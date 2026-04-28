import type { ReactNode } from 'react'

const barClass =
  'border-b border-red-700/35 bg-gradient-to-r from-[#7a2a3a] via-[#662332] to-[#7a2a3a] text-white shadow-md shadow-red-800/20'

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
        className={`mx-auto flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 ${containerClass}`}
      >
        {children}
      </div>
    </header>
  )
}
