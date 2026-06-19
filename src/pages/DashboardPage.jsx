import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getStats, getMe } from '../api/client'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useState, useEffect, useMemo } from 'react'
import Logo from '../assets/logo.jsx'

const DashboardPage = () => {
  const { restaurant, logout } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activePage, setActivePage] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // 📥 États de recherche
  const [searchCheckins, setSearchCheckins] = useState('')
  const [searchClients, setSearchClients] = useState('')

  // ⚙️ États pour le formulaire Settings
  const [settingsForm, setSettingsForm] = useState(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // 1️⃣ Récupération du profil frais
  const { data: meData } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    refetchInterval: 30000,
    onSuccess: (data) => {
      if (data?.restaurant && !settingsForm) {
       setSettingsForm({
  name: data.restaurant.name || '',
  phone: data.restaurant.phone || '',
  address: data.restaurant.address || '',
  sector: data.restaurant.sector || 'restaurant',
  checksRequired: data.restaurant.checksRequired || 10,
  rewardTitle: data.restaurant.rewardTitle || '',
  rewardDesc: data.restaurant.rewardDesc || '',
  rewardEmoji: data.restaurant.rewardEmoji || '🎁',
  scanDelayHours: data.restaurant.scanDelayHours || 6, // ⏱️ Nouvelle propriété !
})
      }
    }
  })

  // 2️⃣ Récupération des statistiques générales
  const { data, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: getStats,
    refetchInterval: 30000
  })

  // 3️⃣ Mutation pour sauvegarder les réglages
  const mutation = useMutation({
    mutationFn: async (formData) => {
      const token = localStorage.getItem('fidapp_token')
      const response = await fetch('https://fidapp-backend-production.up.railway.app/api/auth/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })
      if (!response.ok) throw new Error('Erreur lors de la sauvegarde')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }
  })

  // Initialisation du formulaire si meData arrive plus tard
  if (meData?.restaurant && !settingsForm) {
    setSettingsForm({
      name: meData.restaurant.name || '',
      phone: meData.restaurant.phone || '',
      address: meData.restaurant.address || '',
      sector: meData.restaurant.sector || 'restaurant',
      checksRequired: meData.restaurant.checksRequired || 10,
      rewardTitle: meData.restaurant.rewardTitle || '',
      rewardDesc: meData.restaurant.rewardDesc || '',
      rewardEmoji: meData.restaurant.rewardEmoji || '🎁',
    })
  }

  // Interception de sécurité : Si le compte est suspendu
  if (meData?.restaurant?.suspended) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-red-100 p-8 max-w-sm w-full text-center transform transition-all hover:scale-105">
          <p className="text-7xl mb-4 animate-bounce">🚫</p>
          <h1 className="text-2xl font-black text-red-600 tracking-tight">Compte restreint</h1>
          <p className="text-gray-500 mt-3 text-sm leading-relaxed">
            L'accès à votre espace FidApp a été temporairement suspendu par notre équipe technique.
          </p>
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-4">
            <span className="text-orange-500 font-bold text-lg tracking-wide bg-orange-50 py-2 rounded-xl">fidapp.ma</span>
            <button 
              onClick={logout}
              className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-wider"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    )
  }

  const checksRequired = meData?.restaurant?.checksRequired || restaurant?.checksRequired || 10

  // Fix 5 — Safari date bug
  const chartData = data?.dailyData
    ? Object.entries(data.dailyData).map(([date, count]) => ({
        day: new Date(date.replace(/-/g, '/')).toLocaleDateString('fr-FR', { weekday: 'short' }),
        checkins: count
      }))
    : []

  const navItems = [
    { id: 'overview', label: 'Vue générale', icon: '📊' },
    { id: 'checkins', label: 'Check-ins', icon: '✅' },
    { id: 'clients', label: 'Mes Clients', icon: '👥' },
    { id: 'settings', label: 'Configuration', icon: '⚙️' },
    { id: 'qrcode', label: 'Mon QR Code', icon: '🔲' },
  ]

  const handleSettingsSubmit = (e) => {
    e.preventDefault()
    mutation.mutate(settingsForm)
  }

  // Fix 2 — useMemo pour les filtres
  const filteredCheckins = useMemo(() => {
    return data?.recentCheckins?.filter(c =>
      c.loyaltyCard.user.phone.includes(searchCheckins) ||
      (c.loyaltyCard.user.name && c.loyaltyCard.user.name.toLowerCase().includes(searchCheckins.toLowerCase()))
    ) || []
  }, [data?.recentCheckins, searchCheckins])

  const filteredClients = useMemo(() => {
    return data?.topClients?.filter(c =>
      c.user.phone.includes(searchClients) ||
      (c.user.name && c.user.name.toLowerCase().includes(searchClients.toLowerCase()))
    ) || []
  }, [data?.topClients, searchClients])

  return (
    <div className="min-h-screen bg-slate-50/50 flex font-sans text-slate-800 antialiased">
      
      {/* 📱 Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300" onClick={() => setSidebarOpen(false)} />
      )}

      {/* 🧭 Sidebar Glassmorphism Design */}
      <aside className={`w-64 bg-white/90 backdrop-blur-md border-r border-slate-100 flex flex-col fixed h-full z-50 transition-transform duration-300 ease-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
  {/* 🛠️ Header de la sidebar mis à jour avec ton composant Logo */}
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <Logo size={36} />
            </div>
            <div>
              <p className="font-black text-slate-900 tracking-tight text-base">fid<span className="text-orange-500">app</span></p>
              <p className="text-xs font-semibold text-orange-500/80 uppercase tracking-widest">Business</p>
            </div>
          </div>
          {/* Fix 4 : Bouton de fermeture sur mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Info Resto avec le type de Reward actif */}
        <div className="p-4">
          <div className="bg-gradient-to-r from-slate-50 to-orange-50/30 rounded-2xl p-4 border border-slate-100">
            <p className="font-bold text-slate-800 text-sm truncate">{meData?.restaurant?.name || restaurant?.name}</p>
            <p className="text-xs text-slate-400 mt-0.5 truncate">{meData?.restaurant?.email || restaurant?.email}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 bg-white border border-orange-100 px-2 py-1 rounded-lg shadow-sm">
              <span className="text-xs">{meData?.restaurant?.rewardEmoji || '🎁'}</span>
              <span className="text-[11px] font-medium text-slate-600 truncate max-w-[120px]">{meData?.restaurant?.rewardTitle || 'Cadeau'}</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setSidebarOpen(false)
                if (item.id === 'qrcode') {
                  navigate('/qrcode')
                } else {
                  setActivePage(item.id)
                }
              }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-3 group ${
                activePage === item.id
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/10'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className={`text-lg transition-transform duration-200 ${activePage !== item.id && 'group-hover:scale-120'}`}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-50">
          <button
            onClick={logout}
            className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-red-500 hover:bg-red-50/50 transition-all flex items-center gap-2"
          >
            <span>🚪</span> Déconnexion
          </button>
        </div>
      </aside>

      {/* 💻 Main Content Container */}
      <main className="flex-1 lg:ml-64 min-w-0 transition-all duration-300">
        
        {/* 📋 Header Pro */}
        <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 border border-slate-100 active:scale-95 transition-transform"
            >
              ☰
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                {activePage === 'overview' && 'Tableau de bord'}
                {activePage === 'checkins' && 'Flux de Check-ins'}
                {activePage === 'clients' && 'Base Clients'}
                {activePage === 'settings' && 'Configuration Fidélité'}
              </h1>
              <p className="text-xs font-medium text-slate-400 mt-0.5 capitalize">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[11px] font-bold text-emerald-700 tracking-wider uppercase">Live</span>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          
          {/* 📊 OVERVIEW PAGE */}
          {activePage === 'overview' && (
            <div className="space-y-8">
              {/* Cards Premium */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { label: 'Clients fidèles', value: data?.totalClients ?? '—', icon: '👥', grad: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/5', text: 'text-blue-600', trend: 'Inscrits' },
                  { label: 'Check-ins total', value: data?.totalCheckins ?? '—', icon: '✨', grad: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-500/5', text: 'text-emerald-600', trend: 'Scans validés' },
                  { label: 'Visites ce mois', value: data?.checkinsThisMonth ?? '—', icon: '📅', grad: 'from-purple-500 to-indigo-500', bg: 'bg-purple-500/5', text: 'text-purple-600', trend: 'Mois en cours' },
                  { label: 'Rewards émis', value: data?.totalRewards ?? '—', icon: meData?.restaurant?.rewardEmoji || '🎁', grad: 'from-orange-500 to-amber-500', bg: 'bg-orange-500/5', text: 'text-orange-600', trend: meData?.restaurant?.rewardTitle || 'Offerts' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-200">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl opacity-5 rounded-bl-full group-hover:scale-110 transition-transform duration-300" />
                    <div className={`w-11 h-11 rounded-2xl ${stat.bg} flex items-center justify-center mb-4`}>
                      <span className="text-xl">{stat.icon}</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900 tracking-tight">{isLoading ? '...' : stat.value}</p>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{stat.label}</p>
                    <p className={`text-xs font-semibold ${stat.text} mt-2 bg-slate-50 inline-block px-2 py-0.5 rounded-md`}>{stat.trend}</p>
                  </div>
                ))}
              </div>

              {/* Chart Premium */}
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-bold text-slate-900 text-base">Activité des 7 derniers jours</h2>
                    <p className="text-xs font-medium text-slate-400 mt-0.5">Volume des scans de cartes fidélité</p>
                  </div>
                  <div className="bg-orange-50 text-orange-600 text-xs font-bold px-3 py-1.5 rounded-xl border border-orange-100">
                    7 jours glissants
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCheckins" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(4px)', border: '1px solid #f1f5f9', borderRadius: '16px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
                      formatter={(value) => [`${value} check-ins`, '']}
                    />
                    <Area type="monotone" dataKey="checkins" stroke="#f97316" strokeWidth={3} fill="url(#colorCheckins)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Grille Activités + Tops */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                  <h2 className="font-bold text-slate-900 mb-4 text-base flex items-center gap-2">⚡ Récents scans</h2>
                  <div className="space-y-3.5">
                    {isLoading ? (
                      <p className="text-slate-300 text-sm text-center py-4">Chargement...</p>
                    ) : data?.recentCheckins?.length === 0 ? (
                      <p className="text-slate-400 text-sm text-center py-4">Aucune activité récente</p>
                    ) : data?.recentCheckins?.slice(0, 5).map((c) => (
                      <div key={c.id} className="flex items-center justify-between gap-2 p-2 hover:bg-slate-50 rounded-2xl transition-colors">
                        <div className="flex items-center gap-3 truncate">
                          <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-sm text-slate-600">👤</div>
                          <div className="truncate">
                            <p className="text-sm font-bold text-slate-800 truncate">
                              {c.loyaltyCard.user.name ? `${c.loyaltyCard.user.name}` : c.loyaltyCard.user.phone}
                            </p>
                            <p className="text-xs font-semibold text-slate-400">{c.loyaltyCard.checkCount}/{checksRequired} tampons</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                          {new Date(c.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                  <h2 className="font-bold text-slate-900 mb-4 text-base flex items-center gap-2">🏆 Top ambassadeurs</h2>
                  <div className="space-y-3.5">
                    {isLoading ? (
                      <p className="text-slate-300 text-sm text-center py-4">Chargement...</p>
                    ) : data?.topClients?.length === 0 ? (
                      <p className="text-slate-400 text-sm text-center py-4">Aucun client pour le moment</p>
                    ) : data?.topClients?.slice(0, 5).map((c, i) => (
                      <div key={c.id} className="flex items-center justify-between gap-2 p-2 hover:bg-slate-50 rounded-2xl transition-colors">
                        <div className="flex items-center gap-3 truncate">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${
                            i === 0 ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                            i === 1 ? 'bg-slate-100 text-slate-500' :
                            'bg-orange-50 text-orange-600'
                          }`}>
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                          </div>
                          <div className="truncate">
                            <p className="text-sm font-bold text-slate-800 truncate">
                              {c.user.name ? `${c.user.name}` : c.user.phone}
                            </p>
                            <p className="text-xs font-semibold text-slate-400">{c.totalChecks} visites cumulées</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-orange-500">{c.checkCount}/{checksRequired}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actuel</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ✅ CHECKINS PAGE */}
          {activePage === 'checkins' && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-bold text-slate-900 text-base">Historique des flux</h2>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">{data?.totalCheckins} entrées au total</p>
                </div>
                <div className="relative">
                  <input
                    value={searchCheckins}
                    onChange={(e) => setSearchCheckins(e.target.value)}
                    placeholder="Rechercher un client..."
                    className="w-full sm:w-64 pl-4 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:border-orange-400 focus:bg-white transition-all"
                  />
                </div>
              </div>
              <div className="divide-y divide-slate-50">
                {filteredCheckins.map((c) => (
                  <div key={c.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-bold">
                        ✓
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">
                          {c.loyaltyCard.user.name ? `${c.loyaltyCard.user.name} • ` : ''}{c.loyaltyCard.user.phone}
                        </p>
                        <p className="text-xs font-medium text-slate-400 mt-0.5">Progression carte : <span className="text-orange-500 font-bold">{c.loyaltyCard.checkCount}/{checksRequired}</span></p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-700">{new Date(c.createdAt).toLocaleDateString('fr-FR')}</p>
                      <p className="text-xs font-semibold text-slate-400 mt-0.5">{new Date(c.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))}
                {/* Fix 3 — Message "aucun résultat" checkins */}
                {filteredCheckins.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-2xl mb-2">🔍</p>
                    <p className="text-slate-400 text-sm font-medium">Aucun check-in ne correspond à votre recherche</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 👥 CLIENTS PAGE */}
          {activePage === 'clients' && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-bold text-slate-900 text-base">Membres du programme</h2>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">{data?.totalClients} fiches actives</p>
                </div>
                <input
                  value={searchClients}
                  onChange={(e) => setSearchClients(e.target.value)}
                  placeholder="Nom ou téléphone..."
                  className="w-full sm:w-64 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:border-orange-400 focus:bg-white transition-all"
                />
              </div>
              <div className="divide-y divide-slate-50">
                {filteredClients.map((c, i) => (
                  <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 hover:bg-slate-50/50 gap-4 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-50 border border-slate-100 font-bold rounded-xl flex items-center justify-center text-slate-500">
                        #{i + 1}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">
                          {c.user.name ? `${c.user.name}` : 'Client Anonyme'}
                        </p>
                        <p className="text-xs font-semibold text-slate-400 mt-0.5">{c.user.phone}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 justify-between sm:justify-end">
                      <div className="text-left sm:text-right">
                        <p className="text-base font-black text-slate-800">{c.totalChecks}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scans totaux</p>
                      </div>
                      <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden relative">
                        <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all" style={{ width: `${Math.min((c.checkCount / checksRequired) * 100, 100)}%` }} />
                      </div>
                      <div className="text-right min-w-[55px]">
                        <p className="text-xs font-bold text-slate-700">{c.checkCount}/{checksRequired}</p>
                        <p className="text-[10px] font-medium text-orange-400">en cours</p>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Fix 3 — Message "aucun résultat" clients */}
                {filteredClients.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-2xl mb-2">🔍</p>
                    <p className="text-slate-400 text-sm font-medium">Aucun client ne correspond à votre recherche</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ⚙️ SETTINGS PAGE */}
          {activePage === 'settings' && settingsForm && (
            <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                <div>
                  <h2 className="font-bold text-slate-900 text-base">Configuration Fidélité & Profil</h2>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">Ajustez vos règles métiers et votre offre de récompense</p>
                </div>
                {saveSuccess && (
                  <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-bold px-3 py-1.5 rounded-xl animate-fade-in">
                    ✓ Sauvegardé
                  </span>
                )}
              </div>

              <form onSubmit={handleSettingsSubmit} className="p-6 space-y-6">
                
                {/* Section 1 : Règles de fidélité */}
                <div>
                  <h3 className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4">🎁 Paramètres de la Récompense</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Emoji d'activation</label>
                      <input 
                        type="text" 
                        maxLength={2}
                        value={settingsForm.rewardEmoji}
                        onChange={(e) => setSettingsForm({...settingsForm, rewardEmoji: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-center text-lg focus:outline-none focus:border-orange-400 focus:bg-white transition-all"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Titre du cadeau (ex: Repas Offert)</label>
                      <input 
                        type="text" 
                        required
                        value={settingsForm.rewardTitle}
                        onChange={(e) => setSettingsForm({...settingsForm, rewardTitle: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:border-orange-400 focus:bg-white transition-all"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Description complète</label>
                      <input 
                        type="text" 
                        required
                        value={settingsForm.rewardDesc}
                        onChange={(e) => setSettingsForm({...settingsForm, rewardDesc: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:border-orange-400 focus:bg-white transition-all"
                      />
                    </div>
                 <div>
      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
        Délai entre 2 scans (Heures)
      </label>
      <input 
        type="number" 
        min={0} 
        max={72}
        required
        value={settingsForm.scanDelayHours}
        onChange={(e) => setSettingsForm({...settingsForm, scanDelayHours: parseInt(e.target.value) || 0})}
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-orange-400 focus:bg-white transition-all"
      />
    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Section 2 : Infos Etablissement */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">🏢 Informations de l'Établissement</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nom du commerce</label>
                      <input 
                        type="text" 
                        required
                        value={settingsForm.name}
                        onChange={(e) => setSettingsForm({...settingsForm, name: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:border-orange-400 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Secteur d'activité</label>
                      <select 
                        value={settingsForm.sector}
                        onChange={(e) => setSettingsForm({...settingsForm, sector: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:border-orange-400 focus:bg-white transition-all"
                      >
                        <option value="restaurant">🍴 Restaurant / Fast Food</option>
                        <option value="cafe">☕ Café / Salon de thé</option>
                        <option value="boulangerie">🥖 Boulangerie / Pâtisserie</option>
                        <option value="beaute">💅 Beauté / Coiffeur</option>
                        <option value="autre">📦 Autre commerce</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Téléphone professionnel</label>
                      <input 
                        type="text" 
                        value={settingsForm.phone}
                        onChange={(e) => setSettingsForm({...settingsForm, phone: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:border-orange-400 focus:bg-white transition-all"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Adresse physique</label>
                      <input 
                        type="text" 
                        value={settingsForm.address}
                        onChange={(e) => setSettingsForm({...settingsForm, address: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:border-orange-400 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Bouton de soumission du formulaire */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-orange-500/20 hover:opacity-95 transition-all disabled:opacity-50"
                  >
                    {mutation.isPending ? 'Enregistrement en cours...' : 'Sauvegarder les modifications'}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}

export default DashboardPage
