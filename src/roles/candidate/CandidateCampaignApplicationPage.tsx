import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../../context/useAuth'
import { getElectionLifecycleStatus } from '../../types/election'
import { readFileAsDataUrl } from '../../lib/readDataUrl'
import {
  getElections,
  getMyCampaignApplications,
  submitCampaignApplication,
} from '../../lib/electionsStorage'
import { MyCampaignApplicationsList } from './MyCampaignApplicationsList'

const fieldClass =
  'mt-1 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-stone-900 shadow-inner shadow-stone-300/40 transition-colors focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/35'

const btnPrimary =
  'rounded-lg border border-red-600 bg-red-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-800'

export function CandidateCampaignApplicationPage() {
  const { user } = useAuth()
  const candidateUserId = user?.id ?? ''
  const [elections, setElections] = useState(getElections)
  const [electionId, setElectionId] = useState('')
  const [positionId, setPositionId] = useState('')
  const [platform, setPlatform] = useState('')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoFileName, setPhotoFileName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const refreshElections = useCallback(() => {
    setElections(getElections())
  }, [])

  useEffect(() => {
    window.addEventListener('bevms-elections', refreshElections)
    return () => window.removeEventListener('bevms-elections', refreshElections)
  }, [refreshElections])

  const selectedElection = elections.find((e) => e.id === electionId)
  const appliedElectionIds = new Set(
    getMyCampaignApplications(candidateUserId).map((a) => a.electionId),
  )
  const openElections = elections.filter(
    (e) => getElectionLifecycleStatus(e) !== 'completed',
  )
  const availableElections = openElections.filter(
    (e) => !appliedElectionIds.has(e.id),
  )
  const positionOptions = selectedElection
    ? selectedElection.positionIds.map((id, i) => ({
        id,
        title: selectedElection.positionTitles[i] ?? id,
      }))
    : []

  async function onFileChange(file: File | null) {
    setPhotoPreview(null)
    setPhotoFileName('')
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }
    try {
      const dataUrl = await readFileAsDataUrl(file)
      setPhotoPreview(dataUrl)
      setPhotoFileName(file.name)
      setError(null)
    } catch {
      setError('Could not read the image file.')
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user || user.role !== 'candidate') return
    setError(null)
    setSuccess(null)
    try {
      submitCampaignApplication({
        electionId,
        candidateUserId: user.id,
        positionId,
        platform,
        ballotPhotoDataUrl: photoPreview,
      })
      setSuccess(
        'Application submitted. An administrator will approve or reject it before you can appear on the ballot.',
      )
      setPlatform('')
      setElectionId('')
      setPositionId('')
      setPhotoPreview(null)
      setPhotoFileName('')
      refreshElections()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not submit application.',
      )
    }
  }

  const platformLen = platform.trim().length
  const platformOk = platformLen >= 50

  if (!user || user.role !== 'candidate') {
    return (
      <div className="rounded-2xl border border-stone-300 bg-white p-8 text-center text-stone-400">
        Only candidate accounts can open this page.
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-red-900">
          Campaign Application
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-500">
          Candidate accounts apply once per election. Your platform must be at
          least 50 characters. An administrator will{' '}
          <span className="text-stone-400">approve</span> or{' '}
          <span className="text-stone-400">reject</span> each filing; only
          approved campaigns appear on the ballot, including your optional
          campaign photo.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="max-w-2xl space-y-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-xl ring-1 ring-stone-200/90"
      >
        <div>
          <label
            htmlFor="camp-election"
            className="text-xs font-medium uppercase tracking-wide text-red-800/85"
          >
            Election *
          </label>
          <select
            id="camp-election"
            required
            value={electionId}
            onChange={(e) => {
              setElectionId(e.target.value)
              setPositionId('')
            }}
            className={`${fieldClass} cursor-pointer py-2.5`}
          >
            <option value="">Select Election...</option>
            {availableElections.map((el) => (
              <option key={el.id} value={el.id} className="bg-white">
                {el.title} (ID {el.displayId})
              </option>
            ))}
          </select>
          {availableElections.length === 0 ? (
            <p className="mt-1 text-xs text-amber-800/90">
              You already applied to all currently open elections.
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="camp-position"
            className="text-xs font-medium uppercase tracking-wide text-red-800/85"
          >
            Position *
          </label>
          <select
            id="camp-position"
            required
            disabled={!selectedElection}
            value={positionId}
            onChange={(e) => setPositionId(e.target.value)}
            className={`${fieldClass} cursor-pointer py-2.5 disabled:opacity-50`}
          >
            <option value="">Select Position...</option>
            {positionOptions.map((p) => (
              <option key={p.id} value={p.id} className="bg-white">
                {p.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="camp-platform"
            className="text-xs font-medium uppercase tracking-wide text-red-800/85"
          >
            Campaign Platform *
          </label>
          <textarea
            id="camp-platform"
            required
            minLength={50}
            rows={6}
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            placeholder="Describe your platform, goals, and what you plan to achieve if elected (minimum 50 characters)"
            className={fieldClass}
          />
          <p
            className={
              platformOk
                ? 'mt-1 text-xs text-emerald-500/90'
                : 'mt-1 text-xs text-amber-800/90'
            }
          >
            {platformOk
              ? `${platformLen} characters — requirement met`
              : `Minimum 50 characters required (${platformLen} so far)`}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-red-800/85">
            Ballot / campaign photo
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            className="mt-2 block w-full text-sm text-stone-400 file:mr-3 file:rounded-lg file:border file:border-red-800/50 file:bg-red-50 file:px-3 file:py-2 file:text-sm file:text-red-900"
          />
          <p className="mt-1 text-xs text-stone-600">
            {photoFileName
              ? `Selected: ${photoFileName}`
              : 'No file chosen — optional. Shown on the ballot; your account profile photo is used if you skip this.'}
          </p>
          {photoPreview ? (
            <img
              src={photoPreview}
              alt="Preview"
              className="mt-3 h-32 w-32 rounded-xl object-cover ring-1 ring-red-950/50"
            />
          ) : null}
        </div>

        {error ? (
          <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            {success}
          </p>
        ) : null}

        <button type="submit" className={btnPrimary}>
          Submit application
        </button>
      </form>

      {user ? (
        <MyCampaignApplicationsList
          candidateUserId={user.id}
          variant="inline"
        />
      ) : null}
    </div>
  )
}
