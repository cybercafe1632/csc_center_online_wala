import React, { useState, useRef } from 'react';
import { BusinessSettings, AuditLogItem, UserProfile } from '../../types/index.ts';
import { api } from '../../lib/api.ts';
import {
  Settings,
  Shield,
  Save,
  CheckCircle2,
  Clock,
  Building,
  Phone,
  MapPin,
  Calendar,
  Lock,
  Layers,
  History,
  Download,
  Upload,
  Globe,
  Server,
  HardDrive,
  FileJson,
  Sparkles,
  ExternalLink,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface SettingsAndAuditViewProps {
  currentUser: UserProfile;
  settings: BusinessSettings;
  auditLogs: AuditLogItem[];
  onRefreshSettings: () => void;
}

export const SettingsAndAuditView: React.FC<SettingsAndAuditViewProps> = ({
  currentUser,
  settings,
  auditLogs,
  onRefreshSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'storage' | 'audit'>('settings');

  // Business settings form state
  const [name, setName] = useState(settings.name);
  const [phone, setPhone] = useState(settings.phone);
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp);
  const [address, setAddress] = useState(settings.address);
  const [hours, setHours] = useState(settings.hours);
  const [vleName, setVleName] = useState(settings.vleName);
  const [cscId, setCscId] = useState(settings.cscId);
  const [emergencyNotice, setEmergencyNotice] = useState(settings.emergencyNotice || '');
  const [categoriesText, setCategoriesText] = useState(settings.categories.join(', '));

  // Admin password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Backup & Restore state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupMessage, setBackupMessage] = useState<string | null>(null);
  const [backupError, setBackupError] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleDownloadBackup = async () => {
    try {
      setBackupLoading(true);
      setBackupError(null);
      setBackupMessage(null);
      const blob = await api.downloadDatabaseBackup(currentUser);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `csc_online_full_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setBackupMessage('Database backup successfully downloaded to your device!');
    } catch (err: any) {
      setBackupError(err.message || 'Failed to download database backup');
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBackupError(null);
    setBackupMessage(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setBackupLoading(true);
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (!parsed || (!parsed.users && !parsed.settings && !parsed.services)) {
          throw new Error('Invalid backup file. Must contain CSC database structure.');
        }

        await api.restoreDatabaseBackup(parsed, currentUser);
        setBackupMessage('Database successfully restored from JSON backup! Refreshing data...');
        setTimeout(() => {
          onRefreshSettings();
        }, 1500);
      } catch (err: any) {
        setBackupError(err.message || 'Failed to parse or restore backup file');
      } finally {
        setBackupLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.trim().length < 4) {
      setPasswordError('Password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsChangingPass(true);
    try {
      await api.changePassword(newPassword.trim(), currentUser);
      setPasswordSuccess('Password successfully changed! Your new password is now active.');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(null), 5000);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const updated = await api.updateBusinessSettings(
        {
          name: name.trim(),
          phone: phone.trim(),
          whatsapp: whatsapp.trim(),
          address: address.trim(),
          hours: hours.trim(),
          vleName: vleName.trim(),
          cscId: cscId.trim(),
          emergencyNotice: emergencyNotice.trim(),
          categories: categoriesText.split(',').map((c) => c.trim()).filter(Boolean),
        },
        currentUser
      );
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      onRefreshSettings();
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-600" />
            <span>Business Settings & System Audit Logs</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Admin customization of business details, working hours, services, and immutable operation history
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Business Settings
          </button>
          <button
            onClick={() => setActiveTab('storage')}
            className={`px-3.5 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'storage'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5 text-indigo-600" />
            <span>Publish & Free Storage / पब्लिश व बैकअप</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeTab === 'audit'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Audit Logs ({auditLogs.length})
          </button>
        </div>
      </div>

      {activeTab === 'settings' && (
        <div className="space-y-6 max-w-3xl">
          <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-5 text-xs">
          <div className="border-b border-neutral-100 pb-3 flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-900">Center Information (No Code Required)</h2>
            {saveSuccess && (
              <span className="text-emerald-600 font-bold flex items-center gap-1 text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Settings Saved Successfully!</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Business Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">VLE Owner Name</label>
              <input
                type="text"
                value={vleName}
                onChange={(e) => setVleName(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Phone / Helpline *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">WhatsApp (with 91 country code)</label>
              <input
                type="text"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">CSC Center ID</label>
              <input
                type="text"
                value={cscId}
                onChange={(e) => setCscId(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Center Physical Address *</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Operating Hours</label>
            <input
              type="text"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Service Categories (Comma Separated)
            </label>
            <input
              type="text"
              value={categoriesText}
              onChange={(e) => setCategoriesText(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Emergency Customer Notice Banner
            </label>
            <textarea
              rows={2}
              value={emergencyNotice}
              onChange={(e) => setEmergencyNotice(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs"
            />
          </div>

          {saveError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <span>{saveError}</span>
            </div>
          )}

          <div className="pt-3 border-t border-neutral-100 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save All Settings'}</span>
            </button>
          </div>
        </form>

        {/* Admin Password Change Form */}
        <form onSubmit={handleChangePassword} className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 border-b border-neutral-100 pb-3">
            <Lock className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="font-bold text-sm">Change Admin Password / एडमिन पासवर्ड बदलें</h2>
              <p className="text-[11px] text-slate-500">
                Update your login password for mobile +91 {currentUser.mobile} (Name: {currentUser.name})
              </p>
            </div>
          </div>

          {passwordSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2 font-medium">
              <span>{passwordError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                New Password (नया पासवर्ड) *
              </label>
              <input
                type="password"
                required
                placeholder="Enter new password (min 4 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Confirm New Password (पासवर्ड दोबारा दर्ज करें) *
              </label>
              <input
                type="password"
                required
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isChangingPass}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-500 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isChangingPass ? 'Updating...' : 'Update Password / पासवर्ड सुरक्षित करें'}</span>
            </button>
          </div>
        </form>
        </div>
      )}

      {activeTab === 'storage' && (
        <div className="space-y-6 max-w-4xl">
          {/* Top Banner: Free Storage & Backup Overview */}
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
            <div className="relative z-10 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold border border-indigo-400/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>100% Free Storage & Deployment Options / शून्य लागत पब्लिशिंग</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black">
                App Publish करें व लाइफटाइम Free Storage पाएं
              </h2>
              <p className="text-xs text-indigo-200 leading-relaxed max-w-2xl">
                आपके CSC CENTER ONLINE WALA सॉफ्टवेयर का सारा डेटाबेस (ग्राहक, ऑर्डर्स, अकाउंटिंग, और सेटिंग्स) एक सिंगल लाइटवेट JSON डेटाबेस में सुरक्षित रहता है। आप कभी भी 1-क्लिक में पूरा डेटा बैकअप डाउनलोड कर सकते हैं और इसे किसी भी फ्री क्लाउड होस्टिंग पर बिना किसी चार्ज के पब्लिश कर सकते हैं।
              </p>
            </div>
          </div>

          {/* 1-Click Database Backup & Restore Card */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-100 gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileJson className="w-4 h-4 text-indigo-600" />
                  <span>1-Click Database Backup & Restore (ऑफलाइन व फ्री क्लाउड बैकअप)</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  पूरे डेटाबेस का बैकअप कभी भी अपने फ़ोन या कंप्यूटर पर डाउनलोड करें और आवश्यकता पड़ने पर रीस्टोर करें
                </p>
              </div>
              <span className="text-[11px] px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg border border-emerald-200 inline-flex items-center gap-1 self-start sm:self-auto">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Live Data Protected</span>
              </span>
            </div>

            {backupMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{backupMessage}</span>
              </div>
            )}

            {backupError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{backupError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Download Backup */}
              <div className="p-4 rounded-xl border border-neutral-200 bg-slate-50/60 hover:bg-slate-50 transition space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs mb-1">
                    <Download className="w-4 h-4 text-indigo-600" />
                    <span>Download Full Backup (.json)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    एक क्लिक में सभी ग्राहक खाते, वर्क रिक्वेस्ट, कैश लेजर, और बिजनेस सेटिंग्स का कम्प्लीट बैकअप अपने डिवाइस पर सेव करें।
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  disabled={backupLoading}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>{backupLoading ? 'डाउनलोड हो रहा है...' : 'Download Database (.json)'}</span>
                </button>
              </div>

              {/* Restore Backup */}
              <div className="p-4 rounded-xl border border-neutral-200 bg-slate-50/60 hover:bg-slate-50 transition space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs mb-1">
                    <Upload className="w-4 h-4 text-amber-600" />
                    <span>Restore Database (.json)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    पहले से सेव किया हुआ बैकअप फ़ाइल चुनें और पूरे सॉफ़्टवेयर को पुराने स्टेट में तुरंत रीस्टोर करें।
                  </p>
                </div>
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".json,application/json"
                    onChange={handleRestoreFile}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={backupLoading}
                    className="w-full py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-100 disabled:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4 text-amber-600" />
                    <span>{backupLoading ? 'रीस्टोर हो रहा है...' : 'Choose Backup File & Restore'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Publishing Methods & Free Storage Options */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600" />
              <span>Free Hosting & Free Cloud Storage Guide (कदम-दर-कदम गाइड)</span>
            </h3>

            {/* Option 1: Render.com (Recommended for Node + React Full-Stack) */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                    1
                  </span>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">
                      Render.com पर Free Host करें (100% Free Lifetime)
                    </h4>
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      ₹0 प्रति माह • Free HTTPS SSL • Full-Stack Node + React
                    </span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded">
                  अनुशंसित (Recommended)
                </span>
              </div>

              <div className="text-xs text-slate-700 space-y-2">
                <p className="font-semibold text-slate-900">यह ऐप Render पर कैसे पब्लिश करें:</p>
                <ol className="list-decimal pl-5 space-y-1.5 text-slate-600 leading-relaxed text-[11px]">
                  <li>
                    <strong>GitHub पर कोड डालें:</strong> अपने प्रोजेक्ट को GitHub पर एक Private या Public रिपोजिटरी में Push करें (GitHub 100% Free है)।
                  </li>
                  <li>
                    <strong>Render.com पर फ्री अकाउंट बनाएं:</strong> <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700 font-mono">render.com</code> पर जाएं और "Sign Up with GitHub" करें (कोई क्रेडिट कार्ड आवश्यक नहीं)।
                  </li>
                  <li>
                    <strong>New Web Service चुनें:</strong> "New +" बटन पर क्लिक करके "Web Service" चुनें और अपनी GitHub रिपोजिटरी सेलेक्ट करें।
                  </li>
                  <li>
                    <strong>सेटिंग्स भरें:</strong>
                    <ul className="list-disc pl-4 mt-1 space-y-0.5 font-mono text-[10px] text-slate-700">
                      <li>Environment: Node</li>
                      <li>Build Command: npm run build</li>
                      <li>Start Command: npm start</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Deploy करें:</strong> "Create Web Service" पर क्लिक करते ही 2 मिनट में आपका ऐप लाइव हो जाएगा! आपको फ्री लाइव लिंक मिलेगा (जैसे: <code className="text-emerald-700 font-semibold font-mono">csc-online.onrender.com</code>).
                  </li>
                </ol>
              </div>
            </div>

            {/* Option 2: Firebase Free Tier (Spark Plan) */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center">
                    2
                  </span>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">
                      Google Firebase Free Tier (Spark Plan)
                    </h4>
                    <span className="text-[10px] text-amber-600 font-semibold">
                      1 GB Storage Free • 50,000 Reads/दिन Free • Google Infrastructure
                    </span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-700 font-bold rounded">
                  Google Free Cloud
                </span>
              </div>

              <div className="text-xs text-slate-700 space-y-2">
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Google का Firebase Spark Plan हमेशा के लिए फ्री है। इसमें 1GB का Firestore Cloud Database और फ्री वेब होस्टिंग मिलती है। सीएससी सेंटर जैसे बिजनेस के लिए यह 10,000 से ज्यादा ग्राहकों का डेटा आसानी से फ्री में स्टोर कर सकता है।
                </p>
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 space-y-1">
                  <p className="font-bold">विशेषताएँ:</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-[10px]">
                    <li>Lifetime Free Quota (No billing charges)</li>
                    <li>Firebase Hosting से कस्टम डोमेन (जैसे: <code className="font-mono">csc.yourname.in</code>) फ्री में कनेक्ट होता है।</li>
                    <li>रियल-टाइम डेटा सिंक और सुरक्षित बैकअप</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Option 3: Vercel + Supabase / Neon (100% Free PostgreSQL) */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-black text-xs flex items-center justify-center">
                    3
                  </span>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">
                      Vercel + Supabase / Neon Cloud Database
                    </h4>
                    <span className="text-[10px] text-blue-600 font-semibold">
                      High Speed Edge CDN • 500 MB Free PostgreSQL Database
                    </span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded">
                  Ultra Fast
                </span>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                Vercel आपके फ्रंटएंड को सबसे तेज़ लोडिंग स्पीड देता है, और Supabase/Neon आपको फ्री रिलेशनल डेटाबेस प्रदान करता है। दोनों में 100% फ्री टीयर उपलब्ध है।
              </p>
            </div>

            {/* Important Tips for CSC Owners */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <HelpCircle className="w-4 h-4" />
                <span>सीएससी सेंटर संचालक के लिए महत्वपूर्ण टिप्स (Pro Tips):</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-slate-300 list-disc pl-5 leading-relaxed">
                <li>
                  <strong>डेली बैकअप:</strong> हर शाम काम खत्म होने पर ऊपर दिए गए <strong className="text-white">"Download Full Backup"</strong> बटन से अपनी फ़ाइल डाउनलोड करके गूगल ड्राइव (Google Drive) या कंप्यूटर में सुरक्षित रखें।
                </li>
                <li>
                  <strong>फ्री स्टोरेज पर्याप्त है:</strong> इस ऐप का डेटाबेस सुपर-ऑप्टिमाइज्ड JSON है। 5,000 ग्राहकों और 10,000 ऑर्डर्स का डेटा भी 5 MB से कम साइज लेता है, जो किसी भी फ्री टियर की लिमिट (500 MB - 1 GB) का 1% भी नहीं है!
                </li>
                <li>
                  <strong>मोबाइल से एक्सेस:</strong> किसी भी फ्री होस्टिंग पर पब्लिश करने के बाद आप और आपके ग्राहक मोबाइल ब्राउज़र में "Add to Home Screen" करके इसे मोबाइल ऐप की तरह इस्तेमाल कर सकते हैं।
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-900">Immutable System Audit Log History</h2>
            <span className="text-xs text-slate-400 font-mono">{auditLogs.length} events logged</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-neutral-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Timestamp</th>
                  <th className="py-3 px-4 font-semibold">Operator / User</th>
                  <th className="py-3 px-4 font-semibold">Role</th>
                  <th className="py-3 px-4 font-semibold">Action</th>
                  <th className="py-3 px-4 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {log.userName}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 capitalize">
                        {log.userRole}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-700 whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-slate-700">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
