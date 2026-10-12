import React, { useState } from 'react';
import { UserProfile, RequestItem, EmployeePermissions } from '../../types/index.ts';
import { api } from '../../lib/api.ts';
import {
  Users,
  Search,
  Phone,
  MapPin,
  Calendar,
  MessageSquare,
  Shield,
  UserCheck,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
} from 'lucide-react';

interface CustomersListViewProps {
  currentUser: UserProfile;
  customers: UserProfile[];
  requests: RequestItem[];
  onRefreshCustomers?: () => void;
}

export const CustomersListView: React.FC<CustomersListViewProps> = ({
  currentUser,
  customers,
  requests,
  onRefreshCustomers,
}) => {
  const [search, setSearch] = useState('');
  const [promoteCustomerModal, setPromoteCustomerModal] = useState<UserProfile | null>(null);
  const [designation, setDesignation] = useState('Senior CSC Operator');
  const [permissions, setPermissions] = useState<EmployeePermissions>({
    viewAssignedWork: true,
    updateWorkStatus: true,
    addInternalNotes: true,
    manageCustomerRecords: true,
    createOrEditServices: false,
    uploadServiceImages: false,
    editCustomerPrices: false,
    editGovtFees: false,
    assignOrReassignWork: false,
    viewIncomeAndExpenses: false,
    addFinancialTransactions: true,
    viewReports: false,
    manageLeads: true,
    manageCampaigns: false,
    useWhatsAppCenter: true,
    manageQuickLinks: true,
  });
  const [isPromoting, setIsPromoting] = useState(false);
  const [promoteError, setPromoteError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.mobile.includes(search) ||
      (c.address || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenPromoteModal = (customer: UserProfile) => {
    setPromoteCustomerModal(customer);
    setDesignation('CSC Operator');
    setPromoteError(null);
  };

  const handleTogglePermission = (key: keyof EmployeePermissions) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handlePromoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoteCustomerModal) return;

    setIsPromoting(true);
    setPromoteError(null);

    try {
      await api.promoteCustomer(
        promoteCustomerModal.id,
        designation.trim() || 'CSC Operator',
        permissions,
        currentUser
      );
      setStatusMessage(`सफलतापूर्वक ${promoteCustomerModal.name} को कर्मचारी बना दिया गया!`);
      setPromoteCustomerModal(null);
      if (onRefreshCustomers) {
        onRefreshCustomers();
      }
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err: any) {
      setPromoteError(err.message || 'कर्मचारी बनाने में त्रुटि हुई');
    } finally {
      setIsPromoting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>Customer Accounts & Directory</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered citizens, unique Customer IDs, and employee assignment control (एडमिन यहां से किसी भी ग्राहक को कर्मचारी बना सकते हैं)
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Total Citizens: <span className="font-bold text-slate-900">{customers.length}</span>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search customer by name, mobile, address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-neutral-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Customer ID</th>
                <th className="py-3 px-4 font-semibold">Name</th>
                <th className="py-3 px-4 font-semibold">Mobile Number</th>
                <th className="py-3 px-4 font-semibold">Colony / Address</th>
                <th className="py-3 px-4 font-semibold">Total Requests</th>
                <th className="py-3 px-4 font-semibold text-center">Action: Staff Role</th>
                <th className="py-3 px-4 font-semibold text-right">Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((c) => {
                const userReqs = requests.filter((r) => r.customerId === c.id || r.customerMobile === c.mobile);
                return (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{c.id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{c.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">+91 {c.mobile}</td>
                    <td className="py-3 px-4 text-slate-600">{c.address || 'Burari, Delhi'}</td>
                    <td className="py-3 px-4 font-bold text-indigo-600 tabular-nums">{userReqs.length}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleOpenPromoteModal(c)}
                        className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 transition"
                        title="Promote customer to employee role"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Make Employee / कर्मचारी बनाएं</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <a
                        href={`https://wa.me/91${c.mobile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded font-bold text-xs inline-flex items-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Chat</span>
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Promote Customer to Employee */}
      {promoteCustomerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-neutral-200 max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-400" />
                  <span>Assign Employee Role / कर्मचारी पद सौंपें</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Grant staff permissions to registered customer
                </p>
              </div>
              <button
                onClick={() => setPromoteCustomerModal(null)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePromoteSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Customer Info Card */}
              <div className="p-3 bg-slate-50 rounded-xl border border-neutral-200 text-xs">
                <div className="font-bold text-slate-900 text-sm">{promoteCustomerModal.name}</div>
                <div className="text-slate-500 font-mono mt-0.5">
                  Mobile: +91 {promoteCustomerModal.mobile} · ID: {promoteCustomerModal.id}
                </div>
                <p className="text-[11px] text-indigo-600 font-medium mt-1">
                  Once assigned, this user can log in with their same mobile number and password to access the Employee Console!
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Designation / पद *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior CSC Operator, Verification Assistant"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">
                  Employee Permissions (अनुमतियाँ)
                </label>
                <div className="space-y-2 border border-neutral-200 rounded-xl p-3 max-h-52 overflow-y-auto bg-slate-50 text-xs">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.viewAssignedWork}
                      onChange={() => handleTogglePermission('viewAssignedWork')}
                      className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="font-semibold text-slate-800">View Assigned Work</span>
                      <p className="text-[11px] text-slate-500">Can view tasks assigned to them</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.updateWorkStatus}
                      onChange={() => handleTogglePermission('updateWorkStatus')}
                      className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="font-semibold text-slate-800">Update Work Status</span>
                      <p className="text-[11px] text-slate-500">Can change request progress to Complete/Under Process</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.addInternalNotes}
                      onChange={() => handleTogglePermission('addInternalNotes')}
                      className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="font-semibold text-slate-800">Add Internal Notes</span>
                      <p className="text-[11px] text-slate-500">Can add private work tracking notes</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.manageCustomerRecords}
                      onChange={() => handleTogglePermission('manageCustomerRecords')}
                      className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="font-semibold text-slate-800">Manage Customer Records</span>
                      <p className="text-[11px] text-slate-500">Can view customer list & details</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.addFinancialTransactions}
                      onChange={() => handleTogglePermission('addFinancialTransactions')}
                      className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="font-semibold text-slate-800">Financial Collections</span>
                      <p className="text-[11px] text-slate-500">Can record fees received from customer</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.useWhatsAppCenter}
                      onChange={() => handleTogglePermission('useWhatsAppCenter')}
                      className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="font-semibold text-slate-800">Use WhatsApp Center</span>
                      <p className="text-[11px] text-slate-500">Can send click-to-chat status notifications</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.manageLeads}
                      onChange={() => handleTogglePermission('manageLeads')}
                      className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="font-semibold text-slate-800">Manage Leads & CRM</span>
                      <p className="text-[11px] text-slate-500">Can follow up on citizen inquiries</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.manageQuickLinks}
                      onChange={() => handleTogglePermission('manageQuickLinks')}
                      className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="font-semibold text-slate-800">Portal Quick Links & Guides</span>
                      <p className="text-[11px] text-slate-500">Can access official portal links & guides</p>
                    </div>
                  </label>
                </div>
              </div>

              {promoteError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{promoteError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPromoteCustomerModal(null)}
                  className="px-4 py-2 border border-neutral-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPromoting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{isPromoting ? 'Assigning...' : 'Assign Employee Role / कर्मचारी बनाएं'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
