const styles = {
    new: 'bg-blue-100 text-blue-700 border-blue-200',
    contacted: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    converted: 'bg-green-100 text-green-700 border-green-200'
}

function StatusBadge({ status }) {
    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${styles[status] || 'bg-sand-100 text-ink-700 border-sand-200'
                }`}
        >
            {status}
        </span>
    )
}

export default StatusBadge
