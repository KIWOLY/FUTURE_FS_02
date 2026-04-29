function ActivityFeed({ entries, isLoading, onViewLogs }) {
    return (
        <div className="card p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h3 className="font-display text-2xl text-ink-900">Activity feed</h3>
                    <p className="mt-1 text-sm text-ink-500">Recent admin actions and failed logins.</p>
                </div>
                <button
                    type="button"
                    className="rounded-full border border-ink-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink-700"
                    onClick={onViewLogs}
                    disabled={isLoading}
                >
                    {isLoading ? 'Loading...' : 'View logs'}
                </button>
            </div>
            <div className="mt-4 space-y-3">
                {entries.length === 0 ? (
                    <p className="text-sm text-ink-500">No recent activity.</p>
                ) : (
                    entries.map((entry, index) => {
                        const key = entry.raw || `${entry.message}-${index}`
                        return (
                            <div key={key} className="rounded-xl border border-sand-200 bg-white p-3">
                                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-ink-500">
                                    <span>{entry.level || 'INFO'}</span>
                                    <span>{entry.timestamp || ''}</span>
                                </div>
                                <p className="mt-2 text-xs text-ink-700">{entry.message || entry.raw}</p>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}

export default ActivityFeed
