'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from '@/i18n';
import { useAuth } from '@/hooks/useAuth';
import { roleToKey } from '@/lib/permissions';
import type { TranslationKey } from '@/i18n';
import {
  Home,
  ArrowLeftRight,
  Briefcase,
  MessageCircle,
  Settings,
  FileText,
  Search,
  Calendar,
  Bell,
  ChevronDown,
  MoreVertical,
  CreditCard,
  Clock,
  CheckCircle,
  ArrowUpRight,
  Eye,
  Download,
  Filter,
  Trash2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const sideNavItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/loans', icon: ArrowLeftRight, label: 'Loans' },
  { href: '/investments', icon: Briefcase, label: 'Investments' },
  { href: '/cards', icon: MessageCircle, label: 'Cards', hasNotification: true },
  { href: '/settings', icon: Settings, label: 'Settings' },
  { href: '/balance', icon: FileText, label: 'Balance' },
];

type ApiLoan = {
  id: string | number;
  applicant_name: string;
  amount: number;
  status: string;
  created_at: string;
};

// Get initials from name
const getInitials = (name: string) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Get status styles
const getStatusStyles = (status: string) => {
  const statusMap: Record<string, { bg: string; border: string; text: string; dot: string }> = {
    Approved: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      dot: 'bg-green-400',
    },
    Rejected: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      dot: 'bg-red-400',
    },
    Pending: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-700',
      dot: 'bg-amber-400',
    },
    'In Progress': {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      dot: 'bg-blue-400',
    },
    Completed: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
      dot: 'bg-emerald-400',
    },
    Default: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-700',
      dot: 'bg-gray-400',
    },
  };

  return statusMap[status] || statusMap.Default;
};

// Deterministic sparkline data - same on server and client
const SPARKLINE_DATA_1 = [45, 52, 38, 65, 42, 58, 70, 48, 55, 62, 40, 75, 50, 68, 35, 72, 60, 44, 56, 80];
const SPARKLINE_DATA_2 = [30, 45, 35, 28, 50, 42, 55, 38, 48, 32, 58, 40, 62, 35, 52, 28, 65, 45, 38, 55];
const SPARKLINE_DATA_3 = [55, 68, 72, 60, 78, 85, 65, 90, 75, 82, 70, 95, 80, 88, 60, 92, 70, 85, 65, 100];

export default function PaymentsDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loans, setLoans] = useState<ApiLoan[]>([]);

  const loadLoans = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/loans`);
      if (!response.ok) throw new Error('Unable to load loans');
      const payload = await response.json();
      const rows = Array.isArray(payload?.data) ? payload.data : [];
      const uniqueRows = Array.from(
        new Map<string, ApiLoan>(rows.map((loan: ApiLoan) => [String(loan.id), loan])).values()
      );
      setLoans(uniqueRows);
    } catch {
      setLoans([]);
    }
  }, []);

  useEffect(() => {
    loadLoans();
  }, [loadLoans]);

  const chartData = useMemo(() => {
    const buckets = [
      { month: 'Jan', expense: 0 },
      { month: 'Feb', expense: 0 },
      { month: 'Mar', expense: 0 },
      { month: 'Apr', expense: 0 },
      { month: 'May', expense: 0 },
      { month: 'Jun', expense: 0 },
      { month: 'Jul', expense: 0 },
      { month: 'Aug', expense: 0 },
      { month: 'Sep', expense: 0 },
      { month: 'Oct', expense: 0 },
      { month: 'Nov', expense: 0 },
      { month: 'Dec', expense: 0 },
    ];
    loans.forEach((loan) => {
      const month = new Date(loan.created_at).getMonth();
      if (!Number.isNaN(month)) buckets[month].expense += Number(loan.amount) || 0;
    });
    return buckets;
  }, [loans]);

  const maxExpense = Math.max(...chartData.map((d) => d.expense), 1);
  const approvedBalance = loans
    .filter((loan) => loan.status === 'approved' || loan.status === 'active')
    .reduce((sum, loan) => sum + Number(loan.amount || 0), 0);
  const totalRequested = loans.reduce((sum, loan) => sum + Number(loan.amount || 0), 0);
  const pendingBalance = loans
    .filter((loan) => loan.status === 'pending')
    .reduce((sum, loan) => sum + Number(loan.amount || 0), 0);
  const approvedRatio = totalRequested ? approvedBalance / totalRequested : 0;
  const pendingRatio = totalRequested ? pendingBalance / totalRequested : 0;
  const creditScore = Math.round(Math.min(99, Math.max(35, 58 + approvedRatio * 34 - pendingRatio * 12 + Math.min(loans.length, 12))));
  const creditLevelRaw = creditScore >= 80 ? 'high' : creditScore >= 62 ? 'medium' : 'low';
  const creditLevel = t(`dashboard.${creditLevelRaw}` as TranslationKey);
  const creditStyles = {
    high: {
      text: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      bar: 'from-emerald-500 to-teal-500',
      note: t('dashboard.strongRepayment'),
    },
    medium: {
      text: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      bar: 'from-amber-500 to-orange-500',
      note: t('dashboard.balancedPortfolio'),
    },
    low: {
      text: 'text-rose-700',
      bg: 'bg-rose-50',
      border: 'border-rose-100',
      bar: 'from-rose-500 to-red-500',
      note: t('dashboard.needsAttention'),
    },
  }[creditLevelRaw];

  const historyData = loans.slice(0, 8).map((loan, index) => ({
    id: loan.id,
    name: loan.applicant_name,
    email: '',
    time: new Date(loan.created_at).toLocaleTimeString(),
    amount: Number(loan.amount),
    formattedAmount: `Rp ${Number(loan.amount).toLocaleString("id-ID")}`,
    status: loan.status,
    active: index === 1,
    reference: `LN-${loan.id}`,
    type: 'Loan',
    date: new Date(loan.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
  }));

  // Custom Tooltip for Area Chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white text-xs font-medium px-3 py-2 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
            <p className="font-mono">Rp {(payload[0].value / 1000).toFixed(1)}K</p>
          </div>
          <p className="text-[10px] text-white/40 mt-0.5">{label}</p>
        </div>
      );
    }
    return null;
  };

  // Mini sparkline component for stat cards
  const Sparkline = ({ data, color = '#E5E7EB' }: { data: number[]; color?: string }) => {
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    const points = data.map((v, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((v - min) / range) * 80 - 10;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg className="absolute bottom-0 left-0 w-full h-[40%] opacity-30" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polygon
          points={`0,100 ${points} 100,100`}
          fill={`url(#sparklineGrad-${color.replace('#', '')})`}
          opacity="0.3"
        />
        <defs>
          <linearGradient id={`sparklineGrad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.5" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  return (
    <div className="h-screen w-full max-w-[100vw] bg-slate-50 font-sans overflow-hidden">
      {/* ============ BACKGROUND NOISE & ORBS ============ */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.04] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px',
        }}
      />

      {/* Ambient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/30 rounded-full blur-[120px] pointer-events-none animate-orb-1" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-400/20 rounded-full blur-[120px] pointer-events-none animate-orb-2" />

      {/* ============ MAIN 3-COLUMN LAYOUT ============ */}
      <div className="flex h-full w-full max-w-[100vw] overflow-hidden relative">
        {/* ============ LEFT NAVIGATION - Floating ============ */}
        <aside className="w-[80px] flex flex-col items-center py-6 flex-shrink-0">
          {/* macOS Traffic Lights */}
          <div className="flex items-center gap-1.5 mb-10">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
          </div>

          {/* Navigation Icons */}
          <nav className="flex flex-col items-center gap-6 flex-1">
            {sideNavItems.map((item) => {
              const Icon = item.icon;
              const active = item.href === '/dashboard';

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  aria-label={item.label}
                  className={`relative flex items-center transition-all duration-300 ease-out ${active ? '' : 'hover:translate-x-0.5'
                    }`}
                >
                  <div className={`p-2.5 rounded-xl transition-all duration-300 ease-out ${active
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/70'
                    }`}>
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  {item.hasNotification && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#EF4444] rounded-full border-2 border-white" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom - Logo */}
          <div className="mt-auto">
            <div className="w-10 h-10 relative rounded-full overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
              <Image
                src="/images/fintilla.jpg"
                alt="Fintilla"
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
          </div>
        </aside>

        {/* ============ MAIN CONTENT ============ */}
        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-8 no-scrollbar">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('dashboard.title')}</h1>
              <p className="text-sm text-slate-500 font-medium">{t('dashboard.paymentsUpdates')}</p>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <input
                  type="text"
                  placeholder={t('common.search')}
                  className="pl-11 pr-4 py-2.5 bg-white/70 backdrop-blur-xl border border-white rounded-full text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-56 placeholder:text-slate-500 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300"
                />
              </div>

              {/* Icons */}
              <div className="flex items-center gap-3">
                <button className="w-9 h-9 bg-white/70 backdrop-blur-xl border border-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-all duration-300">
                  <Calendar className="w-4 h-4 text-[#6B7280]" strokeWidth={1.5} />
                </button>
                <button className="relative w-9 h-9 bg-white/70 backdrop-blur-xl border border-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-all duration-300">
                  <Bell className="w-4 h-4 text-[#6B7280]" strokeWidth={1.5} />
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#EF4444] rounded-full border-2 border-white" />
                </button>
                <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="w-9 h-9 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-lg shadow-blue-500/30">
                    {(user?.name || 'JD').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF]" strokeWidth={2} />
                </div>
              </div>
            </div>
          </div>

          {/* ============ BENTO GRID METRICS - 3 Equal Cards ============ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Card 1 - Total Balance */}
            <div className="bg-white/70 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] relative overflow-hidden">
              <Sparkline data={SPARKLINE_DATA_1} color="#090A0B" />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="w-10 h-10 bg-[#F1F5F9] rounded-full flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-[#334155]" strokeWidth={1.5} />
                  </div>
                  <MoreVertical className="w-4 h-4 text-[#9CA3AF] hover:text-[#6B7280] transition-colors cursor-pointer" strokeWidth={1.5} />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t('dashboard.totalBalance')}</p>
                <p className="text-4xl font-bold text-slate-900 mt-1 tracking-tight tabular-nums">
                  Rp {totalRequested.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            {/* Card 2 - Pending */}
            <div className="bg-white/70 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] relative overflow-hidden">
              <Sparkline data={SPARKLINE_DATA_2} color="#F59E0B" />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="w-10 h-10 bg-[#F1F5F9] rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-[#334155]" strokeWidth={1.5} />
                  </div>
                  <MoreVertical className="w-4 h-4 text-[#9CA3AF] hover:text-[#6B7280] transition-colors cursor-pointer" strokeWidth={1.5} />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t('dashboard.pending')}</p>
                <p className="text-4xl font-bold text-slate-900 mt-1 tracking-tight tabular-nums">
                  Rp {pendingBalance.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            {/* Card 3 - Approved */}
            <div className="bg-white/70 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] relative overflow-hidden">
              <Sparkline data={SPARKLINE_DATA_3} color="#059669" />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="w-10 h-10 bg-[#F1F5F9] rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-[#334155]" strokeWidth={1.5} />
                  </div>
                  <MoreVertical className="w-4 h-4 text-[#9CA3AF] hover:text-[#6B7280] transition-colors cursor-pointer" strokeWidth={1.5} />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t('dashboard.approved')}</p>
                <p className="text-4xl font-bold text-slate-900 mt-1 tracking-tight tabular-nums">
                  Rp {approvedBalance.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </div>

          {/* ============ CINEMATIC AREA CHART ============ */}
          <div className="bg-white/70 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 lg:p-8 mb-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t('dashboard.balanceOverview')}</p>
                <p className="text-3xl font-bold text-slate-900 tracking-tight tabular-nums">
                  Rp {approvedBalance.toLocaleString("id-ID")}
                </p>
              </div>
              <button className="text-xs font-medium text-[#9CA3AF] bg-[#F8FAFC] px-4 py-1.5 rounded-full hover:bg-[#F1F5F9] transition-colors flex items-center gap-1">
                {t('dashboard.past30Days')}
                <ChevronDown className="w-3 h-3" strokeWidth={2} />
              </button>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  onMouseMove={(state) => {
                    // Crosshair effect handled by recharts
                  }}
                >
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#090A0B" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#090A0B" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#9CA3AF' }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#9CA3AF' }}
                    dx={-8}
                    tickFormatter={(value) => {
                      if (value === 0) return '0';
                      return `${value / 1000}K`;
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#090A0B', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    stroke="#090A0B"
                    strokeWidth={2}
                    fill="url(#areaGradient)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#090A0B', stroke: 'white', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Credit core system */}
          <section className="mb-8">
            <div className="bg-white/70 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 lg:p-8 overflow-hidden relative">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-emerald-500 to-amber-400" />
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t('dashboard.creditCoreSystem')}</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">{t('dashboard.portfolioHealth')}</h2>
                  <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-slate-500">
                    {creditStyles.note}
                  </p>
                </div>
                <div className={`min-w-[180px] rounded-2xl border ${creditStyles.border} ${creditStyles.bg} px-5 py-4 text-center`}>
                  <p className={`text-4xl font-bold tracking-tight ${creditStyles.text}`}>{creditLevel}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-500">Level</p>
                </div>
              </div>

              <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-3">
                {[
                  { label: t('dashboard.coreScore'), value: `${creditScore}/100` },
                  { label: t('dashboard.approvedRatio'), value: `${Math.round(approvedRatio * 100)}%` },
                  { label: t('dashboard.pendingExposure'), value: `Rp ${pendingBalance.toLocaleString("id-ID")}` },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl bg-slate-50/70 border border-white px-4 py-3">
                    <p className="text-xs font-semibold text-slate-500">{item.label}</p>
                    <p className="mt-1 text-lg font-bold text-slate-900 tabular-nums">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${creditStyles.bar}`}
                  style={{ width: `${creditScore}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>{t('dashboard.low')}</span>
                <span>{t('dashboard.medium')}</span>
                <span>{t('dashboard.high')}</span>
              </div>
            </div>
          </section>

          {/* History - Premium Table */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">{t('dashboard.transactionHistory')}</h2>
                <p className="text-sm text-slate-500 font-medium">{t('dashboard.completeTxHistory')}</p>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/loans" className="text-sm text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1.5 px-4 py-2 bg-white/70 backdrop-blur-xl border border-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  <Filter className="w-3.5 h-3.5" />
                  {t('dashboard.filter')}
                </Link>
                <button className="text-sm text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1.5 px-4 py-2 bg-white/70 backdrop-blur-xl border border-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  <Download className="w-3.5 h-3.5" />
                  {t('dashboard.export')}
                </button>
              </div>
            </div>

            {/* Premium Table Container */}
            <div className="bg-white/70 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-white text-xs font-semibold text-slate-500 uppercase tracking-widest">
                      <th className="py-4 px-4 lg:px-6 whitespace-nowrap">{t('dashboard.id')}</th>
                      <th className="py-4 px-4 lg:px-6 whitespace-nowrap">{t('dashboard.applicant')}</th>
                      <th className="py-4 px-4 lg:px-6 whitespace-nowrap">{t('dashboard.amount')}</th>
                      <th className="py-4 px-4 lg:px-6 whitespace-nowrap">{t('dashboard.status')}</th>
                      <th className="py-4 px-4 lg:px-6 whitespace-nowrap">{t('dashboard.date')}</th>
                      <th className="py-4 px-4 lg:px-6 text-right whitespace-nowrap">{t('dashboard.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-100/50">
                    {historyData.map((item) => {
                      const statusStyles = getStatusStyles(item.status);
                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-gray-50/50 transition-colors duration-150 cursor-pointer group focus:bg-gray-50/50 focus:outline-none"
                        >
                          <td className="py-4 px-4 lg:px-6 text-gray-400 font-medium whitespace-nowrap">
                            {String(item.id).slice(0, 8)}
                          </td>
                          <td className="py-4 px-4 lg:px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-700 flex-shrink-0">
                                {getInitials(item.name)}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-900 truncate max-w-[150px] lg:max-w-[200px]">
                                  {item.name}
                                </div>
                                <div className="text-xs text-gray-500 truncate max-w-[150px] lg:max-w-[200px]">
                                  {item.reference}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 lg:px-6 font-bold text-slate-900 tabular-nums tracking-tight whitespace-nowrap">
                            {item.formattedAmount}
                          </td>
                          <td className="py-4 px-4 lg:px-6 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${statusStyles.bg} ${statusStyles.border} ${statusStyles.text}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${statusStyles.dot}`} />
                              {item.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 lg:px-6 text-gray-500 font-medium whitespace-nowrap">
                            {item.date}
                          </td>
                          <td
                            className="py-4 px-4 lg:px-6"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <div className="flex items-center justify-end gap-1">
                              <Link
                                href={`/loans/${item.id}`}
                                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200 hover:scale-105"
                                title={t('dashboard.viewLoan')}
                              >
                                <Eye className="h-4 w-4" strokeWidth={1.5} />
                              </Link>
                              <Link
                                href={`/loans/${item.id}/edit`}
                                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200 hover:scale-105"
                                title="Edit loan"
                              >
                                <ArrowLeftRight className="h-4 w-4" strokeWidth={1.5} />
                              </Link>
                              <button
                                type="button"
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-105"
                                title="Delete loan"
                              >
                                <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {historyData.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-lg font-medium text-slate-600">{t('dashboard.noTransactions')}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {t('dashboard.tryAdjusting')}
                  </p>
                </div>
              )}

              {/* View All Link */}
              <div className="px-4 lg:px-6 py-4 border-t border-gray-100/50 text-center">
                <Link href="/transactions" className="text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium">
                  {t('dashboard.viewAllTransactions')}
                </Link>
              </div>
            </div>
          </div>
        </main>

        {/* ============ RIGHT SIDEBAR ============ */}
        <aside className="w-[320px] max-w-[320px] p-6 flex flex-col overflow-y-auto overflow-x-hidden flex-shrink-0 no-scrollbar">
          <div className="rounded-3xl border border-white bg-white/70 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t('dashboard.coreMonitor')}</p>
                <h3 className="mt-1 text-lg font-bold tracking-tight text-slate-900">{t('dashboard.creditDistribution')}</h3>
              </div>
              <div className={`rounded-xl ${creditStyles.bg} ${creditStyles.text} px-3 py-2 text-sm font-bold`}>
                {creditScore}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {[
                { label: t('dashboard.approved'), value: approvedBalance, color: 'bg-emerald-500' },
                { label: t('dashboard.pending'), value: pendingBalance, color: 'bg-amber-500' },
                { label: t('dashboard.total'), value: totalRequested, color: 'bg-blue-500' },
              ].map((item) => {
                const width = totalRequested ? Math.max(6, Math.round((item.value / totalRequested) * 100)) : 0;
                return (
                  <div key={item.label}>
                    <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-500">{item.label}</span>
                      <span className="text-slate-900">Rp {item.value.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <Link
              href="/loans/apply"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-blue-500/50"
            >
              {t('dashboard.startApplication')}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </aside>
      </div>

      {/* ============ CUSTOM SCROLLBAR & ANIMATIONS ============ */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: transparent;
          border-radius: 999px;
          transition: background 0.2s;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: transparent;
        }
        .custom-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @keyframes orb-1 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(40px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-30px, 40px) scale(0.9);
          }
        }

        @keyframes orb-2 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(-40px, 30px) scale(1.15);
          }
          66% {
            transform: translate(30px, -40px) scale(0.85);
          }
        }

        .animate-orb-1 {
          animation: orb-1 25s ease-in-out infinite;
        }

        .animate-orb-2 {
          animation: orb-2 30s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
