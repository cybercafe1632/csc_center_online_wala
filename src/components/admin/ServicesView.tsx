import React, { useState } from 'react';
import { ServiceItem, UserProfile, BusinessSettings } from '../../types/index.ts';
import { api } from '../../lib/api.ts';
import {
  Grid,
  Plus,
  Edit2,
  Trash2,
  Eye,
  AlertTriangle,
  DollarSign,
  CheckCircle2,
  X,
  FileText,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface ServicesViewProps {
  currentUser: UserProfile;
  services: ServiceItem[];
  settings: BusinessSettings;
  onRefreshServices: () => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({
  currentUser,
  services,
  settings,
  onRefreshServices,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const canEdit = isAdmin || currentUser.permissions?.createOrEditServices;

  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState<ServiceItem | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Identity & Cards');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('/src/assets/images/pan_aadhaar_services_1791784430711.jpg');
  const [customerPrice, setCustomerPrice] = useState(150);
  const [estimatedGovtFee, setEstimatedGovtFee] = useState(107);
  const [internalServiceCost, setInternalServiceCost] = useState(10);
  const [otherDirectExpenses, setOtherDirectExpenses] = useState(5);
  const [employeeCost, setEmployeeCost] = useState(15);
  const [feeNotes, setFeeNotes] = useState('');
  const [requiredDocs, setRequiredDocs] = useState('Aadhaar Card, Passport Photo');
  const [instructions, setInstructions] = useState('Bring original Aadhaar card for verification.');
  const [isPopular, setIsPopular] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [isPublished, setIsPublished] = useState(true);

  const handleOpenAdd = () => {
    setSelectedService(null);
    setName('');
    setCategory(settings.categories[1] || 'Identity & Cards');
    setDescription('');
    setImageUrl('/src/assets/images/pan_aadhaar_services_1791784430711.jpg');
    setCustomerPrice(100);
    setEstimatedGovtFee(50);
    setInternalServiceCost(5);
    setOtherDirectExpenses(0);
    setEmployeeCost(10);
    setFeeNotes('Portal fee verification note');
    setRequiredDocs('Aadhaar Card');
    setInstructions('Bring mobile phone with active SIM for OTP.');
    setIsPopular(false);
    setIsNew(false);
    setIsPublished(true);
    setIsEditing(true);
  };

  const handleOpenEdit = (srv: ServiceItem) => {
    setSelectedService(srv);
    setName(srv.name);
    setCategory(srv.category);
    setDescription(srv.description);
    setImageUrl(srv.imageUrl);
    setCustomerPrice(srv.customerPrice);
    setEstimatedGovtFee(srv.estimatedGovtFee);
    setInternalServiceCost(srv.internalServiceCost);
    setOtherDirectExpenses(srv.otherDirectExpenses);
    setEmployeeCost(srv.employeeCost);
    setFeeNotes(srv.feeNotes);
    setRequiredDocs(srv.requiredDocuments?.join(', ') || '');
    setInstructions(srv.instructions?.join('\n') || '');
    setIsPopular(srv.isPopular);
    setIsNew(srv.isNew);
    setIsPublished(srv.isPublished);
    setIsEditing(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const payload: Partial<ServiceItem> = {
        id: selectedService?.id,
        name: name.trim(),
        category,
        description: description.trim(),
        imageUrl,
        customerPrice: Number(customerPrice),
        estimatedGovtFee: Number(estimatedGovtFee),
        internalServiceCost: Number(internalServiceCost),
        otherDirectExpenses: Number(otherDirectExpenses),
        employeeCost: Number(employeeCost),
        feeNotes: feeNotes.trim(),
        requiredDocuments: requiredDocs.split(',').map((d) => d.trim()).filter(Boolean),
        instructions: instructions.split('\n').map((i) => i.trim()).filter(Boolean),
        isPopular,
        isNew,
        isPublished,
      };

      await api.saveService(payload, currentUser);
      setIsEditing(false);
      onRefreshServices();
    } catch (err: any) {
      alert(err.message || 'Failed to save service');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await api.deleteService(id, currentUser);
      onRefreshServices();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  const imageOptions = [
    { label: 'Smart IDs (PAN & Aadhaar)', url: '/src/assets/images/pan_aadhaar_services_1791784430711.jpg' },
    { label: 'Revenue & Certificates', url: '/src/assets/images/certificates_revenue_1791784442961.jpg' },
    { label: 'Banking & Insurance', url: '/src/assets/images/banking_insurance_1791784453793.jpg' },
    { label: 'CSC Kendra Kiosk Desk', url: '/src/assets/images/csc_banner_hero_1791784416133.jpg' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Services & Fee Configuration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure customer-facing prices, internal portal fees, employee costs, and required documents
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Service</span>
          </button>
        )}
      </div>

      {/* Critical Business Architecture Notice */}
      <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-start gap-3">
        <DollarSign className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <strong className="block mb-0.5">Customer Pricing vs Internal Fees Separation:</strong>
          <span>
            Customers see <strong>only the Customer Price</strong>. Government/portal fees, internal supplies cost, and employee margins are strictly kept internal to Admin & Staff.
          </span>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.map((srv) => {
          const estimatedMargin = srv.customerPrice - srv.estimatedGovtFee;
          const estimatedNetProfit =
            estimatedMargin - srv.internalServiceCost - srv.otherDirectExpenses - srv.employeeCost;
          const feeWarning = srv.estimatedGovtFee === undefined || srv.estimatedGovtFee === null;

          return (
            <div
              key={srv.id}
              className="bg-white rounded-xl border border-neutral-200 shadow-xs hover:shadow-md transition p-4 flex flex-col justify-between"
            >
              <div>
                {/* Image and Badges */}
                <div className="relative h-36 bg-slate-100 rounded-lg overflow-hidden mb-3">
                  <img
                    src={srv.imageUrl}
                    alt={srv.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    {srv.isPopular && (
                      <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[9px] font-bold rounded">
                        POPULAR
                      </span>
                    )}
                    {srv.isNew && (
                      <span className="px-1.5 py-0.5 bg-indigo-600 text-white text-[9px] font-bold rounded">
                        NEW
                      </span>
                    )}
                  </div>
                  {!srv.isPublished && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center text-white text-xs font-bold">
                      Unpublished (Draft)
                    </div>
                  )}
                </div>

                <div className="text-[11px] font-bold text-indigo-600 uppercase mb-0.5">
                  {srv.category}
                </div>
                <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{srv.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1 mb-3">
                  {srv.description}
                </p>

                {/* Financial Separation Box */}
                <div className="bg-slate-50 rounded-lg p-3 border border-neutral-100 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-slate-700">Customer Price:</span>
                    <span className="text-emerald-700 text-sm tabular-nums">₹{srv.customerPrice}</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-500 text-[11px]">
                    <span>Portal/Govt Fee:</span>
                    <span className="tabular-nums font-mono text-amber-800">₹{srv.estimatedGovtFee}</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-500 text-[11px]">
                    <span>Internal Cost & Staff:</span>
                    <span className="tabular-nums font-mono">₹{srv.internalServiceCost + srv.employeeCost}</span>
                  </div>

                  <div className="pt-1.5 border-t border-neutral-200 flex justify-between items-center text-[11px] font-bold">
                    <span className="text-slate-600">Est. Net Profit:</span>
                    <span className="text-indigo-600 tabular-nums">₹{estimatedNetProfit}</span>
                  </div>
                </div>

                {feeWarning && (
                  <div className="mt-2 p-1.5 bg-amber-50 rounded text-[10px] text-amber-800 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    <span>Government Fee Needs Verification</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setIsPreviewing(srv)}
                  className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded text-xs font-medium transition flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview Card</span>
                </button>

                {canEdit && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(srv)}
                      className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition"
                      title="Edit Service"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteService(srv.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition"
                        title="Delete Service"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Add Service Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl overflow-y-auto border border-neutral-200">
            <div className="sticky top-0 bg-slate-900 text-white p-5 flex items-center justify-between z-10">
              <h3 className="font-bold text-base text-white">
                {selectedService ? 'Edit Service & Pricing' : 'Add New Service'}
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Service Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    {settings.categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Image Selection */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Service Card Image</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                  {imageOptions.map((opt) => (
                    <div
                      key={opt.url}
                      onClick={() => setImageUrl(opt.url)}
                      className={`p-1 rounded-lg border cursor-pointer transition ${
                        imageUrl === opt.url
                          ? 'border-indigo-600 ring-2 ring-indigo-500 bg-indigo-50'
                          : 'border-neutral-200 hover:border-slate-400'
                      }`}
                    >
                      <img src={opt.url} alt={opt.label} className="h-16 w-full object-cover rounded" />
                      <div className="text-[10px] text-center font-semibold mt-1 truncate">{opt.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Architecture Section */}
              <div className="bg-slate-50 p-4 rounded-xl border border-neutral-200 space-y-3">
                <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>Financial Configuration (Customer Price vs Internal Costs)</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Customer Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      value={customerPrice}
                      onChange={(e) => setCustomerPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono font-bold text-emerald-700"
                    />
                    <span className="text-[10px] text-slate-400">What customer pays</span>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Govt / Portal Fee (₹)
                    </label>
                    <input
                      type="number"
                      value={estimatedGovtFee}
                      onChange={(e) => setEstimatedGovtFee(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono text-amber-700"
                    />
                    <span className="text-[10px] text-slate-400">Paid to govt portal</span>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Internal Cost (₹)
                    </label>
                    <input
                      type="number"
                      value={internalServiceCost}
                      onChange={(e) => setInternalServiceCost(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono"
                    />
                    <span className="text-[10px] text-slate-400">Paper, PVC blank, etc.</span>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Staff Incentive (₹)
                    </label>
                    <input
                      type="number"
                      value={employeeCost}
                      onChange={(e) => setEmployeeCost(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono"
                    />
                    <span className="text-[10px] text-slate-400">Operator payout</span>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Internal Fee Verification Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NSDL e-KYC wallet deduction ₹107 / Parivahan test fee ₹350"
                    value={feeNotes}
                    onChange={(e) => setFeeNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Required Documents & Instructions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Required Documents (comma separated)
                  </label>
                  <textarea
                    rows={2}
                    value={requiredDocs}
                    onChange={(e) => setRequiredDocs(e.target.value)}
                    placeholder="e.g. Aadhaar Card copy, 2 Passport Photos"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Customer Instructions (1 per line)
                  </label>
                  <textarea
                    rows={2}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="e.g. Bring registered mobile for Aadhaar OTP"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Mark as Popular</span>
                </label>

                <label className="flex items-center gap-2 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNew}
                    onChange={(e) => setIsNew(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Mark as New Service</span>
                </label>

                <label className="flex items-center gap-2 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Publish to Customers</span>
                </label>
              </div>

              <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-neutral-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition shadow-xs"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Preview Card Modal */}
      {isPreviewing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-neutral-200">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Customer Preview</span>
              <button onClick={() => setIsPreviewing(null)} className="p-1 text-slate-400 hover:text-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
              <div className="h-40 bg-slate-100 overflow-hidden relative">
                <img src={isPreviewing.imageUrl} alt={isPreviewing.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <div className="text-[10px] font-bold text-indigo-600 uppercase mb-1">
                  {isPreviewing.category}
                </div>
                <h3 className="font-bold text-sm text-slate-900 mb-1">{isPreviewing.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-3">{isPreviewing.description}</p>
                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Service Fee</div>
                    <div className="text-base font-extrabold text-slate-900 tabular-nums">
                      ₹{isPreviewing.customerPrice}
                    </div>
                  </div>
                  <button className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold">
                    Send Request
                  </button>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center mt-3">
              Notice: No government fee or profit margin is displayed to the customer.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
