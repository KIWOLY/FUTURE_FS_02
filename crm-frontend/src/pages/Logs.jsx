import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios.js'

function Logs() {
    const [entries, setEntries] = useState([])
    const [offset, setOffset] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const fetchLogs = async (nextOffset = 0, append = false) => {
        setIsLoading(true)
        setError('')
        try {
            const response = await api.get(`/api/admin/audit/?limit=50&offset=${nextOffset}`)
            const data = response.data.entries || []
            setEntries((prev) => (append ? [...prev, ...data] : data))
            setOffset(nextOffset)
        } catch (err) {
            setError('Unable to load logs.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchLogs(0, false)
    }, [])

    const handleLoadMore = () => {
        fetchLogs(offset + 50, true)
    }

    return (
        <div className="page-shell">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
                <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-ocean-700">Audit logs</p>
                        <h1 className="mt-2 font-display text-3xl text-ink-900">System activity</h1>
                        <p className="mt-2 text-sm text-ink-500">Admin actions and authentication events.</p>
                    </div>
                    <button
                        type="button"
                        className="rounded-full border border-ink-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink-700"
                        onClick={() => navigate('/')}
                    >
                        Back to dashboard
                    </button>
                </header>

                {error ? <div className="card p-4 text-sm text-red-600">{error}</div> : null}

                <div className="card p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-[0.2em] text-ink-500">Recent entries</p>
                        <button
                            type="button"
                            className="rounded-full border border-ink-300 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-ink-700"
                            onClick={() => fetchLogs(0, false)}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Loading...' : 'Refresh'}
                        </button>
                    </div>
                    <div className="mt-4 space-y-3">
                        {entries.length === 0 ? (
                            <p className="text-sm text-ink-500">No log entries yet.</p>
                        ) : (
                            entries.map((entry, index) => (
                                <div key={entry.raw || index} className="rounded-xl border border-sand-200 bg-white p-4">
                                    <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-ink-500">
                                        <span className="rounded-full bg-sand-100 px-3 py-1">{entry.level}</span>
                                        <span>{entry.timestamp}</span>
                                        <span>{entry.name}</span>
                                    </div>
                                    <p className="mt-2 text-sm text-ink-700">{entry.message}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <button
                    type="button"
                    className="self-center rounded-full border border-ink-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink-700"
                    onClick={handleLoadMore}
                    disabled={isLoading}
                >
                    {isLoading ? 'Loading...' : 'Load more'}
                </button>
            </div>
        </div>
    )
}

export default Logs
