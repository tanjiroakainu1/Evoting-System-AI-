/** Small shield + check for hero title row */
export function ShieldCheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 2 20 6v8c0 6-3.5 10.5-8 12-4.5-1.5-8-6-8-12V6l8-4Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="m9 14 2.5 2.5L16 11"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Large watermark shield for hero right */
export function ShieldWatermark({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 2 20 6v8c0 6-3.5 10.5-8 12-4.5-1.5-8-6-8-12V6l8-4Z"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinejoin="round"
        opacity="0.35"
      />
      <path
        d="m9 14 2.5 2.5L16 11"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.35"
      />
    </svg>
  )
}

export function LoginDoorIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"
      />
    </svg>
  )
}

export function UserPlusIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
      />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        d="M19 8v6M22 11h-6"
      />
    </svg>
  )
}

export function InfoCircleIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        d="M12 16v-4M12 8h.01"
      />
    </svg>
  )
}

/** Stylized institutional seal placeholder (ISPSC) */
export function IspscSealGraphic({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 80" aria-hidden>
      <circle cx="40" cy="40" r="36" fill="#7f1d1d" opacity="0.12" />
      <circle
        cx="40"
        cy="40"
        r="32"
        fill="none"
        stroke="#7f1d1d"
        strokeWidth="2"
      />
      <circle
        cx="40"
        cy="40"
        r="24"
        fill="none"
        stroke="#b45309"
        strokeWidth="1.5"
        opacity="0.6"
      />
      <text
        x="40"
        y="40"
        textAnchor="middle"
        fill="#450a0a"
        style={{ fontSize: '11px', fontWeight: 700 }}
      >
        ISPSC
      </text>
      <text
        x="40"
        y="54"
        textAnchor="middle"
        fill="#57534e"
        style={{ fontSize: '6px', fontWeight: 600 }}
      >
        TAGUDIN
      </text>
    </svg>
  )
}

/** Simplified Bagong Pilipinas–style round mark */
export function BagongPilipinasMark({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 80" aria-hidden>
      <circle cx="40" cy="40" r="36" fill="#1e3a8a" opacity="0.12" />
      <circle
        cx="40"
        cy="40"
        r="34"
        fill="none"
        stroke="#1e40af"
        strokeWidth="2"
      />
      <circle cx="40" cy="40" r="14" fill="#fbbf24" opacity="0.95" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const r = 26
        const x = 40 + r * Math.cos((deg * Math.PI) / 180)
        const y = 40 + r * Math.sin((deg * Math.PI) / 180)
        return <circle key={deg} cx={x} cy={y} r="3" fill="#1e40af" />
      })}
      <path
        d="M12 52 Q40 62 68 52"
        fill="none"
        stroke="#b91c1c"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <text
        x="40"
        y="74"
        textAnchor="middle"
        fill="#1e3a8a"
        style={{ fontSize: '6px', fontWeight: 700 }}
      >
        BAGONG PILIPINAS
      </text>
    </svg>
  )
}
