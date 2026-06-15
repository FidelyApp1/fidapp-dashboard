import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getStats } from '../api/client'

const StatCard = ({ emoji, label, value, color }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
    <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-4`}>
      <span className="text-2xl">{emoji}</span>
    </div>
    <p className="text-3xl font-bold text-gray-800">{value}</p>
    <p className="text-sm text-gray-400 mt-1">{label}</p>
  </div>
)

const DashboardPage = () => {
  const { restaurant, logout } = useAuth()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: getStats,
    refetchInterval: 30000
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center">
            <span className="text-xl">🃏</span>
          </div>
          <div>
            <p className="font-semibold text-gray-800">{restaurant?.name}</p>
            <p className="text-xs text-gray-400">Dashboard</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/qrcode')}
            className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors"
          >
            Mon QR Code
          </button>
          <button
            onClick={logout}
            className="text-gray-400 hover:text-gray-600 px-4 py-2 rounded-xl text-sm transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Bonjour 👋</h1>
          <p className="text-gray-400 mt-1">Voici un aperçu de votre fidélité client</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard emoji="👥" label="Clients inscrits" value={isLoading ? '...' : data?.totalClients ?? 0} color="bg-blue-50" />
          <StatCard emoji="✅" label="Check-ins total" value={isLoading ? '...' : data?.totalCheckins ?? 0} color="bg-green-50" />
          <StatCard emoji="🎁" label="Rewards émis" value={isLoading ? '...' : data?.totalRewards ?? 0} color="bg-orange-50" />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-50 p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Activité récente</h2>
          {isLoading ? (
            <div className="text-center py-8 text-gray-300">Chargement...</div>
          ) : data?.recentCheckins?.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl">📊</span>
              <p className="text-gray-400 mt-3">Les statistiques apparaîtront ici</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data?.recentCheckins?.map((checkin) => (
                <div key={checkin.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-sm">👤</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{checkin.loyaltyCard.user.phone}</p>
                      <p className="text-xs text-gray-400">{checkin.loyaltyCard.checkCount}/10 visites</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-300">
                    {new Date(checkin.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardPage