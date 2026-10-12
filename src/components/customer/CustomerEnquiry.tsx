import React, { useState } from 'react';
import { BusinessSettings, LeadSource } from '../../types/index.ts';
import {
  PhoneCall,
  MessageSquare,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  QrCode,
  Share2,
  Copy,
  Check,
  ShieldCheck,
  Building,
} from 'lucide-react';

interface CustomerEnquiryProps {
  settings: BusinessSettings;
}

export const CustomerEnquiry: React.FC<CustomerEnquiryProps> = ({ settings }) => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [service, setService] = useState('PAN Card (New / Correction / Reprint)');
  const [area, setArea] = useState('Baba Colony, Burari');
  const [message, setMessage] = useState('');
  const [source, setSource] = useState<LeadSource>('Website');
  const [contactConsent, setContactConsent] = useState(false);
  const [promoConsent, setPromoConsent] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedLeadId, setSubmittedLeadId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim()) {
      setErrorMsg('Please enter your name and 10-digit mobile number.');
      return;
    }
    if (!/^\d{10}$/.test(mobile.trim())) {
      setErrorMsg('Mobile number must be a valid 10-digit number.');
      return;
    }
    if (!contactConsent) {
      setErrorMsg('Please accept the contact consent checkbox so we can reply to you.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          mobile: mobile.trim(),
          interestedService: service,
          areaLocality: area.trim(),
          message: message.trim(),
          source,
          contactConsent,
          promotionalWhatsAppConsent: promoConsent,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit enquiry');
      }

      const data = await res.json();
      setSubmittedLeadId(data.id);
      setName('');
      setMobile('');
      setMessage('');
      setContactConsent(false);
      setPromoConsent(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error submitting enquiry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const shareableUrl = window.location.origin;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Banner */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Enquiry & Contact Center
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Have questions regarding government forms, document rules or pricing? Reach out to us or submit an online enquiry.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Business Info & Counter Info (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-lg">
                CSC
              </div>
              <div>
                <h3 className="font-extrabold text-base">{settings.name}</h3>
                <p className="text-xs text-indigo-300">CSC ID: {settings.cscId} · VLE: {settings.vleName}</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-300 pt-2 border-t border-slate-800">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block mb-0.5">Physical Center Address:</span>
                  <span>{settings.address}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block mb-0.5">Working Hours:</span>
                  <span>{settings.hours}</span>
                  <span className="block text-[11px] text-slate-400 mt-0.5">Open all 7 days for citizen assistance</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <PhoneCall className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block mb-0.5">Phone & Helpline:</span>
                  <a href={`tel:+91${settings.phone}`} className="text-white hover:underline font-mono">
                    +91 {settings.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block mb-0.5">Official WhatsApp:</span>
                  <a
                    href={`https://wa.me/${settings.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:underline font-mono"
                  >
                    +91 {settings.phone} (Click to Chat)
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Share & QR Code */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={() => setShowQrModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition"
              >
                <QrCode className="w-3.5 h-3.5 text-indigo-400" />
                <span>Shop QR Code</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copiedLink ? 'Link Copied!' : 'Share Page'}</span>
              </button>
            </div>
          </div>

          {/* Quick Notice */}
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
            <div className="font-bold mb-1 flex items-center gap-1.5 text-amber-800">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Important Citizen Notice</span>
            </div>
            <p className="leading-relaxed">
              We charge strictly transparent service rates with zero hidden costs. All official government fees are billed with genuine receipts.
            </p>
          </div>
        </div>

        {/* Right Column: Enquiry Form (7 Cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-7 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Send Service Enquiry</h2>
            <p className="text-xs text-slate-500 mb-5">
              Fill out this quick form and our CSC operator will contact you with exact document guidance.
            </p>

            {submittedLeadId ? (
              <div className="py-8 text-center bg-emerald-50 rounded-xl border border-emerald-200 p-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-emerald-900">Thank You! Enquiry Received</h3>
                <p className="text-xs text-emerald-800 mt-1 max-w-sm mx-auto">
                  Your reference Lead ID is <span className="font-mono font-bold">{submittedLeadId}</span>. Our team will contact you on WhatsApp / call shortly.
                </p>
                <button
                  onClick={() => setSubmittedLeadId(null)}
                  className="mt-5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition"
                >
                  Submit Another Enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Chandra"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Mobile Number (10 Digits) *
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="9289787348"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Service Interested In *
                    </label>
                    <select
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                    >
                      <option>PAN Card (New / Correction / Reprint)</option>
                      <option>Aadhaar Address & Mobile Verification Update</option>
                      <option>Instant Smart PVC Card High-Gloss Printing</option>
                      <option>Voter ID Registration & EPIC Card Download</option>
                      <option>Driving Licence (Learner / Permanent / Renewal)</option>
                      <option>Delhi e-District Income Certificate</option>
                      <option>Caste Certificate (SC / ST / OBC Delhi)</option>
                      <option>Delhi NFSA Ration Card Services</option>
                      <option>E-Shram & Labour Welfare Board</option>
                      <option>Vehicle Insurance (Bike & Car Policy)</option>
                      <option>Bank Account Opening & DigiPay AePS</option>
                      <option>Legal Affidavit & Agreement Notary</option>
                      <option>Other Online Service</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Locality / Colony Area
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Baba Colony, Tomar Colony, Burari"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Your Message / Specific Question
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell us what you need help with (e.g. document checklist, time taken)..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    How did you find us?
                  </label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value as LeadSource)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    <option value="Website">Website</option>
                    <option value="Walk-in">Walk-in at Shop</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Instagram">Instagram</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Referral">Friend / Referral</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Consent Checkboxes - Non-Preselected */}
                <div className="space-y-2 pt-2 border-t border-neutral-100">
                  <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contactConsent}
                      onChange={(e) => setContactConsent(e.target.checked)}
                      className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>
                      I give consent to CSC CENTER ONLINE WALA to contact me regarding my enquiry. *
                    </span>
                  </label>

                  <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={promoConsent}
                      onChange={(e) => setPromoConsent(e.target.checked)}
                      className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>
                      (Optional) I wish to receive promotional festival offers & new service updates via WhatsApp.
                    </span>
                  </label>
                </div>

                {errorMsg && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Sending...' : 'Submit Enquiry'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Counter QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center border border-neutral-200 shadow-2xl">
            <h3 className="font-bold text-slate-900 text-base mb-1">CSC Center Online Wala</h3>
            <p className="text-xs text-slate-500 mb-4">Shop Counter QR Code for Customer Inquiries</p>

            <div className="w-48 h-48 mx-auto bg-slate-100 rounded-xl p-4 border border-dashed border-neutral-300 flex flex-col items-center justify-center mb-4">
              <QrCode className="w-32 h-32 text-slate-800" />
              <span className="text-[10px] text-slate-500 font-mono mt-1">Scan to Open Services</span>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Shop No. 200, B Block, Baba Colony, Burari, Delhi · 9289787348
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleCopyLink}
                className="flex-1 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold transition"
              >
                {copiedLink ? 'Copied!' : 'Copy Portal Link'}
              </button>
              <button
                onClick={() => setShowQrModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
