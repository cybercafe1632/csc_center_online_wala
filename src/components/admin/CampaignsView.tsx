import React, { useState } from 'react';
import { CampaignItem, UserProfile, LeadItem, RequestItem, BusinessSettings } from '../../types/index.ts';
import { api } from '../../lib/api.ts';
import {
  Megaphone,
  Plus,
  Play,
  CheckCircle2,
  Users,
  MessageSquare,
  ExternalLink,
  X,
  TrendingUp,
  Filter,
} from 'lucide-react';

interface CampaignsViewProps {
  currentUser: UserProfile;
  campaigns: CampaignItem[];
  leads: LeadItem[];
  requests: RequestItem[];
  settings: BusinessSettings;
  onRefreshCampaigns: () => void;
}

export const CampaignsView: React.FC<CampaignsViewProps> = ({
  currentUser,
  campaigns,
  leads,
  requests,
  settings,
  onRefreshCampaigns,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Campaign create form
  const [campName, setCampName] = useState('');
  const [campObjective, setCampObjective] = useState('');
  const [campService, setCampService] = useState('Instant Smart PVC Card High-Gloss Printing');
  const [campTemplate, setCampTemplate] = useState('Diwali Festival PVC & Smart ID Promotion');

  // Manual Dispatcher states
  const [dispatchQueue, setDispatchQueue] = useState<{ name: string; mobile: string }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleStartDispatch = (camp: CampaignItem) => {
    setSelectedCampaign(camp);
    // Find eligible audience: leads or customers with promotional consent
    const eligible: { name: string; mobile: string }[] = [];
    leads
      .filter((l) => l.promotionalWhatsAppConsent)
      .forEach((l) => eligible.push({ name: l.name, mobile: l.mobile }));

    requests.forEach((r) => {
      if (!eligible.some((e) => e.mobile === r.customerMobile)) {
        eligible.push({ name: r.customerName, mobile: r.customerMobile });
      }
    });

    setDispatchQueue(eligible.slice(0, 10)); // Take first 10 for batch
    setCurrentIndex(0);
  };

  const handleOpenNextWhatsApp = () => {
    if (currentIndex >= dispatchQueue.length || !selectedCampaign) return;
    const recipient = dispatchQueue[currentIndex];
    const text = `Namaste ${recipient.name} ji! 🙏\n\nCSC CENTER ONLINE WALA (Burari) se vishesh suvidha:\n${selectedCampaign.servicePromoted}\n\nKripya sampark karein: 9289787348.`;
    const waLink = `https://wa.me/91${recipient.mobile}?text=${encodeURIComponent(text)}`;

    window.open(waLink, '_blank');

    // Update metrics
    api.updateCampaignMetrics(selectedCampaign.id, {
      chatsOpenedCount: (selectedCampaign.chatsOpenedCount || 0) + 1,
      confirmedSentCount: (selectedCampaign.confirmedSentCount || 0) + 1,
    }).then(() => onRefreshCampaigns());

    setCurrentIndex((prev) => prev + 1);
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campName.trim()) return;

    try {
      await api.createCampaign(
        {
          name: campName.trim(),
          objective: campObjective.trim(),
          servicePromoted: campService,
          audienceFilter: {
            area: 'Baba Colony, Burari',
            onlyPromotionalConsented: true,
          },
          messageTemplate: campTemplate,
          startDate: new Date().toISOString().slice(0, 10),
          owner: currentUser.name,
          status: 'Active',
        },
        currentUser
      );
      setIsCreating(false);
      setCampName('');
      setCampObjective('');
      onRefreshCampaigns();
    } catch (err: any) {
      alert(err.message || 'Failed to create campaign');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-indigo-600" />
            <span>Marketing Campaigns & Manual Broadcast</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Target opted-in local customers with 1-by-1 human Click-to-Chat dispatcher (zero automated spam)
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Campaign</span>
          </button>
        )}
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {campaigns.map((camp) => (
          <div
            key={camp.id}
            className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded">
                  {camp.id}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {camp.status}
                </span>
              </div>

              <h3 className="font-bold text-base text-slate-900 mb-1">{camp.name}</h3>
              <p className="text-xs text-slate-500 mb-3">{camp.objective}</p>

              <div className="text-xs text-slate-600 space-y-1 mb-4 bg-slate-50 p-3 rounded-xl border border-neutral-100">
                <div>
                  <strong>Service Promoted:</strong> {camp.servicePromoted}
                </div>
                <div>
                  <strong>Audience Filter:</strong> Opted-in Local Burari Contacts
                </div>
              </div>

              {/* Recorded Metrics */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs bg-slate-50/70 p-3 rounded-xl border border-neutral-100">
                <div>
                  <div className="font-bold text-slate-900 tabular-nums">
                    {camp.chatsOpenedCount || 0}
                  </div>
                  <div className="text-[10px] text-slate-400">Chats Opened</div>
                </div>
                <div>
                  <div className="font-bold text-emerald-700 tabular-nums">
                    {camp.confirmedSentCount || 0}
                  </div>
                  <div className="text-[10px] text-slate-400">Sent Confirmed</div>
                </div>
                <div>
                  <div className="font-bold text-blue-700 tabular-nums">
                    {camp.repliesRecordedCount || 0}
                  </div>
                  <div className="text-[10px] text-slate-400">Replies</div>
                </div>
                <div>
                  <div className="font-bold text-purple-700 tabular-nums">
                    {camp.conversionsCount || 0}
                  </div>
                  <div className="text-[10px] text-slate-400">Converted</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleStartDispatch(camp)}
              className="mt-5 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Launch 1-by-1 WhatsApp Dispatcher</span>
            </button>
          </div>
        ))}
      </div>

      {/* Manual 1-by-1 Dispatcher Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-neutral-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase">Manual Click-to-Chat</span>
                <h3 className="font-bold text-base text-slate-900">{selectedCampaign.name}</h3>
              </div>
              <button onClick={() => setSelectedCampaign(null)} className="p-1 text-slate-400 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-neutral-200">
                <div className="text-slate-500">Progress:</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">
                  Recipient {currentIndex} of {dispatchQueue.length}
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full transition-all"
                    style={{ width: `${(currentIndex / Math.max(1, dispatchQueue.length)) * 100}%` }}
                  />
                </div>
              </div>

              {currentIndex < dispatchQueue.length ? (
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                  <div className="text-slate-500">Next Recipient:</div>
                  <div className="font-bold text-base text-slate-900">
                    {dispatchQueue[currentIndex].name}
                  </div>
                  <div className="font-mono text-indigo-700 font-semibold">
                    +91 {dispatchQueue[currentIndex].mobile}
                  </div>

                  <button
                    onClick={handleOpenNextWhatsApp}
                    className="mt-4 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs transition"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Open WhatsApp for this Contact</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="text-center py-6 bg-emerald-50 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                  <h4 className="font-bold text-slate-900">Batch Complete!</h4>
                  <p className="text-slate-500 mt-1">All {dispatchQueue.length} contacts opened.</p>
                </div>
              )}

              <button
                onClick={() => setSelectedCampaign(null)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
              >
                Close Dispatcher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Campaign Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-neutral-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base text-slate-900">Create New Campaign</h3>
              <button onClick={() => setIsCreating(false)} className="p-1 text-slate-400 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Campaign Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chhath Puja PVC & Ayushman Drive"
                  value={campName}
                  onChange={(e) => setCampName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Objective</label>
                <input
                  type="text"
                  placeholder="e.g. Re-engage old customers for instant laminated PVC card"
                  value={campObjective}
                  onChange={(e) => setCampObjective(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Service Promoted</label>
                <input
                  type="text"
                  value={campService}
                  onChange={(e) => setCampService(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 border border-neutral-300 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition"
                >
                  Save Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
