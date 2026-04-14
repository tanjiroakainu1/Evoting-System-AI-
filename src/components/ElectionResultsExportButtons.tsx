import type { ElectionResultsDetail } from '../types/election'
import {
  downloadElectionResultsExcel,
  downloadElectionResultsPdf,
} from '../lib/exportElectionResults'

const btnPdf =
  'rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-900 hover:bg-red-100'

const btnExcel =
  'rounded-lg border border-emerald-800/45 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-900/40'

type Props = {
  detail: ElectionResultsDetail
  className?: string
}

export function ElectionResultsExportButtons({ detail, className }: Props) {
  return (
    <div className={['flex flex-wrap gap-2', className].filter(Boolean).join(' ')}>
      <button
        type="button"
        onClick={() => {
          void downloadElectionResultsPdf(detail).catch(() => {
            window.alert('Could not generate PDF. Try again.')
          })
        }}
        className={btnPdf}
      >
        Export PDF
      </button>
      <button
        type="button"
        onClick={() => downloadElectionResultsExcel(detail)}
        className={btnExcel}
      >
        Export Excel
      </button>
    </div>
  )
}
