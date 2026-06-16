import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getStats } from '../api/client'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useState } from 'react'

const DashboardPage = () => {
  const { restaurant, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [activePage, setActivePage] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false) // 📱 État pour le menu mobile

  const { data, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: getStats,
    refetchInterval: 30000
  })

  const chartData = data?.dailyData
    ? Object.entries(data.dailyData).map(([date, count]) => ({
        day: new Date(date).toLocaleDateString('fr-FR', { weekday: 'short' }),
        checkins: count
      }))
    : []

  const navItems = [
    { id: 'overview', label: 'Vue générale', icon: '📊' },
    { id: 'checkins', label: 'Check-ins', icon: '✅' },
    { id: 'clients', label: 'Clients', icon: '👥' },
    { id: 'qrcode', label: 'QR Code', icon: '🔲' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      {/* 📱 Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 🧭 Sidebar Responsive */}
      <aside className={`w-64 bg-white border-r border-gray-100 flex flex-col fixed h-full z-30 transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center shadow-md">
              <span className="text-xl">🃏</span>
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm">FidApp</p>
              <p className="text-xs text-gray-400">Dashboard</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-gray-100">
          <div className="bg-orange-50 rounded-xl p-3">
            <p className="font-semibold text-gray-800 text-sm truncate">{restaurant?.name}</p>
            <p className="text-xs text-gray-400 mt-0.5 truncate">{restaurant?.email}</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setSidebarOpen(false) // Ferme la sidebar sur mobile après un clic
                if (item.id === 'qrcode') {
                  navigate('/qrcode')
                } else {
                  setActivePage(item.id)
                }
              }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${
                activePage === item.id
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={logout}
            className="w-full text-left px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-50 transition-all flex items-center gap-2"
          >
            <span>🚪</span> Déconnexion
          </button>
        </div>
      </aside>

      {/* 💻 Main Content */}
      <main className="flex-1 lg:ml-64 min-w-0 transition-all duration-300">
        
        {/* 📋 Header avec bouton Hamburger */}
        <div className="bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 active:scale-95 transition-transform"
            >
              ☰
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {activePage === 'overview' && 'Vue générale'}
                {activePage === 'checkins' && 'Check-ins récents'}
                {activePage === 'clients' && 'Mes clients'}
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-400">Temps réel</span>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          {/* OVERVIEW */}
          {activePage === 'overview' && (
            <div className="space-y-6">
              {/* Stats cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Clients fidèles', value: data?.totalClients ?? '—', icon: '👥', color: 'bg-blue-50', iconBg: 'bg-blue-100', trend: '+12%' },
                  { label: 'Check-ins total', value: data?.totalCheckins ?? '—', icon: '✅', color: 'bg-green-50', iconBg: 'bg-green-100', trend: '+8%' },
                  { label: 'Ce mois', value: data?.checkinsThisMonth ?? '—', icon: '📅', color: 'bg-purple-50', iconBg: 'bg-purple-100', trend: 'mois en cours' },
                  { label: 'Rewards émis', value: data?.totalRewards ?? '—', icon: '🎁', color: 'bg-orange-50', iconBg: 'bg-orange-100', trend: 'offerts' },
                ].map((stat, i) => (
                  <div key={i} className={`${stat.color} rounded-2xl p-5`}>
                    <div className={`w-10 h-10 ${stat.iconBg} rounded-xl flex items-center justify-center mb-3`}>
                      <span className="text-xl">{stat.icon}</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-800">{isLoading ? '...' : stat.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                    <p className="text-xs text-gray-400 mt-1">{stat.trend}</p>
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-semibold text-gray-800">Activité des 7 derniers jours</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Nombre de check-ins par jour</p>
                  </div>
                  <div className="bg-orange-50 text-orange-500 text-xs font-semibold px-3 py-1 rounded-full">
                    7 jours
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorCheckins" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: '#fff', border: '1px solid #f1f1f1', borderRadius: '12px', fontSize: '12px' }}
                      formatter={(value) => [`${value} check-ins`, '']}
                    />
                    <Area type="monotone" dataKey="checkins" stroke="#f97316" strokeWidth={2} fill="url(#colorCheckins)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Recent checkins + top clients */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h2 className="font-semibold text-gray-800 mb-4">Activité récente</h2>
                  <div className="space-y-3">
                    {isLoading ? (
                      <p className="text-gray-300 text-sm text-center py-4">Chargement...</p>
                    ) : data?.recentCheckins?.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-4">Aucune activité récente</p>
                    ) : data?.recentCheckins?.slice(0, 5).map((c) => (
                      <div key={c.id} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 truncate">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm flex-shrink-0">👤</div>
                          <div className="truncate">
                            <p className="text-sm font-medium text-gray-700 truncate">{c.loyaltyCard.user.phone}</p>
                            <p className="text-xs text-gray-400">{c.loyaltyCard.checkCount}/{restaurant?.checksRequired || 10} visites</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-300 flex-shrink-0">
                          {new Date(c.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h2 className="font-semibold text-gray-800 mb-4">Top clients 🏆</h2>
                  <div className="space-y-3">
                    {isLoading ? (
                      <p className="text-gray-300 text-sm text-center py-4">Chargement...</p>
                    ) : data?.topClients?.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-4">Aucun client pour le moment</p>
                    ) : data?.topClients?.map((c, i) => (
                      <div key={c.id} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 truncate">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                            i === 0 ? 'bg-yellow-100 text-yellow-600' :
                            i === 1 ? 'bg-gray-100 text-gray-500' :
                            i === 2 ? 'bg-orange-100 text-orange-600' :
                            'bg-gray-50 text-gray-400'
                          }`}>
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                          </div>
                          <div className="truncate">
                            <p className="text-sm font-medium text-gray-700 truncate">{c.user.phone}</p>
                            <p className="text-xs text-gray-400">{c.totalChecks} visites au total</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-orange-500">{c.checkCount}/{restaurant?.checksRequired || 10}</p>
                          <p className="text-xs text-gray-300">en cours</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CHECKINS */}
          {activePage === 'checkins' && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800">Tous les check-ins</h2>
                <p className="text-xs text-gray-400 mt-1">{data?.totalCheckins} check-ins au total</p>
              </div>
              <div className="divide-y divide-gray-50">
                {data?.recentCheckins?.map((c) => (
                  <div key={c.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors gap-2">
                    <div className="flex items-center gap-4 truncate">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span>✅</span>
                      </div>
                      <div className="truncate">
                        <p className="font-medium text-gray-800 truncate">{c.loyaltyCard.user.phone}</p>
                        <p className="text-xs text-gray-400">Progression : {c.loyaltyCard.checkCount}/{restaurant?.checksRequired || 10} visites</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm text-gray-600">
                        {new Date(c.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-xs text-gray-300">
                        {new Date(c.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CLIENTS */}
          {activePage === 'clients' && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800">Mes clients fidèles</h2>
                <p className="text-xs text-gray-400 mt-1">{data?.totalClients} clients inscrits</p>
              </div>
              <div className="divide-y divide-gray-50">
                {data?.topClients?.map((c, i) => (
                  <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors gap-4">
                    <div className="flex items-center gap-4 truncate">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${
                        i === 0 ? 'bg-yellow-100' : i === 1 ? 'bg-gray-100' : i === 2 ? 'bg-orange-100' : 'bg-gray-50'
                      }`}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                      </div>
                      <div className="truncate">
                        <p className="font-medium text-gray-800 truncate">{c.user.phone}</p>
                        <p className="text-xs text-gray-400">Client depuis le {new Date(c.createdAt).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 border-t sm:border-0 pt-2 sm:pt-0">
                      <div className="sm:text-right">
                        <p className="text-lg font-bold text-orange-500">{c.totalChecks} <span className="text-xs text-gray-400 font-normal">visites</span></p>
                      </div>
                      <div className="w-32">
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className="bg-orange-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${Math.min((c.checkCount / (restaurant?.checksRequired || 10)) * 100, 100)}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-gray-400 text-right mt-0.5">{c.checkCount}/{restaurant?.checksRequired || 10} en cours</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default DashboardPage