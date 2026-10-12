import React, { useState } from 'react';
import { UserProfile } from '../../types/index.ts';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  Calendar,
  Filter,
  CheckCircle2,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

interface ReportsViewProps {
  currentUser: UserProfile;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ currentUser }) => {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownloadCsv = async (type: 'requests' | 'accounting' | 'customers' | 'leads') => {
    setDownloading(type);
    try {
      const res = await fetch(`/api/export/${type}`, {
        headers: {
          'x-user-id': currentUser.id,
          'x-user-role': currentUser.role,
        },
      });

      if (!res.ok) throw new Error('Download failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `csc_${type}_report_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Export error');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-600" />
          <span>Business Reports & Safe Data Export</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Generate audit-compliant CSV reports and business performance summaries
        </p>
      </div>

      {/* CSV Export Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Requests Export */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Work Requests CSV</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Complete log of all customer requests, customer prices, actual government fees, amount received, and completion status.
            </p>
          </div>

          <button
            onClick={() => handleDownloadCsv('requests')}
            disabled={downloading === 'requests'}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading === 'requests' ? 'Exporting...' : 'Download CSV'}</span>
          </button>
        </div>

        {/* Accounting Export */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Accounting Ledger CSV</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Detailed cashflow entries, collections, portal fee disbursements, operator incentives, and general store expenses.
            </p>
          </div>

          <button
            onClick={() => handleDownloadCsv('accounting')}
            disabled={downloading === 'accounting'}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading === 'accounting' ? 'Exporting...' : 'Download CSV'}</span>
          </button>
        </div>

        {/* Customers Export */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Customer Directory CSV</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              List of all registered citizens, customer IDs, verified mobile numbers, and residential colonies.
            </p>
          </div>

          <button
            onClick={() => handleDownloadCsv('customers')}
            disabled={downloading === 'customers'}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading === 'customers' ? 'Exporting...' : 'Download CSV'}</span>
          </button>
        </div>

        {/* Leads Export */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">CRM Leads CSV</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Inbound inquiries, acquisition sources (Facebook, Walk-in, Website), follow-up statuses, and marketing consents.
            </p>
          </div>

          <button
            onClick={() => handleDownloadCsv('leads')}
            disabled={downloading === 'leads'}
            className="w-full py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading === 'leads' ? 'Exporting...' : 'Download CSV'}</span>
          </button>
        </div>
      </div>

      {/* Compliance Note */}
      <div className="p-4 bg-slate-50 rounded-xl border border-neutral-200 text-xs text-slate-600">
        <strong className="text-slate-900 block mb-1">Data Safety & Historical Price Preservation:</strong>
        <p>
          All exported records maintain pristine historical prices and actual fee snapshots. Changing service catalog prices in the future does not alter existing invoices or past reports.
        </p>
      </div>
    </div>
  );
};
