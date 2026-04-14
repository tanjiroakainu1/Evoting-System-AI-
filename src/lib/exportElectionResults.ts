import type { ElectionResultsDetail } from '../types/election'
import {
  electionStatusLabel,
  getElectionLifecycleStatus,
} from '../types/election'
import { formatElectionDateTimeCell } from './electionDisplay'

function safeFileName(base: string, ext: string): string {
  const cleaned = base
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
  return `${cleaned || 'election-results'}.${ext}`
}

function escapeCsvCell(value: string | number): string {
  const s = String(value)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

/** UTF-8 CSV for Microsoft Excel and other spreadsheets. */
export function downloadElectionResultsExcel(detail: ElectionResultsDetail): void {
  const e = detail.election
  const lines: string[] = []

  lines.push(
    [
      escapeCsvCell('Election title'),
      escapeCsvCell(e.title),
    ].join(','),
  )
  lines.push(
    [
      escapeCsvCell('Display ID'),
      escapeCsvCell(e.displayId),
    ].join(','),
  )
  lines.push(
    [
      escapeCsvCell('Status'),
      escapeCsvCell(
        electionStatusLabel(getElectionLifecycleStatus(e)),
      ),
    ].join(','),
  )
  lines.push(
    [
      escapeCsvCell('Start'),
      escapeCsvCell(formatElectionDateTimeCell(e.startAt)),
    ].join(','),
  )
  lines.push(
    [
      escapeCsvCell('End'),
      escapeCsvCell(formatElectionDateTimeCell(e.endAt)),
    ].join(','),
  )
  lines.push(
    [
      escapeCsvCell('Eligible voters'),
      escapeCsvCell(detail.eligibleVoters),
    ].join(','),
  )
  lines.push(
    [
      escapeCsvCell('Votes cast (unique voters)'),
      escapeCsvCell(detail.votersParticipated),
    ].join(','),
  )
  lines.push(
    [
      escapeCsvCell('Turnout %'),
      escapeCsvCell(detail.turnoutPercent),
    ].join(','),
  )
  lines.push('')

  for (const block of detail.positions) {
    lines.push(escapeCsvCell(`Office: ${block.positionTitle}`))
    lines.push(
      [
        escapeCsvCell('Rank'),
        escapeCsvCell('Candidate'),
        escapeCsvCell('Votes'),
        escapeCsvCell('Percentage'),
      ].join(','),
    )
    for (const row of block.rows) {
      lines.push(
        [
          escapeCsvCell(row.rank),
          escapeCsvCell(row.candidateName),
          escapeCsvCell(row.votes),
          escapeCsvCell(row.percentage),
        ].join(','),
      )
    }
    lines.push('')
  }

  const csv = `\uFEFF${lines.join('\r\n')}`
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = safeFileName(
    `election-results-${e.displayId}-${e.title}`,
    'csv',
  )
  a.click()
  URL.revokeObjectURL(url)
}

/** Loads PDF libraries on first use to keep the main bundle smaller. */
export async function downloadElectionResultsPdf(
  detail: ElectionResultsDetail,
): Promise<void> {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])

  const e = detail.election
  const doc = new jsPDF({ format: 'a4', unit: 'mm' })
  const margin = 14
  let y = 16

  doc.setFontSize(15)
  doc.setFont('helvetica', 'bold')
  doc.text(e.title, margin, y)
  doc.setFont('helvetica', 'normal')
  y += 8

  doc.setFontSize(10)
  const metaLines = [
    `Display ID: ${e.displayId}`,
    `Status: ${electionStatusLabel(getElectionLifecycleStatus(e))}`,
    `Period: ${formatElectionDateTimeCell(e.startAt)} – ${formatElectionDateTimeCell(e.endAt)}`,
    `Eligible voters: ${detail.eligibleVoters}  ·  Votes cast: ${detail.votersParticipated}  ·  Turnout: ${detail.turnoutPercent}%`,
  ]
  for (const line of metaLines) {
    const parts = doc.splitTextToSize(line, 180)
    for (const p of parts) {
      doc.text(p, margin, y)
      y += 5
    }
  }
  y += 4

  for (const block of detail.positions) {
    if (y > 250) {
      doc.addPage()
      y = 16
    }
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(block.positionTitle, margin, y)
    doc.setFont('helvetica', 'normal')
    y += 2

    autoTable(doc, {
      startY: y + 2,
      head: [['Rank', 'Candidate', 'Votes', '%']],
      body: block.rows.map((r) => [
        String(r.rank),
        r.candidateName,
        String(r.votes),
        String(r.percentage),
      ]),
      margin: { left: margin, right: margin },
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [80, 25, 25], textColor: 255 },
      theme: 'striped',
    })

    const withTable = doc as typeof doc & {
      lastAutoTable?: { finalY: number }
    }
    const tableEnd = withTable.lastAutoTable?.finalY
    y = (tableEnd ?? y) + 12
  }

  doc.save(
    safeFileName(`election-results-${e.displayId}-${e.title}`, 'pdf'),
  )
}
