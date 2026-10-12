import React, { useState } from 'react';
import { RequestItem, BusinessSettings, UserProfile } from '../../types/index.ts';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  MessageSquare,
  Search,
  ExternalLink,
  PhoneCall,
  Calendar,
  CreditCard,
} from 'lucide-react';

interface CustomerRequestsProps {
  requests: RequestItem[];
  settings: BusinessSettings;
  currentUser: UserProfile | null;
  onOpenLoginModal: () => void;
}

export const CustomerRequests: React.FC<CustomerRequestsProps> = ({
  requests,
  settings,
  currentUser,
  onOpenLoginModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-16 text-center p-8 bg-white rounded-2xl border border-neutral-200 shadow-sm">
        <FileText className="w-12 h-12 text-indigo-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900">Please Log In</h3>
        <p className="text-xs text-slate-500 mt-1 mb-5">
          Log in with your mobile number to view and track your submitted CSC requests.
        </p>
        <button
          onClick={onOpenLoginModal}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          Customer Login
        </button>
      </div>
    );
  }

  const myRequests = requests.filter((r) => {
    return (
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getStatusColor = (status: RequestItem['status']) => {
    switch (status) {
      case 'Complete':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Ready for Collection':
        return 'bg-blue-50 text-blue-700 border-blue-200 font-bold';
      case 'Under Process':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Document Required':
        return 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
      case 'Rejected':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">My Service Requests</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track status, document requirements, and collection updates for {currentUser.name}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Request ID or service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {myRequests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200 p-8">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No requests found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You haven't submitted any service requests yet, or no request matches your search.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {myRequests.map((req) => {
            const outstanding = Math.max(0, req.customerPriceSnapshot - (req.amountReceived || 0));
            const whatsappText = `Namaste CSC Center Wala! Mujhe meri Request ${req.id} (${req.serviceName}) ka status jaan na hai. Status: ${req.status}.`;
            const waLink = `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(whatsappText)}`;

            return (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 hover:border-indigo-200 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-800 rounded">
                      {req.id}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(req.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      req.status
                    )}`}
                  >
                    {req.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  {/* Left: Service Details */}
                  <div className="md:col-span-2 space-y-2">
                    <h3 className="text-base font-bold text-slate-900">{req.serviceName}</h3>
                    <div className="text-xs text-slate-500">
                      Category: <span className="font-medium text-slate-700">{req.serviceCategory}</span>
                    </div>

                    {req.customerNotes && (
                      <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-neutral-100">
                        <span className="font-semibold text-slate-700">Your Note: </span>
                        {req.customerNotes}
                      </div>
                    )}

                    {/* Status hint for customer */}
                    {req.status === 'Ready for Collection' && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-xs text-blue-900 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>
                          <strong>Document is Ready!</strong> Please visit Shop No. 200, Baba Colony Burari during 8:30 AM – 9:00 PM to collect.
                        </span>
                      </div>
                    )}

                    {req.status === 'Document Required' && (
                      <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5 text-xs text-rose-800 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>
                          <strong>Missing Document:</strong> Please send required documents via WhatsApp or bring them to the shop.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right: Payment & Action */}
                  <div className="bg-slate-50/70 p-4 rounded-xl border border-neutral-100 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">Service Fee:</span>
                        <span className="font-bold text-slate-800 tabular-nums">
                          ₹{req.customerPriceSnapshot}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">Amount Paid:</span>
                        <span className="font-semibold text-emerald-700 tabular-nums">
                          ₹{req.amountReceived || 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs pt-1 border-t border-neutral-200">
                        <span className="text-slate-600 font-medium">Balance Due:</span>
                        <span className={`font-bold tabular-nums ${outstanding > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                          ₹{outstanding}
                        </span>
                      </div>
                    </div>

                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp for Update</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
