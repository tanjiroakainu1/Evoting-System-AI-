const tableDateOpts: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
}

export function formatElectionDateTimeCell(iso: string): string {
  return new Date(iso).toLocaleString(undefined, tableDateOpts)
}

export function formatElectionPeriod(isoStart: string, isoEnd: string): string {
  const a = new Date(isoStart).toLocaleString(undefined, tableDateOpts)
  const b = new Date(isoEnd).toLocaleString(undefined, tableDateOpts)
  return `${a} – ${b}`
}

export function toDatetimeLocalValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function fromDatetimeLocalValue(local: string): string {
  return new Date(local).toISOString()
}
