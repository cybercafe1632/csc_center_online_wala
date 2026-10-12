import React, { useState } from 'react';
import { UserProfile, BusinessSettings, RequestItem } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../lib/api.ts';
import {
  User,
  Phone,
  MapPin,
  Calendar,
  FileText,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  HelpCircle,
  MessageSquare,
  Lock,
} from 'lucide-react';

interface CustomerProfileProps {
  settings: BusinessSettings;
  requests: RequestItem[];
  onOpenLoginModal: () => void;
  onOpenRegisterModal: () => void;
  onNavigateToRequests: () => void;
}

export const CustomerProfile: React.FC<CustomerProfileProps> = ({
  settings,
  requests,
  onOpenLoginModal,
  onOpenRegisterModal,
  onNavigateToRequests,
}) => {
  const { currentUser, logout, switchDemoUser } = useAuth();

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-12 px-4 text-center">
        <div className="bg-white rounded-2xl p-8 border border-neutral-200 shadow-sm">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Welcome to {settings.name}</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Log in with your mobile number to view your requests, order history, and saved profile.
          </p>

          <div className="space-y-3">
            <button
              onClick={onOpenLoginModal}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              Sign In
            </button>
            <button
              onClick={onOpenRegisterModal}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
            >
              Create New Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (newPass.length < 4) {
      setPassError('Password must be at least 4 characters long');
      return;
    }
    if (newPass !== confirmPass) {
      setPassError('Passwords do not match');
      return;
    }

    setIsUpdating(true);
    try {
      await api.changePassword(newPass.trim(), currentUser);
      setPassSuccess('Password successfully changed! नया पासवर्ड सुरक्षित कर लिया गया है।');
      setNewPass('');
      setConfirmPass('');
      setTimeout(() => setPassSuccess(null), 5000);
    } catch (err: any) {
      setPassError(err.message || 'Failed to update password');
    } finally {
      setIsUpdating(false);
    }
  };

  const myRequests = requests.filter(
    (r) => r.customerId === currentUser.id || r.customerMobile === currentUser.mobile
  );
  const completedCount = myRequests.filter((r) => r.status === 'Complete').length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-slate-900">{currentUser.name}</h2>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded">
                {currentUser.id}
              </span>
            </div>
            <div className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>+91 {currentUser.mobile}</span>
            </div>
            {currentUser.address && (
              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentUser.address}</span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log Out</span>
        </button>
      </div>

      {/* Quick Activity Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div
          onClick={onNavigateToRequests}
          className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs cursor-pointer hover:border-indigo-300 transition"
        >
          <span className="text-xs text-slate-500 font-medium block">Total Requests</span>
          <span className="text-2xl font-black text-slate-900 tabular-nums">{myRequests.length}</span>
          <span className="text-[11px] text-indigo-600 font-semibold block mt-1">View list →</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <span className="text-xs text-emerald-700 font-medium block">Completed Cards</span>
          <span className="text-2xl font-black text-emerald-600 tabular-nums">{completedCount}</span>
          <span className="text-[11px] text-slate-400 block mt-1">Delivered</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-xs text-slate-500 font-medium block">Customer Type</span>
          <span className="text-sm font-bold text-slate-900 block mt-1">Verified Citizen</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Burari CSC Seva Portal</span>
        </div>
      </div>

      {/* Account Settings / Privacy */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4 text-xs">
        <h3 className="font-bold text-sm text-slate-900">Communication & Privacy</h3>

        <div className="space-y-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-neutral-100 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-800">WhatsApp Service Updates</div>
              <div className="text-[11px] text-slate-500">
                Receive instant status updates and collection alerts
              </div>
            </div>
            <span className="px-2 py-1 bg-emerald-100 text-emerald-800 font-bold rounded text-[11px]">
              Active
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-neutral-100 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-800">Helpline & Physical Assistance</div>
              <div className="text-[11px] text-slate-500">
                Shop No. 200, B Block, Baba Colony, Burari, Delhi (8:30 AM – 9:00 PM)
              </div>
            </div>
            <a
              href={`https://wa.me/${settings.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-emerald-600 text-white font-bold rounded text-xs flex items-center gap-1"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat</span>
            </a>
          </div>
        </div>
      </div>

      {/* Security & Password Change */}
      <form onSubmit={handleUpdatePassword} className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-slate-900 border-b border-neutral-100 pb-3">
          <Lock className="w-4 h-4 text-indigo-600" />
          <h3 className="font-bold text-sm">Security & Password / पासवर्ड बदलें</h3>
        </div>

        {passSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{passSuccess}</span>
          </div>
        )}

        {passError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
            <span>{passError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">New Password (नया पासवर्ड) *</label>
            <input
              type="password"
              required
              placeholder="Enter new password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Confirm Password (पुष्टि करें) *</label>
            <input
              type="password"
              required
              placeholder="Confirm new password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isUpdating}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{isUpdating ? 'Updating...' : 'Update Password / पासवर्ड बदलें'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
