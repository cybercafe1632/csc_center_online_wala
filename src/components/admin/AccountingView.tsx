import React, { useState } from 'react';
import { AccountingTransaction, UserProfile, RequestItem } from '../../types/index.ts';
import { api } from '../../lib/api.ts';
import {
  DollarSign,
  Plus,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  X,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';

interface AccountingViewProps {
  currentUser: UserProfile;
  transactions: AccountingTransaction[];
  requests: RequestItem[];
  summary: {
    totalCustomerRevenueCharged: number;
    totalAmountCollected: number;
    outstandingBalance: number;
    totalGovtFeesPaid: number;
    totalOtherExpenses: number;
    totalEmployeeCosts: number;
    grossMargin: number;
    netProfit: number;
    requestsCount: number;
    completedRequestsCount: number;
  };
  onRefreshAccounting: () => void;
}

export const AccountingView: React.FC<AccountingViewProps> = ({
  currentUser,
  transactions,
  requests,
  summary,
  onRefreshAccounting,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const [isAddingTxn, setIsAddingTxn] = useState(false);

  // New Transaction states
  const [txnType, setTxnType] = useState<AccountingTransaction['type']>('customer_payment');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Customer Collection');
  const [paymentMode, setPaymentMode] = useState<AccountingTransaction['paymentMode']>('Cash');
  const [selectedReqId, setSelectedReqId] = useState('');

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    try {
      await api.addTransaction(
        {
          requestId: selectedReqId || undefined,
          type: txnType,
          amount: Number(amount),
          description: description.trim() || 'Payment entry',
          category,
          recordedBy: currentUser.name,
          paymentMode,
        },
        currentUser
      );
      setIsAddingTxn(false);
      setAmount('');
      setDescription('');
      setSelectedReqId('');
      onRefreshAccounting();
    } catch (err: any) {
      alert(err.message || 'Failed to add transaction');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            <span>Business Management, Accounting & Profit</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Accurate revenue recognition, cash collections vs outstanding receivables, portal fee deductions, and net margins
          </p>
        </div>

        <button
          onClick={() => setIsAddingTxn(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record Transaction</span>
        </button>
      </div>

      {/* Top 6 Financial Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-[11px] text-slate-400 font-medium block">Total Billed</span>
          <span className="text-xl font-extrabold text-slate-900 tabular-nums">
            ₹{summary.totalCustomerRevenueCharged}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">Customer invoices</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-[11px] text-emerald-700 font-medium block">Cash/UPI Collected</span>
          <span className="text-xl font-extrabold text-emerald-600 tabular-nums">
            ₹{summary.totalAmountCollected}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">Actual in hand</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-[11px] text-rose-700 font-medium block">Outstanding Balance</span>
          <span className="text-xl font-extrabold text-rose-600 tabular-nums">
            ₹{summary.outstandingBalance}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">Pending payments</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-[11px] text-amber-700 font-medium block">Govt/Portal Fees Paid</span>
          <span className="text-xl font-extrabold text-amber-600 tabular-nums">
            ₹{summary.totalGovtFeesPaid}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">NSDL / Parivahan etc.</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-[11px] text-indigo-700 font-medium block">Gross Margin</span>
          <span className="text-xl font-extrabold text-indigo-600 tabular-nums">
            ₹{summary.grossMargin}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">After govt fees</span>
        </div>

        <div className="bg-slate-900 text-white p-4 rounded-xl shadow-xs">
          <span className="text-[11px] text-slate-400 font-medium block">Net Business Profit</span>
          <span className="text-xl font-black text-emerald-400 tabular-nums">
            ₹{summary.netProfit}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">Recognized bottomline</span>
        </div>
      </div>

      {/* Transactions Ledger */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-900">Accounting Ledger & Cashflow Transactions</h2>
          <span className="text-xs text-slate-400 font-mono">{transactions.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-neutral-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Txn ID</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 font-semibold">Description</th>
                <th className="py-3 px-4 font-semibold">Mode</th>
                <th className="py-3 px-4 font-semibold">Recorded By</th>
                <th className="py-3 px-4 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {transactions.map((txn) => {
                const isIncome = txn.type === 'customer_payment';
                return (
                  <tr key={txn.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{txn.id}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(txn.date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                          isIncome
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {txn.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{txn.description}</div>
                      {txn.requestId && (
                        <div className="text-[10px] text-slate-400 font-mono">{txn.requestId}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{txn.paymentMode}</td>
                    <td className="py-3 px-4 text-slate-500">{txn.recordedBy}</td>
                    <td className="py-3 px-4 text-right font-bold tabular-nums">
                      <span className={isIncome ? 'text-emerald-600' : 'text-slate-900'}>
                        {isIncome ? `+₹${txn.amount}` : `-₹${txn.amount}`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Transaction Modal */}
      {isAddingTxn && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-neutral-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base text-slate-900">Record Financial Transaction</h3>
              <button onClick={() => setIsAddingTxn(false)} className="p-1 text-slate-400 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Transaction Type</label>
                <select
                  value={txnType}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    setTxnType(val);
                    if (val === 'customer_payment') setCategory('Customer Collection');
                    else if (val === 'govt_fee') setCategory('Government / Portal Fee');
                    else if (val === 'direct_expense') setCategory('Direct Supplies / Paper');
                    else if (val === 'employee_payout') setCategory('Employee Cost');
                    else setCategory('General Expense');
                  }}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white"
                >
                  <option value="customer_payment">Customer Payment Received</option>
                  <option value="govt_fee">Government / Portal Fee Debit</option>
                  <option value="direct_expense">Direct Expense (Lamination, PVC Sheets)</option>
                  <option value="employee_payout">Employee Incentive Payout</option>
                  <option value="general_expense">Office / Center Expense</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 150"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as any)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="QR">Shop Counter QR</option>
                  <option value="CSC Wallet">CSC Digital Seva Wallet</option>
                  <option value="Bank">Bank Transfer / NetBanking</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Related Request (Optional)</label>
                <select
                  value={selectedReqId}
                  onChange={(e) => setSelectedReqId(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white"
                >
                  <option value="">None (General Shop Expense)</option>
                  {requests.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.id} - {r.customerName} ({r.serviceName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description / Memo</label>
                <input
                  type="text"
                  placeholder="e.g. Full fee received via UPI / NSDL wallet debit"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingTxn(false)}
                  className="px-4 py-2 border border-neutral-300 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
