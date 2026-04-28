import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import type { AppRole } from '../types/roles'
import { roleBasePath } from '../lib/rolePaths'
import {
  BagongPilipinasMark,
  InfoCircleIcon,
  IspscSealGraphic,
  LoginDoorIcon,
  ShieldCheckIcon,
  ShieldWatermark,
  UserPlusIcon,
} from '../components/landing/LandingIcons'
import {
  backgroundOfStudy,
  hero,
  institution,
  keyFeatures,
  systemPurposeBullets,
  systemPurposeIntro,
} from '../content/landingCopy'

const ctaPrimary =
  'inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white px-5 py-3 text-sm font-semibold tracking-wide text-red-950 shadow-lg shadow-black/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-50 hover:shadow-xl active:translate-y-0'

const ctaGhost =
  'inline-flex items-center gap-2 rounded-xl border-2 border-white/85 bg-white/10 px-5 py-3 text-sm font-semibold tracking-wide text-white backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/18 hover:shadow-lg active:translate-y-0'

export function LandingPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-svh bg-stone-50 text-stone-800">
      {/* Institutional header */}
      <header className="relative border-b border-red-700/30 bg-gradient-to-r from-[#7a2a3a] via-[#662332] to-[#7a2a3a] pt-[max(2px,env(safe-area-inset-top))] text-white shadow-sm shadow-red-900/15">
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,transparent_45%)]"
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-2 px-3 py-2 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:gap-x-4 sm:gap-y-0 sm:px-5 sm:py-2.5">
          <div className="order-1 flex justify-center sm:order-none sm:justify-start">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white shadow-md shadow-black/20 ring-1 ring-black/5 sm:h-14 sm:w-14 sm:rounded-xl">
              <IspscSealGraphic className="h-9 w-9 sm:h-12 sm:w-12" />
            </div>
          </div>
          <div className="order-3 min-w-0 py-0.5 text-center sm:order-none sm:py-0 sm:text-left">
            <p className="font-display text-[0.65rem] font-medium leading-tight tracking-wide text-red-100/95 sm:text-xs">
              {institution.lines[0]}
            </p>
            <p className="font-display mt-0.5 text-pretty text-sm font-semibold leading-tight tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] sm:mt-0.5 sm:text-base md:text-lg">
              {institution.lines[1]}
            </p>
            <p className="font-display mt-0.5 text-[0.65rem] font-medium leading-tight tracking-wide text-red-100/90 sm:text-xs">
              {institution.lines[2]}
            </p>
          </div>
          <div className="order-2 flex justify-center sm:order-none sm:justify-end">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white shadow-md shadow-black/20 ring-1 ring-black/5 sm:h-14 sm:w-14 sm:rounded-xl">
              <BagongPilipinasMark className="h-9 w-9 sm:h-12 sm:w-12" />
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#c02626] via-[#991b1b] to-[#3f0a0a] text-white">
        <div
          className="pointer-events-none absolute -right-4 top-1/2 hidden -translate-y-1/2 text-white lg:block"
          aria-hidden
        >
          <ShieldWatermark className="h-[min(85vh,28rem)] w-auto opacity-[0.14]" />
        </div>
        {user ? (
          <div className="relative z-20 mx-auto flex max-w-6xl justify-end px-4 pt-4 sm:px-5 sm:pt-5">
            <Link
              to={roleBasePath(user.role as AppRole)}
              className="rounded-xl border border-white/35 bg-white/95 px-4 py-2.5 text-sm font-semibold text-red-900 shadow-lg shadow-black/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
            >
              Go to dashboard
            </Link>
          </div>
        ) : null}
        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-5 sm:pb-20 sm:pt-12 lg:pb-24 lg:pt-14">
          <div className="max-w-2xl">
            <div className="flex items-start gap-3 sm:gap-5">
              <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-lg backdrop-blur-sm sm:h-14 sm:w-14">
                <ShieldCheckIcon className="h-7 w-7 text-white sm:h-8 sm:w-8" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold tracking-tight text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)] sm:text-4xl md:text-5xl md:leading-[1.1]">
                  {hero.title}
                </h1>
                <p className="font-display mt-4 text-base font-medium leading-snug tracking-wide text-red-50 sm:text-lg">
                  {hero.subtitle}
                </p>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-red-50/95 sm:text-base">
                  {hero.description}
                </p>
              </div>
            </div>
            <div className="mt-10 flex flex-wrap gap-3 sm:mt-12">
              {user ? (
                <Link
                  to={roleBasePath(user.role as AppRole)}
                  className={ctaPrimary}
                >
                  <LoginDoorIcon className="h-5 w-5" />
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className={ctaPrimary}>
                    <LoginDoorIcon className="h-5 w-5" />
                    Login
                  </Link>
                  <Link to="/register" className={ctaGhost}>
                    <UserPlusIcon className="h-5 w-5" />
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="border-t border-stone-200 bg-stone-50 px-4 py-16 sm:px-5 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display inline-flex items-center justify-center gap-2.5 text-xl font-semibold tracking-tight text-red-800 sm:text-2xl">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-800/40 bg-red-50 text-red-700 shadow-inner">
              <InfoCircleIcon className="h-5 w-5" />
            </span>
            About the System
          </h2>
        </div>

        <div className="mx-auto mt-14 max-w-3xl">
          <h3 className="font-display text-lg font-semibold tracking-tight text-red-900">
            Background of the Study
          </h3>
          <div className="mt-5 space-y-5 text-left text-sm leading-relaxed text-stone-600 sm:text-base">
            {backgroundOfStudy.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-14 max-w-3xl">
          <h3 className="font-display text-lg font-semibold tracking-tight text-red-900">
            System Purpose
          </h3>
          <p className="mt-5 text-sm leading-relaxed text-stone-600 sm:text-base">
            {systemPurposeIntro}
          </p>
          <ul className="mt-5 list-disc space-y-2.5 pl-5 text-sm text-stone-600 marker:text-red-500 sm:text-base">
            {systemPurposeBullets.map((item) => (
              <li key={item} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          <h3 className="font-display text-center text-lg font-semibold tracking-tight text-red-900">
            Key Features
          </h3>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {keyFeatures.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-stone-200 bg-white p-6 shadow-lg shadow-stone-200/50 ring-1 ring-stone-200/80 transition-all duration-300 hover:-translate-y-1 hover:border-red-300 hover:shadow-xl hover:shadow-stone-300/30"
              >
                <div className="h-1 w-14 rounded-full bg-gradient-to-r from-red-400 via-red-600 to-neutral-900 transition-all duration-300 group-hover:w-20 group-hover:from-red-300" />
                <h4 className="font-display mt-4 text-base font-semibold text-red-900">
                  {f.title}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-stone-500">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Development team */}
      <section className="border-t border-stone-200 bg-stone-100 px-4 py-16 sm:px-5 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-center text-xl font-semibold tracking-tight text-red-800 sm:text-2xl">
            Developer
          </h2>
          <div className="mx-auto mt-8 max-w-xl">
            <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-md shadow-stone-200/50">
              <p className="font-display text-2xl font-semibold text-red-900">
                Raminder Jangao
              </p>
              <p className="mt-2 text-sm text-stone-500">
                System Developer
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-stone-200 bg-stone-100 px-4 py-8 text-center">
        <p className="text-xs leading-relaxed text-red-800/65">
          E‑Vote System · Ilocos Sur Polytechnic State College · Tagudin Campus
        </p>
      </footer>
    </div>
  )
}
