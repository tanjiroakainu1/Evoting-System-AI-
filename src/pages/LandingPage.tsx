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
  researchTeam,
  systemPurposeBullets,
  systemPurposeIntro,
} from '../content/landingCopy'

const ctaPrimary =
  'inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white px-5 py-3 text-sm font-semibold text-red-950 shadow-lg shadow-black/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-50 hover:shadow-xl active:translate-y-0'

const ctaGhost =
  'inline-flex items-center gap-2 rounded-xl border-2 border-white/85 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/12 hover:shadow-lg active:translate-y-0'

export function LandingPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-svh bg-stone-50 text-stone-800">
      {/* Institutional header */}
      <header className="relative border-b border-red-800/40 bg-gradient-to-r from-[#5b1f2c] via-[#4b1823] to-[#5b1f2c] text-white shadow-lg shadow-red-900/20">
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,transparent_50%)]"
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-6 px-4 py-6 sm:grid-cols-[auto_1fr_auto] sm:gap-6 sm:px-5">
          <div className="flex justify-center sm:justify-start">
            <div className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white shadow-xl shadow-black/25 ring-1 ring-black/5 sm:h-20 sm:w-20">
              <IspscSealGraphic className="h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]" />
            </div>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-xs font-medium text-red-900/95 sm:text-sm">
              {institution.lines[0]}
            </p>
            <p className="font-display text-lg font-semibold leading-tight tracking-tight text-white sm:text-xl md:text-2xl">
              {institution.lines[1]}
            </p>
            <p className="text-xs text-red-900/90 sm:text-sm">
              {institution.lines[2]}
            </p>
          </div>
          <div className="flex justify-center sm:justify-end">
            <div className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white shadow-xl shadow-black/25 ring-1 ring-black/5 sm:h-20 sm:w-20">
              <BagongPilipinasMark className="h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]" />
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#c02626] via-[#991b1b] to-[#3f0a0a] text-white">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_70%_0%,rgba(255,255,255,0.12),transparent_55%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_0%_100%,rgba(0,0,0,0.25),transparent_50%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-4 top-1/2 hidden -translate-y-1/2 text-white lg:block"
          aria-hidden
        >
          <ShieldWatermark className="h-[min(85vh,28rem)] w-auto opacity-[0.14]" />
        </div>
        {user ? (
          <div className="relative z-20 mx-auto flex max-w-6xl justify-end px-4 pt-5 sm:px-5">
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
                <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl md:leading-[1.1]">
                  {hero.title}
                </h1>
                <p className="mt-4 text-base font-medium leading-snug text-red-50 sm:text-lg">
                  {hero.subtitle}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-red-50/92 sm:text-base">
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
          <div className="mt-5 space-y-5 text-left text-sm leading-relaxed text-stone-400 sm:text-base">
            {backgroundOfStudy.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-14 max-w-3xl">
          <h3 className="font-display text-lg font-semibold tracking-tight text-red-900">
            System Purpose
          </h3>
          <p className="mt-5 text-sm leading-relaxed text-stone-400 sm:text-base">
            {systemPurposeIntro}
          </p>
          <ul className="mt-5 list-disc space-y-2.5 pl-5 text-sm text-stone-400 marker:text-red-500 sm:text-base">
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
            Development Team
          </h2>
          <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-14">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-red-700/90">
                Institution Information
              </h3>
              <dl className="mt-5 space-y-4">
                {institution.details.map((row) => (
                  <div
                    key={row.label}
                    className="border-b border-stone-200 pb-4 last:border-0"
                  >
                    <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">
                      {row.label}
                    </dt>
                    <dd className="mt-1.5 text-sm font-medium leading-snug text-stone-800 sm:text-base">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-red-700/90">
                Research Team Members
              </h3>
              <ul className="mt-5 space-y-4">
                {researchTeam.map((member) => (
                  <li
                    key={member.name}
                    className="rounded-2xl border border-stone-200 bg-white p-5 shadow-md shadow-stone-200/50 transition-all duration-200 hover:border-red-300 hover:shadow-lg"
                  >
                    <p className="font-display font-semibold text-red-900">
                      {member.name}
                    </p>
                    <p className="mt-1.5 text-sm text-stone-500">{member.role}</p>
                  </li>
                ))}
              </ul>
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
