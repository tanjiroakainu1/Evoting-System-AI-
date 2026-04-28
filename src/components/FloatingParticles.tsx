import type { CSSProperties } from 'react'

type Dot = {
  left: string
  top: string
  size: number
  delay: number
  duration: number
  color: 'red' | 'emerald'
}

const dots: Dot[] = [
  { left: '6%', top: '14%', size: 6, delay: 0.1, duration: 13, color: 'red' },
  { left: '15%', top: '30%', size: 8, delay: 0.8, duration: 16, color: 'emerald' },
  { left: '24%', top: '10%', size: 7, delay: 1.1, duration: 12, color: 'red' },
  { left: '35%', top: '22%', size: 5, delay: 0.4, duration: 14, color: 'emerald' },
  { left: '44%', top: '8%', size: 9, delay: 1.6, duration: 17, color: 'red' },
  { left: '56%', top: '19%', size: 7, delay: 0.9, duration: 15, color: 'emerald' },
  { left: '64%', top: '11%', size: 6, delay: 0.3, duration: 13, color: 'red' },
  { left: '72%', top: '26%', size: 8, delay: 1.2, duration: 18, color: 'emerald' },
  { left: '83%', top: '15%', size: 7, delay: 0.7, duration: 16, color: 'red' },
  { left: '92%', top: '32%', size: 5, delay: 1.4, duration: 14, color: 'emerald' },
  { left: '8%', top: '54%', size: 8, delay: 0.5, duration: 18, color: 'red' },
  { left: '18%', top: '68%', size: 6, delay: 1.0, duration: 13, color: 'emerald' },
  { left: '31%', top: '78%', size: 9, delay: 1.8, duration: 19, color: 'red' },
  { left: '47%', top: '63%', size: 7, delay: 0.2, duration: 15, color: 'emerald' },
  { left: '59%', top: '74%', size: 6, delay: 1.3, duration: 12, color: 'red' },
  { left: '71%', top: '58%', size: 8, delay: 0.6, duration: 17, color: 'emerald' },
  { left: '84%', top: '71%', size: 7, delay: 1.5, duration: 16, color: 'red' },
  { left: '94%', top: '84%', size: 6, delay: 0.4, duration: 13, color: 'emerald' },
  { left: '4%', top: '42%', size: 5, delay: 0.9, duration: 12, color: 'red' },
  { left: '11%', top: '86%', size: 7, delay: 1.9, duration: 20, color: 'emerald' },
  { left: '21%', top: '46%', size: 6, delay: 0.5, duration: 14, color: 'red' },
  { left: '27%', top: '60%', size: 5, delay: 1.7, duration: 11, color: 'emerald' },
  { left: '38%', top: '88%', size: 8, delay: 0.2, duration: 18, color: 'red' },
  { left: '42%', top: '36%', size: 6, delay: 1.1, duration: 15, color: 'emerald' },
  { left: '53%', top: '48%', size: 5, delay: 0.3, duration: 12, color: 'red' },
  { left: '61%', top: '88%', size: 7, delay: 1.6, duration: 17, color: 'emerald' },
  { left: '68%', top: '40%', size: 6, delay: 0.7, duration: 13, color: 'red' },
  { left: '76%', top: '86%', size: 8, delay: 1.4, duration: 19, color: 'emerald' },
  { left: '88%', top: '47%', size: 5, delay: 0.6, duration: 14, color: 'red' },
  { left: '97%', top: '56%', size: 7, delay: 1.2, duration: 16, color: 'emerald' },
]

export function FloatingParticles() {
  return (
    <div className="floating-particles-layer" aria-hidden>
      {dots.map((dot, idx) => {
        const style = {
          left: dot.left,
          top: dot.top,
          width: `${dot.size}px`,
          height: `${dot.size}px`,
          animationDelay: `${dot.delay}s`,
          animationDuration: `${dot.duration}s`,
        } satisfies CSSProperties
        return (
          <span
            key={`${dot.left}-${dot.top}-${idx}`}
            style={style}
            className={`particle-dot ${dot.color === 'red' ? 'particle-red' : 'particle-emerald'}`}
          />
        )
      })}
    </div>
  )
}
