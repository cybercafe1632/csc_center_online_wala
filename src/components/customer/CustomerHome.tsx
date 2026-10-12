import React, { useState, useMemo } from 'react';
import { ServiceItem, BusinessSettings, UserProfile, RequestItem } from '../../types/index.ts';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  ArrowRight,
  Sparkles,
  PhoneCall,
  MessageSquare,
  ShieldCheck,
  CreditCard,
  Send,
  X,
  ExternalLink,
  ChevronLeft,
  ShoppingBag,
  Award,
  Layers,
  Car,
  Landmark,
  HardHat,
  Scale,
  Zap,
  Check,
} from 'lucide-react';

interface CustomerHomeProps {
  services: ServiceItem[];
  settings: BusinessSettings;
  currentUser: UserProfile | null;
  userRequestsCount?: number;
  onRequestSubmitted: (newReq: any) => void;
  onOpenLoginModal: () => void;
  onNavigateToRequests?: () => void;
  onNavigateToEnquiry?: () => void;
}

interface CategoryRailItem {
  id: string;
  name: string;
  hindiName: string;
  icon: any;
  colorBg: string;
  colorIcon: string;
  imageUrl?: string;
}

const CATEGORY_RAIL: CategoryRailItem[] = [
  {
    id: 'for_you',
    name: 'For You',
    hindiName: 'लोकप्रिय',
    icon: Sparkles,
    colorBg: 'bg-gradient-to-tr from-purple-100 to-pink-100',
    colorIcon: 'text-purple-600',
    imageUrl: '/src/assets/images/pan_aadhaar_services_1791784430711.jpg',
  },
  {
    id: 'Identity & Cards',
    name: 'Identity & Cards',
    hindiName: 'पहचान पत्र',
    icon: CreditCard,
    colorBg: 'bg-gradient-to-tr from-blue-100 to-indigo-100',
    colorIcon: 'text-blue-600',
    imageUrl: '/src/assets/images/pan_aadhaar_services_1791784430711.jpg',
  },
  {
    id: 'Certificates & Revenue',
    name: 'Certificates',
    hindiName: 'प्रमाण पत्र',
    icon: Award,
    colorBg: 'bg-gradient-to-tr from-amber-100 to-orange-100',
    colorIcon: 'text-amber-600',
    imageUrl: '/src/assets/images/certificates_revenue_1791784442961.jpg',
  },
  {
    id: 'Licenses & Transport',
    name: 'Transport & DL',
    hindiName: 'ड्राइविंग लाइसेंस',
    icon: Car,
    colorBg: 'bg-gradient-to-tr from-emerald-100 to-teal-100',
    colorIcon: 'text-emerald-600',
    imageUrl: '/src/assets/images/csc_banner_hero_1791784416133.jpg',
  },
  {
    id: 'Banking & Finance',
    name: 'Banking & Insurance',
    hindiName: 'बैंकिंग व बीमा',
    icon: Landmark,
    colorBg: 'bg-gradient-to-tr from-cyan-100 to-sky-100',
    colorIcon: 'text-cyan-700',
    imageUrl: '/src/assets/images/banking_insurance_1791784453793.jpg',
  },
  {
    id: 'Welfare & Labour',
    name: 'Labour & Welfare',
    hindiName: 'श्रमिक व कल्याण',
    icon: HardHat,
    colorBg: 'bg-gradient-to-tr from-rose-100 to-red-100',
    colorIcon: 'text-rose-600',
    imageUrl: '/src/assets/images/certificates_revenue_1791784442961.jpg',
  },
  {
    id: 'Legal & Affidavits',
    name: 'Legal & Notary',
    hindiName: 'शपथ पत्र / स्टाम्प',
    icon: Scale,
    colorBg: 'bg-gradient-to-tr from-slate-100 to-zinc-200',
    colorIcon: 'text-slate-700',
    imageUrl: '/src/assets/images/certificates_revenue_1791784442961.jpg',
  },
];

export const CustomerHome: React.FC<CustomerHomeProps> = ({
  services,
  settings,
  currentUser,
  userRequestsCount = 0,
  onRequestSubmitted,
  onOpenLoginModal,
  onNavigateToRequests,
  onNavigateToEnquiry,
}) => {
  const [activeCategoryId, setActiveCategoryId] = useState('for_you');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  // Request Form modal states
  const [customerNotes, setCustomerNotes] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestMobile, setGuestMobile] = useState('');
  const [guestAddress, setGuestAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Confirmation modal states
  const [confirmationData, setConfirmationData] = useState<{
    requestId: string;
    serviceName: string;
    customerPrice: number;
    whatsappUrl: string;
    whatsappOpened: boolean;
  } | null>(null);

  // Filtered services
  const popularServices = useMemo(() => {
    return services.filter((s) => s.isPopular);
  }, [services]);

  const newServices = useMemo(() => {
    return services.filter((s) => s.isNew || !s.isPopular);
  }, [services]);

  const activeCategoryServices = useMemo(() => {
    if (activeCategoryId === 'for_you') {
      return services;
    }
    return services.filter((s) => s.category === activeCategoryId);
  }, [services, activeCategoryId]);

  const searchedServices = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );
  }, [services, searchQuery]);

  const handleOpenService = (service: ServiceItem) => {
    setSelectedService(service);
    setSubmitError(null);
    setCustomerNotes('');
    if (currentUser) {
      setGuestName(currentUser.name);
      setGuestMobile(currentUser.mobile);
      setGuestAddress(currentUser.address || '');
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    const name = currentUser?.name || guestName.trim();
    const mobile = currentUser?.mobile || guestMobile.trim();
    const address = currentUser?.address || guestAddress.trim();

    if (!name || !mobile) {
      setSubmitError('Please provide your name and 10-digit mobile number.');
      return;
    }
    if (!/^\d{10}$/.test(mobile)) {
      setSubmitError('Mobile number must be a valid 10-digit number.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        serviceId: selectedService.id,
        customerNotes,
        customerName: name,
        customerMobile: mobile,
        customerAddress: address,
      };

      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(currentUser
            ? {
                'x-user-id': currentUser.id,
                'x-user-role': currentUser.role,
              }
            : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to submit request');
      }

      const created = await res.json();
      onRequestSubmitted(created);

      // Prepare WhatsApp prefilled message
      const textMsg =
        `*CSC CENTER ONLINE WALA — New Service Request*\n\n` +
        `Request ID: *${created.id}*\n` +
        `Customer: *${created.customerName}*\n` +
        `Mobile: ${created.customerMobile}\n` +
        `Service: *${created.serviceName}*\n` +
        `Price: ₹${created.customerPriceSnapshot}\n` +
        (customerNotes ? `Note: ${customerNotes}\n` : '') +
        `\nKripya is request ko process karein. Dhanyawad!`;

      const whatsappUrl = `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(textMsg)}`;

      // Attempt to open WhatsApp in a separate tab
      let whatsappOpened = false;
      try {
        const openedWin = window.open(whatsappUrl, '_blank');
        if (openedWin) {
          whatsappOpened = true;
        }
      } catch (err) {
        whatsappOpened = false;
      }

      // Log WhatsApp attempt
      fetch('/api/whatsapp/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientMobile: settings.phone,
          recipientName: 'CSC Center Desk',
          messageType: 'request_created',
          messageText: textMsg,
          relatedRequestId: created.id,
          outcome: whatsappOpened ? 'WhatsApp Opened' : 'Not Opened',
        }),
      }).catch(() => {});

      setSelectedService(null);
      setConfirmationData({
        requestId: created.id,
        serviceName: created.serviceName,
        customerPrice: created.customerPriceSnapshot,
        whatsappUrl,
        whatsappOpened,
      });
    } catch (err: any) {
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-white">
      {/* Flipkart Style App Sub-Header / Search Bar */}
      <div className="sticky top-16 z-30 bg-white border-b border-neutral-200 px-3 py-2.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
              All Categories <span className="text-xs text-slate-400 font-normal hidden sm:inline">(सभी सेवाएँ)</span>
            </h1>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search PAN, Aadhaar, PVC, DL, Income..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 bg-slate-100 hover:bg-slate-50 focus:bg-white text-slate-900 placeholder:text-slate-400 rounded-lg text-xs font-medium border border-transparent focus:border-indigo-500 focus:outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Header Badges / Cart / Helpline */}
          <div className="flex items-center gap-2 shrink-0">
            {onNavigateToRequests && (
              <button
                onClick={onNavigateToRequests}
                className="relative p-2 text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition"
                title="My Requests"
              >
                <FileText className="w-4 h-4" />
                {userRequestsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-indigo-600 text-white font-bold text-[9px] rounded-full h-4 w-4 flex items-center justify-center tabular-nums">
                    {userRequestsCount}
                  </span>
                )}
              </button>
            )}

            <a
              href={`https://wa.me/${settings.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>9289787348</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Flipkart Dual-Column Layout */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full pb-20 md:pb-8">
        {/* LEFT VERTICAL CATEGORY RAIL (Exactly like Flipkart Screenshot) */}
        <aside className="w-20 sm:w-28 md:w-36 bg-slate-50/80 border-r border-neutral-200 shrink-0 overflow-y-auto max-h-[calc(100vh-7.5rem)] sticky top-28 scrollbar-none py-2">
          <div className="space-y-1">
            {CATEGORY_RAIL.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategoryId === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategoryId(cat.id);
                    setSearchQuery('');
                  }}
                  className={`w-full text-center relative py-3 px-1 flex flex-col items-center gap-1.5 transition ${
                    isActive
                      ? 'bg-white text-indigo-700 font-bold shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100/60'
                  }`}
                >
                  {/* Active Blue Indicator Strip on Left Edge (Flipkart Style) */}
                  {isActive && (
                    <div className="absolute left-0 top-1 bottom-1 w-1 bg-indigo-600 rounded-r-full" />
                  )}

                  {/* Circular/Rounded Category Thumbnail */}
                  <div
                    className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center p-1 border transition ${
                      isActive
                        ? 'border-indigo-400 ring-2 ring-indigo-200 bg-white shadow-xs'
                        : 'border-neutral-200/80 bg-white hover:border-slate-300'
                    }`}
                  >
                    {cat.imageUrl ? (
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <div className={`w-full h-full rounded-xl ${cat.colorBg} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${cat.colorIcon}`} />
                      </div>
                    )}
                  </div>

                  {/* Category Label */}
                  <span
                    className={`text-[10px] sm:text-xs leading-tight tracking-tight px-1 line-clamp-2 ${
                      isActive ? 'font-bold text-indigo-700' : 'font-medium text-slate-700'
                    }`}
                  >
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* RIGHT CONTENT PANE (Grid of Service Cards with Badges & Pricing) */}
        <div className="flex-1 px-3 sm:px-6 py-4 overflow-y-auto">
          {/* If user is searching, show search results */}
          {searchedServices !== null ? (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">
                  Search Results for "{searchQuery}" ({searchedServices.length})
                </h2>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-indigo-600 font-semibold"
                >
                  Clear Search
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {searchedServices.map((srv) => (
                  <ServiceTileCard
                    key={srv.id}
                    service={srv}
                    onOpen={() => handleOpenService(srv)}
                  />
                ))}
              </div>

              {searchedServices.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No services found matching your query.
                </div>
              )}
            </div>
          ) : activeCategoryId === 'for_you' ? (
            /* "For You" Section: Flipkart style Popular Store + New Launches */
            <div className="space-y-6">
              {/* Popular Store Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                      Popular Services (लोकप्रिय सेवाएँ)
                    </h2>
                    <p className="text-[11px] text-slate-500">Most requested citizen services in Burari</p>
                  </div>
                  <span className="text-[11px] text-indigo-600 font-bold">Best Value</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {popularServices.map((srv) => (
                    <ServiceTileCard
                      key={srv.id}
                      service={srv}
                      badgeText="APPLY NOW"
                      badgeColor="bg-emerald-600"
                      onOpen={() => handleOpenService(srv)}
                    />
                  ))}
                </div>
              </div>

              {/* New & Upcoming Launches Section */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                      New & Welfare Services (नई सेवाएँ)
                    </h2>
                    <p className="text-[11px] text-slate-500">Fast online verification & card printing</p>
                  </div>
                  <span className="text-[11px] text-amber-600 font-bold">New</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {newServices.map((srv) => (
                    <ServiceTileCard
                      key={srv.id}
                      service={srv}
                      badgeText={srv.isNew ? 'NEW SERVICE' : 'INSTANT APPLY'}
                      badgeColor="bg-indigo-600"
                      onOpen={() => handleOpenService(srv)}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Specific Category View */
            <div>
              <div className="mb-4">
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                  {activeCategoryId}
                </h2>
                <p className="text-[11px] text-slate-500">
                  Select a service below to submit an instant online request
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {activeCategoryServices.map((srv) => (
                  <ServiceTileCard
                    key={srv.id}
                    service={srv}
                    badgeText="REQUEST"
                    badgeColor="bg-emerald-600"
                    onOpen={() => handleOpenService(srv)}
                  />
                ))}
              </div>

              {activeCategoryServices.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No services listed under this category yet.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Request Submission Modal (Bottom sheet on mobile, centered modal on desktop) */}
      {selectedService && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-neutral-200">
            {/* Header */}
            <div className="sticky top-0 bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between z-10">
              <div className="truncate pr-2">
                <span className="text-[11px] font-semibold text-indigo-300 block truncate">
                  {selectedService.category}
                </span>
                <h3 className="text-base font-bold text-white truncate">
                  {selectedService.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="p-5 sm:p-6 space-y-4">
              {/* Customer-Facing Price Card (Zero internal fees or margins shown!) */}
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <div className="text-xs text-emerald-800 font-medium">Service Fee to Pay</div>
                  <div className="text-2xl font-black text-emerald-900 tabular-nums">
                    ₹{selectedService.customerPrice}
                  </div>
                </div>
                <div className="text-right text-[11px] text-emerald-700">
                  <span className="block font-semibold">✓ Verified Processing</span>
                  <span className="block text-[10px] text-emerald-600">Doorstep / In-Store Pickup</span>
                </div>
              </div>

              {/* Saved Customer Profile Auto-fill */}
              {currentUser ? (
                <div className="bg-indigo-50/70 p-3 rounded-lg border border-indigo-100 text-xs text-indigo-900">
                  <span className="font-bold">Logged in as:</span> {currentUser.name} (Mobile: {currentUser.mobile})
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  <div className="text-xs font-semibold text-slate-700">Your Contact Information</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-500 font-medium">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Kumar"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 font-medium">Mobile Number (10 digits) *</label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="9289787348"
                        value={guestMobile}
                        onChange={(e) => setGuestMobile(e.target.value.replace(/\D/g, ''))}
                        className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 font-medium">Colony / Address (Burari)</label>
                    <input
                      type="text"
                      placeholder="e.g. Baba Colony, Burari, Delhi"
                      value={guestAddress}
                      onChange={(e) => setGuestAddress(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Required Documents Hint */}
              {selectedService.requiredDocuments?.length > 0 && (
                <div className="bg-slate-50 p-3 rounded-lg border border-neutral-200">
                  <div className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Documents to bring or send on WhatsApp:</span>
                  </div>
                  <ul className="text-xs text-slate-600 list-disc list-inside space-y-0.5">
                    {selectedService.requiredDocuments.map((doc, i) => (
                      <li key={i}>{doc}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Special Note */}
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Any note or specific requirement? (Optional)
                </label>
                <textarea
                  rows={2}
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="e.g. Need urgent print, name correction in PAN, etc."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {submitError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedService(null)}
                  className="px-4 py-2.5 border border-neutral-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Submitting Request...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Request (₹{selectedService.customerPrice})</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation & WhatsApp Dialog */}
      {confirmationData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-neutral-200 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Request Recorded Successfully!</h3>
            <p className="text-xs text-slate-500 mt-1">
              Your service request is saved in the database.
            </p>

            <div className="my-4 p-3.5 bg-slate-50 rounded-xl border border-neutral-200 text-left space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Request ID:</span>
                <span className="font-mono font-bold text-slate-900">{confirmationData.requestId}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Service:</span>
                <span className="font-semibold text-slate-800">{confirmationData.serviceName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Customer Price:</span>
                <span className="font-bold text-emerald-700">₹{confirmationData.customerPrice}</span>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <div className="mb-4">
              <a
                href={confirmationData.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Open WhatsApp to Confirm</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <p className="text-[11px] text-slate-400 mt-2">
                Click above if WhatsApp did not open automatically.
              </p>
            </div>

            <button
              onClick={() => setConfirmationData(null)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
            >
              Done / Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component: Service Tile Card matching Flipkart Card aesthetic
interface ServiceTileCardProps {
  service: ServiceItem;
  badgeText?: string;
  badgeColor?: string;
  onOpen: () => void;
}

const ServiceTileCard: React.FC<ServiceTileCardProps> = ({
  service,
  badgeText = 'APPLY NOW',
  badgeColor = 'bg-emerald-600',
  onOpen,
}) => {
  return (
    <div
      onClick={onOpen}
      className="group bg-white rounded-2xl border border-neutral-200/90 hover:border-indigo-400 shadow-2xs hover:shadow-md transition cursor-pointer overflow-hidden flex flex-col justify-between"
    >
      <div>
        {/* Thumbnail Container (Flipkart Product Mockup Style) */}
        <div className="relative aspect-square sm:aspect-4/3 bg-slate-100 overflow-hidden">
          <img
            src={service.imageUrl}
            alt={service.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />

          {/* High-Contrast Pill Tag on image (Flipkart 'BUY NOW' / 'SALE IS LIVE' style) */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-center">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider text-white shadow-sm uppercase ${badgeColor}`}
            >
              {service.isPopular ? 'POPULAR' : badgeText}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-2.5 sm:p-3">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 line-clamp-2 leading-snug transition">
            {service.name}
          </h3>
          <p className="text-[10px] sm:text-[11px] text-slate-500 line-clamp-1 mt-0.5">
            {service.category}
          </p>
        </div>
      </div>

      {/* Pricing Strip & 1-Tap Trigger */}
      <div className="p-2.5 sm:p-3 pt-0">
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
          <div className="text-xs sm:text-sm font-extrabold text-slate-900 tabular-nums">
            ₹{service.customerPrice}
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-indigo-600 group-hover:underline">
            Request →
          </span>
        </div>
      </div>
    </div>
  );
};
