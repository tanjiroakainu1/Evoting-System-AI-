import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode }

type State = { error: Error | null }

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-svh bg-stone-100 px-4 py-16 text-stone-900">
          <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-white p-8 shadow-lg">
            <h1 className="font-display text-xl font-semibold text-red-900">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-stone-600">
              The app hit an unexpected error. Try reloading the page. If you
              just deployed, clear site data for this domain and sign in again.
            </p>
            <pre className="mt-4 max-h-40 overflow-auto rounded-lg bg-stone-100 p-3 text-xs text-red-900">
              {this.state.error.message}
            </pre>
            <button
              type="button"
              className="mt-6 rounded-xl bg-red-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-800"
              onClick={() => window.location.reload()}
            >
              Reload page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
