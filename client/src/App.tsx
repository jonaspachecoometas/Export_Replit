import { Switch, Route, useLocation } from "wouter";
import { lazy, Suspense, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { SoeMotorProvider } from "@/contexts/SoeMotorContext";
import { ProtectedRoute } from "@/lib/protected-route";
import { CommandPalette } from "@/components/CommandPalette";
import { KnowledgeCollectorInit } from "@/components/KnowledgeCollectorInit";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";

const Agent = lazy(() => import("@/pages/Agent"));
const Admin = lazy(() => import("@/pages/Admin"));
const Chat = lazy(() => import("@/pages/Chat"));
const WhatsApp = lazy(() => import("@/pages/WhatsApp"));
const Automations = lazy(() => import("@/pages/Automations"));
const BiWorkspace = lazy(() => import("@/pages/BiWorkspace"));
const ProcessCompass = lazy(() => import("@/pages/ProcessCompass"));
const WorkspacePage = lazy(() => import("@/pages/WorkspacePage"));
const AppViewer = lazy(() => import("@/pages/AppViewer"));
const Crm = lazy(() => import("@/pages/Crm"));
const Production = lazy(() => import("@/pages/Production"));
const Support = lazy(() => import("@/pages/Support"));
const Valuation = lazy(() => import("@/pages/Valuation"));
const Canvas = lazy(() => import("@/pages/Canvas"));
const IDE = lazy(() => import("@/pages/IDE"));
const Scientist = lazy(() => import("@/pages/Scientist"));
const Knowledge = lazy(() => import("@/pages/Knowledge"));
const CentralApis = lazy(() => import("@/pages/CentralApis"));
const ApiTesterPage = lazy(() => import("@/pages/ApiTesterPage"));
const ApiHub = lazy(() => import("@/pages/ApiHub"));
const Cockpit = lazy(() => import("@/pages/Cockpit"));
const Fisco = lazy(() => import("@/pages/Fisco"));
const People = lazy(() => import("@/pages/People"));
const Contabil = lazy(() => import("@/pages/Contabil"));
const SOE = lazy(() => import("@/pages/SOE"));
const Financeiro = lazy(() => import("@/pages/Financeiro"));
const Communities = lazy(() => import("@/pages/Communities"));
const ArcadiaNext = lazy(() => import("@/pages/ArcadiaNext"));
const QualityModule = lazy(() => import("@/pages/QualityModule"));
const CommercialEnv = lazy(() => import("@/pages/CommercialEnv"));
const FieldOperations = lazy(() => import("@/pages/FieldOperations"));
const TechnicalModule = lazy(() => import("@/pages/TechnicalModule"));
const SuppliersPortal = lazy(() => import("@/pages/SuppliersPortal"));
const NPSSurvey = lazy(() => import("@/pages/NPSSurvey"));
const EngineeringHub = lazy(() => import("@/pages/EngineeringHub"));
const DocTypeBuilder = lazy(() => import("@/pages/DocTypeBuilder"));
const PageBuilder = lazy(() => import("@/pages/PageBuilder"));
const DevelopmentModule = lazy(() => import("@/pages/DevelopmentModule"));
const ArcadiaRetail = lazy(() => import("@/pages/ArcadiaRetail"));
const Plus = lazy(() => import("@/pages/Plus"));
const SuperAdmin = lazy(() => import("@/pages/SuperAdmin"));
const Marketplace = lazy(() => import("@/pages/Marketplace"));
const LMS = lazy(() => import("@/pages/LMS"));
const AppCenter = lazy(() => import("@/pages/AppCenter"));
const XosCentral = lazy(() => import("@/pages/XosCentral"));
const XosCrm = lazy(() => import("@/pages/XosCrm"));
const XosInbox = lazy(() => import("@/pages/XosInbox"));
const XosTickets = lazy(() => import("@/pages/XosTickets"));
const Migration = lazy(() => import("@/pages/Migration"));
const DevCenter = lazy(() => import("@/pages/DevCenter"));
const XosCampaigns = lazy(() => import("@/pages/XosCampaigns"));
const XosAutomations = lazy(() => import("@/pages/XosAutomations"));
const XosSites = lazy(() => import("@/pages/XosSites"));
const XosGovernance = lazy(() => import("@/pages/XosGovernance"));
const XosPipeline = lazy(() => import("@/pages/XosPipeline"));
const XosSupervisor = lazy(() => import("@/pages/XosSupervisor"));
const XosReports = lazy(() => import("@/pages/XosReports"));
const XosProtocols = lazy(() => import("@/pages/XosProtocols"));


function LoadingFallback() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #e5e7eb", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} />
        <p style={{ marginTop: 16, color: "#6b7280" }}>Carregando...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<LoadingFallback />}>
    <Switch>
      <ProtectedRoute path="/" component={Cockpit} />
      <ProtectedRoute path="/agent" component={Agent} />
      <ProtectedRoute path="/admin" component={Admin} />
      <ProtectedRoute path="/chat" component={Chat} />
      <ProtectedRoute path="/whatsapp" component={WhatsApp} />
      <ProtectedRoute path="/comunicacao" component={XosInbox} />
      <ProtectedRoute path="/automations" component={Automations} />
      <ProtectedRoute path="/insights" component={BiWorkspace} />
      <ProtectedRoute path="/compass" component={ProcessCompass} />
      <ProtectedRoute path="/crm" component={Crm} />
      <ProtectedRoute path="/production" component={Production} />
      <ProtectedRoute path="/support" component={Support} />
      <ProtectedRoute path="/valuation" component={Valuation} />
      <ProtectedRoute path="/canvas" component={Canvas} />
      <ProtectedRoute path="/ide" component={IDE} />
      <ProtectedRoute path="/scientist" component={Scientist} />
      <ProtectedRoute path="/knowledge" component={Knowledge} />
      <ProtectedRoute path="/central-apis" component={CentralApis} />
      <ProtectedRoute path="/api-tester" component={ApiTesterPage} />
      <ProtectedRoute path="/api-hub" component={ApiHub} />
      <ProtectedRoute path="/fisco" component={Fisco} />
      <ProtectedRoute path="/people" component={People} />
      <ProtectedRoute path="/contabil" component={Contabil} />
      <ProtectedRoute path="/soe" component={SOE} />
      <ProtectedRoute path="/erp" component={SOE} />
      <ProtectedRoute path="/financeiro" component={Financeiro} />
      <ProtectedRoute path="/communities" component={Communities} />
      <ProtectedRoute path="/quality" component={QualityModule} />
      <ProtectedRoute path="/commercial-env" component={CommercialEnv} />
      <ProtectedRoute path="/field-ops" component={FieldOperations} />
      <ProtectedRoute path="/technical" component={TechnicalModule} />
      <ProtectedRoute path="/suppliers" component={SuppliersPortal} />
      <ProtectedRoute path="/nps" component={NPSSurvey} />
      <ProtectedRoute path="/engineering" component={EngineeringHub} />
      <ProtectedRoute path="/development" component={DevelopmentModule} />
      <ProtectedRoute path="/retail" component={ArcadiaRetail} />
      <ProtectedRoute path="/plus" component={() => { const [, nav] = useLocation(); useEffect(() => nav("/soe"), []); return null; }} />
      <ProtectedRoute path="/super-admin" component={SuperAdmin} />
      <ProtectedRoute path="/marketplace" component={Marketplace} />
      <ProtectedRoute path="/lms" component={LMS} />
      <ProtectedRoute path="/apps" component={AppCenter} />
      <ProtectedRoute path="/xos" component={XosCentral} />
      <ProtectedRoute path="/xos/crm" component={XosCrm} />
      <ProtectedRoute path="/xos/inbox" component={XosInbox} />
      <ProtectedRoute path="/xos/tickets" component={XosTickets} />
      <ProtectedRoute path="/xos/campaigns" component={XosCampaigns} />
      <ProtectedRoute path="/xos/automations" component={XosAutomations} />
      <ProtectedRoute path="/xos/sites" component={XosSites} />
      <ProtectedRoute path="/xos/governance" component={XosGovernance} />
      <ProtectedRoute path="/xos/pipeline" component={XosPipeline} />
      <ProtectedRoute path="/xos/supervisor" component={XosSupervisor} />
      <ProtectedRoute path="/xos/reports" component={XosReports} />
      <ProtectedRoute path="/xos/protocols" component={XosProtocols} />

      <ProtectedRoute path="/doctype-builder" component={DocTypeBuilder} />
      <ProtectedRoute path="/page-builder" component={PageBuilder} />
      <ProtectedRoute path="/migration" component={Migration} />
      <ProtectedRoute path="/dev-center" component={DevCenter} />
      <ProtectedRoute path="/page/:id" component={WorkspacePage} />
      <ProtectedRoute path="/app/:id" component={AppViewer} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SoeMotorProvider>
          <TooltipProvider>
            <KnowledgeCollectorInit />
            <Toaster />
            <CommandPalette />
            <Router />
          </TooltipProvider>
        </SoeMotorProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
