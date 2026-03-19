/**
 * Seed das regras padrão do SOE (soe_regras)
 * Insere FISCAL_RULES_PADRAO + BUSINESS_RULES_PADRAO no banco.
 * Idempotente: pula regras que já existem (por nome + trigger).
 *
 * Uso:
 *   DATABASE_URL=postgres://... npx tsx scripts/seed-soe-rules.ts
 */

import pg from "pg";
import { FISCAL_RULES_PADRAO } from "../server/soe/rule-engine/fiscal-rules";
import { BUSINESS_RULES_PADRAO } from "../server/soe/rule-engine/business-rules";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL não definida");
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const ALL_RULES = [...FISCAL_RULES_PADRAO, ...BUSINESS_RULES_PADRAO];

console.log(`Inserindo ${ALL_RULES.length} regras padrão SOE...\n`);

let inserted = 0;
let skipped = 0;

for (const rule of ALL_RULES) {
  const existing = await client.query(
    `SELECT id FROM soe_regras WHERE nome = $1 AND trigger = $2 AND origem_padrao = true`,
    [rule.nome, rule.trigger]
  );

  if ((existing.rowCount ?? 0) > 0) {
    console.log(`  [SKIP] ${rule.id}`);
    skipped++;
    continue;
  }

  await client.query(
    `INSERT INTO soe_regras (dominio, trigger, nome, condicao, acao, prioridade, ativo, origem_padrao, tenant_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      rule.dominio,
      rule.trigger,
      rule.nome,
      JSON.stringify(rule.condicao),
      JSON.stringify(rule.acao),
      rule.prioridade,
      rule.ativo,
      true,
      null,
    ]
  );

  console.log(`  [OK]   ${rule.id} — ${rule.nome}`);
  inserted++;
}

await client.end();

console.log(`\nConcluído: ${inserted} inseridas, ${skipped} ignoradas.`);
