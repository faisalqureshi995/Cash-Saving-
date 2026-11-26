import React, { useState } from 'react';
import { AppState, GoalConfig } from '../types';
import { formatPKR } from '../utils/ranks';
import { exportBackup } from '../utils/storage';
import {
  X,
  Download,
  Upload,
  RotateCcw,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Target,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  onUpdateGoal: (goal: GoalConfig) => void;
  onImportBackup: (imported: AppState) => void;
  onLoadDemoData: () => void;
  onResetToZero: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  state,
  onUpdateGoal,
  onImportBackup,
  onLoadDemoData,
  onResetToZero,
  soundEnabled,
  onToggleSound,
  theme,
  onToggleTheme,
}) => {
  const [targetAmountInput, setTargetAmountInput] = useState<number>(state.goal.targetAmount || 100000);
  const [targetDateInput, setTargetDateInput] = useState<string>(state.goal.targetDate || '');
  const [goalSavedFeedback, setGoalSavedFeedback] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetAmountInput <= 0) return;
    onUpdateGoal({
      ...state.goal,
      targetAmount: targetAmountInput,
      targetDate: targetDateInput || undefined,
    });
    setGoalSavedFeedback(true);
    setTimeout(() => setGoalSavedFeedback(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.entries)) {
          onImportBackup(parsed);
          onClose();
        } else {
          alert('Invalid backup file format. Please upload a valid Cash Saving JSON export.');
        }
      } catch {
        alert('Could not parse the backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white font-display">Settings & Backup</h2>
            <p className="text-xs text-slate-400">Manage targets, data export, and appearance</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings modal"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Section 1: Goal Target Settings */}
          <form onSubmit={handleSaveGoal} className="space-y-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white font-display">Savings Goal Configuration</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                  Target Amount (PKR)
                </label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  required
                  value={targetAmountInput}
                  onChange={(e) => setTargetAmountInput(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono font-bold text-white focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                  Target Date (Optional)
                </label>
                <input
                  type="date"
                  value={targetDateInput}
                  onChange={(e) => setTargetDateInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">
                Default: PKR 100,000 for Conqueror Rank.
              </span>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
              >
                {goalSavedFeedback ? 'Saved ✓' : 'Update Goal'}
              </button>
            </div>
          </form>

          {/* Section 1.5: Daily Saving Discipline System */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white font-display">Daily Discipline & Penalty System</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Target is <strong className="text-white">Rs. 200/day</strong> (Pakistan Time: Asia/Karachi).
              Depositing ≥ Rs. 200 marks the day as <strong className="text-emerald-400">Target Achieved ✅</strong>.
              Depositing &lt; Rs. 200 (including Rs. 0) automatically assesses a fixed <strong className="text-rose-400">Rs. 200 penalty</strong>.
              Penalties are deducted only once per past calendar day and never drop balance below zero.
            </p>
          </div>

          {/* Section 2: Preferences (Audio & Theme) */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Preferences & Audio
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onToggleSound}
                className="min-h-[48px] p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between text-left transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-amber-400" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-500" />
                  )}
                  <div>
                    <span className="text-xs font-bold text-white block">Sound Effects</span>
                    <span className="text-[10px] text-slate-400">
                      {soundEnabled ? 'Coin & Fanfare On' : 'Muted'}
                    </span>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={onToggleTheme}
                className="min-h-[48px] p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between text-left transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {theme === 'dark' ? (
                    <Moon className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Sun className="w-4 h-4 text-yellow-500" />
                  )}
                  <div>
                    <span className="text-xs font-bold text-white block">Theme Mode</span>
                    <span className="text-[10px] text-slate-400">
                      {theme === 'dark' ? 'Dark Gaming' : 'Light Mode'}
                    </span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Section 3: Data Backup & Restore */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Data Backup & Device Portability
              </h3>
            </div>
            <p className="text-[11px] text-slate-400">
              Your financial records are preserved locally in this browser. Export a JSON backup file anytime to transfer to another device or create a safe copy.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => exportBackup(state)}
                className="min-h-[44px] py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Export Backup (JSON)</span>
              </button>

              <label className="min-h-[44px] py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer">
                <Upload className="w-4 h-4 text-sky-400" />
                <span>Import Backup</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Section 4: Testing & Demo Sandbox */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Demo Data & Zero Reset
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  onLoadDemoData();
                  onClose();
                }}
                className="min-h-[44px] py-2.5 px-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-amber-300 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Demo Data</span>
              </button>

              {!confirmReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="min-h-[44px] py-2.5 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-xs font-semibold text-rose-300 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Back to Zero</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onResetToZero();
                    setConfirmReset(false);
                    onClose();
                  }}
                  className="min-h-[44px] py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/30 transition-all"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Confirm Wipe?</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
