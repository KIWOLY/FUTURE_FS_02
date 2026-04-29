import StatusBadge from './StatusBadge.jsx'

function LeadTable({ leads, onSelect, onStatusChange }) {
    return (
        <div className="card overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-sand-100 text-ink-700">
                    <tr>
                        <th className="px-4 py-3 font-semibold">Name</th>
                        <th className="px-4 py-3 font-semibold">Email</th>
                        <th className="px-4 py-3 font-semibold">Source</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold">Received</th>
                    </tr>
                </thead>
                <tbody>
                    {leads.map((lead) => (
                        <tr
                            key={lead.id}
                            className="border-t border-sand-200 hover:bg-sand-50 cursor-pointer"
                            onClick={() => onSelect(lead.id)}
                        >
                            <td className="px-4 py-3 font-medium text-ink-900">{lead.name}</td>
                            <td className="px-4 py-3 text-ink-700">{lead.email}</td>
                            <td className="px-4 py-3 text-ink-700">{lead.source}</td>
                            <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                                <select
                                    className="rounded-lg border border-sand-200 bg-white px-2 py-1 text-xs font-semibold text-ink-700"
                                    value={lead.status}
                                    onChange={(event) => onStatusChange(lead.id, event.target.value)}
                                >
                                    <option value="new">new</option>
                                    <option value="contacted">contacted</option>
                                    <option value="converted">converted</option>
                                </select>
                                <div className="mt-2">
                                    <StatusBadge status={lead.status} />
                                </div>
                            </td>
                            <td className="px-4 py-3 text-ink-700">
                                {new Date(lead.created_at).toLocaleString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default LeadTable
