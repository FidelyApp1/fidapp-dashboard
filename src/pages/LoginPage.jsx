import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/client'
import { useAuth } from '../context/AuthContext'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { loginUser } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await login(email, password)
      loginUser(data.token, data.restaurant)
      navigate('/dashboard')
    } catch {
      setError('Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-4xl">🃏</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">FidApp</h1>
          <p className="text-gray-400 mt-1">Espace restaurant</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">Connexion</h2>

          <div className="mb-4">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="w-full mt-2 px-4 py-3 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-orange-400 transition-colors"
            />
          </div>

          <div className="mb-6">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full mt-2 px-4 py-3 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-orange-400 transition-colors"
            />
          </div>

          {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-4 rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
          >
            {loading ? 'Connexion...' : 'Se connecter →'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginPage