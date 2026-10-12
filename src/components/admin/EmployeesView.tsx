import React, { useState } from 'react';
import { UserProfile, EmployeePermissions, RequestItem } from '../../types/index.ts';
import { api } from '../../lib/api.ts';
import {
  UserCheck,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Check,
  X,
  Lock,
  Phone,
  Briefcase,
  AlertCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface EmployeesViewProps {
  currentUser: UserProfile;
  employees: UserProfile[];
  requests: RequestItem[];
  onRefreshEmployees: () => void;
}

export const EmployeesView: React.FC<EmployeesViewProps> = ({
  currentUser,
  employees,
  requests,
  onRefreshEmployees,
}) => {
  const [selectedEmp, setSelectedEmp] = useState<UserProfile | null>(null);
  const [isAddingEmp, setIsAddingEmp] = useState(false);
  const [permError, setPermError] = useState<string | null>(null);
  const [createEmpError, setCreateEmpError] = useState<string | null>(null);

  // New employee form
  const [newName, setNewName] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newPassword, setNewPassword] = useState('emp123');
  const [newDesignation, setNewDesignation] = useState('CSC Operator');

  // Permissions state for editing
  const [permissions, setPermissions] = useState<EmployeePermissions>({
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
    manageQuickLinks: true,
  });

  const handleOpenPermissions = (emp: UserProfile) => {
    setSelectedEmp(emp);
    if (emp.permissions) {
      setPermissions({ ...emp.permissions });
    }
  };

  const handleTogglePermission = (key: keyof EmployeePermissions) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSavePermissions = async () => {
    if (!selectedEmp) return;
    setPermError(null);
    try {
      await api.updateEmployee(
        selectedEmp.id,
        { permissions },
        currentUser
      );
      setSelectedEmp(null);
      onRefreshEmployees();
    } catch (err: any) {
      setPermError(err.message || 'Failed to update employee permissions');
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateEmpError(null);
    if (!newName.trim() || !newMobile.trim()) return;
    if (!/^\d{10}$/.test(newMobile.trim())) {
      setCreateEmpError('Mobile must be 10 digits');
      return;
    }

    try {
      await api.addEmployee(
        {
          name: newName.trim(),
          mobile: newMobile.trim(),
          password: newPassword.trim(),
          designation: newDesignation.trim(),
          permissions,
        },
        currentUser
      );
      setIsAddingEmp(false);
      setNewName('');
      setNewMobile('');
      onRefreshEmployees();
    } catch (err: any) {
      setCreateEmpError(err.message || 'Failed to create employee');
    }
  };

  const permissionList: { key: keyof EmployeePermissions; label: string; desc: string }[] = [
    { key: 'viewAssignedWork', label: 'View Assigned Work', desc: 'Can view tasks assigned by Admin' },
    { key: 'updateWorkStatus', label: 'Update Work Status', desc: 'Can move status to Under Process / Complete / Doc Required' },
    { key: 'addInternalNotes', label: 'Add Internal Notes', desc: 'Can write confidential notes and application tracking numbers' },
    { key: 'manageCustomerRecords', label: 'Manage Customer Records', desc: 'Can search and view customer contact profiles' },
    { key: 'createOrEditServices', label: 'Create or Edit Services', desc: 'Special power: can modify services catalog' },
    { key: 'uploadServiceImages', label: 'Upload Service Images', desc: 'Can replace card banner graphics' },
    { key: 'editCustomerPrices', label: 'Edit Customer Prices', desc: 'CRITICAL: Can change customer billing rates' },
    { key: 'editGovtFees', label: 'Edit Government / Portal Fees', desc: 'CRITICAL: Can update internal portal fee configs' },
    { key: 'assignOrReassignWork', label: 'Assign or Reassign Work', desc: 'Can delegate requests to other employees' },
    { key: 'viewIncomeAndExpenses', label: 'View Income and Expenses', desc: 'Can see total collections and profit accounting' },
    { key: 'addFinancialTransactions', label: 'Add Financial Transactions', desc: 'Can record cash collections or portal fee debits' },
    { key: 'viewReports', label: 'View Reports & Export', desc: 'Can view business metrics and download CSVs' },
    { key: 'manageLeads', label: 'Manage Leads & CRM', desc: 'Can follow up on inbound inquiries and convert to customers' },
    { key: 'manageCampaigns', label: 'Manage Campaigns', desc: 'Can run marketing promotions and broadcast lists' },
    { key: 'useWhatsAppCenter', label: 'Use Manual WhatsApp Center', desc: 'Can open prefilled click-to-chat messages' },
    { key: 'manageQuickLinks', label: 'Manage Quick Links & Guides', desc: 'Can view/edit official portal links and instructions' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Employee Management & Special Powers
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Admin controls employee accounts, assigned workload, and 16 granular security permissions
          </p>
        </div>

        <button
          onClick={() => setIsAddingEmp(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Employee</span>
        </button>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {employees.map((emp) => {
          const assignedCount = requests.filter((r) => r.assignedEmployeeId === emp.id).length;
          const pendingCount = requests.filter(
            (r) => r.assignedEmployeeId === emp.id && ['Pending', 'Under Process', 'Document Required'].includes(r.status)
          ).length;
          const completedCount = requests.filter(
            (r) => r.assignedEmployeeId === emp.id && r.status === 'Complete'
          ).length;

          const grantedCount = emp.permissions
            ? Object.values(emp.permissions).filter(Boolean).length
            : 0;

          return (
            <div
              key={emp.id}
              className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-base">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{emp.name}</h3>
                      <p className="text-xs text-indigo-600 font-medium">
                        {emp.designation || 'CSC Operator'}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                    {emp.id}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1 mb-4">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono font-medium">+91 {emp.mobile}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Account: {emp.active ? 'Active' : 'Deactivated'}
                  </div>
                </div>

                {/* Workload Metrics */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-neutral-100 text-center text-xs mb-4">
                  <div>
                    <div className="font-bold text-slate-900 tabular-nums">{assignedCount}</div>
                    <div className="text-[10px] text-slate-400">Assigned</div>
                  </div>
                  <div>
                    <div className="font-bold text-amber-600 tabular-nums">{pendingCount}</div>
                    <div className="text-[10px] text-slate-400">In Progress</div>
                  </div>
                  <div>
                    <div className="font-bold text-emerald-600 tabular-nums">{completedCount}</div>
                    <div className="text-[10px] text-slate-400">Completed</div>
                  </div>
                </div>

                {/* Permissions Summary Badge */}
                <div className="p-2 bg-indigo-50/50 rounded-lg border border-indigo-100 text-xs flex items-center justify-between">
                  <span className="text-indigo-900 font-medium">Special Powers Granted:</span>
                  <span className="font-bold text-indigo-700 font-mono">
                    {grantedCount} / {permissionList.length}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleOpenPermissions(emp)}
                className="mt-4 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Configure Powers & Permissions</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Permissions Configuration Modal */}
      {selectedEmp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl overflow-y-auto border border-neutral-200">
            <div className="sticky top-0 bg-slate-900 text-white p-5 flex items-center justify-between z-10">
              <div>
                <h3 className="font-bold text-base text-white">
                  Permissions: {selectedEmp.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  ID: {selectedEmp.id} · {selectedEmp.designation}
                </p>
              </div>
              <button
                onClick={() => setSelectedEmp(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Admin notice: Financial, pricing, and work assignment permissions should only be granted to authorized operators. Revoking permissions takes effect immediately on the server.
                </span>
              </div>

              <div className="divide-y divide-neutral-100">
                {permissionList.map((item) => {
                  const isChecked = !!permissions[item.key];
                  return (
                    <div
                      key={item.key}
                      onClick={() => handleTogglePermission(item.key)}
                      className="py-3 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50 px-2 rounded-lg transition"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900">{item.label}</div>
                        <div className="text-[11px] text-slate-500">{item.desc}</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by parent div
                        className="mt-1 h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>
                  );
                })}
              </div>

              {permError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs mt-3">
                  <span>{permError}</span>
                </div>
              )}

              <div className="pt-4 border-t border-neutral-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedEmp(null)}
                  className="px-4 py-2 border border-neutral-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePermissions}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                >
                  Save Permissions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Employee Modal */}
      {isAddingEmp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-neutral-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base text-slate-900">Add New Employee</h3>
              <button onClick={() => setIsAddingEmp(false)} className="p-1 text-slate-400 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mobile Number (10 digits) *</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="9876543210"
                  value={newMobile}
                  onChange={(e) => setNewMobile(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Login Password *</label>
                <input
                  type="password"
                  required
                  placeholder="emp123"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Senior CSC Operator / Documentation Desk"
                  value={newDesignation}
                  onChange={(e) => setNewDesignation(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {createEmpError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
                  <span>{createEmpError}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddingEmp(false)}
                  className="px-4 py-2 border border-neutral-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                >
                  Create Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
