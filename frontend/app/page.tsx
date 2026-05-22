'use client';

import Link from 'next/link';
import { useState } from 'react';
import { translations, type Locale } from '@/app/i18n/translations';

export default function Home() {
  const [locale, setLocale] = useState<Locale>('pt');
  const t = translations[locale];

  function toggleLocale() {
    setLocale((prev) => (prev === 'pt' ? 'en' : 'pt'));
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-zinc-50/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-xl bg-zinc-800">
              <span className="text-sm font-bold text-white">T</span>
            </div>
            <span className="text-base font-semibold tracking-tight text-zinc-900">
              TapFolio
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleLocale}
              aria-label="Trocar idioma"
              className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-700"
            >
              {locale === 'pt' ? 'EN' : 'PT'}
            </button>
            <Link
              href="/login"
              className="hidden text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 sm:block"
            >
              {t.nav.login}
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-zinc-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-700"
            >
              {t.nav.register}
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 pb-24 pt-20 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-medium text-zinc-500 shadow-sm">
            <span className="size-1.5 rounded-full bg-zinc-400" aria-hidden="true" />
            {t.hero.badge}
          </div>

          <h1 className="mb-6 text-5xl font-bold tracking-tight text-zinc-900 md:text-6xl lg:text-7xl">
            {t.hero.title}
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-zinc-500 md:text-xl">
            {t.hero.subtitle}
          </p>

          <Link
            href="/register"
            className="inline-flex rounded-full bg-zinc-800 px-8 py-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-zinc-700"
          >
            {t.hero.cta}
          </Link>
        </section>

        {/* Features */}
        <section className="border-y border-zinc-100 bg-white py-20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-zinc-900">
              {t.features.title}
            </h2>

            <div className="grid gap-6 md:grid-cols-3">
              {t.features.items.map((feature, index) => (
                <article
                  key={index}
                  className="rounded-2xl border border-zinc-100 bg-zinc-50 p-8"
                >
                  <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-zinc-200 text-zinc-600">
                    <FeatureIcon index={index} />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-zinc-900">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-500">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <h2 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900">
              {t.cta.title}
            </h2>
            <p className="mb-8 text-lg text-zinc-500">{t.cta.subtitle}</p>
            <Link
              href="/register"
              className="inline-flex rounded-full bg-zinc-800 px-8 py-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-zinc-700"
            >
              {t.cta.button}
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-100 py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-zinc-400">
          © {new Date().getFullYear()} TapFolio — {t.footer.rights}
        </div>
      </footer>
    </div>
  );
}

function FeatureIcon({ index }: { index: number }) {
  if (index === 0) {
    return (
      <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
      </svg>
    );
  }

  if (index === 1) {
    return (
      <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
      </svg>
    );
  }

  return (
    <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  );
}
