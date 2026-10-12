import React from 'react';
import { RequestItem, LeadItem, UserProfile } from '../../types/index.ts';
import {
  Users,
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  DollarSign,
  MessageSquare,
  ArrowRight,
  Shield,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface DashboardViewProps {
  currentUser: UserProfile;
  requests: RequestItem[];
  leads: LeadItem[];
  summary: {
    totalCustomerRevenueCharged: number;
    totalAmountCollected: number;
    outstandingBalance: number;
    totalGovtFeesPaid: number;
    totalOtherExpenses: number;
    totalEmployeeCosts: number;
    grossMargin: number;
    netProfit: number;
    requestsCount: number;
    completedRequestsCount: number;
  };
  onSelectModule: (mod: any) => void;
  onSelectRequest: (req: RequestItem) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  requests,
  leads,
  summary,
  onSelectModule,
  onSelectRequest,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const unassignedRequests = requests.filter((r) => r.status === 'New / Unassigned');
  const inProgressRequests = requests.filter((r) => ['Pending', 'Under Process', 'Document Required'].includes(r.status));
  const readyRequests = requests.filter((r) => r.status === 'Ready for Collection');
  const completedRequests = requests.filter((r) => r.status === 'Complete');

  const newLeads = leads.filter((l) => l.status === 'New Lead');
  const followUpLeads = leads.filter((l) => l.status === 'Follow-up Required' || l.followUpDate);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Welcome, {currentUser.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            CSC CENTER ONLINE WALA Management Console · Shop No. 200, Baba Colony, Burari
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => onSelectModule('requests')}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
            >
              <span>Manage Requests ({requests.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Unassigned Work */}
        <div
          onClick={() => onSelectModule('assignments')}
          className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs hover:border-indigo-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>New / Unassigned</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 tabular-nums">
            {unassignedRequests.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Requires Admin Assignment</p>
        </div>

        {/* Work In Progress */}
        <div
          onClick={() => onSelectModule('requests')}
          className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs hover:border-indigo-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Work In Progress</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-blue-600 tabular-nums">
            {inProgressRequests.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Under Process & Doc Required</p>
        </div>

        {/* Ready for Collection */}
        <div
          onClick={() => onSelectModule('whatsapp')}
          className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs hover:border-indigo-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Ready for Collection</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 tabular-nums">
            {readyRequests.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Cards at shop counter</p>
        </div>

        {/* New Inbound Leads */}
        <div
          onClick={() => onSelectModule('leads')}
          className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs hover:border-indigo-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>New Leads & CRM</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-purple-600 tabular-nums">
            {newLeads.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Online & Walk-in Enquiries</p>
        </div>
      </div>

      {/* Financial Health Snapshot (Admin or Permitted Employee) */}
      {(isAdmin || currentUser.permissions?.viewIncomeAndExpenses) && (
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Financial & Business Accounting Snapshot</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Calculated strictly from actual fee snapshots & recorded collections
              </p>
            </div>
            <button
              onClick={() => onSelectModule('accounting')}
              className="text-xs text-indigo-300 hover:text-white font-semibold flex items-center gap-1"
            >
              <span>Full Ledger</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <div className="text-[11px] text-slate-400">Total Billed</div>
              <div className="text-base sm:text-lg font-bold text-white tabular-nums">
                ₹{summary.totalCustomerRevenueCharged}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Cash/UPI Collected</div>
              <div className="text-base sm:text-lg font-bold text-emerald-400 tabular-nums">
                ₹{summary.totalAmountCollected}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Outstanding Due</div>
              <div className="text-base sm:text-lg font-bold text-rose-400 tabular-nums">
                ₹{summary.outstandingBalance}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Govt Fees Paid</div>
              <div className="text-base sm:text-lg font-bold text-amber-300 tabular-nums">
                ₹{summary.totalGovtFeesPaid}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Gross Margin</div>
              <div className="text-base sm:text-lg font-bold text-blue-300 tabular-nums">
                ₹{summary.grossMargin}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Net Business Profit</div>
              <div className="text-base sm:text-lg font-extrabold text-emerald-300 tabular-nums">
                ₹{summary.netProfit}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Recent Requests & Follow-up Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Requests Table (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recent Customer Requests</h2>
              <p className="text-xs text-slate-500">Live work items across all services</p>
            </div>
            <button
              onClick={() => onSelectModule('requests')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View All ({requests.length}) →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-y border-neutral-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Request ID</th>
                  <th className="py-2.5 px-3 font-semibold">Customer</th>
                  <th className="py-2.5 px-3 font-semibold">Service</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold">Assigned To</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {requests.slice(0, 5).map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {req.id}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{req.customerName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{req.customerMobile}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800 line-clamp-1">{req.serviceName}</div>
                      <div className="text-[11px] text-slate-400">₹{req.customerPriceSnapshot}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {req.assignedEmployeeName || (
                        <span className="text-amber-600 font-bold text-[11px]">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onSelectRequest(req)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded text-xs font-semibold transition"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Urgent Leads & WhatsApp Quick Action (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick WhatsApp Center Shortcut */}
          <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm mb-1">
              <MessageSquare className="w-4 h-4 text-emerald-700" />
              <span>Manual WhatsApp Center</span>
            </div>
            <p className="text-xs text-emerald-800 mb-4">
              Send click-to-chat status updates and collection notices without API charges.
            </p>
            <button
              onClick={() => onSelectModule('whatsapp')}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              Open WhatsApp Center
            </button>
          </div>

          {/* Pending Follow-ups */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Follow-ups Due
              </h3>
              <span className="text-xs text-slate-400 font-mono">{followUpLeads.length} pending</span>
            </div>

            <div className="space-y-2.5">
              {followUpLeads.slice(0, 4).map((lead) => (
                <div
                  key={lead.id}
                  className="p-2.5 bg-slate-50 hover:bg-indigo-50/50 rounded-lg border border-neutral-100 transition text-xs"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-slate-900">{lead.name}</span>
                    <span className="text-[10px] text-amber-600 font-bold">
                      {lead.followUpDate || 'Due Soon'}
                    </span>
                  </div>
                  <div className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">
                    {lead.interestedService}
                  </div>
                </div>
              ))}
              {followUpLeads.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">No follow-ups due today.</p>
              )}
            </div>

            <button
              onClick={() => onSelectModule('followups')}
              className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
            >
              View All Follow-ups
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
