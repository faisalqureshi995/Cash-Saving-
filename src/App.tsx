/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { ActiveTab, AppState, GoalConfig, RankDefinition, SavingEntry, TransactionType } from './types';
import {
  loadAppState,
  saveAppState,
  calculateProcessedEntries,
  generateSampleDemoData,
  DEFAULT_GOAL,
} from './utils/storage';
import { calculateRank, getNextRank, formatPKR } from './utils/ranks';
import { calculateStreaks } from './utils/streaks';
import { soundManager } from './utils/audio';

import { TopNav } from './components/TopNav';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { RankJourney } from './components/RankJourney';
import { SavingsHistory } from './components/SavingsHistory';
import { SavingsAnalytics } from './components/SavingsAnalytics';
import { AchievementsView } from './components/AchievementsView';
import { AddCashModal } from './components/AddCashModal';
import { RankUpCelebration } from './components/RankUpCelebration';
import { VictoryModal } from './components/VictoryModal';
import { SettingsModal } from './components/SettingsModal';
import { RewardModal } from './components/RewardModal';
import { DepositRewardLevel, getDepositReward } from './utils/rewards';
import { evaluateMissedDayPenalties } from './utils/penalties';
import { MilestoneTracker } from './components/MilestoneTracker';
import { MilestoneCelebrationModal } from './components/MilestoneCelebrationModal';

export default function App() {
  const [state, setState] = useState<AppState>(() => loadAppState());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalInitialType, setModalInitialType] = useState<TransactionType>('saving');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newlyUnlockedRank, setNewlyUnlockedRank] = useState<RankDefinition | null>(null);
  const [showVictoryModal, setShowVictoryModal] = useState(false);

  // Cash Saving Rewards Modal (Chess.com Style)
  const [currentRewardPopup, setCurrentRewardPopup] = useState<{
    reward: DepositRewardLevel;
    amount: number;
  } | null>(null);
  const [pendingNextRank, setPendingNextRank] = useState<RankDefinition | null>(null);
  const [pendingVictory, setPendingVictory] = useState(false);

  // Rs. 500 Saving Milestone Celebration State
  const [pendingMilestoneCelebration, setPendingMilestoneCelebration] = useState<{
    completedMilestoneNum: number;
    unlockedCount: number;
    currentBalance: number;
    nextMilestoneNum: number;
    isAllCompleted: boolean;
  } | null>(null);
  const [activeMilestoneCelebration, setActiveMilestoneCelebration] = useState<{
    completedMilestoneNum: number;
    unlockedCount: number;
    currentBalance: number;
    nextMilestoneNum: number;
    isAllCompleted: boolean;
  } | null>(null);

  // Compute processed entries with running balance and penalty metrics
  const {
    processedEntries,
    currentBalance,
    totalDeposited,
    totalWithdrawn,
    totalPenalties,
    totalPenaltyCount,
    outstandingPenaltyTotal,
  } = useMemo(() => {
    return calculateProcessedEntries(state.entries);
  }, [state.entries]);

  // Automatically evaluate missed days penalties in Asia/Karachi (runs on load and changes)
  useEffect(() => {
    const result = evaluateMissedDayPenalties(state.entries, state.disciplineStartDate);
    if (result.hasChanges && result.newPenalties.length > 0) {
      setState((prev) => ({
        ...prev,
        entries: [...prev.entries, ...result.newPenalties],
      }));
    }
  }, [state.disciplineStartDate, state.entries.length]);

  // Compute current rank from net savings
  const currentRank = useMemo(() => {
    return calculateRank(currentBalance);
  }, [currentBalance]);

  // Compute streaks
  const streakStats = useMemo(() => {
    return calculateStreaks(state.entries);
  }, [state.entries]);

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    saveAppState(state);
  }, [state]);

  // Sync theme to document element
  useEffect(() => {
    const root = document.documentElement;
    if (state.theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
      document.body.className = 'bg-slate-100 text-slate-900 antialiased';
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
      document.body.className = 'bg-slate-950 text-slate-100 antialiased selection:bg-amber-500/30 selection:text-amber-200';
    }
  }, [state.theme]);

  // Handle adding a cash transaction (deposit or withdrawal)
  const handleAddTransaction = (newEntryData: Omit<SavingEntry, 'id' | 'createdAt'>) => {
    const newEntry: SavingEntry = {
      ...newEntryData,
      id: `entry_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };

    const previousBalance = currentBalance;
    const previousRank = calculateRank(previousBalance);

    const updatedEntries = [...state.entries, newEntry];
    const { currentBalance: nextBalance } = calculateProcessedEntries(updatedEntries);
    const nextRank = calculateRank(nextBalance);

    const prevMilestoneCount = Math.min(200, Math.floor(Math.max(0, previousBalance) / 500));
    const nextMilestoneCount = Math.min(200, Math.floor(Math.max(0, nextBalance) / 500));

    // Audio cue
    if (newEntry.type === 'saving') {
      soundManager.playCoin(state.soundEnabled);
      const reward = getDepositReward(newEntry.amount);

      // Check for 100k Conqueror victory milestone
      if (previousBalance < 100000 && nextBalance >= 100000) {
        setPendingVictory(true);
      } else if (nextRank.order > previousRank.order) {
        setPendingNextRank(nextRank);
      }

      // Check for Rs. 500 Milestone completion (each cumulative Rs. 500 completed)
      if (nextMilestoneCount > prevMilestoneCount) {
        setPendingMilestoneCelebration({
          completedMilestoneNum: nextMilestoneCount,
          unlockedCount: nextMilestoneCount - prevMilestoneCount,
          currentBalance: nextBalance,
          nextMilestoneNum: Math.min(200, nextMilestoneCount + 1),
          isAllCompleted: nextMilestoneCount >= 200,
        });
      }

      // Immediately display Chess.com-style award popup
      setCurrentRewardPopup({
        reward,
        amount: newEntry.amount,
      });
    } else {
      soundManager.playTap(state.soundEnabled);
    }

    // Update state persistently
    setState((prev) => ({
      ...prev,
      entries: updatedEntries,
      unlockedMilestones: Array.from(new Set([...prev.unlockedMilestones, nextRank.id])),
    }));
  };

  const handleCloseReward = () => {
    const nextRankToCelebrate = pendingNextRank;
    const victoryToCelebrate = pendingVictory;
    const milestoneToCelebrate = pendingMilestoneCelebration;

    setCurrentRewardPopup(null);
    setPendingNextRank(null);
    setPendingVictory(false);
    setPendingMilestoneCelebration(null);

    if (victoryToCelebrate) {
      setTimeout(() => {
        soundManager.playVictory(state.soundEnabled);
        setShowVictoryModal(true);
      }, 150);
    } else if (milestoneToCelebrate) {
      setTimeout(() => {
        soundManager.playMilestone(state.soundEnabled);
        setActiveMilestoneCelebration(milestoneToCelebrate);
      }, 150);
    } else if (nextRankToCelebrate) {
      setTimeout(() => {
        soundManager.playRankUp(state.soundEnabled);
        setNewlyUnlockedRank(nextRankToCelebrate);
      }, 150);
    }
  };

  const handleCloseMilestoneCelebration = () => {
    const nextRankToCelebrate = pendingNextRank;
    setActiveMilestoneCelebration(null);
    if (nextRankToCelebrate) {
      setPendingNextRank(null);
      setTimeout(() => {
        soundManager.playRankUp(state.soundEnabled);
        setNewlyUnlockedRank(nextRankToCelebrate);
      }, 150);
    }
  };

  // Handle updating an existing entry
  const handleUpdateEntry = (updated: SavingEntry) => {
    soundManager.playTap(state.soundEnabled);
    const updatedEntries = state.entries.map((e) => (e.id === updated.id ? updated : e));
    setState((prev) => ({
      ...prev,
      entries: updatedEntries,
    }));
  };

  // Handle deleting an entry
  const handleDeleteEntry = (id: string) => {
    soundManager.playTap(state.soundEnabled);
    const filtered = state.entries.filter((e) => e.id !== id);
    setState((prev) => ({
      ...prev,
      entries: filtered,
    }));
  };

  // Settings & Goals
  const handleUpdateGoal = (newGoal: GoalConfig) => {
    setState((prev) => ({
      ...prev,
      goal: newGoal,
    }));
  };

  const handleImportBackup = (imported: AppState) => {
    setState(imported);
  };

  const handleLoadDemoData = () => {
    const demo = generateSampleDemoData();
    setState((prev) => ({
      ...prev,
      entries: demo,
    }));
  };

  const handleResetToZero = () => {
    setState({
      entries: [],
      goal: DEFAULT_GOAL,
      theme: 'dark',
      soundEnabled: true,
      unlockedMilestones: [],
    });
  };

  const handleToggleSound = () => {
    const next = !state.soundEnabled;
    setState((prev) => ({ ...prev, soundEnabled: next }));
    if (next) soundManager.playCoin(true);
  };

  const handleToggleTheme = () => {
    setState((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  const openAddModal = (type: TransactionType = 'saving') => {
    setModalInitialType(type);
    setIsAddModalOpen(true);
  };

  return (
    <div className={`min-h-screen flex flex-col ${state.theme === 'light' ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'}`}>
      {/* Top Bar Navigation */}
      <TopNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAddModal={() => openAddModal('saving')}
        onOpenSettings={() => setIsSettingsOpen(true)}
        soundEnabled={state.soundEnabled}
        onToggleSound={handleToggleSound}
        theme={state.theme}
        onToggleTheme={handleToggleTheme}
        currentBalance={currentBalance}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            currentBalance={currentBalance}
            totalDeposited={totalDeposited}
            totalWithdrawn={totalWithdrawn}
            totalPenalties={totalPenalties}
            totalPenaltyCount={totalPenaltyCount}
            outstandingPenaltyTotal={outstandingPenaltyTotal}
            currentRank={currentRank}
            goal={state.goal}
            streakStats={streakStats}
            recentEntries={processedEntries.slice().reverse()}
            allEntries={processedEntries}
            onOpenAddModal={() => openAddModal('saving')}
            onOpenWithdrawModal={() => openAddModal('withdrawal')}
            onNavigateTab={setActiveTab}
            onEditEntry={() => setActiveTab('history')}
          />
        )}

        {activeTab === 'milestones' && (
          <MilestoneTracker
            currentBalance={currentBalance}
            onOpenAddModal={() => openAddModal('saving')}
          />
        )}

        {activeTab === 'journey' && (
          <RankJourney
            currentSavings={currentBalance}
            currentRank={currentRank}
            onOpenAddModal={() => openAddModal('saving')}
          />
        )}

        {activeTab === 'history' && (
          <SavingsHistory
            entries={processedEntries}
            onUpdateEntry={handleUpdateEntry}
            onDeleteEntry={handleDeleteEntry}
            onOpenAddModal={() => openAddModal('saving')}
          />
        )}

        {activeTab === 'analytics' && (
          <SavingsAnalytics
            entries={processedEntries}
            currentBalance={currentBalance}
            totalDeposited={totalDeposited}
            totalWithdrawn={totalWithdrawn}
            goal={state.goal}
            currentRank={currentRank}
            streakStats={streakStats}
          />
        )}

        {activeTab === 'achievements' && (
          <AchievementsView
            currentSavings={currentBalance}
            streakStats={streakStats}
            unlockedMilestones={state.unlockedMilestones}
          />
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Add / Withdraw Cash Modal */}
      <AddCashModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddTransaction}
        currentBalance={currentBalance}
        initialType={modalInitialType}
      />

      {/* Cash Saving Reward Popup (Chess.com Style) */}
      {currentRewardPopup && (
        <RewardModal
          isOpen={!!currentRewardPopup}
          onClose={handleCloseReward}
          reward={currentRewardPopup.reward}
          amount={currentRewardPopup.amount}
        />
      )}

      {/* Rs. 500 Saving Milestone Celebration Modal */}
      {activeMilestoneCelebration && (
        <MilestoneCelebrationModal
          isOpen={!!activeMilestoneCelebration}
          onClose={handleCloseMilestoneCelebration}
          completedMilestoneNum={activeMilestoneCelebration.completedMilestoneNum}
          unlockedCount={activeMilestoneCelebration.unlockedCount}
          currentBalance={activeMilestoneCelebration.currentBalance}
          nextMilestoneNum={activeMilestoneCelebration.nextMilestoneNum}
          isAllCompleted={activeMilestoneCelebration.isAllCompleted}
        />
      )}

      {/* Rank Up Celebration Modal */}
      {newlyUnlockedRank && (
        <RankUpCelebration
          rank={newlyUnlockedRank}
          nextRank={getNextRank(newlyUnlockedRank.id)}
          currentBalance={currentBalance}
          onClose={() => setNewlyUnlockedRank(null)}
          onViewJourney={() => {
            setNewlyUnlockedRank(null);
            setActiveTab('journey');
          }}
        />
      )}

      {/* Final Victory Conqueror Modal */}
      <VictoryModal
        isOpen={showVictoryModal}
        onClose={() => setShowVictoryModal(false)}
        totalSaved={currentBalance}
        totalEntries={state.entries.filter((e) => e.type === 'saving').length}
        activeDays={streakStats.totalActiveDays}
        longestStreak={streakStats.longestStreak}
        onSetNewGoal={() => {
          setShowVictoryModal(false);
          setIsSettingsOpen(true);
        }}
      />

      {/* Settings & Backup Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        state={state}
        onUpdateGoal={handleUpdateGoal}
        onImportBackup={handleImportBackup}
        onLoadDemoData={handleLoadDemoData}
        onResetToZero={handleResetToZero}
        soundEnabled={state.soundEnabled}
        onToggleSound={handleToggleSound}
        theme={state.theme}
        onToggleTheme={handleToggleTheme}
      />
    </div>
  );
}
