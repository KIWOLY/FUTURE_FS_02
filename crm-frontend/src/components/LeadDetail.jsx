import { useState } from 'react'
import StatusBadge from './StatusBadge.jsx'

function LeadDetail({ lead, onAddNote, onDelete }) {
    const [noteText, setNoteText] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    const handleSubmit = async (event) => {
        event.preventDefault()
        if (!noteText.trim()) {
            return
        }
        setIsSaving(true)
        await onAddNote(noteText)
        setNoteText('')
        setIsSaving(false)
    }

    return (
        <aside className="card p-6">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-ink-500">Lead detail</p>
                    <h2 className="text-2xl font-semibold text-ink-900">{lead.name}</h2>
                </div>
                <button
                    type="button"
                    className="rounded-full border border-red-200 px-4 py-1 text-xs font-semibold text-red-600"
                    onClick={onDelete}
                >
                    Delete
                </button>
            </div>

            <div className="mt-4 space-y-2 text-sm text-ink-700">
                <p>
                    <span className="font-semibold text-ink-900">Email:</span> {lead.email}
                </p>
                <p>
                    <span className="font-semibold text-ink-900">Source:</span> {lead.source}
                </p>
                <p>
                    <span className="font-semibold text-ink-900">Status:</span>{' '}
                    <StatusBadge status={lead.status} />
                </p>
                <p>
                    <span className="font-semibold text-ink-900">Message:</span> {lead.message}
                </p>
            </div>

            <div className="mt-6">
                <h3 className="text-sm font-semibold text-ink-900">Notes</h3>
                <div className="mt-3 space-y-3">
                    {lead.notes.length === 0 ? (
                        <p className="text-sm text-ink-500">No notes yet.</p>
                    ) : (
                        lead.notes.map((note) => (
                            <div key={note.id} className="rounded-xl border border-sand-200 bg-white p-3">
                                <p className="text-sm text-ink-700">{note.text}</p>
                                <p className="mt-2 text-xs text-ink-500">
                                    {new Date(note.created_at).toLocaleString()}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
                <textarea
                    value={noteText}
                    onChange={(event) => setNoteText(event.target.value)}
                    className="w-full rounded-xl border border-sand-200 bg-white p-3 text-sm text-ink-700"
                    rows={3}
                    placeholder="Add a note..."
                />
                <button
                    type="submit"
                    className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white"
                    disabled={isSaving}
                >
                    {isSaving ? 'Saving...' : 'Add note'}
                </button>
            </form>
        </aside>
    )
}

export default LeadDetail
