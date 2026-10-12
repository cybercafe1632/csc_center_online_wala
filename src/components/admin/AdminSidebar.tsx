import React from 'react';
import { UserProfile } from '../../types/index.ts';
import {
  LayoutDashboard,
  Users,
  Grid,
  ClipboardList,
  UserCheck,
  UserPlus,
  MessageSquare,
  Sparkles,
  Target,
  Megaphone,
  Clock,
  Share2,
  DollarSign,
  BarChart3,
  ExternalLink,
  BookOpen,
  Settings,
  Shield,
  LogOut,
  ChevronRight,
} from 'lucide-react';

export type AdminModule =
  | 'dashboard'
  | 'customers'
  | 'services'
  | 'requests'
  | 'employees'
  | 'assignments'
  | 'whatsapp'
  | 'marketing'
  | 'leads'
  | 'campaigns'
  | 'followups'
  | 'referrals'
  | 'accounting'
  | 'reports'
  | 'quicklinks'
  | 'guides'
  | 'settings';

interface AdminSidebarProps {
  currentUser: UserProfile;
  activeModule: AdminModule;
  setActiveModule: (mod: AdminModule) => void;
  unassignedCount?: number;
  newLeadsCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentUser,
  activeModule,
  setActiveModule,
  unassignedCount = 0,
  newLeadsCount = 0,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const perms = currentUser.permissions || {
    viewAssignedWork: true,
    updateWorkStatus: true,
    addInternalNotes: true,
    manageCustomerRecords: false,
    createOrEditServices: false,
    uploadServiceImages: false,
    editCustomerPrices: false,
    editGovtFees: false,
    assignOrReassignWork: false,
    viewIncomeAndExpenses: false,
    addFinancialTransactions: false,
    viewReports: false,
    manageLeads: false,
    manageCampaigns: false,
    useWhatsAppCenter: false,
    manageQuickLinks: false,
  };

  const navItems: { id: AdminModule; label: string; icon: any; count?: number; visible: boolean }[] = [
    { id: 'dashboard', label: '1. Dashboard', icon: LayoutDashboard, visible: true },
    { id: 'customers', label: '2. Customers', icon: Users, visible: isAdmin || perms.manageCustomerRecords },
    { id: 'services', label: '3. Services & Fees', icon: Grid, visible: isAdmin || perms.createOrEditServices },
    { id: 'requests', label: '4. Requests & Work', icon: ClipboardList, count: unassignedCount, visible: isAdmin || perms.viewAssignedWork },
    { id: 'employees', label: '5. Employees & Powers', icon: UserCheck, visible: isAdmin },
    { id: 'assignments', label: '6. Work Assignment', icon: UserPlus, visible: isAdmin || perms.assignOrReassignWork },
    { id: 'whatsapp', label: '7. Manual WhatsApp', icon: MessageSquare, visible: isAdmin || perms.useWhatsAppCenter },
    { id: 'marketing', label: '8. Marketing Studio', icon: Sparkles, visible: isAdmin || perms.manageCampaigns },
    { id: 'leads', label: '9. Leads & CRM', icon: Target, count: newLeadsCount, visible: isAdmin || perms.manageLeads },
    { id: 'campaigns', label: '10. Campaigns', icon: Megaphone, visible: isAdmin || perms.manageCampaigns },
    { id: 'followups', label: '11. Follow-ups', icon: Clock, visible: isAdmin || perms.manageLeads || perms.viewAssignedWork },
    { id: 'referrals', label: '12. Referral Tracking', icon: Share2, visible: isAdmin || perms.manageLeads },
    { id: 'accounting', label: '13. Income & Expenses', icon: DollarSign, visible: isAdmin || perms.viewIncomeAndExpenses || perms.addFinancialTransactions },
    { id: 'reports', label: '14. Reports & CSV', icon: BarChart3, visible: isAdmin || perms.viewReports },
    { id: 'quicklinks', label: '15. Quick Links', icon: ExternalLink, visible: isAdmin || perms.manageQuickLinks },
    { id: 'guides', label: '16. Work Guides', icon: BookOpen, visible: true },
    { id: 'settings', label: '17. Settings & Audit', icon: Settings, visible: isAdmin },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 min-h-[calc(100vh-4rem)]">
      {/* Current User Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            {currentUser.name.charAt(0)}
          </div>
          <div className="truncate">
            <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
            <div className="text-[11px] text-indigo-400 capitalize flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>{currentUser.role}</span>
              {currentUser.designation && <span className="text-slate-400">· {currentUser.designation}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto scrollbar-thin">
        {navItems
          .filter((item) => item.visible)
          .map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition text-left ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-white tabular-nums">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 bg-slate-950/20">
        <div className="flex justify-between">
          <span>Burari Center</span>
          <span className="text-slate-400">DL-200</span>
        </div>
      </div>
    </aside>
  );
};
