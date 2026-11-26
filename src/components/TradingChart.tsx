import React, { useState, useMemo, useRef } from 'react';
import { SavingEntry, RankDefinition } from '../types';
import { formatPKR, formatShortPKR, calculateRank } from '../utils/ranks';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  AlertOctagon,
  ShieldAlert,
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle2,
} from 'lucide-react';

interface TradingChartProps {
  entries: SavingEntry[];
  currentBalance: number;
  totalDeposited?: number;
  totalPenalties?: number;
  totalPenaltyCount?: number;
  outstandingPenaltyTotal?: number;
  targetAmount?: number;
  currentRank: RankDefinition;
  compact?: boolean;
}

type TimeframeFilter = 'daily' | 'weekly' | 'monthly' | 'all';

interface ChartPoint {
  index: number;
  id: string;
  date: string;
  displayDate: string;
  time?: string;
  open: number;
  high: number;
  low: number;
  close: number;
  depositAmount: number;
  penaltyAmount: number;
  isPenalty: boolean;
  isSaving: boolean;
  isWithdrawal: boolean;
  targetStatus: 'achieved' | 'missed' | 'pending';
  change: number;
  percentChange: number;
  note?: string;
  reason?: string;
  rankName: string;
}

export const TradingChart: React.FC<TradingChartProps> = ({
  entries,
  currentBalance,
  totalDeposited = 0,
  totalPenalties = 0,
  totalPenaltyCount = 0,
  outstandingPenaltyTotal = 0,
  targetAmount = 100000,
  currentRank,
  compact = false,
}) => {
  const [chartType, setChartType] = useState<'line' | 'candles'>('line');
  const [timeframe, setTimeframe] = useState<TimeframeFilter>('daily');
  const [showEMA, setShowEMA] = useState(true);
  const [showResistance, setShowResistance] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState<ChartPoint | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Chronologically sorted entries
  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      if (a.time && b.time && a.time !== b.time) return a.time.localeCompare(b.time);
      if (a.type !== b.type) {
        if (a.type === 'saving') return -1;
        if (b.type === 'saving') return 1;
      }
      return a.createdAt.localeCompare(b.createdAt);
    });
  }, [entries]);

  // Transform entries into chart trading series with running balances
  const chartPoints = useMemo(() => {
    if (!sortedEntries || sortedEntries.length === 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      return [
        {
          index: 0,
          id: 'start_0',
          date: todayStr,
          displayDate: 'Start',
          open: 0,
          high: 0,
          low: 0,
          close: 0,
          depositAmount: 0,
          penaltyAmount: 0,
          isPenalty: false,
          isSaving: true,
          isWithdrawal: false,
          targetStatus: 'pending' as const,
          change: 0,
          percentChange: 0,
          rankName: 'Bronze',
        },
      ];
    }

    // Filter by timeframe
    let filtered = sortedEntries;
    const now = new Date();
    if (timeframe === 'daily') {
      // Last 14-21 days of individual steps
      const cutoff = new Date(now);
      cutoff.setDate(cutoff.getDate() - 21);
      const cutoffStr = cutoff.toISOString().split('T')[0];
      filtered = sortedEntries.filter((e) => e.date >= cutoffStr);
      if (filtered.length === 0) filtered = sortedEntries.slice(-10);
    } else if (timeframe === 'weekly') {
      // Last 8 weeks
      const cutoff = new Date(now);
      cutoff.setDate(cutoff.getDate() - 56);
      const cutoffStr = cutoff.toISOString().split('T')[0];
      filtered = sortedEntries.filter((e) => e.date >= cutoffStr);
      if (filtered.length === 0) filtered = sortedEntries.slice(-15);
    } else if (timeframe === 'monthly') {
      // Last 6 months
      const cutoff = new Date(now);
      cutoff.setDate(cutoff.getDate() - 180);
      const cutoffStr = cutoff.toISOString().split('T')[0];
      filtered = sortedEntries.filter((e) => e.date >= cutoffStr);
      if (filtered.length === 0) filtered = sortedEntries;
    }

    // Compute baseline balance before filtered period
    let running = 0;
    const firstDate = filtered[0].date;
    sortedEntries.forEach((e) => {
      if (e.date < firstDate) {
        if (e.type === 'saving') {
          running += e.amount;
        } else {
          running = Math.max(0, running - (e.actualDeducted ?? e.amount));
        }
      }
    });

    const points: ChartPoint[] = [];

    // Optional baseline point
    if (filtered.length > 0 && filtered[0].date === sortedEntries[0].date && running === 0) {
      points.push({
        index: 0,
        id: 'baseline_0',
        date: filtered[0].date,
        displayDate: 'Base',
        open: 0,
        high: 0,
        low: 0,
        close: 0,
        depositAmount: 0,
        penaltyAmount: 0,
        isPenalty: false,
        isSaving: true,
        isWithdrawal: false,
        targetStatus: 'pending',
        change: 0,
        percentChange: 0,
        rankName: 'Bronze',
      });
    }

    filtered.forEach((e) => {
      const open = running;
      const isPenalty = e.type === 'penalty';
      const isSaving = e.type === 'saving';
      const isWithdrawal = e.type === 'withdrawal';

      let depositAmount = 0;
      let penaltyAmount = 0;

      if (isSaving) {
        depositAmount = e.amount;
        running += e.amount;
      } else if (isPenalty) {
        penaltyAmount = e.actualDeducted ?? e.amount;
        running = Math.max(0, running - penaltyAmount);
      } else {
        const withdraw = e.actualDeducted ?? e.amount;
        running = Math.max(0, running - withdraw);
      }

      const close = running;
      const high = Math.max(open, close);
      const low = Math.min(open, close);
      const change = close - open;
      const percentChange = open > 0 ? (change / open) * 100 : close > 0 ? 100 : 0;
      const parts = e.date.split('-');
      const displayDate = parts.length === 3 ? `${parts[2]}/${parts[1]}` : e.date;
      const rank = calculateRank(close);

      points.push({
        index: points.length,
        id: e.id,
        date: e.date,
        displayDate,
        time: e.time,
        open,
        high,
        low,
        close,
        depositAmount,
        penaltyAmount,
        isPenalty,
        isSaving,
        isWithdrawal,
        targetStatus: e.targetStatus || (isPenalty ? 'missed' : isSaving && e.amount >= 200 ? 'achieved' : 'pending'),
        change,
        percentChange,
        note: e.note,
        reason: e.reason,
        rankName: rank.name,
      });
    });

    return points;
  }, [sortedEntries, timeframe]);

  // Geometry dimensions
  const svgWidth = 720;
  const svgHeight = compact ? 230 : 330;
  const margin = { top: 32, right: 68, bottom: compact ? 30 : 45, left: 16 };
  const innerWidth = svgWidth - margin.left - margin.right;
  const innerHeight = svgHeight - margin.top - margin.bottom;

  // Scale math
  const maxPrice = Math.max(targetAmount, ...chartPoints.map((p) => p.high), 1000);
  const minPrice = 0;
  const priceRange = maxPrice - minPrice;

  const getY = (val: number) => {
    const clamped = Math.max(minPrice, Math.min(maxPrice, val));
    return margin.top + innerHeight - ((clamped - minPrice) / (priceRange || 1)) * innerHeight;
  };

  const getX = (index: number) => {
    if (chartPoints.length <= 1) return margin.left + innerWidth / 2;
    return margin.left + (index / (chartPoints.length - 1)) * innerWidth;
  };

  // EMA calculation
  const emaPoints = useMemo(() => {
    if (chartPoints.length < 2) return [];
    const k = 2 / (3 + 1);
    let ema = chartPoints[0].close;
    return chartPoints.map((d, i) => {
      if (i > 0) ema = d.close * k + ema * (1 - k);
      return { x: getX(i), y: getY(ema) };
    });
  }, [chartPoints, maxPrice]);

  // Segments for line chart with dynamic colors: Green for savings, Red for penalties/withdrawals
  const lineSegments = useMemo(() => {
    if (chartPoints.length < 2) return [];
    const segs: {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      isPenalty: boolean;
      isBullish: boolean;
    }[] = [];

    for (let i = 0; i < chartPoints.length - 1; i++) {
      const p1 = chartPoints[i];
      const p2 = chartPoints[i + 1];
      segs.push({
        x1: getX(i),
        y1: getY(p1.close),
        x2: getX(i + 1),
        y2: getY(p2.close),
        isPenalty: p2.isPenalty,
        isBullish: p2.close >= p1.close,
      });
    }
    return segs;
  }, [chartPoints, maxPrice]);

  // Overall path for smooth gradient fill
  const linePath = useMemo(() => {
    if (chartPoints.length === 0) return '';
    return chartPoints
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.close)}`)
      .join(' ');
  }, [chartPoints, maxPrice]);

  const areaPath = useMemo(() => {
    if (chartPoints.length === 0) return '';
    const firstX = getX(0);
    const lastX = getX(chartPoints.length - 1);
    const baseY = margin.top + innerHeight;
    return `${linePath} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
  }, [linePath, chartPoints]);

  // Mouse crosshair handler
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || chartPoints.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * svgWidth;

    let closestIndex = 0;
    let closestDist = Infinity;
    chartPoints.forEach((_, i) => {
      const px = getX(i);
      const dist = Math.abs(px - mouseX);
      if (dist < closestDist) {
        closestDist = dist;
        closestIndex = i;
      }
    });

    const pt = chartPoints[closestIndex];
    setHoveredPoint(pt);
    setHoverPosition({ x: getX(closestIndex), y: getY(pt.close) });
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
    setHoverPosition(null);
  };

  // Price ticks
  const yTicks = [0, targetAmount * 0.25, targetAmount * 0.5, targetAmount * 0.75, targetAmount];

  return (
    <div
      className={`rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden transition-all ${
        compact ? 'p-5' : 'p-6 sm:p-7'
      }`}
    >
      {/* 1. TOP KPI STRIP: Total Penalties, Total Deposits, and Current Balance */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pb-5 border-b border-slate-800">
        {/* Current Balance */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-mono font-semibold">
            Current Savings Balance
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white tabular-nums">
              {formatPKR(currentBalance)}
            </span>
          </div>
          <span className="text-[11px] text-amber-400 font-semibold block mt-0.5">
            {currentRank.name} Tier
          </span>
        </div>

        {/* Total Deposits */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-900/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-emerald-400 block font-mono font-semibold">
              Total Cash Deposits
            </span>
            <ArrowUpCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 tabular-nums">
              +{formatPKR(totalDeposited)}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            Green Upward Moves
          </span>
        </div>

        {/* Total Daily Penalties Deducted */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-rose-900/40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-rose-400 block font-mono font-semibold">
              Total Penalties Deducted
            </span>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-rose-400 tabular-nums">
              {totalPenalties > 0 ? `−${formatPKR(totalPenalties)}` : 'Rs. 0'}
            </span>
          </div>
          <span className="text-[11px] text-rose-300/80 block mt-0.5 font-mono">
            {totalPenaltyCount} missed day{totalPenaltyCount === 1 ? '' : 's'} penalized (−Rs. 200/day)
          </span>
        </div>

        {/* Discipline / Outstanding Status */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-mono font-semibold">
            Daily Target Rule
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl sm:text-2xl font-black font-mono text-slate-100">
              Rs. 200 / Day
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            {outstandingPenaltyTotal > 0 ? (
              <span className="text-amber-400 font-bold">
                ⚠️ Rs. {outstandingPenaltyTotal.toLocaleString()} unpaid penalty
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                No unpaid penalties
              </span>
            )}
          </span>
        </div>
      </div>

      {/* 2. TRADING HEADER & FILTER CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500/20 via-yellow-500/10 to-emerald-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Activity className="w-5 h-5 animate-pulse text-amber-400" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold tracking-widest text-slate-300 uppercase">
                SAVINGS MARKET FLOW
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Green pumps indicate savings; Red dips indicate daily penalties or withdrawals
            </p>
          </div>
        </div>

        {/* Chart View Switcher & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Chart Type: Line vs Candles */}
          <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all min-h-[32px] cursor-pointer ${
                chartType === 'line'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Neon Line
            </button>
            <button
              onClick={() => setChartType('candles')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all min-h-[32px] cursor-pointer ${
                chartType === 'candles'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Candles (K-Line)
            </button>
          </div>

          {/* Daily, Weekly, Monthly Filter as requested */}
          <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono">
            {(
              [
                { id: 'daily', label: 'Daily' },
                { id: 'weekly', label: 'Weekly' },
                { id: 'monthly', label: 'Monthly' },
                { id: 'all', label: 'All Time' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeframe(t.id)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all min-h-[32px] cursor-pointer ${
                  timeframe === t.id
                    ? 'bg-slate-800 text-amber-400 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {!compact && (
            <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-slate-800 text-[11px]">
              <button
                onClick={() => setShowEMA(!showEMA)}
                className={`px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                  showEMA
                    ? 'bg-purple-950/50 border-purple-500/60 text-purple-300'
                    : 'border-slate-800 text-slate-500'
                }`}
                title="Toggle Moving Average"
              >
                EMA
              </button>
              <button
                onClick={() => setShowResistance(!showResistance)}
                className={`px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                  showResistance
                    ? 'bg-yellow-950/50 border-yellow-500/60 text-yellow-300'
                    : 'border-slate-800 text-slate-500'
                }`}
                title="Toggle PKR 100k Target Resistance Line"
              >
                100K Resistance
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. MAIN TRADING SVG VIEWPORT */}
      <div className="relative w-full pt-4 select-none">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id="tradingGlowGreen" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#059669" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#022c22" stopOpacity="0.0" />
            </linearGradient>

            <filter id="neonPulseGreen" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="neonPulseRed" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Grid */}
          <g className="opacity-20 pointer-events-none">
            {yTicks.map((val) => {
              const y = getY(val);
              return (
                <line
                  key={val}
                  x1={margin.left}
                  y1={y}
                  x2={svgWidth - margin.right}
                  y2={y}
                  stroke="#64748B"
                  strokeWidth="0.8"
                  strokeDasharray="3 3"
                />
              );
            })}
          </g>

          {/* PKR 100K Target Resistance Line */}
          {showResistance && (
            <g>
              <line
                x1={margin.left}
                y1={getY(targetAmount)}
                x2={svgWidth - margin.right}
                y2={getY(targetAmount)}
                stroke="#EAB308"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.85"
              />
              <rect
                x={svgWidth - margin.right + 2}
                y={getY(targetAmount) - 9}
                width="64"
                height="18"
                rx="4"
                fill="#854D0E"
                stroke="#EAB308"
                strokeWidth="1"
              />
              <text
                x={svgWidth - margin.right + 34}
                y={getY(targetAmount) + 3}
                textAnchor="middle"
                fill="#FEF08A"
                fontSize="9"
                fontWeight="bold"
                fontFamily="monospace"
              >
                100K GOAL
              </text>
            </g>
          )}

          {/* Y-Axis Price Labels */}
          <g className="text-[10px] font-mono fill-slate-500 pointer-events-none">
            {yTicks.map((val) => (
              <text
                key={val}
                x={svgWidth - margin.right + 6}
                y={getY(val) + 3.5}
                fill="#94A3B8"
                fontSize="9"
                fontFamily="monospace"
              >
                {formatShortPKR(val)}
              </text>
            ))}
          </g>

          {/* MODE 1: NEON LINE WITH COLOR-CODED SEGMENTS */}
          {chartType === 'line' && (
            <g>
              {/* Background gradient fill */}
              <path d={areaPath} fill="url(#tradingGlowGreen)" />

              {/* Individual Multi-colored Segments: Red for penalties, Green for savings */}
              {lineSegments.map((seg, idx) => {
                const isPenaltyDrop = seg.isPenalty;
                const strokeColor = isPenaltyDrop ? '#EF4444' : seg.isBullish ? '#10B981' : '#F87171';
                return (
                  <line
                    key={idx}
                    x1={seg.x1}
                    y1={seg.y1}
                    x2={seg.x2}
                    y2={seg.y2}
                    stroke={strokeColor}
                    strokeWidth={isPenaltyDrop ? '3.5' : '2.5'}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter={isPenaltyDrop ? 'url(#neonPulseRed)' : 'url(#neonPulseGreen)'}
                  />
                );
              })}

              {/* EMA trend line */}
              {showEMA && emaPoints.length > 1 && (
                <path
                  d={emaPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
                  fill="none"
                  stroke="#A855F7"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                  opacity="0.8"
                />
              )}

              {/* Vertex Nodes: Green dots for savings, Red down-triangles for penalties */}
              {chartPoints.map((pt, i) => {
                const x = getX(i);
                const y = getY(pt.close);

                if (pt.isPenalty) {
                  // Downward red triangle marker for penalty
                  return (
                    <g key={pt.id || i}>
                      <polygon
                        points={`${x},${y + 7} ${x - 6},${y - 5} ${x + 6},${y - 5}`}
                        fill="#EF4444"
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                      />
                      <circle cx={x} cy={y} r="8" fill="none" stroke="#EF4444" strokeWidth="1" opacity="0.6" />
                    </g>
                  );
                }

                // Normal vertex
                const isLast = i === chartPoints.length - 1;
                return (
                  <g key={pt.id || i}>
                    <circle
                      cx={x}
                      cy={y}
                      r={isLast ? 5 : 3.5}
                      fill={pt.change >= 0 ? '#10B981' : '#F43F5E'}
                      stroke="#FFFFFF"
                      strokeWidth={isLast ? 2 : 1}
                    />
                    {isLast && (
                      <circle
                        cx={x}
                        cy={y}
                        r="9"
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="1.5"
                        className="animate-ping opacity-75"
                      />
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* MODE 2: CANDLESTICKS (K-LINE) */}
          {chartType === 'candles' && (
            <g>
              {chartPoints.map((c, i) => {
                const x = getX(i);
                const candleWidth = Math.max(6, Math.min(20, (innerWidth / chartPoints.length) * 0.7));

                const openY = getY(c.open);
                const closeY = getY(c.close);
                const highY = getY(c.high);
                const lowY = getY(c.low);

                const topBodyY = Math.min(openY, closeY);
                const bodyHeight = Math.max(4, Math.abs(closeY - openY));

                const isRed = c.isPenalty || c.close < c.open;
                const candleColor = isRed ? '#EF4444' : '#10B981';
                const wickColor = isRed ? '#F87171' : '#34D399';

                return (
                  <g key={c.id || i} className="transition-all hover:brightness-125">
                    {/* Wicks */}
                    <line
                      x1={x}
                      y1={highY}
                      x2={x}
                      y2={lowY}
                      stroke={wickColor}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />

                    {/* Candle Body */}
                    <rect
                      x={x - candleWidth / 2}
                      y={topBodyY}
                      width={candleWidth}
                      height={bodyHeight}
                      rx="2"
                      fill={candleColor}
                      stroke={isRed ? '#B91C1C' : '#059669'}
                      strokeWidth="1"
                    />

                    {/* Penalty Alert badge above candle */}
                    {c.isPenalty && (
                      <circle cx={x} cy={highY - 8} r="3" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1" />
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* X-Axis Date Ticks */}
          <g className="text-[10px] font-mono fill-slate-500 pointer-events-none">
            {chartPoints.map((d, i) => {
              const step = Math.ceil(chartPoints.length / (compact ? 5 : 8));
              if (i % step !== 0 && i !== chartPoints.length - 1) return null;
              const x = getX(i);
              return (
                <text
                  key={i}
                  x={x}
                  y={margin.top + innerHeight + 18}
                  textAnchor="middle"
                  fill="#94A3B8"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {d.displayDate}
                </text>
              );
            })}
          </g>

          {/* Crosshair Laser Lines */}
          {hoveredPoint && hoverPosition && (
            <g className="pointer-events-none">
              <line
                x1={hoverPosition.x}
                y1={margin.top}
                x2={hoverPosition.x}
                y2={margin.top + innerHeight}
                stroke="#38BDF8"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.8"
              />
              <line
                x1={margin.left}
                y1={hoverPosition.y}
                x2={svgWidth - margin.right}
                y2={hoverPosition.y}
                stroke="#38BDF8"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.8"
              />

              <rect
                x={svgWidth - margin.right + 2}
                y={hoverPosition.y - 9}
                width="64"
                height="18"
                rx="4"
                fill="#0369A1"
                stroke="#38BDF8"
                strokeWidth="1"
              />
              <text
                x={svgWidth - margin.right + 34}
                y={hoverPosition.y + 3.5}
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="9"
                fontWeight="bold"
                fontFamily="monospace"
              >
                {formatShortPKR(hoveredPoint.close)}
              </text>

              <circle
                cx={hoverPosition.x}
                cy={hoverPosition.y}
                r="6"
                fill={hoveredPoint.isPenalty ? '#EF4444' : '#38BDF8'}
                stroke="#FFFFFF"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {/* 4. HOVER / TAP CROSSHAIR TOOLTIP: Date, Transaction Amount, Penalty Amount, Updated Balance */}
        {hoveredPoint && hoverPosition && (
          <div
            className="absolute z-30 pointer-events-none transition-all p-3.5 rounded-2xl bg-slate-950/95 border border-sky-400/60 shadow-[0_0_25px_rgba(56,189,248,0.25)] text-xs backdrop-blur-md min-w-[240px]"
            style={{
              left: `${Math.min(Math.max(8, (hoverPosition.x / svgWidth) * 100 - 15), 65)}%`,
              top: `${Math.max(8, (hoverPosition.y / svgHeight) * 100 - 55)}%`,
            }}
          >
            {/* Header: Date & Status Tag */}
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="font-mono text-[11px] text-slate-300 font-bold flex items-center gap-1">
                <Calendar className="w-3 h-3 text-sky-400" />
                {hoveredPoint.date}
              </span>

              {hoveredPoint.isPenalty ? (
                <span className="font-mono text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  Target Missed ❌
                </span>
              ) : hoveredPoint.depositAmount >= 200 ? (
                <span className="font-mono text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Target Achieved ✅
                </span>
              ) : (
                <span className="font-mono text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {hoveredPoint.isWithdrawal ? 'Withdrawal' : 'Entry'}
                </span>
              )}
            </div>

            {/* Metrics Breakdown */}
            <div className="pt-2 space-y-1.5 font-mono text-[11px]">
              {/* Updated Running Balance */}
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Updated Balance:</span>
                <span className="font-bold text-white text-sm">
                  {formatPKR(hoveredPoint.close)}
                </span>
              </div>

              {/* Transaction Amount */}
              {hoveredPoint.depositAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Cash Deposited:</span>
                  <span className="font-bold text-emerald-400">
                    +{formatPKR(hoveredPoint.depositAmount)}
                  </span>
                </div>
              )}

              {/* Penalty Amount */}
              {hoveredPoint.isPenalty && (
                <div className="flex justify-between p-1 bg-rose-950/40 rounded border border-rose-900/50">
                  <span className="text-rose-300">Daily Penalty Deducted:</span>
                  <span className="font-black text-rose-400">
                    −{formatPKR(hoveredPoint.penaltyAmount || 200)} 🔴
                  </span>
                </div>
              )}

              {/* Net Balance Flow */}
              <div className="flex justify-between text-[10px] pt-1 border-t border-slate-800/80">
                <span className="text-slate-400">Step Net Flow:</span>
                <span className={`font-bold ${hoveredPoint.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {hoveredPoint.change >= 0 ? '+' : ''}
                  {formatPKR(hoveredPoint.change)}
                </span>
              </div>

              {/* Reason / Note */}
              {(hoveredPoint.reason || hoveredPoint.note) && (
                <div className="text-[10px] text-slate-300 italic pt-1 truncate">
                  "{hoveredPoint.reason || hoveredPoint.note}"
                </div>
              )}

              <div className="flex justify-between text-[10px] pt-1 text-slate-400">
                <span>Rank Tier:</span>
                <span className="text-amber-400 font-bold font-sans">
                  {hoveredPoint.rankName}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. CLEAR LEGEND AS REQUESTED */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 font-mono">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
            <strong className="text-emerald-400">Green = Savings Added</strong>
          </span>

          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
            <strong className="text-rose-400">Red = Penalty Deducted (−Rs. 200 🔴)</strong>
          </span>

          {showEMA && (
            <span className="flex items-center gap-1.5 hidden sm:inline-flex">
              <span className="w-3 h-0.5 bg-purple-400" />
              <span>Purple = EMA Trendline</span>
            </span>
          )}
        </div>

        <div className="text-slate-400 text-right text-[11px]">
          Target Discipline: <strong className="text-amber-400">Rs. 200 / Calendar Day</strong>
        </div>
      </div>
    </div>
  );
};
