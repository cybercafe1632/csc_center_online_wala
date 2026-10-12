import React, { useState } from 'react';
import {
  UserProfile,
  WhatsAppLogItem,
  RequestItem,
  LeadItem,
  WhatsAppOutcome,
  BusinessSettings,
} from '../../types/index.ts';
import { api } from '../../lib/api.ts';
import {
  MessageSquare,
  Send,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  User,
  Phone,
  RefreshCw,
  Edit3,
} from 'lucide-react';

interface WhatsAppCenterViewProps {
  currentUser: UserProfile;
  settings: BusinessSettings;
  requests: RequestItem[];
  leads: LeadItem[];
  logs: WhatsAppLogItem[];
  onRefreshLogs: () => void;
}

export const WhatsAppCenterView: React.FC<WhatsAppCenterViewProps> = ({
  currentUser,
  settings,
  requests,
  leads,
  logs,
  onRefreshLogs,
}) => {
  const [recipientType, setRecipientType] = useState<'request' | 'lead' | 'custom'>('request');
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [customMobile, setCustomMobile] = useState('');
  const [customName, setCustomName] = useState('');

  const [templateType, setTemplateType] = useState<
    'ready_collection' | 'status_update' | 'doc_reminder' | 'payment_reminder' | 'custom'
  >('ready_collection');

  const [messageDraft, setMessageDraft] = useState('');
  const [selectedLogForOutcome, setSelectedLogForOutcome] = useState<WhatsAppLogItem | null>(null);
  const [outcomeVal, setOutcomeVal] = useState<WhatsAppOutcome>('WhatsApp Opened');
  const [outcomeNote, setOutcomeNote] = useState('');

  // Auto-generate template draft when inputs change
  const generateDraft = (type: typeof templateType, name: string, req?: RequestItem, lead?: LeadItem) => {
    const custName = name || 'Customer';
    const reqId = req?.id || 'REQ-XXXX';
    const srvName = req?.serviceName || lead?.interestedService || 'Online Service';

    switch (type) {
      case 'ready_collection':
        return `Namaste ${custName} ji! 🙏\n\nAapka *${srvName}* (Request ID: *${reqId}*) banke taiyar hai.\nKripya hamari shop par aakar physical card / document receive kar lein.\n\n📍 *CSC CENTER ONLINE WALA*\nShop No. 200, B Block, Baba Colony, Burari, Delhi\n⏰ Samay: 8:30 AM to 9:00 PM\n📞 Helpline: 9289787348`;
      case 'doc_reminder':
        return `Namaste ${custName} ji! 🙏\n\nAapki request *${reqId}* (${srvName}) ke liye jaruri documents pending hain.\nKripya is WhatsApp number par photo bhej dijiye ya center par aakar submit karein taaki hum aage process kar sakein.\n\nCSC CENTER ONLINE WALA · Burari (9289787348)`;
      case 'payment_reminder':
        const bal = req ? req.customerPriceSnapshot - (req.amountReceived || 0) : 0;
        return `Namaste ${custName} ji! 🙏\n\nAapki request *${reqId}* (${srvName}) ka bacha hua balance *₹${bal}* pending hai.\nKripya UPI ya cash dwara bhugtan karein taaki document delivery ki ja sake.\n\nUPI: 9289787348@paytm\nCSC CENTER ONLINE WALA`;
      case 'status_update':
        return `Namaste ${custName} ji! 🙏\n\nAapki request *${reqId}* (${srvName}) ka status abhi *${req?.status || 'Under Process'}* hai.\nJaise hi document taiyar hoga, hum aapko suchit karenge.\n\nCSC CENTER ONLINE WALA · 9289787348`;
      default:
        return `Namaste ${custName} ji! 🙏\n\nCSC CENTER ONLINE WALA (Baba Colony Burari) se aapko suchit kiya ja raha hai.\nKisi bhi sahayata ke liye reply karein ya call karein: 9289787348.`;
    }
  };

  const handleSelectRequest = (reqId: string) => {
    setSelectedRequestId(reqId);
    const req = requests.find((r) => r.id === reqId);
    if (req) {
      setMessageDraft(generateDraft(templateType, req.customerName, req));
    }
  };

  const handleSelectLead = (lId: string) => {
    setSelectedLeadId(lId);
    const lead = leads.find((l) => l.id === lId);
    if (lead) {
      setMessageDraft(generateDraft(templateType, lead.name, undefined, lead));
    }
  };

  const handleTemplateChange = (t: typeof templateType) => {
    setTemplateType(t);
    let targetName = customName;
    let req: RequestItem | undefined;
    let lead: LeadItem | undefined;

    if (recipientType === 'request') {
      req = requests.find((r) => r.id === selectedRequestId);
      if (req) targetName = req.customerName;
    } else if (recipientType === 'lead') {
      lead = leads.find((l) => l.id === selectedLeadId);
      if (lead) targetName = lead.name;
    }

    setMessageDraft(generateDraft(t, targetName, req, lead));
  };

  const handleOpenWhatsApp = async () => {
    let targetMobile = '';
    let targetName = '';
    let relatedReqId: string | undefined;
    let relatedLeadId: string | undefined;

    if (recipientType === 'request') {
      const req = requests.find((r) => r.id === selectedRequestId);
      if (!req) {
        alert('Please select a request');
        return;
      }
      targetMobile = req.customerMobile;
      targetName = req.customerName;
      relatedReqId = req.id;
    } else if (recipientType === 'lead') {
      const lead = leads.find((l) => l.id === selectedLeadId);
      if (!lead) {
        alert('Please select a lead');
        return;
      }
      targetMobile = lead.mobile;
      targetName = lead.name;
      relatedLeadId = lead.id;
    } else {
      if (!customMobile || !customMobile.trim()) {
        alert('Please enter a 10-digit mobile number');
        return;
      }
      targetMobile = customMobile.trim();
      targetName = customName.trim() || 'Customer';
    }

    // Clean mobile number
    const cleanPhone = targetMobile.replace(/\D/g, '');
    const waLink = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(messageDraft)}`;

    // Open WhatsApp Click-to-Chat in new window
    window.open(waLink, '_blank');

    // Create log in DB
    try {
      const logged = await api.logWhatsAppMessage(
        {
          recipientMobile: cleanPhone,
          recipientName: targetName,
          messageType: templateType === 'ready_collection' ? 'ready_collection' : templateType === 'doc_reminder' ? 'doc_reminder' : templateType === 'payment_reminder' ? 'payment_reminder' : 'custom',
          messageText: messageDraft,
          relatedRequestId: relatedReqId,
          relatedLeadId: relatedLeadId,
          outcome: 'WhatsApp Opened',
        },
        currentUser
      );
      onRefreshLogs();
      setSelectedLogForOutcome(logged);
    } catch (err: any) {
      console.error('Failed to log WhatsApp interaction', err);
    }
  };

  const handleUpdateOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLogForOutcome) return;
    try {
      await api.updateWhatsAppOutcome(
        selectedLogForOutcome.id,
        outcomeVal,
        outcomeNote,
        currentUser
      );
      setSelectedLogForOutcome(null);
      setOutcomeNote('');
      onRefreshLogs();
    } catch (err: any) {
      alert(err.message || 'Failed to update outcome');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-emerald-600" />
            <span>Manual WhatsApp Center (No API Required)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Send official Click-to-Chat messages with prefilled templates and track manual delivery outcomes
          </p>
        </div>

        <div className="text-xs bg-emerald-50 text-emerald-800 font-bold px-3 py-1.5 rounded-lg border border-emerald-200">
          Official Number: +91 {settings.phone}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Message Composer (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Compose & Send Message</h2>

          {/* Recipient Source Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Select Recipient Type
            </label>
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                onClick={() => setRecipientType('request')}
                className={`flex-1 py-1.5 px-3 rounded-lg font-semibold border transition ${
                  recipientType === 'request'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 text-slate-700 border-neutral-200 hover:bg-slate-100'
                }`}
              >
                From Requests ({requests.length})
              </button>
              <button
                type="button"
                onClick={() => setRecipientType('lead')}
                className={`flex-1 py-1.5 px-3 rounded-lg font-semibold border transition ${
                  recipientType === 'lead'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 text-slate-700 border-neutral-200 hover:bg-slate-100'
                }`}
              >
                From Leads ({leads.length})
              </button>
              <button
                type="button"
                onClick={() => setRecipientType('custom')}
                className={`flex-1 py-1.5 px-3 rounded-lg font-semibold border transition ${
                  recipientType === 'custom'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 text-slate-700 border-neutral-200 hover:bg-slate-100'
                }`}
              >
                Custom Number
              </button>
            </div>
          </div>

          {/* Recipient Dropdown */}
          {recipientType === 'request' && (
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Choose Customer Request
              </label>
              <select
                value={selectedRequestId}
                onChange={(e) => handleSelectRequest(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs font-medium bg-white"
              >
                <option value="">Select a request...</option>
                {requests.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.id} - {r.customerName} ({r.serviceName} · {r.status})
                  </option>
                ))}
              </select>
            </div>
          )}

          {recipientType === 'lead' && (
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Choose Lead / Inquiry
              </label>
              <select
                value={selectedLeadId}
                onChange={(e) => handleSelectLead(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs font-medium bg-white"
              >
                <option value="">Select an inquiry...</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.id} - {l.name} ({l.interestedService} · {l.status})
                  </option>
                ))}
              </select>
            </div>
          )}

          {recipientType === 'custom' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Customer Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">10-Digit Mobile</label>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="9289787348"
                  value={customMobile}
                  onChange={(e) => setCustomMobile(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs font-mono"
                />
              </div>
            </div>
          )}

          {/* Template Category Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Select Message Purpose
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleTemplateChange('ready_collection')}
                className={`py-2 px-2.5 rounded-lg font-semibold border text-center transition ${
                  templateType === 'ready_collection'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 text-slate-700 border-neutral-200 hover:bg-slate-100'
                }`}
              >
                Ready for Collection
              </button>
              <button
                type="button"
                onClick={() => handleTemplateChange('doc_reminder')}
                className={`py-2 px-2.5 rounded-lg font-semibold border text-center transition ${
                  templateType === 'doc_reminder'
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-slate-50 text-slate-700 border-neutral-200 hover:bg-slate-100'
                }`}
              >
                Missing Document
              </button>
              <button
                type="button"
                onClick={() => handleTemplateChange('payment_reminder')}
                className={`py-2 px-2.5 rounded-lg font-semibold border text-center transition ${
                  templateType === 'payment_reminder'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-slate-50 text-slate-700 border-neutral-200 hover:bg-slate-100'
                }`}
              >
                Payment Reminder
              </button>
              <button
                type="button"
                onClick={() => handleTemplateChange('status_update')}
                className={`py-2 px-2.5 rounded-lg font-semibold border text-center transition ${
                  templateType === 'status_update'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-700 border-neutral-200 hover:bg-slate-100'
                }`}
              >
                General Status
              </button>
            </div>
          </div>

          {/* Message Textarea */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Message Content (Fully Editable)
              </label>
              <span className="text-[10px] text-slate-400">
                {messageDraft.length} characters
              </span>
            </div>
            <textarea
              rows={7}
              value={messageDraft}
              onChange={(e) => setMessageDraft(e.target.value)}
              placeholder="Select a request above or type your custom message..."
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-xl text-xs font-sans leading-relaxed focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Send CTA */}
          <button
            onClick={handleOpenWhatsApp}
            disabled={!messageDraft.trim()}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Open WhatsApp Chat with Prefilled Message</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Manual Outcome Recorder & Activity Log (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Outcome Confirmation Box */}
          {selectedLogForOutcome && (
            <div className="bg-amber-50 rounded-2xl border border-amber-300 p-5 shadow-sm">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs mb-1">
                <CheckCircle2 className="w-4 h-4 text-amber-700" />
                <span>Confirm Manual Message Outcome</span>
              </div>
              <p className="text-[11px] text-amber-800 mb-3">
                WhatsApp was opened for <strong>{selectedLogForOutcome.recipientName}</strong>. Please record the confirmed status:
              </p>

              <form onSubmit={handleUpdateOutcome} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Outcome Status</label>
                  <select
                    value={outcomeVal}
                    onChange={(e) => setOutcomeVal(e.target.value as WhatsAppOutcome)}
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg bg-white"
                  >
                    <option value="WhatsApp Opened">WhatsApp Opened</option>
                    <option value="Manually Confirmed Sent">Manually Confirmed Sent (Pressed Send)</option>
                    <option value="Reply Recorded">Customer Replied</option>
                    <option value="Follow-up Required">Follow-up Required</option>
                    <option value="Not Opened">Not Opened / Failed</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Operator Note (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Customer will come by 6 PM"
                    value={outcomeNote}
                    onChange={(e) => setOutcomeNote(e.target.value)}
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg bg-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedLogForOutcome(null)}
                    className="px-3 py-1 bg-white border border-neutral-300 rounded text-slate-700 font-medium"
                  >
                    Skip
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1 bg-amber-700 text-white rounded font-bold hover:bg-amber-800 transition"
                  >
                    Save Outcome
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Activity Log */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Recent WhatsApp Activity Log ({logs.length})
              </h3>
              <button
                onClick={onRefreshLogs}
                className="p-1 text-slate-400 hover:text-slate-700 rounded transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-slate-50 rounded-xl border border-neutral-100 text-xs space-y-1"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-900">{log.recipientName}</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 font-mono">
                    +91 {log.recipientMobile}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {log.outcome}
                    </span>
                    <span className="text-[10px] text-slate-400">By {log.operatorName}</span>
                  </div>

                  {log.notes && (
                    <div className="text-[11px] text-slate-600 bg-white p-1.5 rounded border border-neutral-200 mt-1">
                      {log.notes}
                    </div>
                  )}
                </div>
              ))}

              {logs.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">No WhatsApp activity recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
