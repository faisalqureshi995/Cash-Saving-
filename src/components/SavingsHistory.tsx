import React, { useState, useMemo } from 'react';
import { SavingEntry, SavingSource, TransactionType } from '../types';
import { formatPKR } from '../utils/ranks';
import { toLocalDateString } from '../utils/streaks';
import { getDepositReward } from '../utils/rewards';
import {
  Search,
  Filter,
  ArrowDownRight,
  ArrowUpRight,
  Trash2,
  Edit2,
  Calendar,
  X,
  AlertCircle,
  Clock,
  ArrowUpDown,
  AlertOctagon,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';

interface SavingsHistoryProps {
  entries: SavingEntry[];
  onUpdateEntry: (updated: SavingEntry) => void;
  onDeleteEntry: (id: string) => void;
  onOpenAddModal: () => void;
}

type FilterPeriod = 'all' | 'today' | 'this_week' | 'this_month' | 'last_month' | 'custom';
type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

export const SavingsHistory: React.FC<SavingsHistoryProps> = ({
  entries,
  onUpdateEntry,
  onDeleteEntry,
  onOpenAddModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [period, setPeriod] = useState<FilterPeriod>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'saving' | 'withdrawal' | 'penalty'>('all');

  // Modal states for Edit and Delete confirmation
  const [editingEntry, setEditingEntry] = useState<SavingEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<SavingEntry | null>(null);

  // Edit form state
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editDate, setEditDate] = useState<string>('');
  const [editSource, setEditSource] = useState<SavingSource>('salary');
  const [editNote, setEditNote] = useState<string>('');
  const [editType, setEditType] = useState<TransactionType>('saving');

  const openEditModal = (entry: SavingEntry) => {
    setEditingEntry(entry);
    setEditAmount(entry.amount);
    setEditDate(entry.date);
    setEditSource(entry.source);
    setEditNote(entry.note || '');
    setEditType(entry.type);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;
    if (editAmount <= 0) return;

    onUpdateEntry({
      ...editingEntry,
      amount: editAmount,
      date: editDate,
      source: editSource,
      note: editNote.trim() || undefined,
      type: editType,
      updatedAt: new Date().toISOString(),
    });
    setEditingEntry(null);
  };

  // Filter and sort computation
  const filteredAndSorted = useMemo(() => {
    const today = new Date();
    const todayStr = toLocalDateString(today);

    // Week calculation: start of week (Monday)
    const dayOfWeek = today.getDay();
    const diffToMonday = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today);
    monday.setDate(diffToMonday);
    const mondayStr = toLocalDateString(monday);

    // Month calculation
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-11
    const thisMonthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

    const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const lastMonthPrefix = `${lastMonthDate.getFullYear()}-${String(
      lastMonthDate.getMonth() + 1
    ).padStart(2, '0')}`;

    return entries
      .filter((entry) => {
        // Type filter
        if (typeFilter !== 'all' && entry.type !== typeFilter) return false;

        // Source filter
        if (sourceFilter !== 'all' && entry.source !== sourceFilter) return false;

        // Period filter
        if (period === 'today' && entry.date !== todayStr) return false;
        if (period === 'this_week' && entry.date < mondayStr) return false;
        if (period === 'this_month' && !entry.date.startsWith(thisMonthPrefix)) return false;
        if (period === 'last_month' && !entry.date.startsWith(lastMonthPrefix)) return false;
        if (period === 'custom') {
          if (customStart && entry.date < customStart) return false;
          if (customEnd && entry.date > customEnd) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchNote = entry.note && entry.note.toLowerCase().includes(q);
          const matchReason = entry.reason && entry.reason.toLowerCase().includes(q);
          const matchSource = entry.source && entry.source.toLowerCase().includes(q);
          const matchAmount = entry.amount.toString().includes(q);
          if (!matchNote && !matchReason && !matchSource && !matchAmount) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          if (a.date !== b.date) return b.date.localeCompare(a.date);
          return (b.time || '').localeCompare(a.time || '');
        }
        if (sortBy === 'oldest') {
          if (a.date !== b.date) return a.date.localeCompare(b.date);
          return (a.time || '').localeCompare(b.time || '');
        }
        if (sortBy === 'highest') return b.amount - a.amount;
        if (sortBy === 'lowest') return a.amount - b.amount;
        return 0;
      });
  }, [entries, typeFilter, sourceFilter, period, customStart, customEnd, searchQuery, sortBy]);

  // Monthly summary aggregation
  const monthlySummary = useMemo(() => {
    const map = new Map<
      string,
      { deposits: number; withdrawals: number; penalties: number; count: number; activeDays: Set<string> }
    >();
    entries.forEach((e) => {
      const ym = e.date.substring(0, 7); // YYYY-MM
      const current = map.get(ym) || {
        deposits: 0,
        withdrawals: 0,
        penalties: 0,
        count: 0,
        activeDays: new Set<string>(),
      };
      if (e.type === 'saving') {
        current.deposits += e.amount;
        current.activeDays.add(e.date);
      } else if (e.type === 'penalty') {
        current.penalties += e.actualDeducted ?? e.amount;
      } else {
        current.withdrawals += e.actualDeducted ?? e.amount;
      }
      current.count++;
      map.set(ym, current);
    });

    return Array.from(map.entries())
      .map(([ym, data]) => ({
        ym,
        deposits: data.deposits,
        withdrawals: data.withdrawals,
        penalties: data.penalties,
        net: data.deposits - data.withdrawals - data.penalties,
        activeDaysCount: data.activeDays.size,
      }))
      .sort((a, b) => b.ym.localeCompare(a.ym));
  }, [entries]);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Savings & Penalty History
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Audit of every cash deposit, daily discipline penalty, and running balance
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="min-h-[44px] px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm rounded-xl shadow-md shadow-amber-500/20 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
        >
          + Record Entry
        </button>
      </div>

      {/* Monthly Performance Summary */}
      {monthlySummary.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-wider font-bold text-slate-400 block">
            Monthly Performance Summary
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {monthlySummary.slice(0, 3).map((m) => {
              const [year, month] = m.ym.split('-');
              const monthName = new Date(Number(year), Number(month) - 1).toLocaleString('en-US', {
                month: 'long',
                year: 'numeric',
              });
              return (
                <div
                  key={m.ym}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-sm font-display">{monthName}</span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {m.activeDaysCount} Active Days
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400 pt-1">
                    <span>Deposited:</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      +{formatPKR(m.deposits)}
                    </span>
                  </div>
                  {m.penalties > 0 && (
                    <div className="flex justify-between text-slate-400">
                      <span>Daily Penalties:</span>
                      <span className="font-mono text-rose-400 font-bold">
                        −{formatPKR(m.penalties)} 🔴
                      </span>
                    </div>
                  )}
                  {m.withdrawals > 0 && (
                    <div className="flex justify-between text-slate-400">
                      <span>Withdrawn:</span>
                      <span className="font-mono text-rose-300 font-semibold">
                        -{formatPKR(m.withdrawals)}
                      </span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-800/80 flex justify-between font-semibold">
                    <span className="text-slate-300">Net Saved:</span>
                    <span className="font-mono text-amber-400 font-extrabold text-sm">
                      {formatPKR(m.net)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters & Search Control Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        {/* Search Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes, reasons, sources, or amounts..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-sm text-slate-200 placeholder-slate-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-sm text-slate-200"
            >
              <option value="newest">Newest Date First</option>
              <option value="oldest">Oldest Date First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Filter Tabs: Period */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs text-slate-400 mr-2 font-medium">Period:</span>
          {(
            [
              { id: 'all', label: 'All Time' },
              { id: 'today', label: 'Today' },
              { id: 'this_week', label: 'This Week' },
              { id: 'this_month', label: 'This Month' },
              { id: 'last_month', label: 'Last Month' },
              { id: 'custom', label: 'Custom Range' },
            ] as const
          ).map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors min-h-[36px] cursor-pointer ${
                period === p.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom Range Inputs */}
        {period === 'custom' && (
          <div className="flex items-center gap-3 pt-2">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block mb-1">From Date</span>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block mb-1">To Date</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
              />
            </div>
          </div>
        )}

        {/* Secondary Filter: Type & Source */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
            >
              <option value="all">All Types</option>
              <option value="saving">Savings (+)</option>
              <option value="penalty">Daily Penalties (−Rs. 200 🔴)</option>
              <option value="withdrawal">Withdrawals (-)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Source:</span>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
            >
              <option value="all">All Sources</option>
              <option value="salary">Salary</option>
              <option value="business">Business</option>
              <option value="pocket_money">Pocket Money</option>
              <option value="gift">Gift / Eidi</option>
              <option value="side_hustle">Side Hustle</option>
              <option value="daily_change">Spare Change</option>
              <option value="other">Other / Discipline</option>
            </select>
          </div>

          <span className="text-slate-400 ml-auto font-mono">
            Showing {filteredAndSorted.length} of {entries.length} records
          </span>
        </div>
      </div>

      {/* Entries List */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        {filteredAndSorted.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500">
              <Calendar className="w-6 h-6" />
            </div>
            <p className="text-sm text-slate-300 font-medium">No matching records found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your date range, search query, or tap "Record Entry" to add savings.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredAndSorted.map((entry) => {
              const isPenalty = entry.type === 'penalty';
              const isSaving = entry.type === 'saving';

              return (
                <div
                  key={entry.id}
                  className={`p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    isPenalty
                      ? 'bg-rose-950/20 hover:bg-rose-950/30 border-l-4 border-l-rose-500'
                      : 'hover:bg-slate-850/40'
                  }`}
                >
                  {/* Left: Icon & Description */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                        isPenalty
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : isSaving
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {isPenalty ? (
                        <AlertOctagon className="w-6 h-6 text-rose-400 animate-pulse" />
                      ) : isSaving ? (
                        <ArrowDownRight className="w-6 h-6" />
                      ) : (
                        <ArrowUpRight className="w-6 h-6" />
                      )}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white">
                          {isPenalty
                            ? 'Daily saving target missed'
                            : entry.note || (isSaving ? 'Cash Saved' : 'Cash Withdrawal')}
                        </span>

                        {/* Status Badges */}
                        {isPenalty ? (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" />
                            Target Missed ❌
                          </span>
                        ) : isSaving && entry.amount >= 200 ? (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Target Achieved ✅
                          </span>
                        ) : null}

                        {/* Reward Badge if Saving */}
                        {isSaving && (() => {
                          const reward = getDepositReward(entry.amount);
                          return (
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${reward.badgeBg} ${reward.textColor} border ${reward.badgeBorder}`}
                              title={reward.message}
                            >
                              <span>{reward.emoji}</span>
                              <span>{reward.title}</span>
                            </span>
                          );
                        })()}
                      </div>

                      {/* Sub-details: Date, Time, Cash Deposited & Reason */}
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
                        <span className="font-mono">{entry.date}</span>
                        {entry.time && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-1 font-mono text-slate-400">
                              <Clock className="w-3 h-3" />
                              {entry.time}
                            </span>
                          </>
                        )}
                        {isPenalty && (
                          <>
                            <span>·</span>
                            <span className="text-rose-300">
                              Deposited on day: <strong>{formatPKR(entry.dailyDepositedAmount ?? 0)}</strong> (Target: Rs. 200)
                            </span>
                          </>
                        )}
                        {entry.balanceBefore !== undefined && entry.balanceAfter !== undefined && (
                          <>
                            <span>·</span>
                            <span className="text-slate-400 font-mono text-[11px]">
                              Before: {formatPKR(entry.balanceBefore)} → After: {formatPKR(entry.balanceAfter)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount, Running Balance, Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-800/60">
                    <div className="text-left sm:text-right font-mono">
                      {isPenalty ? (
                        <span className="text-base font-black text-rose-400 block tracking-tight">
                          −Rs. {(entry.actualDeducted ?? entry.amount).toLocaleString()} 🔴
                        </span>
                      ) : (
                        <span
                          className={`text-base font-extrabold block ${
                            isSaving ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isSaving ? '+' : '-'}
                          {formatPKR(entry.amount)}
                        </span>
                      )}

                      {entry.runningBalance !== undefined && (
                        <span className="text-xs text-slate-400 block">
                          Net Bal: {formatPKR(entry.runningBalance)}
                        </span>
                      )}
                    </div>

                    {/* Actions: Edit & Delete (Disabled for automated penalties or allowed with notice) */}
                    <div className="flex items-center gap-1 shrink-0">
                      {!isPenalty && (
                        <button
                          onClick={() => openEditModal(entry)}
                          aria-label="Edit saving entry"
                          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Edit this entry"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setDeletingEntry(entry)}
                        aria-label="Delete entry"
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        title={isPenalty ? 'Dismiss this penalty' : 'Delete this entry'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editingEntry && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
        >
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-display">Edit Cash Record</h3>
              <button
                onClick={() => setEditingEntry(null)}
                aria-label="Close edit modal"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                  Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditType('saving')}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                      editType === 'saving'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400 font-bold'
                        : 'border-slate-800 text-slate-400'
                    }`}
                  >
                    Deposit (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditType('withdrawal')}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                      editType === 'withdrawal'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-400 font-bold'
                        : 'border-slate-800 text-slate-400'
                    }`}
                  >
                    Withdrawal (-)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                  Amount (PKR)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editAmount}
                  onChange={(e) => setEditAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-lg font-mono font-bold text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                    Source
                  </label>
                  <select
                    value={editSource}
                    onChange={(e) => setEditSource(e.target.value as SavingSource)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200"
                  >
                    <option value="salary">Salary</option>
                    <option value="business">Business</option>
                    <option value="pocket_money">Pocket Money</option>
                    <option value="gift">Gift / Eidi</option>
                    <option value="side_hustle">Side Hustle</option>
                    <option value="daily_change">Spare Change</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                  Note
                </label>
                <input
                  type="text"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="Optional memo..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200"
                />
              </div>

              <p className="text-[11px] text-slate-400">
                Saving this change will automatically recalculate running balances, ranks, and streaks.
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingEntry(null)}
                  className="w-1/2 min-h-[44px] py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 min-h-[44px] py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingEntry && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
        >
          <div className="w-full max-w-sm bg-slate-900 border border-rose-900/60 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/15 text-rose-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white font-display">
                {deletingEntry.type === 'penalty' ? 'Dismiss Penalty Record?' : 'Delete Entry?'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {deletingEntry.type === 'penalty' ? (
                  <>
                    Are you sure you want to dismiss the daily penalty of{' '}
                    <strong className="text-rose-400 font-mono">−Rs. {deletingEntry.amount}</strong> for{' '}
                    {deletingEntry.date}?
                  </>
                ) : (
                  <>
                    Are you sure you want to delete this record of{' '}
                    <strong className="text-white font-mono">
                      {formatPKR(deletingEntry.amount)}
                    </strong>{' '}
                    from {deletingEntry.date}?
                  </>
                )}
              </p>
            </div>

            <p className="text-[11px] text-rose-300/80 p-2.5 bg-rose-950/40 rounded-xl border border-rose-900/40">
              Total balance and gaming rank will be recalculated from remaining entries.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeletingEntry(null)}
                className="w-1/2 min-h-[44px] py-2.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-xl cursor-pointer"
              >
                Keep Record
              </button>
              <button
                onClick={() => {
                  onDeleteEntry(deletingEntry.id);
                  setDeletingEntry(null);
                }}
                className="w-1/2 min-h-[44px] py-2.5 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
