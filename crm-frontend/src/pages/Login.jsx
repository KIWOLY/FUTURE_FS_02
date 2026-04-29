import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios.js'

function Login() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleChange = (event) => {
        const { name, value } = event.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')
        setIsSubmitting(true)
        try {
            const response = await api.post('/api/auth/login/', formData)
            localStorage.setItem('access_token', response.data.access)
            localStorage.setItem('refresh_token', response.data.refresh)
            if (response.data.user) {
                localStorage.setItem('user_profile', JSON.stringify(response.data.user))
            }
            navigate('/')
        } catch (err) {
            setError('Login failed. Check your email and password.')
        } finally {
            setIsSubmitting(false)
        }
    }

    useEffect(() => {
        const token = localStorage.getItem('access_token')
        if (token) {
            navigate('/')
        }
    }, [navigate])

    return (
        <div className="page-shell flex items-center justify-center">
            <div className="card w-full max-w-md p-8">
                <h1 className="font-display text-3xl font-semibold text-ink-900">CRM Login</h1>
                <p className="mt-2 text-sm text-ink-500">Sign in to manage clients.</p>
                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="text-xs font-semibold uppercase text-ink-500">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="mt-2 w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold uppercase text-ink-500">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="mt-2 w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm"
                            placeholder="••••••••"
                        />
                    </div>
                    {error ? <p className="text-sm text-red-600">{error}</p> : null}
                    <button
                        type="submit"
                        className="w-full rounded-xl bg-ink-900 px-4 py-3 text-sm font-semibold text-white"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Login
