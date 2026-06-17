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
  const [showPassword, setShowPassword] = useState(false)

  // ⚡ Ajout du paramètre "e" pour intercepter l'événement HTML
  const handleSubmit = async (e) => {
    e.preventDefault() // 🚫 Bloque le rafraîchissement automatique de la page
    
    setLoading(true)
    setError('')
    try {
      const data = await login(email, password)
      loginUser(data.token, data.restaurant)
      navigate('/dashboard')
    } catch (err) {
      // Optionnel : affiche l'erreur réelle du serveur si nécessaire pour débugger
      setError(err.response?.data?.error || 'Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        
        {/* En-tête de la page */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-4xl">🃏</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">FidApp</h1>
          <p className="text-gray-400 mt-1">Espace restaurant</p>
        </div>

        {/* Formulaire de connexion */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">Connexion</h2>

          <form onSubmit={handleSubmit}>
            {/* Champ Email */}
            <div className="mb-4">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                className="w-full mt-2 px-4 py-3 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-orange-400 transition-colors"
              />
            </div>

            {/* Champ Mot de passe */}
            <div className="mb-6">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Mot de passe</label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full mt-2 px-4 py-3 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-orange-400 transition-colors pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 bottom-3 text-gray-400 hover:text-gray-600 text-lg transition-colors select-none"
                  tabIndex="-1"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Message d'erreur */}
            {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}

            {/* Bouton d'action */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-4 rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
            >
              {loading ? 'Connexion...' : 'Se connecter →'}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}

export default LoginPage