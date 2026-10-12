import React, { useState } from 'react';
import { LeadItem, RequestItem, ReferralItem, UserProfile } from '../../types/index.ts';
import { api } from '../../lib/api.ts';
import {
  Clock,
  Share2,
  Plus,
  CheckCircle2,
  Phone,
  MessageSquare,
  DollarSign,
  AlertCircle,
  X,
} from 'lucide-react';

interface FollowupsAndReferralsViewProps {
  currentUser: UserProfile;
  leads: LeadItem[];
  requests: RequestItem[];
  referrals: ReferralItem[];
  mode: 'followups' | 'referrals';
  onRefreshData: () => void;
}

export const FollowupsAndReferralsView: React.FC<FollowupsAndReferralsViewProps> = ({
  currentUser,
  leads,
  requests,
  referrals,
  mode,
  onRefreshData,
}) => {
  const [isAddingReferral, setIsAddingReferral] = useState(false);
  const [refName, setRefName] = useState('');
  const [refMobile, setRefMobile] = useState('');
  const [personName, setPersonName] = useState('');
  const [personMobile, setPersonMobile] = useState('');
  const [refService, setRefService] = useState('Vehicle Insurance (Bike & Car Policy)');
  const [rewardAmount, setRewardAmount] = useState('50');

  const pendingFollowups = leads.filter(
    (l) => l.status === 'Follow-up Required' || (l.followUpDate && l.status !== 'Converted to Customer')
  );

  const handleAddReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refName.trim() || !personName.trim()) return;

    try {
      await api.addReferral({
        referrerName: refName.trim(),
        referrerMobile: refMobile.trim(),
        referredPersonName: personName.trim(),
        referredPersonMobile: personMobile.trim(),
        serviceInterested: refService,
        status: 'Pending',
        rewardAmount: Number(rewardAmount) || 0,
      });
      setIsAddingReferral(false);
      setRefName('');
      setPersonName('');
      setPersonMobile('');
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to add referral');
    }
  };

  const handleUpdateReferralStatus = async (id: string, status: any) => {
    try {
      await api.updateReferral(id, { status });
      onRefreshData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (mode === 'followups') {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Clock className="w-6 h-6 text-amber-600" />
            <span>Follow-ups Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pending callbacks, document reminders, and customer follow-up schedule
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingFollowups.map((lead) => (
            <div
              key={lead.id}
              className="bg-white rounded-xl border border-neutral-200 p-4 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-800 rounded">
                    Due: {lead.followUpDate || 'Today'}
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">
                    {lead.status}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 mb-0.5">{lead.name}</h3>
                <div className="text-xs text-slate-500 font-mono mb-2">+91 {lead.mobile}</div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-neutral-100 text-xs text-slate-700 space-y-1 mb-3">
                  <div>
                    <strong>Service:</strong> {lead.interestedService}
                  </div>
                  <div>
                    <strong>Locality:</strong> {lead.areaLocality}
                  </div>
                  {lead.notes?.length > 0 && (
                    <div className="text-[11px] text-slate-500 italic mt-1">
                      Latest: {lead.notes[lead.notes.length - 1]}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <a
                  href={`tel:+91${lead.mobile}`}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
                <a
                  href={`https://wa.me/91${lead.mobile}?text=${encodeURIComponent(
                    `Namaste ${lead.name} ji! CSC CENTER ONLINE WALA (Burari) se aapki enquiry (${lead.interestedService}) ke baare mein baat karni thi.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          ))}

          {pendingFollowups.length === 0 && (
            <div className="col-span-full py-12 text-center bg-white rounded-xl border border-neutral-200 text-slate-400 text-xs">
              Great work! No pending follow-ups scheduled.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Share2 className="w-6 h-6 text-indigo-600" />
            <span>Referral Tracking & Local Partners</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track customer referrals from local shops (tea stalls, photocopy centers) and commission rewards
          </p>
        </div>

        <button
          onClick={() => setIsAddingReferral(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Referral</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-neutral-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Referral ID</th>
                <th className="py-3 px-4 font-semibold">Referrer (Partner)</th>
                <th className="py-3 px-4 font-semibold">Referred Citizen</th>
                <th className="py-3 px-4 font-semibold">Service</th>
                <th className="py-3 px-4 font-semibold">Reward</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {referrals.map((ref) => (
                <tr key={ref.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{ref.id}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{ref.referrerName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">+91 {ref.referrerMobile}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{ref.referredPersonName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">+91 {ref.referredPersonMobile}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-700">{ref.serviceInterested}</td>
                  <td className="py-3 px-4 font-bold text-emerald-700 tabular-nums">
                    ₹{ref.rewardAmount || 0}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {ref.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <select
                      value={ref.status}
                      onChange={(e) => handleUpdateReferralStatus(ref.id, e.target.value)}
                      className="px-2 py-1 bg-white border border-neutral-300 rounded text-xs font-semibold"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Converted">Converted</option>
                      <option value="Paid Reward">Paid Reward</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Referral Modal */}
      {isAddingReferral && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-neutral-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base text-slate-900">Add Referral Entry</h3>
              <button onClick={() => setIsAddingReferral(false)} className="p-1 text-slate-400 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddReferral} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Referrer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Tea Stall Baba Colony"
                  value={refName}
                  onChange={(e) => setRefName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Referrer Mobile</label>
                <input
                  type="tel"
                  placeholder="9811223344"
                  value={refMobile}
                  onChange={(e) => setRefMobile(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Referred Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amit Kumar"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Referred Customer Mobile *</label>
                <input
                  type="tel"
                  required
                  placeholder="9899112233"
                  value={personMobile}
                  onChange={(e) => setPersonMobile(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Commission / Reward (₹)</label>
                <input
                  type="number"
                  value={rewardAmount}
                  onChange={(e) => setRewardAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs font-mono font-bold"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingReferral(false)}
                  className="px-4 py-2 border border-neutral-300 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition"
                >
                  Save Referral
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
