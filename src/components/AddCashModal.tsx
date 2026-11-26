import React, { useState } from 'react';
import { SavingEntry, SavingSource, TransactionType } from '../types';
import { getKarachiDate, getKarachiTime, DAILY_TARGET_PKR } from '../utils/penalties';
import { formatPKR } from '../utils/ranks';
import { getDepositReward } from '../utils/rewards';
import { X, ArrowDownRight, ArrowUpRight, DollarSign, Calendar, Tag, FileText, Sparkles, Target } from 'lucide-react';

interface AddCashModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (entry: Omit<SavingEntry, 'id' | 'createdAt'>) => void;
  currentBalance: number;
  initialType?: TransactionType;
}

const SOURCES: { id: SavingSource; label: string }[] = [
  { id: 'salary', label: 'Salary / Wages' },
  { id: 'business', label: 'Business Profit' },
  { id: 'side_hustle', label: 'Side Hustle / Freelance' },
  { id: 'pocket_money', label: 'Pocket Money / Allowance' },
  { id: 'gift', label: 'Gift / Eidi' },
  { id: 'daily_change', label: 'Daily Spare Change' },
  { id: 'other', label: 'Other Source' },
];

const PRESET_AMOUNTS = [200, 500, 1000, 2000, 5000, 10000];

export const AddCashModal: React.FC<AddCashModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentBalance,
  initialType = 'saving',
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [amountInput, setAmountInput] = useState<string>('');
  const [date, setDate] = useState<string>(getKarachiDate());
  const [source, setSource] = useState<SavingSource>('salary');
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const parsedAmount = parseFloat(amountInput) || 0;
  const simulatedNewBalance =
    type === 'saving'
      ? currentBalance + parsedAmount
      : currentBalance - parsedAmount;

  const handlePresetClick = (val: number) => {
    setAmountInput(String(val));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }
    if (!date) {
      setError('Please select a valid date.');
      return;
    }
    if (type === 'withdrawal' && parsedAmount > currentBalance) {
      setError(`Cannot withdraw more than your current savings of ${formatPKR(currentBalance)}.`);
      return;
    }

    setIsSubmitting(true);
    const timeStr = getKarachiTime();

    const reward = type === 'saving' ? getDepositReward(parsedAmount) : undefined;

    onSubmit({
      type,
      amount: parsedAmount,
      date,
      time: timeStr,
      source,
      note: note.trim() || undefined,
      rewardTitle: reward?.title,
      rewardEmoji: reward?.emoji,
    });

    // Reset and close
    setAmountInput('');
    setNote('');
    setError(null);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="w-full sm:max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white font-display">Record Cash Transaction</h2>
            <p className="text-xs text-slate-400">Keep your PKR 100,000 progress accurate and leveling up</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close transaction modal"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* Transaction Type Segmented Toggle */}
          <div className="grid grid-cols-2 p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setType('saving');
                setError(null);
              }}
              className={`min-h-[44px] flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all ${
                type === 'saving'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>Add Savings</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setType('withdrawal');
                setError(null);
              }}
              className={`min-h-[44px] flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all ${
                type === 'withdrawal'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Withdrawal</span>
            </button>
          </div>

          {/* Amount Field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              {type === 'saving' ? 'Amount to Save (PKR)' : 'Withdrawal Amount (PKR)'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold">
                ₨
              </div>
              <input
                type="number"
                min="1"
                step="any"
                required
                value={amountInput}
                onChange={(e) => {
                  setAmountInput(e.target.value);
                  setError(null);
                }}
                placeholder="e.g. 5,000"
                className="w-full pl-9 pr-4 py-3 bg-slate-950 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-xl font-bold font-mono text-white placeholder-slate-600 transition-all"
                autoFocus
              />
            </div>

            {/* Quick Amount Chips */}
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {PRESET_AMOUNTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handlePresetClick(val)}
                  className="px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  +{val.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Live Reward Level Preview (Chess.com Style) */}
            {type === 'saving' && parsedAmount > 0 && (() => {
              const liveReward = getDepositReward(parsedAmount);
              return (
                <div
                  className={`mt-3 p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs transition-all ${liveReward.badgeBg} ${liveReward.badgeBorder}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl shrink-0">{liveReward.emoji}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className={liveReward.textColor}>{liveReward.title} Award</span>
                        <span className="text-[10px] text-slate-400 font-normal">({liveReward.emoji})</span>
                      </div>
                      <p className="text-[11px] text-slate-300 italic truncate">
                        "{liveReward.message}"
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-lg bg-slate-900 text-amber-300 font-semibold border border-amber-500/30 shrink-0">
                    Reward Tier
                  </span>
                </div>
              );
            })()}
          </div>

          {/* Date & Source Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Date Saved
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl text-sm text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Fund Source
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as SavingSource)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl text-sm text-slate-200"
              >
                {SOURCES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Freelance project bonus, eid gift..."
              maxLength={120}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl text-sm text-slate-200 placeholder-slate-600"
            />
          </div>

          {/* Live Balance Impact Preview */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Current Net Balance:</span>
              <span className="font-mono text-slate-200">{formatPKR(currentBalance)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Updated Balance After Entry:</span>
              <span
                className={`font-mono text-sm font-bold ${
                  type === 'saving' ? 'text-amber-400' : 'text-rose-400'
                }`}
              >
                {formatPKR(Math.max(0, simulatedNewBalance))}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-xs text-rose-300">
              {error}
            </div>
          )}

          {/* Submit CTA */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 min-h-[44px] py-3 text-sm font-medium text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-2/3 min-h-[44px] py-3 text-sm font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] ${
                type === 'saving'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/25'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/25'
              }`}
            >
              {type === 'saving'
                ? `Confirm +${formatPKR(parsedAmount || 0)}`
                : `Confirm -${formatPKR(parsedAmount || 0)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
