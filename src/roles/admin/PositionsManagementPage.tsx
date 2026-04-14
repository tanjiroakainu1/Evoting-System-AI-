import { useEffect, useState, type FormEvent } from 'react'
import {
  addPosition,
  deletePosition,
  getPositions,
  updatePosition,
} from '../../lib/electionsStorage'

const fieldClass =
  'mt-1 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-stone-900 shadow-inner shadow-stone-300/40 transition-colors focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/35'

const btn =
  'rounded-lg border border-red-800/50 bg-red-50 px-3 py-2 text-sm font-medium text-red-900 hover:bg-red-900/50'

const btnDanger =
  'rounded-lg border border-red-300 bg-red-100 px-3 py-2 text-sm font-medium text-red-900 hover:bg-red-200'

export function PositionsManagementPage() {
  const [positions, setPositions] = useState(getPositions)
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')

  function refresh() {
    setPositions(getPositions())
  }

  useEffect(() => {
    function onEvt() {
      refresh()
    }
    window.addEventListener('bevms-elections', onEvt)
    return () => window.removeEventListener('bevms-elections', onEvt)
  }, [])

  function onAdd(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    try {
      addPosition(title)
      setTitle('')
      refresh()
      setSuccess('Position added.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add position.')
    }
  }

  function startEdit(id: string, current: string) {
    setEditingId(id)
    setEditingTitle(current)
    setError(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditingTitle('')
  }

  function saveEdit() {
    if (!editingId) return
    setError(null)
    try {
      updatePosition(editingId, editingTitle)
      cancelEdit()
      refresh()
      setSuccess('Position updated.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update.')
    }
  }

  function onDelete(id: string, label: string) {
    if (
      !window.confirm(`Delete position “${label}”? Existing elections keep their saved titles.`)
    ) {
      return
    }
    setError(null)
    try {
      deletePosition(id)
      refresh()
      setSuccess('Position removed.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete.')
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-red-900">
          Positions management system
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-500">
          Define offices (President, Secretary, etc.) that can be targeted when
          you create an election. Seeded defaults appear on first load; add or
          edit rows as needed.
        </p>
      </div>

      <form
        onSubmit={onAdd}
        className="max-w-xl rounded-2xl border border-stone-200 bg-white p-6 shadow-xl ring-1 ring-stone-200/90"
      >
        <h2 className="font-display text-lg font-semibold text-red-900">
          Add position
        </h2>
        <label
          htmlFor="pos-new-title"
          className="mt-4 block text-xs font-medium uppercase tracking-wide text-red-800/85"
        >
          Position title *
        </label>
        <input
          id="pos-new-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={fieldClass}
          placeholder="e.g. Public Relations Officer"
          required
        />
        {error ? (
          <p className="mt-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="mt-3 rounded-lg border border-red-800/40 bg-red-50 px-3 py-2 text-sm text-red-900">
            {success}
          </p>
        ) : null}
        <button
          type="submit"
          className="font-display mt-6 rounded-xl bg-gradient-to-r from-red-600 via-red-800 to-neutral-950 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-950/35 hover:from-red-500"
        >
          Save position
        </button>
      </form>

      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xl ring-1 ring-stone-200/90">
        <h2 className="font-display text-lg font-semibold text-red-900">
          Positions list
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          {positions.length} position{positions.length === 1 ? '' : 's'}
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-stone-200">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wider text-stone-500">
                <th className="px-3 py-3 font-medium text-red-800/80">Title</th>
                <th className="px-3 py-3 font-medium text-red-800/80">Actions</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-stone-200/80 last:border-0 hover:bg-stone-50/80"
                >
                  <td className="px-3 py-3 font-medium text-stone-800">
                    {editingId === p.id ? (
                      <input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className={fieldClass}
                      />
                    ) : (
                      p.title
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      {editingId === p.id ? (
                        <>
                          <button type="button" onClick={saveEdit} className={btn}>
                            Save changes
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className={btn}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(p.id, p.title)}
                            className={btn}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(p.id, p.title)}
                            className={btnDanger}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
