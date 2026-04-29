import { useState } from 'react'

function UserManagement({ users, isSuperuser, onToggleActive, onResetPassword }) {
    const [passwords, setPasswords] = useState({})

    const handlePasswordChange = (userId, value) => {
        setPasswords((prev) => ({ ...prev, [userId]: value }))
    }

    const handleReset = async (userId) => {
        const password = passwords[userId]
        if (!password) {
            return
        }
        await onResetPassword(userId, password)
        setPasswords((prev) => ({ ...prev, [userId]: '' }))
    }

    return (
        <div className="card overflow-hidden">
            <div className="border-b border-sand-200 px-6 py-4">
                <h3 className="font-display text-2xl text-ink-900">User management</h3>
                <p className="mt-1 text-sm text-ink-500">Enable, disable, and reset admin passwords.</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-sand-100 text-ink-700">
                        <tr>
                            <th className="px-4 py-3 font-semibold">User</th>
                            <th className="px-4 py-3 font-semibold">Role</th>
                            <th className="px-4 py-3 font-semibold">Status</th>
                            <th className="px-4 py-3 font-semibold">Reset password</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="border-t border-sand-200">
                                <td className="px-4 py-3">
                                    <p className="font-medium text-ink-900">
                                        {user.first_name} {user.last_name}
                                    </p>
                                    <p className="text-xs text-ink-500">@{user.username}</p>
                                    <p className="text-xs text-ink-500">{user.email}</p>
                                </td>
                                <td className="px-4 py-3 text-ink-700">
                                    {user.is_superuser ? 'Superuser' : user.is_staff ? 'Staff' : 'User'}
                                </td>
                                <td className="px-4 py-3">
                                    <button
                                        type="button"
                                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${user.is_active
                                                ? 'border-emerald-200 text-emerald-700'
                                                : 'border-red-200 text-red-600'
                                            }`}
                                        disabled={!isSuperuser}
                                        onClick={() => onToggleActive(user.id, !user.is_active)}
                                    >
                                        {user.is_active ? 'Active' : 'Disabled'}
                                    </button>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-col gap-2 md:flex-row md:items-center">
                                        <input
                                            type="password"
                                            className="w-full rounded-xl border border-sand-200 bg-white px-3 py-2 text-xs"
                                            placeholder="New password"
                                            value={passwords[user.id] || ''}
                                            onChange={(event) => handlePasswordChange(user.id, event.target.value)}
                                            disabled={!isSuperuser}
                                        />
                                        <button
                                            type="button"
                                            className="rounded-xl bg-ink-900 px-3 py-2 text-xs font-semibold text-white"
                                            onClick={() => handleReset(user.id)}
                                            disabled={!isSuperuser}
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default UserManagement
