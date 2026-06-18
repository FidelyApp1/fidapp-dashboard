import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/client'
import { useAuth } from '../context/AuthContext'
import Logo from '../assets/logo.jsx' // On réutilise ton vrai Logo !

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { loginUser } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await login(email, password)
      loginUser(data.token, data.restaurant)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-orange-200 flex items-center justify-center px-6 relative overflow-hidden">
      {/* LA GRILLE : Copiée collée de ta landing pour cohérence absolue */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-orange-100/40 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        {/* Branding synchro avec Navbar Landing */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="flex items-center gap-2 mb-3">
            <Logo size={36} />
            <span className="font-black text-2xl tracking-tight text-gray-900">fid<span className="text-orange-500">app</span></span>
          </div>
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Espace Restaurant Pro</p>
        </div>

        {/* Formulaire Bento Style */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 p-8 sm:p-10">
          <h2 className="text-2xl font-black tracking-tight text-gray-900 mb-2">Ravi de vous revoir</h2>
          <p className="text-sm text-gray-500 mb-6 font-medium">Connectez-vous pour piloter vos récompenses.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Identifiant Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="gerant@commerce.ma"
                required
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Mot de passe</label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-sm font-medium pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors select-none"
                  tabIndex="-1"
                >
                  {showPassword ? 'Masquer' : 'Afficher'}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-xs font-semibold bg-red-50 border border-red-100 p-3.5 rounded-xl text-center">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-gray-900/10 hover:shadow-gray-900/20 active:scale-[0.98] text-sm mt-2 flex items-center justify-center gap-2"
            >
              {loading ? 'Authentification...' : 'Accéder au Dashboard pro'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage