import React, { useState } from 'react';
import { QuickLinkItem, WorkGuideItem, UserProfile } from '../../types/index.ts';
import {
  ExternalLink,
  BookOpen,
  Plus,
  CheckSquare,
  AlertTriangle,
  FileText,
  Search,
  Shield,
  X,
  ChevronRight,
  Globe,
} from 'lucide-react';

interface QuickLinksAndGuidesViewProps {
  currentUser: UserProfile;
  quickLinks: QuickLinkItem[];
  workGuides: WorkGuideItem[];
}

export const QuickLinksAndGuidesView: React.FC<QuickLinksAndGuidesViewProps> = ({
  currentUser,
  quickLinks,
  workGuides,
}) => {
  const [activeTab, setActiveTab] = useState<'quicklinks' | 'guides'>('quicklinks');
  const [search, setSearch] = useState('');
  const [selectedGuide, setSelectedGuide] = useState<WorkGuideItem | null>(null);

  const filteredLinks = quickLinks.filter((l) =>
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.category.toLowerCase().includes(search.toLowerCase()) ||
    l.description.toLowerCase().includes(search.toLowerCase())
  );

  const filteredGuides = workGuides.filter((g) =>
    g.serviceName.toLowerCase().includes(search.toLowerCase()) ||
    g.portalName.toLowerCase().includes(search.toLowerCase()) ||
    g.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Globe className="w-6 h-6 text-indigo-600" />
            <span>Quick Links & Operator Work Guides</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified official government portal shortcuts and step-by-step Standard Operating Procedures (SOPs)
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('quicklinks')}
            className={`px-4 py-1.5 rounded-lg transition ${
              activeTab === 'quicklinks'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Portal Shortcuts ({quickLinks.length})
          </button>
          <button
            onClick={() => setActiveTab('guides')}
            className={`px-4 py-1.5 rounded-lg transition ${
              activeTab === 'guides'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Employee Work Guides ({workGuides.length})
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search portals, forms, NSDL, UTI, Delhi e-District..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
      </div>

      {/* Tab 1: Portal Quick Links */}
      {activeTab === 'quicklinks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLinks.map((link) => (
            <div
              key={link.id}
              className="bg-white rounded-xl border border-neutral-200 p-4 shadow-xs hover:border-indigo-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                    {link.category}
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">
                    {link.officialBadge}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 mb-1">{link.title}</h3>
                <p className="text-xs text-slate-500 mb-3">{link.description}</p>

                {link.internalInstructions && (
                  <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-100 text-[11px] text-amber-900 mb-3">
                    <strong className="block text-amber-800">Operator Note:</strong>
                    <span>{link.internalInstructions}</span>
                  </div>
                )}
              </div>

              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Launch Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Step-by-Step Operator Work Guides */}
      {activeTab === 'guides' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGuides.map((guide) => (
            <div
              key={guide.id}
              className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                    {guide.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {guide.steps.length} Steps
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 mb-1">{guide.serviceName}</h3>
                <div className="text-xs text-slate-500 mb-3">Portal: {guide.portalName}</div>

                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-neutral-100 mb-3">
                  <strong className="block text-slate-800 text-[11px]">Documents Required:</strong>
                  <ul className="list-disc list-inside text-[11px] space-y-0.5 text-slate-500">
                    {guide.requiredDocuments.slice(0, 3).map((d, i) => (
                      <li key={i} className="truncate">{d}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setSelectedGuide(guide)}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Open Step-by-Step SOP</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Guide Detail Modal */}
      {selectedGuide && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl overflow-y-auto border border-neutral-200">
            <div className="sticky top-0 bg-slate-900 text-white p-5 flex items-center justify-between z-10">
              <div>
                <span className="text-[11px] font-semibold text-indigo-300">
                  {selectedGuide.portalName}
                </span>
                <h3 className="font-bold text-base text-white">{selectedGuide.serviceName}</h3>
              </div>
              <button
                onClick={() => setSelectedGuide(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {/* Portal link button */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-neutral-200">
                <div>
                  <span className="font-bold text-slate-800 block">{selectedGuide.portalName}</span>
                  <span className="text-[11px] text-slate-500 font-mono truncate max-w-xs block">
                    {selectedGuide.portalUrl}
                  </span>
                </div>
                <a
                  href={selectedGuide.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-semibold flex items-center gap-1 hover:bg-slate-800"
                >
                  <span>Open Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Documents Required */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2">Required Citizen Documents</h4>
                <div className="bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100">
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    {selectedGuide.requiredDocuments.map((doc, idx) => (
                      <li key={idx}>{doc}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Step by Step execution */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2">Procedure Steps & Checklist</h4>
                <div className="space-y-3">
                  {selectedGuide.steps.map((step) => (
                    <div
                      key={step.stepNumber}
                      className="p-3.5 bg-white rounded-xl border border-neutral-200 shadow-xs space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {step.stepNumber}
                        </span>
                        <h5 className="font-bold text-slate-900">{step.title}</h5>
                      </div>
                      <p className="text-slate-600 pl-7 leading-relaxed">{step.description}</p>
                      {step.checklist?.length > 0 && (
                        <div className="pl-7 pt-1 space-y-1">
                          {step.checklist.map((item, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                              <CheckSquare className="w-3 h-3 text-emerald-600" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Critical Caveats */}
              {selectedGuide.importantNotes?.length > 0 && (
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-amber-900">
                  <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Important Operator Warnings</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    {selectedGuide.importantNotes.map((note, i) => (
                      <li key={i}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
