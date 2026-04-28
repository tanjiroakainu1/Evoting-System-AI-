import type { ReactNode } from 'react'

const barClass =
  'border-b border-red-700/30 bg-gradient-to-r from-[#7a2a3a] via-[#662332] to-[#7a2a3a] pt-[max(2px,env(safe-area-inset-top))] text-white shadow-sm shadow-red-900/15'

type Props = {
  children: ReactNode /** e.g. max-w-lg, max-w-4xl */
  containerClass?: string
}

export function InstitutionalTopBar({
  children,
  containerClass = 'max-w-6xl',
}: Props) {
  return (
    <header className={barClass}>
      <div
        className={`mx-auto flex w-full min-w-0 flex-wrap items-center justify-between gap-2 px-3 py-1.5 sm:gap-3 sm:px-6 sm:py-2 ${containerClass}`}
      >
        {children}
      </div>
    </header>
  )
}
