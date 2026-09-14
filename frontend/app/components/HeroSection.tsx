'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  ChevronDown,
  Landmark,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useTranslation } from '@/i18n';

export default function HomeSection() {
  const { t, language, setLanguage } = useTranslation();

  const navItems = [t('landing.creditScore'), t('landing.loans'), t('landing.investments'), t('landing.insights')];

  const metrics = [
    { label: t('landing.requestedCredit'), value: 'Rp 18.4M', icon: Landmark, tone: 'blue' },
    { label: t('landing.riskAccuracy'), value: '98.7%', icon: ShieldCheck, tone: 'emerald' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      <div className="absolute top-[-12%] left-[-10%] h-[520px] w-[520px] rounded-full bg-blue-400/30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-16%] right-[-8%] h-[620px] w-[620px] rounded-full bg-emerald-400/20 blur-[120px] pointer-events-none" />
      <div className="absolute top-[18%] right-[18%] h-[360px] w-[360px] rounded-full bg-indigo-400/20 blur-[110px] pointer-events-none" />

      <nav className="sticky top-0 z-50 border-b border-white bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Image
              src="/images/fintilla.jpg"
              alt="Fintilla"
              width={40}
              height={40}
              className="rounded-xl object-cover shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
            />
            <span className="text-2xl font-bold tracking-tight text-slate-900">Fintilla</span>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <a
                key={item}
                href="#"
                className="flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
              >
                {item}
                <ChevronDown className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setLanguage(language === "en" ? "id" : "en")}
              className="hidden sm:flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:bg-slate-50 hover:text-slate-900"
            >
              <span className={language === "en" ? "text-slate-900" : "text-slate-400"}>EN</span>
              <span className="text-slate-300">|</span>
              <span className={language === "id" ? "text-slate-900" : "text-slate-400"}>ID</span>
            </button>
            <Link
              href="/employee/login"
              className="hidden rounded-full px-5 py-2 text-sm font-semibold text-slate-500 transition-all hover:text-slate-900 hover:bg-slate-100 sm:inline-flex"
            >
              {t('landing.portalLogin')}
            </Link>
            <Link
              href="/login"
              className="hidden rounded-full border border-white bg-white/70 px-5 py-2 text-sm font-semibold text-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:text-slate-900 sm:inline-flex"
            >
              {t('landing.signIn')}
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-blue-500/50"
            >
              {t('landing.signUp')}
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl grid-cols-1 items-center gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <div className="max-w-2xl space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-white bg-white/70 px-4 py-2 text-sm font-semibold text-slate-600 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
            <Sparkles className="h-4 w-4 text-blue-600" />
            {t('landing.premiumEngine')}
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl font-bold leading-[1.02] tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
              {t('landing.heroTitle')}
            </h1>
            <p className="max-w-lg text-lg font-medium leading-8 text-slate-500">
              {t('landing.heroDesc')}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-blue-500/50"
            >
              {t('landing.openDashboard')}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/loans/apply"
              className="inline-flex items-center justify-center rounded-full border border-white bg-white/70 px-6 py-3 text-sm font-semibold text-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl transition-all hover:text-slate-900"
            >
              {t('landing.startApplication')}
            </Link>
          </div>
        </div>

        <div className="relative hidden md:flex justify-center lg:justify-end">
          <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-blue-500/10 via-white/20 to-emerald-400/20 blur-3xl" />
          <div className="relative w-full max-w-xl p-8 bg-white/40 backdrop-blur-2xl border-2 border-white/80 rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08),inset_0_0_20px_rgba(255,255,255,0.5)]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{t('landing.portfolioCommand')}</p>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">{t('landing.executiveOverview')}</h2>
              </div>
              <div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-600">
                {t('landing.live')}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {metrics.map((metric) => {
                const Icon = metric.icon;
                const isRisk = metric.tone === 'emerald';
                return (
                  <div
                    key={metric.label}
                    className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 transition-transform hover:-translate-y-1"
                  >
                    <div className="mb-5 flex items-start justify-between">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full ${isRisk ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                          }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      {isRisk ? (
                        <div className="relative h-16 w-16">
                          <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
                            <defs>
                              <linearGradient id="riskRing" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#10B981" />
                                <stop offset="100%" stopColor="#14B8A6" />
                              </linearGradient>
                            </defs>
                            <circle
                              cx="32"
                              cy="32"
                              r="26"
                              fill="none"
                              stroke="#E2E8F0"
                              strokeWidth="7"
                            />
                            <circle
                              cx="32"
                              cy="32"
                              r="26"
                              fill="none"
                              stroke="url(#riskRing)"
                              strokeWidth="7"
                              strokeLinecap="round"
                              strokeDasharray="163.36"
                              strokeDashoffset="2.12"
                              filter="drop-shadow(0 6px 6px rgba(16,185,129,0.25))"
                            />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-slate-900">
                            99%
                          </span>
                        </div>
                      ) : (
                        <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600">
                          +12.8%
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-500">{metric.label}</p>
                    <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{metric.value}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 transition-transform hover:-translate-y-1">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{t('landing.requestVelocity')}</p>
                  <p className="text-xl font-bold tracking-tight text-slate-900">{t('landing.monthlyFunding')}</p>
                </div>
                <div className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600">
                  <TrendingUp className="h-3.5 w-3.5" />
                  +12.8%
                </div>
              </div>
              <div className="relative h-52 overflow-hidden rounded-3xl bg-gradient-to-b from-slate-50 to-white">
                <div className="absolute inset-x-6 top-8 h-px bg-slate-200/70" />
                <div className="absolute inset-x-6 top-20 h-px bg-slate-200/70" />
                <div className="absolute inset-x-6 top-32 h-px bg-slate-200/70" />
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 520 210" fill="none">
                  <defs>
                    <linearGradient id="fundingFill" x1="0" y1="50" x2="0" y2="190">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="fundingLine" x1="72" y1="150" x2="456" y2="58">
                      <stop offset="0%" stopColor="#2563EB" />
                      <stop offset="55%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#14B8A6" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M64 162 C118 132 144 145 188 112 C235 76 276 104 318 82 C364 58 402 76 456 46 L456 190 L64 190 Z"
                    fill="url(#fundingFill)"
                  />
                  <path
                    d="M64 162 C118 132 144 145 188 112 C235 76 276 104 318 82 C364 58 402 76 456 46"
                    stroke="url(#fundingLine)"
                    strokeWidth="7"
                    strokeLinecap="round"
                    filter="drop-shadow(0 8px 8px rgba(16,185,129,0.3))"
                  />
                  <circle cx="456" cy="46" r="8" fill="#10B981" stroke="white" strokeWidth="5" />
                </svg>
                <div className="absolute bottom-5 left-6 right-6 flex justify-between text-xs font-semibold text-slate-400">
                  <span>Jan</span>
                  <span>Mar</span>
                  <span>May</span>
                  <span>Jul</span>
                  <span>Sep</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 transition-transform hover:-translate-y-1">
              <div>
                <p className="text-sm font-medium text-slate-500">{t('landing.latestRequest')}</p>
                <p className="mt-1 text-lg font-bold tracking-tight text-slate-900">Rp 485,000 {t('landing.termLoan')}</p>
              </div>
              <div className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600">
                {t('landing.lowRisk')}
              </div>
            </div>

          </div>
        </div>

        <div className="md:hidden rounded-3xl border border-white bg-white/70 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
          <div className="grid grid-cols-2 gap-3">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="rounded-2xl bg-slate-50 p-4">
                  <Icon className="mb-3 h-5 w-5 text-blue-600" />
                  <p className="text-xs font-medium text-slate-500">{metric.label}</p>
                  <p className="mt-1 text-xl font-bold tracking-tight text-slate-900">{metric.value}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
