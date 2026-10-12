import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import {
  BusinessSettings,
  ServiceItem,
  RequestItem,
  UserProfile,
  LeadItem,
  WhatsAppLogItem,
  AccountingTransaction,
  MarketingTemplate,
  CampaignItem,
  ReferralItem,
  QuickLinkItem,
  WorkGuideItem,
  AuditLogItem,
} from './types/index.ts';
import { api } from './lib/api.ts';
import { Header, CustomerTabType } from './components/common/Header.tsx';
import { AuthModal } from './components/common/AuthModal.tsx';
import { CustomerHome } from './components/customer/CustomerHome.tsx';
import { CustomerRequests } from './components/customer/CustomerRequests.tsx';
import { CustomerEnquiry } from './components/customer/CustomerEnquiry.tsx';
import { CustomerProfile } from './components/customer/CustomerProfile.tsx';
import { AdminSidebar, AdminModule } from './components/admin/AdminSidebar.tsx';
import { DashboardView } from './components/admin/DashboardView.tsx';
import { RequestsView } from './components/admin/RequestsView.tsx';
import { ServicesView } from './components/admin/ServicesView.tsx';
import { EmployeesView } from './components/admin/EmployeesView.tsx';
import { WhatsAppCenterView } from './components/admin/WhatsAppCenterView.tsx';
import { MarketingStudioView } from './components/admin/MarketingStudioView.tsx';
import { LeadsCRMView } from './components/admin/LeadsCRMView.tsx';
import { CampaignsView } from './components/admin/CampaignsView.tsx';
import { FollowupsAndReferralsView } from './components/admin/FollowupsAndReferralsView.tsx';
import { AccountingView } from './components/admin/AccountingView.tsx';
import { ReportsView } from './components/admin/ReportsView.tsx';
import { QuickLinksAndGuidesView } from './components/admin/QuickLinksAndGuidesView.tsx';
import { SettingsAndAuditView } from './components/admin/SettingsAndAuditView.tsx';
import { CustomersListView } from './components/admin/CustomersListView.tsx';
import {
  LayoutDashboard,
  Grid,
  FileText,
  PhoneCall,
  Menu,
  X,
  AlertCircle,
  HelpCircle,
  Shield,
  User,
  ShoppingBag,
} from 'lucide-react';

const MainApp: React.FC = () => {
  const { currentUser, isLoading: authLoading } = useAuth();

  // Core Data States
  const [settings, setSettings] = useState<BusinessSettings>({
    name: 'CSC CENTER ONLINE WALA',
    tagline: 'Apna Digital Seva Kendra & Cyber Café Hub',
    phone: '9289787348',
    whatsapp: '919289787348',
    address: 'Shop No. 200, B Block, Baba Colony, Burari, Delhi - 110084, India',
    hours: '8:30 AM to 9:00 PM',
    vleName: 'Rakesh Kumar',
    cscId: 'DL-BURARI-200',
    logoUrl: '/src/assets/images/csc_banner_hero_1791784416133.jpg',
    categories: [
      'All Services',
      'Identity & Cards',
      'Certificates & Revenue',
      'Banking & Finance',
      'Licenses & Transport',
      'Welfare & Labour',
      'Legal & Affidavits',
    ],
    bannerImages: [],
    emergencyNotice: 'All government forms, online registrations & instant PVC card print available daily 8:30 AM – 9:00 PM.',
  });

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [transactions, setTransactions] = useState<AccountingTransaction[]>([]);
  const [whatsappLogs, setWhatsappLogs] = useState<WhatsAppLogItem[]>([]);
  const [marketingTemplates, setMarketingTemplates] = useState<MarketingTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [referrals, setReferrals] = useState<ReferralItem[]>([]);
  const [quickLinks, setQuickLinks] = useState<QuickLinkItem[]>([]);
  const [workGuides, setWorkGuides] = useState<WorkGuideItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [accountingSummary, setAccountingSummary] = useState({
    totalCustomerRevenueCharged: 0,
    totalAmountCollected: 0,
    outstandingBalance: 0,
    totalGovtFeesPaid: 0,
    totalOtherExpenses: 0,
    totalEmployeeCosts: 0,
    grossMargin: 0,
    netProfit: 0,
    requestsCount: 0,
    completedRequestsCount: 0,
  });

  // Navigation states: Flipkart style default 'categories'
  const [activeCustomerTab, setActiveCustomerTab] = useState<CustomerTabType>('categories');
  const [activeAdminModule, setActiveAdminModule] = useState<AdminModule>('dashboard');
  const [adminPreviewMode, setAdminPreviewMode] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Modal states
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [selectedReqForDetail, setSelectedReqForDetail] = useState<RequestItem | null>(null);

  // Initial Data Fetch
  const loadInitialData = async () => {
    try {
      const s = await api.getBusinessSettings().catch(() => settings);
      setSettings(s);

      const srvs = await api.getServices(currentUser).catch(() => []);
      setServices(srvs);

      const ql = await api.getQuickLinks().catch(() => []);
      setQuickLinks(ql);

      const wg = await api.getWorkGuides().catch(() => []);
      setWorkGuides(wg);

      const tpls = await api.getMarketingTemplates().catch(() => []);
      setMarketingTemplates(tpls);

      const camps = await api.getCampaigns().catch(() => []);
      setCampaigns(camps);

      const refs = await api.getReferrals().catch(() => []);
      setReferrals(refs);

      if (currentUser) {
        const reqs = await api.getRequests(currentUser).catch(() => []);
        setRequests(reqs);

        if (currentUser.role === 'admin' || currentUser.role === 'employee') {
          const lds = await api.getLeads(currentUser).catch(() => []);
          setLeads(lds);

          const wl = await api.getWhatsAppLogs(currentUser).catch(() => []);
          setWhatsappLogs(wl);

          if (currentUser.role === 'admin') {
            const emps = await api.getEmployees(currentUser).catch(() => []);
            setEmployees(emps);

            const custs = await api.getCustomers(currentUser).catch(() => []);
            setCustomers(custs);

            const logs = await api.getAuditLogs(currentUser).catch(() => []);
            setAuditLogs(logs);
          }

          if (currentUser.role === 'admin' || currentUser.permissions?.viewIncomeAndExpenses) {
            const summ = await api.getAccountingSummary(currentUser).catch(() => null);
            if (summ) setAccountingSummary(summ);

            const txns = await api.getTransactions(currentUser).catch(() => []);
            setTransactions(txns);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching app data', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [currentUser]);

  const handleRequestSubmitted = (newReq: RequestItem) => {
    setRequests((prev) => [newReq, ...prev]);
    loadInitialData();
  };

  const handleOpenWhatsAppWithDraft = (text: string) => {
    setActiveAdminModule('whatsapp');
  };

  const isStaff = currentUser && (currentUser.role === 'admin' || currentUser.role === 'employee') && !adminPreviewMode;

  const myRequestsCount = currentUser
    ? requests.filter((r) => r.customerId === currentUser.id || r.customerMobile === currentUser.mobile).length
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Global Header */}
      <Header
        settings={settings}
        activeCustomerTab={activeCustomerTab}
        setActiveCustomerTab={setActiveCustomerTab}
        userRequestsCount={myRequestsCount}
        onOpenLoginModal={() => {
          setAuthModalMode('login');
          setAuthModalOpen(true);
        }}
        onOpenRegisterModal={() => {
          setAuthModalMode('register');
          setAuthModalOpen(true);
        }}
        onOpenEnquiryModal={() => setActiveCustomerTab('enquiry')}
        adminPreviewMode={adminPreviewMode}
        onToggleAdminPreview={() => setAdminPreviewMode(!adminPreviewMode)}
      />

      {/* Admin Preview Mode Indicator Banner */}
      {currentUser?.role === 'admin' && adminPreviewMode && (
        <div className="bg-indigo-700 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-xs">
          <span>👁️ Customer Store Preview Mode (Admin: CSC CENTER ONLINE WALA)</span>
          <button
            onClick={() => setAdminPreviewMode(false)}
            className="px-2.5 py-1 bg-white text-indigo-800 rounded font-bold hover:bg-slate-100 transition"
          >
            Return to Admin Console (एडमिन पैनल पर वापस जाएं) →
          </button>
        </div>
      )}

      {/* Emergency Notice Banner (if set) */}
      {settings.emergencyNotice && !isStaff && (
        <div className="bg-amber-400/90 text-amber-950 px-4 py-2 text-xs font-semibold text-center border-b border-amber-500/20">
          📢 {settings.emergencyNotice}
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* If user is Admin or Employee: Render Admin Console */}
        {isStaff ? (
          <div className="flex-1 flex flex-col md:flex-row">
            {/* Mobile Sidebar Toggle Button */}
            <div className="md:hidden bg-slate-900 text-white p-3 flex items-center justify-between border-b border-slate-800">
              <span className="text-xs font-bold capitalize">
                Console View: {activeAdminModule}
              </span>
              <button
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                className="p-1.5 bg-slate-800 rounded-lg text-slate-300 hover:text-white"
              >
                {mobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>

            {/* Sidebar (Desktop + Mobile drawer) */}
            <div className={`${mobileSidebarOpen ? 'block' : 'hidden'} md:block shrink-0`}>
              <AdminSidebar
                currentUser={currentUser}
                activeModule={activeAdminModule}
                setActiveModule={(mod) => {
                  setActiveAdminModule(mod);
                  setMobileSidebarOpen(false);
                }}
                unassignedCount={requests.filter((r) => r.status === 'New / Unassigned').length}
                newLeadsCount={leads.filter((l) => l.status === 'New Lead').length}
              />
            </div>

            {/* Workspace Viewport */}
            <div className="flex-1 bg-slate-50 overflow-y-auto">
              {activeAdminModule === 'dashboard' && (
                <DashboardView
                  currentUser={currentUser}
                  requests={requests}
                  leads={leads}
                  summary={accountingSummary}
                  onSelectModule={(mod) => setActiveAdminModule(mod)}
                  onSelectRequest={(req) => {
                    setSelectedReqForDetail(req);
                    setActiveAdminModule('requests');
                  }}
                />
              )}

              {activeAdminModule === 'customers' && (
                <CustomersListView
                  currentUser={currentUser}
                  customers={customers}
                  requests={requests}
                  onRefreshCustomers={loadInitialData}
                />
              )}

              {activeAdminModule === 'services' && (
                <ServicesView
                  currentUser={currentUser}
                  services={services}
                  settings={settings}
                  onRefreshServices={loadInitialData}
                />
              )}

              {(activeAdminModule === 'requests' || activeAdminModule === 'assignments') && (
                <RequestsView
                  currentUser={currentUser}
                  requests={requests}
                  employees={employees}
                  onRefreshRequests={loadInitialData}
                  selectedRequestFromOutside={selectedReqForDetail}
                  onClearSelectedRequest={() => setSelectedReqForDetail(null)}
                />
              )}

              {activeAdminModule === 'employees' && (
                <EmployeesView
                  currentUser={currentUser}
                  employees={employees}
                  requests={requests}
                  onRefreshEmployees={loadInitialData}
                />
              )}

              {activeAdminModule === 'whatsapp' && (
                <WhatsAppCenterView
                  currentUser={currentUser}
                  settings={settings}
                  requests={requests}
                  leads={leads}
                  logs={whatsappLogs}
                  onRefreshLogs={loadInitialData}
                />
              )}

              {activeAdminModule === 'marketing' && (
                <MarketingStudioView
                  currentUser={currentUser}
                  templates={marketingTemplates}
                  onOpenWhatsAppWithText={handleOpenWhatsAppWithDraft}
                  onRefreshTemplates={loadInitialData}
                />
              )}

              {activeAdminModule === 'leads' && (
                <LeadsCRMView
                  currentUser={currentUser}
                  leads={leads}
                  employees={employees}
                  onRefreshLeads={loadInitialData}
                  onRefreshCustomers={loadInitialData}
                />
              )}

              {activeAdminModule === 'campaigns' && (
                <CampaignsView
                  currentUser={currentUser}
                  campaigns={campaigns}
                  leads={leads}
                  requests={requests}
                  settings={settings}
                  onRefreshCampaigns={loadInitialData}
                />
              )}

              {activeAdminModule === 'followups' && (
                <FollowupsAndReferralsView
                  currentUser={currentUser}
                  leads={leads}
                  requests={requests}
                  referrals={referrals}
                  mode="followups"
                  onRefreshData={loadInitialData}
                />
              )}

              {activeAdminModule === 'referrals' && (
                <FollowupsAndReferralsView
                  currentUser={currentUser}
                  leads={leads}
                  requests={requests}
                  referrals={referrals}
                  mode="referrals"
                  onRefreshData={loadInitialData}
                />
              )}

              {activeAdminModule === 'accounting' && (
                <AccountingView
                  currentUser={currentUser}
                  transactions={transactions}
                  requests={requests}
                  summary={accountingSummary}
                  onRefreshAccounting={loadInitialData}
                />
              )}

              {activeAdminModule === 'reports' && (
                <ReportsView currentUser={currentUser} />
              )}

              {activeAdminModule === 'quicklinks' && (
                <QuickLinksAndGuidesView
                  currentUser={currentUser}
                  quickLinks={quickLinks}
                  workGuides={workGuides}
                />
              )}

              {activeAdminModule === 'guides' && (
                <QuickLinksAndGuidesView
                  currentUser={currentUser}
                  quickLinks={quickLinks}
                  workGuides={workGuides}
                />
              )}

              {activeAdminModule === 'settings' && (
                <SettingsAndAuditView
                  currentUser={currentUser}
                  settings={settings}
                  auditLogs={auditLogs}
                  onRefreshSettings={loadInitialData}
                />
              )}
            </div>
          </div>
        ) : (
          /* Customer Portal View: Flipkart Dual-Rail Category Experience */
          <div className="flex-1">
            {activeCustomerTab === 'categories' && (
              <CustomerHome
                services={services}
                settings={settings}
                currentUser={currentUser}
                userRequestsCount={myRequestsCount}
                onRequestSubmitted={handleRequestSubmitted}
                onOpenLoginModal={() => {
                  setAuthModalMode('login');
                  setAuthModalOpen(true);
                }}
                onNavigateToRequests={() => setActiveCustomerTab('requests')}
                onNavigateToEnquiry={() => setActiveCustomerTab('enquiry')}
              />
            )}

            {activeCustomerTab === 'requests' && (
              <CustomerRequests
                requests={requests}
                settings={settings}
                currentUser={currentUser}
                onOpenLoginModal={() => {
                  setAuthModalMode('login');
                  setAuthModalOpen(true);
                }}
              />
            )}

            {activeCustomerTab === 'account' && (
              <CustomerProfile
                settings={settings}
                requests={requests}
                onOpenLoginModal={() => {
                  setAuthModalMode('login');
                  setAuthModalOpen(true);
                }}
                onOpenRegisterModal={() => {
                  setAuthModalMode('register');
                  setAuthModalOpen(true);
                }}
                onNavigateToRequests={() => setActiveCustomerTab('requests')}
              />
            )}

            {(activeCustomerTab === 'enquiry' || activeCustomerTab === 'contact') && (
              <CustomerEnquiry settings={settings} />
            )}
          </div>
        )}
      </main>

      {/* Customer Mobile Sticky Bottom Navigation Bar (Flipkart App Native Style from Screenshot) */}
      {!isStaff && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-neutral-200 py-1.5 px-3 flex justify-around items-center shadow-lg">
          {/* Categories Tab (4-squares Grid icon - matching screenshot) */}
          <button
            onClick={() => setActiveCustomerTab('categories')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition ${
              activeCustomerTab === 'categories' ? 'text-indigo-600 font-bold' : 'text-slate-500'
            }`}
          >
            <Grid className="w-5 h-5" />
            <span>Categories</span>
          </button>

          {/* Cart / My Requests Tab with count badge */}
          <button
            onClick={() => setActiveCustomerTab('requests')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition relative ${
              activeCustomerTab === 'requests' ? 'text-indigo-600 font-bold' : 'text-slate-500'
            }`}
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              {myRequestsCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-indigo-600 text-white font-bold text-[9px] rounded-full h-4 w-4 flex items-center justify-center tabular-nums">
                  {myRequestsCount}
                </span>
              )}
            </div>
            <span>My Requests</span>
          </button>

          {/* Account Tab */}
          <button
            onClick={() => setActiveCustomerTab('account')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition ${
              activeCustomerTab === 'account' ? 'text-indigo-600 font-bold' : 'text-slate-500'
            }`}
          >
            <User className="w-5 h-5" />
            <span>Account</span>
          </button>

          {/* Enquiry / Helpline Tab */}
          <button
            onClick={() => setActiveCustomerTab('enquiry')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition ${
              activeCustomerTab === 'enquiry' || activeCustomerTab === 'contact' ? 'text-indigo-600 font-bold' : 'text-slate-500'
            }`}
          >
            <PhoneCall className="w-5 h-5" />
            <span>Help / QR</span>
          </button>
        </div>
      )}

      {/* Login & Registration Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          loadInitialData();
        }}
        defaultMode={authModalMode}
        onLoginSuccess={(user) => {
          setAdminPreviewMode(false);
          if (user.role === 'admin') {
            setActiveAdminModule('dashboard');
          } else if (user.role === 'employee') {
            setActiveAdminModule('requests');
          } else {
            setActiveCustomerTab('categories');
          }
          loadInitialData();
        }}
      />
    </div>
  );
};

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('App runtime error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    localStorage.removeItem('csc_user');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-6 max-w-md w-full text-center space-y-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              ⚠️
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              CSC CENTER ONLINE WALA
            </h2>
            <p className="text-xs text-slate-600">
              ऐप लोड करने में कोई अस्थायी रुकावट आई। नीचे दिए गए बटन से तुरंत रिफ्रेश करें।
            </p>
            <button
              onClick={this.handleReset}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              रीलोड करें (Reload & Continue)
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ErrorBoundary>
  );
}
