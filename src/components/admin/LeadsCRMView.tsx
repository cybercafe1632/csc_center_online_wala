import React, { useState } from 'react';
import { LeadItem, UserProfile, LeadStatus, LeadSource } from '../../types/index.ts';
import { api } from '../../lib/api.ts';
import {
  Target,
  Plus,
  QrCode,
  Phone,
  MessageSquare,
  CheckCircle2,
  Clock,
  UserCheck,
  Calendar,
  X,
  ExternalLink,
  Search,
  Filter,
} from 'lucide-react';

interface LeadsCRMViewProps {
  currentUser: UserProfile;
  leads: LeadItem[];
  employees: UserProfile[];
  onRefreshLeads: () => void;
  onRefreshCustomers: () => void;
}

export const LeadsCRMView: React.FC<LeadsCRMViewProps> = ({
  currentUser,
  leads,
  employees,
  onRefreshLeads,
  onRefreshCustomers,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [isAddingLead, setIsAddingLead] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Form states for adding lead
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [service, setService] = useState('PAN Card (New / Correction / Reprint)');
  const [area, setArea] = useState('Baba Colony, Burari');
  const [source, setSource] = useState<LeadSource>('Walk-in');
  const [message, setMessage] = useState('');

  // Status & Note update states
  const [newStatus, setNewStatus] = useState<LeadStatus>('Interested');
  const [followUpDate, setFollowUpDate] = useState('');
  const [assignEmpId, setAssignEmpId] = useState('');
  const [newNote, setNewNote] = useState('');

  const filtered = leads.filter((l) => {
    const matchSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.mobile.includes(search) ||
      l.interestedService.toLowerCase().includes(search.toLowerCase()) ||
      l.areaLocality.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    const matchSource = sourceFilter === 'all' || l.source === sourceFilter;
    return matchSearch && matchStatus && matchSource;
  });

  const handleOpenLead = (l: LeadItem) => {
    setSelectedLead(l);
    setNewStatus(l.status);
    setFollowUpDate(l.followUpDate || '');
    setAssignEmpId(l.assignedEmployeeId || '');
    setNewNote('');
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim()) return;
    if (!/^\d{10}$/.test(mobile.trim())) {
      alert('Mobile must be 10 digits');
      return;
    }

    try {
      await api.createLead({
        name: name.trim(),
        mobile: mobile.trim(),
        interestedService: service,
        areaLocality: area.trim(),
        message: message.trim(),
        source,
        contactConsent: true,
        promotionalWhatsAppConsent: true,
      });
      setIsAddingLead(false);
      setName('');
      setMobile('');
      setMessage('');
      onRefreshLeads();
    } catch (err: any) {
      alert(err.message || 'Failed to add lead');
    }
  };

  const handleUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    try {
      const updates: Partial<LeadItem> = {
        status: newStatus,
        followUpDate: followUpDate || undefined,
        assignedEmployeeId: assignEmpId || undefined,
      };

      if (assignEmpId) {
        const emp = employees.find((e) => e.id === assignEmpId);
        if (emp) updates.assignedEmployeeName = emp.name;
      }

      if (newNote.trim()) {
        updates.notes = [
          ...(selectedLead.notes || []),
          `[${new Date().toLocaleDateString('en-IN')} by ${currentUser.name}]: ${newNote.trim()}`,
        ];
      }

      const updated = await api.updateLead(selectedLead.id, updates, currentUser);
      setSelectedLead(updated);
      setNewNote('');
      onRefreshLeads();
    } catch (err: any) {
      alert(err.message || 'Failed to update lead');
    }
  };

  const handleConvertCustomer = async () => {
    if (!selectedLead) return;
    try {
      await api.convertLeadToCustomer(selectedLead.id, currentUser);
      alert(`Lead successfully converted to Customer!`);
      setSelectedLead(null);
      onRefreshLeads();
      onRefreshCustomers();
    } catch (err: any) {
      alert(err.message || 'Failed to convert');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Target className="w-6 h-6 text-purple-600" />
            <span>Lead Generation & CRM</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Capture citizen inquiries from Facebook, website, WhatsApp & walk-in counter, manage follow-ups, and convert to customers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQrModal(true)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
          >
            <QrCode className="w-4 h-4 text-slate-600" />
            <span>Shop QR Code</span>
          </button>

          <button
            onClick={() => setIsAddingLead(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Walk-in Lead</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads by name, mobile, service, colony..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-neutral-200 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-neutral-200 rounded-lg font-medium"
        >
          <option value="all">All Lead Statuses</option>
          <option value="New Lead">New Lead</option>
          <option value="Contact Pending">Contact Pending</option>
          <option value="Contacted">Contacted</option>
          <option value="Interested">Interested</option>
          <option value="Follow-up Required">Follow-up Required</option>
          <option value="Converted to Customer">Converted to Customer</option>
          <option value="Not Interested">Not Interested</option>
        </select>

        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-neutral-200 rounded-lg font-medium"
        >
          <option value="all">All Lead Sources</option>
          <option value="Walk-in">Walk-in</option>
          <option value="Website">Website</option>
          <option value="WhatsApp">WhatsApp</option>
          <option value="Facebook">Facebook</option>
          <option value="Instagram">Instagram</option>
          <option value="YouTube">YouTube</option>
          <option value="Referral">Referral</option>
        </select>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-neutral-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Lead ID</th>
                <th className="py-3 px-4 font-semibold">Contact Name</th>
                <th className="py-3 px-4 font-semibold">Interested Service</th>
                <th className="py-3 px-4 font-semibold">Area / Source</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Follow-up</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => handleOpenLead(lead)}
                  className="hover:bg-purple-50/40 cursor-pointer transition"
                >
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{lead.id}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{lead.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">+91 {lead.mobile}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-800 line-clamp-1">{lead.interestedService}</div>
                    {lead.message && (
                      <div className="text-[11px] text-slate-400 line-clamp-1 italic">{lead.message}</div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-slate-700">{lead.areaLocality || 'Burari'}</div>
                    <div className="text-[10px] text-purple-600 font-semibold">{lead.source}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {lead.followUpDate ? (
                      <span className="text-amber-700 font-semibold">{lead.followUpDate}</span>
                    ) : (
                      <span className="text-slate-400">None</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenLead(lead);
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-purple-600 hover:text-white rounded text-xs font-semibold transition"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-xs">
            No leads found matching your search.
          </div>
        )}
      </div>

      {/* Lead Detail & Follow-up Drawer */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] shadow-2xl overflow-y-auto border border-neutral-200">
            <div className="sticky top-0 bg-slate-900 text-white p-5 flex items-center justify-between z-10">
              <div>
                <span className="font-mono text-xs text-purple-300 font-bold">{selectedLead.id}</span>
                <h3 className="font-bold text-base text-white">{selectedLead.name}</h3>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Contact info card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-neutral-200 flex justify-between items-center">
                <div>
                  <div className="font-mono font-bold text-sm text-slate-900">+91 {selectedLead.mobile}</div>
                  <div className="text-slate-500 mt-0.5">Locality: {selectedLead.areaLocality}</div>
                  <div className="text-slate-500">Service: {selectedLead.interestedService}</div>
                </div>

                <a
                  href={`https://wa.me/91${selectedLead.mobile}?text=${encodeURIComponent(
                    `Namaste ${selectedLead.name} ji! CSC CENTER ONLINE WALA (Burari) se aapki enquiry mili thi.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>

              {/* Status & Follow-up Form */}
              <form onSubmit={handleUpdateLead} className="space-y-3 bg-white p-4 rounded-xl border border-neutral-200">
                <div className="font-bold text-slate-900 text-sm">Update Lead Status & Follow-up</div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as LeadStatus)}
                      className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg bg-white"
                    >
                      <option value="New Lead">New Lead</option>
                      <option value="Contact Pending">Contact Pending</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Interested">Interested</option>
                      <option value="Follow-up Required">Follow-up Required</option>
                      <option value="Converted to Customer">Converted to Customer</option>
                      <option value="Not Interested">Not Interested</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Follow-up Due Date</label>
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Assign Follow-up to Employee</label>
                  <select
                    value={assignEmpId}
                    onChange={(e) => setAssignEmpId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg bg-white"
                  >
                    <option value="">Unassigned</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.designation || 'Operator'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Add Note / Call Outcome</label>
                  <input
                    type="text"
                    placeholder="e.g. Spoke to customer, will come on Saturday with Aadhaar"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg"
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={handleConvertCustomer}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Convert to Customer</span>
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition"
                  >
                    Save Changes
                  </button>
                </div>
              </form>

              {/* Notes History */}
              <div>
                <h4 className="font-bold text-slate-700 mb-2">History & Activity Notes</h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {selectedLead.notes?.map((n, i) => (
                    <div key={i} className="p-2 bg-slate-50 rounded border border-neutral-100 text-slate-700">
                      {n}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Walk-in Lead Modal */}
      {isAddingLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-neutral-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base text-slate-900">Add Walk-in or Phone Lead</h3>
              <button onClick={() => setIsAddingLead(false)} className="p-1 text-slate-400 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunil Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mobile Number (10 digits) *</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="9289787348"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Interested Service</label>
                <input
                  type="text"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Locality / Colony</label>
                <input
                  type="text"
                  placeholder="e.g. Baba Colony, Burari"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Source</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as LeadSource)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white"
                >
                  <option value="Walk-in">Walk-in at Shop</option>
                  <option value="WhatsApp">WhatsApp Inquiry</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Referral">Referral</option>
                  <option value="Website">Website</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingLead(false)}
                  className="px-4 py-2 border border-neutral-300 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center border border-neutral-200 shadow-2xl">
            <h3 className="font-bold text-slate-900 text-base mb-1">Shop Counter QR Code</h3>
            <p className="text-xs text-slate-500 mb-4">Print or show on tablet for customer inquiries</p>

            <div className="w-48 h-48 mx-auto bg-slate-100 rounded-xl p-4 border border-dashed border-neutral-300 flex flex-col items-center justify-center mb-4">
              <QrCode className="w-32 h-32 text-slate-800" />
              <span className="text-[10px] text-slate-500 font-mono mt-1">Scan for Online Services</span>
            </div>

            <p className="text-xs text-slate-600 mb-4 font-medium">
              CSC CENTER ONLINE WALA · Burari Delhi · 9289787348
            </p>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
