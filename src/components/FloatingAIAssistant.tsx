import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react'
import { useAuth } from '../context/useAuth'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

const OPENROUTER_BASE_URL =
  import.meta.env.VITE_OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1'
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY ?? ''
const OPENROUTER_MODEL =
  import.meta.env.VITE_OPENROUTER_MODEL ?? 'openai/gpt-4o-mini'

export function FloatingAIAssistant({
  developerName,
}: {
  developerName: string
}) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const canUseAI = OPENROUTER_API_KEY.trim().length > 0

  const intro = useMemo(
    () =>
      user
        ? `Hello ${user.fullName}. I am your polite AI assistant. Ask me anything.`
        : 'Hello. I am your polite AI assistant. Ask me anything.',
    [user],
  )

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, loading, error, open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  async function askAI(e: FormEvent) {
    e.preventDefault()
    const prompt = query.trim()
    if (!prompt || loading) return
    setError(null)

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: prompt }]
    setMessages(nextMessages)
    setQuery('')
    setLoading(true)

    if (!canUseAI) {
      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content:
            'AI key is missing. Add VITE_OPENROUTER_API_KEY in your env to enable assistant responses.',
        },
      ])
      setLoading(false)
      return
    }

    try {
      const resp = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'E-Vote Assistant',
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          messages: [
            {
              role: 'system',
              content:
                'You are a polite, friendly assistant in an e-voting management system. Be concise, practical, and respectful. You may answer both system-related and general questions.',
            },
            ...nextMessages,
          ],
          temperature: 0.5,
        }),
      })
      if (!resp.ok) throw new Error(`AI request failed (${resp.status}).`)
      const data = (await resp.json()) as {
        choices?: Array<{ message?: { content?: string } }>
      }
      const content = data.choices?.[0]?.message?.content?.trim()
      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content: content || 'I could not generate a response. Please try again.',
        },
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI request failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[70] flex w-[min(calc(100vw-2rem),26rem)] max-w-[26rem] flex-col items-stretch pb-[max(0px,env(safe-area-inset-bottom))] sm:bottom-5 sm:right-5">
      {open ? (
        <section className="pointer-events-auto mb-3 flex h-[min(72svh,32rem)] w-full flex-col rounded-2xl border border-red-200 bg-white/95 shadow-2xl backdrop-blur-sm sm:h-[min(76svh,34rem)] sm:w-[24rem] sm:self-end">
          <header className="flex items-center justify-between rounded-t-2xl border-b border-red-200 bg-gradient-to-r from-[#5b1f2c] via-[#4b1823] to-[#5b1f2c] px-3 py-2 text-white">
            <div>
              <p className="text-sm font-semibold">AI Assistant</p>
              <p className="text-[11px] text-red-100">Developer: {developerName}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md border border-white/30 px-2 py-0.5 text-xs hover:bg-white/10"
            >
              Close
            </button>
          </header>

          <div
            ref={scrollRef}
            className="flex-1 space-y-2 overflow-y-auto p-3 text-sm"
          >
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-emerald-900">
              {intro}
            </p>
            {messages.map((m, idx) => (
              <div
                key={`${m.role}-${idx}`}
                className={
                  m.role === 'user'
                    ? 'ml-4 rounded-lg bg-red-50 px-2.5 py-2 text-red-900 sm:ml-8'
                    : 'mr-4 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-2 text-stone-800 sm:mr-8'
                }
              >
                {m.content}
              </div>
            ))}
            {error ? (
              <p className="rounded-lg border border-red-300 bg-red-50 px-2.5 py-2 text-xs text-red-900">
                {error}
              </p>
            ) : null}
          </div>

          <form onSubmit={askAI} className="border-t border-stone-200 p-3">
            <div className="flex items-end gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask anything..."
                className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/25"
              />
              <button
                type="submit"
                disabled={loading}
                className="h-[2.35rem] rounded-lg bg-red-700 px-3 text-xs font-semibold text-white hover:bg-red-800 disabled:opacity-60"
              >
                {loading ? 'Sending...' : 'Ask'}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="floating-gem pointer-events-auto relative ml-auto grid h-14 w-14 shrink-0 place-items-center rounded-full border border-red-300/70 bg-gradient-to-br from-red-500 via-red-700 to-emerald-500 shadow-xl"
        aria-label="Open AI assistant"
      >
        <span className="floating-gem-core" />
        <span className="relative text-lg text-white">AI</span>
      </button>
    </div>
  )
}
