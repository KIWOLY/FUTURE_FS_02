import axios from 'axios'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const api = axios.create({
    baseURL: apiBaseUrl,
    headers: {
        'Content-Type': 'application/json'
    }
})

const refreshClient = axios.create({
    baseURL: apiBaseUrl,
    headers: {
        'Content-Type': 'application/json'
    }
})

let isRefreshing = false
let pendingRequests = []

const resolvePending = (error, token = null) => {
    pendingRequests.forEach((prom) => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token)
        }
    })
    pendingRequests = []
}

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config
        if (!error.response || error.response.status !== 401 || originalRequest._retry) {
            return Promise.reject(error)
        }

        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            if (window.location.pathname !== '/login') {
                window.location.href = '/login'
            }
            return Promise.reject(error)
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                pendingRequests.push({ resolve, reject })
            }).then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`
                return api(originalRequest)
            })
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
            const response = await refreshClient.post('/api/auth/refresh/', {
                refresh: refreshToken
            })
            const newAccessToken = response.data.access
            localStorage.setItem('access_token', newAccessToken)
            api.defaults.headers.Authorization = `Bearer ${newAccessToken}`
            resolvePending(null, newAccessToken)
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            return api(originalRequest)
        } catch (refreshError) {
            resolvePending(refreshError, null)
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            if (window.location.pathname !== '/login') {
                window.location.href = '/login'
            }
            return Promise.reject(refreshError)
        } finally {
            isRefreshing = false
        }
    }
)

export default api
