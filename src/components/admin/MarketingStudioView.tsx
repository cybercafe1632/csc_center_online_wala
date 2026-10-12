import React, { useState } from 'react';
import { MarketingTemplate, UserProfile } from '../../types/index.ts';
import {
  Sparkles,
  Copy,
  Check,
  Send,
  MessageSquare,
  Share2,
  Plus,
  Edit2,
  X,
  Languages,
} from 'lucide-react';

interface MarketingStudioViewProps {
  currentUser: UserProfile;
  templates: MarketingTemplate[];
  onOpenWhatsAppWithText: (text: string) => void;
  onRefreshTemplates: () => void;
}

export const MarketingStudioView: React.FC<MarketingStudioViewProps> = ({
  currentUser,
  templates,
  onOpenWhatsAppWithText,
  onRefreshTemplates,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLang, setSelectedLang] = useState<string>('all');
  const [selectedTone, setSelectedTone] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [isEditingModal, setIsEditingModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<MarketingTemplate['category']>('whatsapp');
  const [editLang, setEditLang] = useState<MarketingTemplate['language']>('hindi');
  const [editTone, setEditTone] = useState<MarketingTemplate['tone']>('friendly');
  const [editContent, setEditContent] = useState('');

  const filtered = templates.filter((t) => {
    const matchCat = selectedCategory === 'all' || t.category === selectedCategory;
    const matchLang = selectedLang === 'all' || t.language === selectedLang;
    const matchTone = selectedTone === 'all' || t.tone === selectedTone;
    return matchCat && matchLang && matchTone;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || !editContent.trim()) return;

    try {
      const res = await fetch('/api/marketing/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          'x-user-role': currentUser.role,
        },
        body: JSON.stringify({
          id: `TPL-${Date.now().toString().slice(-4)}`,
          title: editTitle.trim(),
          category: editCategory,
          language: editLang,
          tone: editTone,
          content: editContent.trim(),
        }),
      });
      if (!res.ok) throw new Error('Failed to save template');
      setIsEditingModal(false);
      setEditTitle('');
      setEditContent('');
      onRefreshTemplates();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            <span>Marketing Content Studio</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pre-approved high-converting WhatsApp, Status, Facebook, Reel & Festival marketing copy
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsEditingModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Template</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        {/* Category */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-1.5 border border-neutral-300 rounded-lg font-medium bg-white"
        >
          <option value="all">All Channels</option>
          <option value="whatsapp">WhatsApp Broadcast</option>
          <option value="whatsapp_status">WhatsApp Status</option>
          <option value="facebook">Facebook Post</option>
          <option value="instagram">Instagram Caption</option>
          <option value="reel_script">Reel / Shorts Script</option>
          <option value="festival">Festival Greeting</option>
          <option value="followup">Follow-up Message</option>
        </select>

        {/* Language */}
        <select
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value)}
          className="px-3 py-1.5 border border-neutral-300 rounded-lg font-medium bg-white"
        >
          <option value="all">All Languages</option>
          <option value="hindi">Hindi (हिंदी)</option>
          <option value="hinglish">Hinglish</option>
          <option value="english">English</option>
        </select>

        {/* Tone */}
        <select
          value={selectedTone}
          onChange={(e) => setSelectedTone(e.target.value)}
          className="px-3 py-1.5 border border-neutral-300 rounded-lg font-medium bg-white"
        >
          <option value="all">All Tones</option>
          <option value="professional">Professional</option>
          <option value="friendly">Friendly</option>
          <option value="attractive">Attractive / High-Offer</option>
          <option value="short_direct">Short & Direct</option>
        </select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                <span className="font-bold text-indigo-600 uppercase tracking-wider">
                  {tpl.category.replace('_', ' ')}
                </span>
                <span className="capitalize bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                  {tpl.language} · {tpl.tone.replace('_', ' ')}
                </span>
              </div>

              <h3 className="font-bold text-sm text-slate-900 mb-3">{tpl.title}</h3>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-neutral-100 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto font-sans">
                {tpl.content}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
              <button
                onClick={() => handleCopy(tpl.id, tpl.content)}
                className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5"
              >
                {copiedId === tpl.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onOpenWhatsAppWithText(tpl.content)}
                className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1"
                title="Send via WhatsApp Center"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Template Modal */}
      {isEditingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base text-slate-900">Create Marketing Template</h3>
              <button onClick={() => setIsEditingModal(false)} className="p-1 text-slate-400 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Headline / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Free Ayushman Card Camp Burari"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Channel</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as any)}
                    className="w-full px-2 py-1.5 border border-neutral-300 rounded-lg bg-white"
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="whatsapp_status">Status</option>
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="reel_script">Reel</option>
                    <option value="festival">Festival</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Language</label>
                  <select
                    value={editLang}
                    onChange={(e) => setEditLang(e.target.value as any)}
                    className="w-full px-2 py-1.5 border border-neutral-300 rounded-lg bg-white"
                  >
                    <option value="hindi">Hindi</option>
                    <option value="hinglish">Hinglish</option>
                    <option value="english">English</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tone</label>
                  <select
                    value={editTone}
                    onChange={(e) => setEditTone(e.target.value as any)}
                    className="w-full px-2 py-1.5 border border-neutral-300 rounded-lg bg-white"
                  >
                    <option value="friendly">Friendly</option>
                    <option value="professional">Professional</option>
                    <option value="attractive">Attractive</option>
                    <option value="short_direct">Short & Direct</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Message Body *</label>
                <textarea
                  rows={6}
                  required
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Type promotional text with emoji, contact numbers and CTA..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingModal(false)}
                  className="px-4 py-2 border border-neutral-300 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
