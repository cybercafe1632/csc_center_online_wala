import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { UserProfile } from '../../types/index.ts';
import { X, Lock, Phone, User, AlertCircle, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
  onLoginSuccess?: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
  onLoginSuccess,
}) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);

  // Form states
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let cleanMobile = mobile.trim().replace(/\D/g, '');
      if (cleanMobile.length === 12 && cleanMobile.startsWith('91')) cleanMobile = cleanMobile.slice(2);
      else if (cleanMobile.length === 11 && cleanMobile.startsWith('0')) cleanMobile = cleanMobile.slice(1);

      if (mode === 'login') {
        if (!/^\d{10}$/.test(cleanMobile)) {
          throw new Error('Please enter a valid 10-digit mobile number (10-अंक मोबाइल नंबर दर्ज करें)');
        }
        if (!password.trim()) {
          throw new Error('Please enter your password (पासवर्ड दर्ज करें)');
        }
        const loggedInUser = await login(cleanMobile, password.trim());
        if (onLoginSuccess && loggedInUser) {
          onLoginSuccess(loggedInUser);
        }
      } else {
        if (!name.trim()) throw new Error('Please enter your full name (कृपया अपना पूरा नाम लिखें)');
        if (!/^\d{10}$/.test(cleanMobile)) {
          throw new Error('Please enter a valid 10-digit mobile number (10-अंक मोबाइल नंबर दर्ज करें)');
        }
        if (password.trim().length < 4) {
          throw new Error('Password must be at least 4 characters (पासवर्ड कम से कम 4 अक्षरों का होना चाहिए)');
        }
        const registeredUser = await register({
          name: name.trim(),
          mobile: cleanMobile,
          password: password.trim(),
          address: address.trim(),
        });
        if (onLoginSuccess && registeredUser) {
          onLoginSuccess(registeredUser);
        }
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-neutral-200">
        {/* Header - Single unified login header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <h3 className="font-bold text-base text-white">
                {mode === 'login' ? 'Unified Login / प्रवेश करें' : 'Customer Registration / नया ग्राहक खाता'}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              CSC CENTER ONLINE WALA · Burari Delhi
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informational Guidance */}
        <div className="px-5 py-3 bg-indigo-50/70 border-b border-indigo-100/60 text-[11px] text-indigo-950 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            {mode === 'login' ? (
              <span>
                <strong>Single Login:</strong> अपना मोबाइल नंबर और पासवर्ड दर्ज करें।
              </span>
            ) : (
              <span>
                <strong>सरल रजिस्ट्रेशन:</strong> नया ग्राहक खाता बनाने के लिए सिर्फ नाम, मोबाइल और पासवर्ड भरें।
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'register' && (
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Full Name (पूरा नाम) *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Mobile Number (10 डिजिट मोबाइल नंबर) *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="9289787348"
                value={mobile}
                onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, '');
                  if (val.length > 10 && val.startsWith('91')) val = val.slice(2);
                  else if (val.length > 10 && val.startsWith('0')) val = val.slice(1);
                  setMobile(val.slice(0, 10));
                }}
                className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Password (पासवर्ड) *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Colony / Address (कॉलोनी या पता - Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Gali No. 4, Baba Colony, Burari, Delhi"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          )}

          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <span>कृपया प्रतीक्षा करें... (Processing)</span>
            ) : (
              <>
                <span>{mode === 'login' ? 'Login / लॉगिन करें' : 'Create Account / खाता बनाएं'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          <div className="text-center pt-2">
            {mode === 'login' ? (
              <p className="text-xs text-slate-500">
                New customer? (नया ग्राहक हैं?){' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  className="font-bold text-indigo-600 hover:underline"
                >
                  Register here (खाता बनाएं)
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                Already registered? (पहले से खाता है?){' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className="font-bold text-indigo-600 hover:underline"
                >
                  Login here (लॉगिन करें)
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
