import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { BusinessSettings } from '../../types/index.ts';
import {
  ShieldCheck,
  User,
  LogOut,
  LogIn,
  UserPlus,
  PhoneCall,
  MessageSquare,
  Clock,
  Sparkles,
  ChevronDown,
  Layers,
  FileText,
  HelpCircle,
  Grid,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';

export type CustomerTabType = 'categories' | 'requests' | 'account' | 'enquiry' | 'contact';

interface HeaderProps {
  settings: BusinessSettings;
  activeCustomerTab: CustomerTabType;
  setActiveCustomerTab: (tab: CustomerTabType) => void;
  userRequestsCount?: number;
  onOpenLoginModal: () => void;
  onOpenRegisterModal: () => void;
  onOpenEnquiryModal: () => void;
  adminPreviewMode?: boolean;
  onToggleAdminPreview?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  activeCustomerTab,
  setActiveCustomerTab,
  userRequestsCount = 0,
  onOpenLoginModal,
  onOpenRegisterModal,
  onOpenEnquiryModal,
  adminPreviewMode,
  onToggleAdminPreview,
}) => {
  const { currentUser, logout, switchDemoUser } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200">
      {/* Top Banner: Contact info & Quick account switcher for testing */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-[11px] sm:text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              Open: {settings.hours}
            </span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <a
              href={`tel:+91${settings.phone}`}
              className="hidden sm:flex items-center gap-1 text-slate-300 hover:text-white transition"
            >
              <PhoneCall className="w-3 h-3 text-slate-400" />
              <span>Helpline: +91 {settings.phone}</span>
            </a>
            <span className="hidden md:inline text-slate-500">|</span>
            <span className="hidden md:inline text-slate-300">
              {settings.address}
            </span>
          </div>

          {/* User status badge or quick testing helper */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-300 flex items-center gap-1">
                  {currentUser.role === 'admin' && (
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded font-bold text-[10px]">
                      👑 ADMIN
                    </span>
                  )}
                  {currentUser.role === 'employee' && (
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded font-bold text-[10px]">
                      💼 EMPLOYEE
                    </span>
                  )}
                  {currentUser.role === 'customer' && (
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded font-bold text-[10px]">
                      👤 CUSTOMER
                    </span>
                  )}
                  <span className="font-semibold text-white ml-1">{currentUser.name}</span>
                </span>

                {currentUser.role === 'admin' && onToggleAdminPreview && (
                  <button
                    onClick={onToggleAdminPreview}
                    className="ml-2 px-2.5 py-0.5 bg-indigo-700 hover:bg-indigo-600 text-white rounded text-[11px] font-semibold transition flex items-center gap-1 border border-indigo-500"
                  >
                    <Eye className="w-3 h-3" />
                    <span>{adminPreviewMode ? 'Back to Admin Console' : 'Preview Customer Portal'}</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span>Welcome! Login with Mobile & Password</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-sm font-bold text-lg">
            CSC
          </div>
          <div>
            <div className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap block">
              {settings.name}
            </div>
            <span className="text-[11px] text-slate-500 font-medium block">
              Digital Seva Kendra & Cyber Café · Burari Delhi
            </span>
          </div>
        </div>

        {/* Customer Navigation Links (Only shown when browsing Customer Portal) */}
        {(!currentUser || currentUser.role === 'customer' || adminPreviewMode) && (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveCustomerTab('categories')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeCustomerTab === 'categories' ? 'text-indigo-600 font-bold' : ''
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>All Categories</span>
            </button>
            <button
              onClick={() => setActiveCustomerTab('requests')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeCustomerTab === 'requests' ? 'text-indigo-600 font-bold' : ''
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>My Requests</span>
              {userRequestsCount > 0 && (
                <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full">
                  {userRequestsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveCustomerTab('account')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeCustomerTab === 'account' ? 'text-indigo-600 font-bold' : ''
              }`}
            >
              <User className="w-4 h-4" />
              <span>Account</span>
            </button>
            <button
              onClick={() => setActiveCustomerTab('enquiry')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap ${
                activeCustomerTab === 'enquiry' ? 'text-indigo-600 font-bold' : ''
              }`}
            >
              Enquiry & QR
            </button>
            <button
              onClick={() => setActiveCustomerTab('contact')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap ${
                activeCustomerTab === 'contact' ? 'text-indigo-600 font-bold' : ''
              }`}
            >
              Shop Timings
            </button>
          </nav>
        )}

        {/* Actions & Account */}
        <div className="flex items-center gap-3 shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div
                onClick={() => (!currentUser || currentUser.role === 'customer' ? setActiveCustomerTab('account') : null)}
                className="text-right hidden sm:block cursor-pointer hover:opacity-80"
              >
                <div className="text-xs font-semibold text-slate-900">{currentUser.name}</div>
                <div className="text-[11px] text-slate-500 font-mono">ID: {currentUser.id}</div>
              </div>
              <button
                onClick={logout}
                title="Log Out (लॉगआउट)"
                className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition font-semibold flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenLoginModal}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 border border-neutral-300 hover:border-indigo-400 rounded-lg transition flex items-center gap-1"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login / लॉगिन</span>
              </button>
              <button
                onClick={onOpenRegisterModal}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition whitespace-nowrap flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register / खाता बनाएं</span>
              </button>
            </div>
          )}

          {/* WhatsApp Direct Help */}
          <a
            href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(
              'Namaste CSC CENTER ONLINE WALA! Mujhe online service ke baare mein jaankari chahiye.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition whitespace-nowrap"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
        </div>
      </div>
    </header>
  );
};
