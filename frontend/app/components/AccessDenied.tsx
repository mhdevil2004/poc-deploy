'use client';

import Link from 'next/link';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';
import { useTranslation } from '@/i18n';

export function AccessDenied() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-6">
      {/* Ambient orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-rose-400/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-slate-400/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md text-center">
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-3xl p-10">
          {/* Icon */}
          <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldX className="w-8 h-8 text-rose-500" strokeWidth={1.5} />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
            {t('access.denied')}
          </h1>

          {/* Message */}
          <p className="text-sm text-slate-500 font-medium mb-2">
            {t('access.deniedMessage')}
          </p>

          {/* Hint */}
          <p className="text-xs text-slate-400 mb-8">
            {t('access.deniedHint')}
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
              {t('access.goBack')}
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all shadow-lg shadow-blue-500/30"
            >
              <Home className="w-4 h-4" strokeWidth={2} />
              {t('access.dashboard')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
