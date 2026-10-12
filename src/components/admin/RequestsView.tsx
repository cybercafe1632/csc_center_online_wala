import React, { useState, useMemo } from 'react';
import { RequestItem, UserProfile, RequestStatus } from '../../types/index.ts';
import { api } from '../../lib/api.ts';
import {
  Search,
  Filter,
  UserCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileText,
  DollarSign,
  MessageSquare,
  Send,
  X,
  ExternalLink,
  ChevronRight,
  UserPlus,
  ShieldAlert,
  Calendar,
  History,
} from 'lucide-react';

interface RequestsViewProps {
  currentUser: UserProfile;
  requests: RequestItem[];
  employees: UserProfile[];
  onRefreshRequests: () => void;
  selectedRequestFromOutside?: RequestItem | null;
  onClearSelectedRequest?: () => void;
}

export const RequestsView: React.FC<RequestsViewProps> = ({
  currentUser,
  requests,
  employees,
  onRefreshRequests,
  selectedRequestFromOutside,
  onClearSelectedRequest,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const perms = currentUser.permissions;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(
    selectedRequestFromOutside || null
  );

  // Detail Modal Sub-actions
  const [newStatus, setNewStatus] = useState<RequestStatus>('Under Process');
  const [statusNote, setStatusNote] = useState('');
  const [internalNoteInput, setInternalNoteInput] = useState('');
  const [assignEmpId, setAssignEmpId] = useState('');
  const [assignPriority, setAssignPriority] = useState<'Normal' | 'High' | 'Urgent'>('Normal');
  const [assignDueDate, setAssignDueDate] = useState('');

  // Financial adjustment states
  const [recordAmountReceived, setRecordAmountReceived] = useState('');
  const [recordGovtFee, setRecordGovtFee] = useState('');
  const [recordExpense, setRecordExpense] = useState('');
  const [paymentMode, setPaymentMode] = useState<RequestItem['paymentMode']>('Cash');

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchSearch =
        r.id.toLowerCase().includes(search.toLowerCase()) ||
        r.customerName.toLowerCase().includes(search.toLowerCase()) ||
        r.customerMobile.includes(search) ||
        r.serviceName.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchEmp =
        employeeFilter === 'all' ||
        (employeeFilter === 'unassigned' && !r.assignedEmployeeId) ||
        r.assignedEmployeeId === employeeFilter;

      return matchSearch && matchStatus && matchEmp;
    });
  }, [requests, search, statusFilter, employeeFilter]);

  const handleOpenDetail = (req: RequestItem) => {
    setSelectedRequest(req);
    setNewStatus(req.status);
    setStatusNote('');
    setInternalNoteInput('');
    setAssignEmpId(req.assignedEmployeeId || '');
    setAssignPriority(req.priority || 'Normal');
    setAssignDueDate(req.dueDate || '');
    setRecordAmountReceived('');
    setRecordGovtFee('');
    setRecordExpense('');
  };

  const handleCloseDetail = () => {
    setSelectedRequest(null);
    if (onClearSelectedRequest) onClearSelectedRequest();
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    try {
      const updated = await api.updateRequestStatus(
        selectedRequest.id,
        newStatus,
        statusNote,
        currentUser
      );
      setSelectedRequest(updated);
      setStatusNote('');
      onRefreshRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleAssignEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !assignEmpId) return;
    try {
      const updated = await api.assignRequest(
        selectedRequest.id,
        {
          employeeId: assignEmpId,
          priority: assignPriority,
          dueDate: assignDueDate || undefined,
        },
        currentUser
      );
      setSelectedRequest(updated);
      onRefreshRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to assign work');
    }
  };

  const handleAddInternalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !internalNoteInput.trim()) return;
    try {
      const updated = await api.addInternalNote(
        selectedRequest.id,
        internalNoteInput.trim(),
        currentUser
      );
      setSelectedRequest(updated);
      setInternalNoteInput('');
      onRefreshRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to add note');
    }
  };

  const handleUpdateFinancials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    try {
      const payload: any = {};
      if (recordAmountReceived !== '') {
        payload.amountReceived = Number(recordAmountReceived);
        payload.paymentMode = paymentMode;
      }
      if (recordGovtFee !== '') payload.actualGovtFeePaid = Number(recordGovtFee);
      if (recordExpense !== '') payload.otherExpensesPaid = Number(recordExpense);

      const updated = await api.updateRequestFinancials(
        selectedRequest.id,
        payload,
        currentUser
      );
      setSelectedRequest(updated);
      setRecordAmountReceived('');
      setRecordGovtFee('');
      setRecordExpense('');
      onRefreshRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to update financials');
    }
  };

  const handleOpenWhatsAppToCustomer = (type: 'status' | 'collection' | 'doc') => {
    if (!selectedRequest) return;

    let text = '';
    if (type === 'collection') {
      text = `Namaste ${selectedRequest.customerName} ji! Aapka ${selectedRequest.serviceName} (Request ID: ${selectedRequest.id}) taiyar ho chuka hai. Kripya CSC CENTER ONLINE WALA (Shop 200, Baba Colony, Burari) aakar receive kar lein. Timings: 8:30 AM to 9:00 PM.`;
    } else if (type === 'doc') {
      text = `Namaste ${selectedRequest.customerName} ji! Aapki request ${selectedRequest.id} (${selectedRequest.serviceName}) ke liye jaruri documents pending hain. Kripya WhatsApp par photo bhej dijiye ya shop par le aaiye.`;
    } else {
      text = `Namaste ${selectedRequest.customerName} ji! Aapki request ${selectedRequest.id} (${selectedRequest.serviceName}) ka current status: *${selectedRequest.status}*. Kisi bhi sahayata ke liye sampark karein: 9289787348.`;
    }

    const waLink = `https://wa.me/91${selectedRequest.customerMobile}?text=${encodeURIComponent(text)}`;
    window.open(waLink, '_blank');

    // Log in WhatsApp Center
    api.logWhatsAppMessage(
      {
        recipientMobile: selectedRequest.customerMobile,
        recipientName: selectedRequest.customerName,
        messageType: type === 'collection' ? 'ready_collection' : type === 'doc' ? 'doc_reminder' : 'status_update',
        messageText: text,
        relatedRequestId: selectedRequest.id,
        outcome: 'WhatsApp Opened',
      },
      currentUser
    ).catch(() => {});
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Requests & Work Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track customer applications, assign operators, update statuses and record portal fees
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Total Work Items: <span className="font-bold text-slate-900">{requests.length}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Request ID, customer, mobile, service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-neutral-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-neutral-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="New / Unassigned">New / Unassigned</option>
          <option value="Pending">Pending</option>
          <option value="Under Process">Under Process</option>
          <option value="Document Required">Document Required</option>
          <option value="Ready for Collection">Ready for Collection</option>
          <option value="Complete">Complete</option>
          <option value="Rejected">Rejected</option>
        </select>

        <select
          value={employeeFilter}
          onChange={(e) => setEmployeeFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-neutral-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        >
          <option value="all">All Employees</option>
          <option value="unassigned">Unassigned Only</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name}
            </option>
          ))}
        </select>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-neutral-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Request ID</th>
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold">Service</th>
                <th className="py-3 px-4 font-semibold">Price / Due</th>
                <th className="py-3 px-4 font-semibold">Assigned To</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredRequests.map((req) => {
                const outstanding = Math.max(0, req.customerPriceSnapshot - (req.amountReceived || 0));
                return (
                  <tr
                    key={req.id}
                    onClick={() => handleOpenDetail(req)}
                    className="hover:bg-indigo-50/40 cursor-pointer transition"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {req.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{req.customerName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{req.customerMobile}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800 line-clamp-1">{req.serviceName}</div>
                      <div className="text-[11px] text-slate-400">{req.serviceCategory}</div>
                    </td>
                    <td className="py-3 px-4 tabular-nums">
                      <div className="font-bold text-slate-900">₹{req.customerPriceSnapshot}</div>
                      <div className={`text-[11px] ${outstanding > 0 ? 'text-rose-600 font-semibold' : 'text-emerald-600'}`}>
                        {outstanding > 0 ? `Due: ₹${outstanding}` : 'Paid'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {req.assignedEmployeeName ? (
                        <span className="text-slate-700 font-medium">{req.assignedEmployeeName}</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {new Date(req.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetail(req);
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-600 hover:text-white rounded text-xs font-semibold transition"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-xs">
            No requests found matching your filter criteria.
          </div>
        )}
      </div>

      {/* Request Detail Drawer / Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] shadow-2xl overflow-y-auto border border-neutral-200">
            {/* Modal Header */}
            <div className="sticky top-0 bg-slate-900 text-white p-5 flex items-center justify-between z-10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-indigo-500/30 text-indigo-200 rounded">
                    {selectedRequest.id}
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-300 font-semibold">{selectedRequest.status}</span>
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {selectedRequest.serviceName}
                </h3>
              </div>
              <button
                onClick={handleCloseDetail}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-neutral-200 text-xs">
                <div>
                  <span className="text-slate-400 block">Customer Name & ID:</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedRequest.customerName}</span>
                  <span className="text-slate-500 block text-[11px]">ID: {selectedRequest.customerId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Mobile & Address:</span>
                  <a
                    href={`tel:+91${selectedRequest.customerMobile}`}
                    className="font-mono font-bold text-indigo-600 hover:underline block"
                  >
                    +91 {selectedRequest.customerMobile}
                  </a>
                  <span className="text-slate-500 block text-[11px]">
                    {selectedRequest.customerAddress || 'Baba Colony, Burari, Delhi'}
                  </span>
                </div>
              </div>

              {/* Financial Snapshot & Ledger Breakdown */}
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Price Snapshot & Accounting Breakdown</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Gross Margin: ₹{selectedRequest.customerPriceSnapshot - (selectedRequest.actualGovtFeePaid || 0)}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-neutral-200">
                    <span className="text-slate-400 block text-[10px]">Customer Price:</span>
                    <span className="font-bold text-slate-900 tabular-nums">
                      ₹{selectedRequest.customerPriceSnapshot}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-neutral-200">
                    <span className="text-slate-400 block text-[10px]">Amount Received:</span>
                    <span className="font-bold text-emerald-700 tabular-nums">
                      ₹{selectedRequest.amountReceived || 0}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-neutral-200">
                    <span className="text-slate-400 block text-[10px]">Govt Fee Paid:</span>
                    <span className="font-bold text-amber-700 tabular-nums">
                      ₹{selectedRequest.actualGovtFeePaid || 0}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-neutral-200">
                    <span className="text-slate-400 block text-[10px]">Balance Due:</span>
                    <span className="font-bold text-rose-700 tabular-nums">
                      ₹{Math.max(0, selectedRequest.customerPriceSnapshot - (selectedRequest.amountReceived || 0))}
                    </span>
                  </div>
                </div>

                {/* Quick Financial Update Form (Admin or Staff) */}
                {(isAdmin || perms?.addFinancialTransactions) && (
                  <form onSubmit={handleUpdateFinancials} className="mt-3 pt-3 border-t border-indigo-100 flex flex-wrap items-center gap-2">
                    <input
                      type="number"
                      placeholder="Total Cash/UPI Received ₹"
                      value={recordAmountReceived}
                      onChange={(e) => setRecordAmountReceived(e.target.value)}
                      className="px-2.5 py-1.5 bg-white border border-neutral-300 rounded text-xs w-44 font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Actual Govt Fee Paid ₹"
                      value={recordGovtFee}
                      onChange={(e) => setRecordGovtFee(e.target.value)}
                      className="px-2.5 py-1.5 bg-white border border-neutral-300 rounded text-xs w-40 font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold transition"
                    >
                      Update Financials
                    </button>
                  </form>
                )}
              </div>

              {/* Work Assignment Module (Admin or Permitted Employee) */}
              {(isAdmin || perms?.assignOrReassignWork) && (
                <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Employee Assignment & Priority</span>
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      Current: {selectedRequest.assignedEmployeeName || 'Unassigned'}
                    </span>
                  </div>

                  <form onSubmit={handleAssignEmployee} className="flex flex-wrap items-center gap-3">
                    <select
                      value={assignEmpId}
                      onChange={(e) => setAssignEmpId(e.target.value)}
                      className="px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-medium bg-white"
                    >
                      <option value="">Select Employee...</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} ({emp.designation || 'Operator'})
                        </option>
                      ))}
                    </select>

                    <select
                      value={assignPriority}
                      onChange={(e) => setAssignPriority(e.target.value as any)}
                      className="px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-medium bg-white"
                    >
                      <option value="Normal">Priority: Normal</option>
                      <option value="High">Priority: High</option>
                      <option value="Urgent">Priority: Urgent</option>
                    </select>

                    <input
                      type="date"
                      value={assignDueDate}
                      onChange={(e) => setAssignDueDate(e.target.value)}
                      className="px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-medium bg-white"
                    />

                    <button
                      type="submit"
                      disabled={!assignEmpId}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-lg text-xs font-semibold transition"
                    >
                      Save Assignment
                    </button>
                  </form>
                </div>
              )}

              {/* Status Update & Actions */}
              {(isAdmin || perms?.updateWorkStatus) && (
                <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Update Work Status</span>
                  </h4>

                  <form onSubmit={handleUpdateStatus} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as RequestStatus)}
                        className="px-3 py-2 border border-neutral-300 rounded-lg text-xs font-semibold bg-white"
                      >
                        <option value="New / Unassigned">New / Unassigned</option>
                        <option value="Pending">Pending</option>
                        <option value="Under Process">Under Process</option>
                        <option value="Document Required">Document Required</option>
                        <option value="Ready for Collection">Ready for Collection</option>
                        <option value="Complete">Complete</option>
                        <option value="Rejected">Rejected</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Public remark / Status note (optional)..."
                        value={statusNote}
                        onChange={(e) => setStatusNote(e.target.value)}
                        className="px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                    >
                      Confirm Status Update
                    </button>
                  </form>
                </div>
              )}

              {/* Quick WhatsApp Actions */}
              <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Send WhatsApp Message to Customer</span>
                  </h4>
                  <span className="text-[11px] text-emerald-700 font-mono">
                    +91 {selectedRequest.customerMobile}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleOpenWhatsAppToCustomer('collection')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1"
                  >
                    <span>Ready for Collection Notice</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleOpenWhatsAppToCustomer('doc')}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1"
                  >
                    <span>Missing Document Notice</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleOpenWhatsAppToCustomer('status')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1"
                  >
                    <span>General Status Update</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Internal Notes (Strictly Hidden from Customers) */}
              {(isAdmin || perms?.addInternalNotes) && (
                <div className="bg-slate-50 p-4 rounded-xl border border-neutral-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                      <span>Confidential Internal Notes</span>
                    </h4>
                    <span className="text-[10px] text-amber-700 font-semibold bg-amber-100 px-2 py-0.5 rounded">
                      Staff & Admin Only · Never shown to customer
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {selectedRequest.internalNotes?.map((note, idx) => (
                      <div
                        key={idx}
                        className="text-xs text-slate-700 bg-white p-2 rounded border border-neutral-200"
                      >
                        {note}
                      </div>
                    ))}
                    {(!selectedRequest.internalNotes || selectedRequest.internalNotes.length === 0) && (
                      <p className="text-xs text-slate-400 italic">No internal notes added yet.</p>
                    )}
                  </div>

                  <form onSubmit={handleAddInternalNote} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add portal acknowledgment number, SDM remark, etc..."
                      value={internalNoteInput}
                      onChange={(e) => setInternalNoteInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!internalNoteInput.trim()}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-lg text-xs font-semibold transition"
                    >
                      Save Note
                    </button>
                  </form>
                </div>
              )}

              {/* History Timeline */}
              <div className="pt-2 border-t border-neutral-200">
                <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-slate-400" />
                  <span>Timestamped Audit History</span>
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto text-xs">
                  {selectedRequest.history?.map((h, i) => (
                    <div key={i} className="flex items-start justify-between text-slate-600 bg-slate-50 p-2 rounded">
                      <div>
                        <span className="font-semibold text-slate-900">{h.updatedBy}: </span>
                        <span>{h.note}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono ml-2">
                        {new Date(h.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
