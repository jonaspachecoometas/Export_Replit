/**
 * XOS Scheduler
 * - Every 5 min: check SLA breaches and emit events
 * - Every 30 sec: broadcast live supervisor stats via Socket.IO
 */
import { db } from "../../db";
import { sql } from "drizzle-orm";
import { broadcastXos } from "../socket-io";

const SLA_CHECK_INTERVAL_MS = 5 * 60 * 1000;   // 5 minutes
const STATS_BROADCAST_INTERVAL_MS = 30 * 1000;  // 30 seconds

/** Mark overdue protocols as SLA-breached and emit event per tenant */
async function checkSlaBreaches() {
  try {
    // Mark protocols where sla_deadline has passed and still open/unbreached
    const breached = await db.execute(sql`
      UPDATE xos_protocols
      SET sla_breach = true, updated_at = NOW()
      WHERE status = 'open'
        AND sla_deadline IS NOT NULL
        AND sla_deadline < NOW()
        AND sla_breach = false
      RETURNING id, tenant_id, protocol_number, contact_id, queue_id, assigned_to
    `);

    const rows = (breached as any).rows ?? [];
    for (const row of rows) {
      broadcastXos("sla.breach", {
        protocolId: row.id,
        tenantId: row.tenant_id,
        protocolNumber: row.protocol_number,
        contactId: row.contact_id,
        queueId: row.queue_id,
        assignedTo: row.assigned_to,
        breachedAt: new Date().toISOString(),
      });

      // Forward to automation engine (non-blocking)
      try {
        const engineHost = process.env.AUTOMATION_ENGINE_HOST || "localhost";
        const enginePort = process.env.AUTOMATION_ENGINE_PORT || "8005";
        await fetch(`http://${engineHost}:${enginePort}/xos/trigger`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event_type: "crm.sla.breached",
            payload: { protocol_id: row.id, protocol_number: row.protocol_number },
            tenant_id: row.tenant_id,
          }),
          signal: AbortSignal.timeout(5000),
        });
      } catch {
        // Non-blocking — engine may be offline
      }
    }

    if (rows.length > 0) {
      console.log(`[xos:scheduler] SLA check: ${rows.length} breach(es) detected`);
    }
  } catch (err) {
    console.error("[xos:scheduler] SLA check error:", err);
  }
}

/** Broadcast aggregate supervisor stats to all connected clients */
async function broadcastSupervisorStats() {
  try {
    const [convsResult, ticketsResult, agentsResult] = await Promise.all([
      db.execute(sql`
        SELECT
          COUNT(*) FILTER (WHERE status = 'open') AS open_conversations,
          COUNT(*) FILTER (WHERE status = 'resolved' AND updated_at > NOW() - INTERVAL '24h') AS resolved_today
        FROM xos_conversations
      `),
      db.execute(sql`
        SELECT
          COUNT(*) FILTER (WHERE status IN ('open','in_progress') AND priority = 'urgent') AS urgent_open
        FROM xos_tickets
      `),
      db.execute(sql`
        SELECT COUNT(*) FILTER (WHERE is_online = true) AS agents_online
        FROM xos_agents
      `),
    ]);

    const c = ((convsResult as any).rows ?? [])[0] ?? {};
    const t = ((ticketsResult as any).rows ?? [])[0] ?? {};
    const a = ((agentsResult as any).rows ?? [])[0] ?? {};

    broadcastXos("supervisor.stats", {
      openConversations: Number(c.open_conversations ?? 0),
      resolvedToday: Number(c.resolved_today ?? 0),
      urgentTickets: Number(t.urgent_open ?? 0),
      agentsOnline: Number(a.agents_online ?? 0),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    // Suppress — tables may not exist in dev
    if (process.env.NODE_ENV !== "production") {
      console.debug("[xos:scheduler] stats broadcast skipped:", (err as any)?.message);
    }
  }
}

export function startXosScheduler() {
  // Stagger initial runs slightly to avoid startup congestion
  setTimeout(() => {
    checkSlaBreaches();
    setInterval(checkSlaBreaches, SLA_CHECK_INTERVAL_MS);
  }, 15_000); // first SLA check 15s after boot

  setTimeout(() => {
    broadcastSupervisorStats();
    setInterval(broadcastSupervisorStats, STATS_BROADCAST_INTERVAL_MS);
  }, 5_000); // first broadcast 5s after boot

  console.log("[xos:scheduler] Started — SLA checks every 5min, stats every 30s");
}
