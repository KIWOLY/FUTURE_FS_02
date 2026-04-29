import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios.js'
import ActivityFeed from '../components/ActivityFeed.jsx'
import LeadDetail from '../components/LeadDetail.jsx'
import LeadTable from '../components/LeadTable.jsx'
import UserManagement from '../components/UserManagement.jsx'

function Dashboard() {
    const [leads, setLeads] = useState([])
    const [selectedLead, setSelectedLead] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [adminForm, setAdminForm] = useState({
        email: '',
        username: '',
        first_name: '',
        last_name: '',
        password: ''
    })
    const [adminNotice, setAdminNotice] = useState('')
    const [adminError, setAdminError] = useState('')
    const [adminLoading, setAdminLoading] = useState(false)
    const [userProfile, setUserProfile] = useState(null)
    const [users, setUsers] = useState([])
    const navigate = useNavigate()

    const fetchLeads = async () => {
        setIsLoading(true)
        setError('')
        try {
            const response = await api.get('/api/leads/')
            setLeads(response.data)
        } catch (err) {
            setError('Failed to load leads. Please sign in again.')
        } finally {
            setIsLoading(false)
        }
    }

    const fetchLeadDetail = async (leadId) => {
        const response = await api.get(`/api/leads/${leadId}/`)
        const notes = [...response.data.notes].sort(
            (a, b) => new Date(a.created_at) - new Date(b.created_at)
        )
        setSelectedLead({ ...response.data, notes })
    }

    const handleSelect = (leadId) => {
        fetchLeadDetail(leadId)
    }

    const handleStatusChange = async (leadId, statusValue) => {
        await api.patch(`/api/leads/${leadId}/`, { status: statusValue })
        setLeads((prev) =>
            prev.map((lead) => (lead.id === leadId ? { ...lead, status: statusValue } : lead))
        )
        if (selectedLead && selectedLead.id === leadId) {
            setSelectedLead((prev) => ({ ...prev, status: statusValue }))
        }
    }

    const handleAddNote = async (text) => {
        if (!selectedLead) {
            return
        }
        await api.post(`/api/leads/${selectedLead.id}/add_note/`, { text })
        await fetchLeadDetail(selectedLead.id)
    }

    const handleDelete = async () => {
        if (!selectedLead) {
            return
        }
        await api.delete(`/api/leads/${selectedLead.id}/`)
        setLeads((prev) => prev.filter((lead) => lead.id !== selectedLead.id))
        setSelectedLead(null)
    }

    const fetchProfile = async () => {
        try {
            const response = await api.get('/api/auth/me/')
            setUserProfile(response.data)
            localStorage.setItem('user_profile', JSON.stringify(response.data))
        } catch (err) {
            setUserProfile(null)
        }
    }

    const fetchAdminData = async () => {
        setAdminLoading(true)
        setAdminError('')
        try {
            const [usersResponse] = await Promise.all([
                api.get('/api/admin/users/')
            ])
            setUsers(usersResponse.data)
        } catch (err) {
            setAdminError('Unable to load admin data.')
        } finally {
            setAdminLoading(false)
        }
    }


    useEffect(() => {
        fetchLeads()
        fetchProfile()
        const storedProfile = localStorage.getItem('user_profile')
        if (storedProfile) {
            setUserProfile(JSON.parse(storedProfile))
        }
    }, [])

    useEffect(() => {
        if (userProfile && userProfile.is_staff) {
            fetchAdminData()
        }
    }, [userProfile])

    const filteredLeads = leads.filter((lead) => {
        const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
        const searchValue = searchTerm.toLowerCase().trim()
        const matchesSearch = !searchValue
            || lead.name.toLowerCase().includes(searchValue)
            || lead.email.toLowerCase().includes(searchValue)
            || lead.source.toLowerCase().includes(searchValue)
        return matchesStatus && matchesSearch
    })

    const statusCounts = leads.reduce(
        (acc, lead) => {
            acc.total += 1
            acc[lead.status] = (acc[lead.status] || 0) + 1
            return acc
        },
        { total: 0, new: 0, contacted: 0, converted: 0 }
    )

    const roleLabel = userProfile?.is_superuser
        ? 'Superuser'
        : userProfile?.is_staff
            ? 'Staff'
            : 'User'

    const handleLogout = () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_profile')
        navigate('/login')
    }

    const handleAdminChange = (event) => {
        const { name, value } = event.target
        setAdminForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleCreateAdmin = async (event) => {
        event.preventDefault()
        setAdminNotice('')
        setAdminError('')
        try {
            await api.post('/api/auth/create-admin/', adminForm)
            setAdminNotice('Staff user created successfully.')
            setAdminForm({ email: '', username: '', first_name: '', last_name: '', password: '' })
            fetchAdminData()
        } catch (err) {
            const detail = err?.response?.data?.detail
            setAdminError(detail || 'Failed to create admin. Only superusers can do this.')
        }
    }

    const handleToggleActive = async (userId, isActive) => {
        setAdminNotice('')
        setAdminError('')
        try {
            const response = await api.patch(`/api/admin/users/${userId}/set-active/`, { is_active: isActive })
            setUsers((prev) => prev.map((user) => (user.id === userId ? response.data : user)))
        } catch (err) {
            setAdminError('Unable to update user status.')
        }
    }

    const handleResetPassword = async (userId, password) => {
        setAdminNotice('')
        setAdminError('')
        try {
            await api.post(`/api/admin/users/${userId}/reset-password/`, { password })
            setAdminNotice('Password reset successful.')
        } catch (err) {
            const detail = err?.response?.data?.password?.[0] || err?.response?.data?.detail
            setAdminError(detail || 'Unable to reset password.')
        }
    }

    const handleViewLogs = () => {
        navigate('/logs')
    }

    return (
        <div className="page-shell">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
                <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-ocean-700">CRM Dashboard</p>
                        <h1 className="mt-2 font-display text-4xl text-ink-900">Portfolio leads</h1>
                        <p className="mt-3 max-w-xl text-sm text-ink-500">
                            Track every lead from your portfolio, update statuses, and keep notes in one place.
                        </p>
                        {userProfile ? (
                            <div className="mt-4 inline-flex items-center gap-3 rounded-full border border-sand-200 bg-white px-4 py-2 text-xs text-ink-700">
                                <span className="font-semibold">{userProfile.email}</span>
                                <span className="rounded-full bg-sand-100 px-3 py-1 text-[10px] uppercase tracking-[0.2em]">
                                    {roleLabel}
                                </span>
                            </div>
                        ) : null}
                    </div>
                    <button
                        type="button"
                        className="rounded-full border border-ink-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink-700"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </header>

                {error ? (
                    <div className="card p-4 text-sm text-red-600">{error}</div>
                ) : null}

                <section className="grid gap-4 md:grid-cols-4">
                    <div className="card p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-ink-500">Total leads</p>
                        <p className="mt-2 text-2xl font-semibold text-ink-900">{statusCounts.total}</p>
                    </div>
                    <div className="card p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-ink-500">New</p>
                        <p className="mt-2 text-2xl font-semibold text-ink-900">{statusCounts.new}</p>
                    </div>
                    <div className="card p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-ink-500">Contacted</p>
                        <p className="mt-2 text-2xl font-semibold text-ink-900">{statusCounts.contacted}</p>
                    </div>
                    <div className="card p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-ink-500">Converted</p>
                        <p className="mt-2 text-2xl font-semibold text-ink-900">{statusCounts.converted}</p>
                    </div>
                </section>

                <section className="card flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
                        <div className="flex-1">
                            <label className="text-xs font-semibold uppercase text-ink-500">Search</label>
                            <input
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                className="mt-2 w-full rounded-xl border border-sand-200 bg-white px-4 py-2 text-sm"
                                placeholder="Search by name, email, source"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold uppercase text-ink-500">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(event) => setStatusFilter(event.target.value)}
                                className="mt-2 w-full rounded-xl border border-sand-200 bg-white px-3 py-2 text-sm"
                            >
                                <option value="all">All</option>
                                <option value="new">New</option>
                                <option value="contacted">Contacted</option>
                                <option value="converted">Converted</option>
                            </select>
                        </div>
                    </div>
                    <div className="text-xs uppercase tracking-[0.2em] text-ink-500">
                        Showing {filteredLeads.length} leads
                    </div>
                </section>

                {isLoading ? (
                    <div className="card p-6 text-sm text-ink-500">Loading leads...</div>
                ) : filteredLeads.length === 0 ? (
                    <div className="card p-6 text-sm text-ink-500">No leads yet.</div>
                ) : (
                    <LeadTable
                        leads={filteredLeads}
                        onSelect={handleSelect}
                        onStatusChange={handleStatusChange}
                    />
                )}

                {selectedLead ? (
                    <LeadDetail lead={selectedLead} onAddNote={handleAddNote} onDelete={handleDelete} />
                ) : (
                    <div className="card p-6 text-sm text-ink-500">
                        Select a lead to view details and notes.
                    </div>
                )}

                {userProfile?.is_superuser ? (
                    <section className="card p-6">
                        <h2 className="font-display text-2xl text-ink-900">Create another admin</h2>
                        <p className="mt-2 text-sm text-ink-500">
                            Superusers can add additional admin accounts for the CRM dashboard.
                        </p>
                        <form className="mt-4 grid gap-4 md:grid-cols-3" onSubmit={handleCreateAdmin}>
                            <input
                                name="first_name"
                                type="text"
                                value={adminForm.first_name}
                                onChange={handleAdminChange}
                                className="rounded-xl border border-sand-200 bg-white px-4 py-2 text-sm"
                                placeholder="First name"
                                required
                            />
                            <input
                                name="last_name"
                                type="text"
                                value={adminForm.last_name}
                                onChange={handleAdminChange}
                                className="rounded-xl border border-sand-200 bg-white px-4 py-2 text-sm"
                                placeholder="Last name"
                                required
                            />
                            <input
                                name="email"
                                type="email"
                                value={adminForm.email}
                                onChange={handleAdminChange}
                                className="rounded-xl border border-sand-200 bg-white px-4 py-2 text-sm"
                                placeholder="admin@example.com"
                                required
                            />
                            <input
                                name="username"
                                type="text"
                                value={adminForm.username}
                                onChange={handleAdminChange}
                                className="rounded-xl border border-sand-200 bg-white px-4 py-2 text-sm"
                                placeholder="username"
                                required
                            />
                            <input
                                name="password"
                                type="password"
                                value={adminForm.password}
                                onChange={handleAdminChange}
                                className="rounded-xl border border-sand-200 bg-white px-4 py-2 text-sm"
                                placeholder="temporary password"
                                required
                            />
                            <button
                                type="submit"
                                className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white md:col-span-3"
                            >
                                Create admin
                            </button>
                        </form>
                        {adminNotice ? (
                            <p className="mt-3 text-sm text-emerald-700">{adminNotice}</p>
                        ) : null}
                        {adminError ? (
                            <p className="mt-3 text-sm text-red-600">{adminError}</p>
                        ) : null}
                    </section>
                ) : null}

                {userProfile?.is_staff ? (
                    <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                        <div className="space-y-6">
                            {adminLoading ? (
                                <div className="card p-4 text-sm text-ink-500">Loading admin tools...</div>
                            ) : (
                                <UserManagement
                                    users={users}
                                    isSuperuser={userProfile.is_superuser}
                                    onToggleActive={handleToggleActive}
                                    onResetPassword={handleResetPassword}
                                />
                            )}
                            {adminError ? (
                                <div className="card p-4 text-sm text-red-600">{adminError}</div>
                            ) : null}
                        </div>
                        {userProfile?.is_superuser ? (
                            <ActivityFeed
                                entries={[]}
                                isLoading={adminLoading}
                                onViewLogs={handleViewLogs}
                            />
                        ) : (
                            <div className="card p-6 text-sm text-ink-500">
                                Log access is restricted to superusers.
                            </div>
                        )}
                    </section>
                ) : null}
            </div>
        </div>
    )
}

export default Dashboard
