import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyQrCodes, generateQrCode } from '../api/client'
import { useAuth } from '../context/AuthContext'
import Logo from '../assets/logo.jsx'

const QrCodePage = () => {
  const navigate = useNavigate()
  const { restaurant } = useAuth()
  const [qrData, setQrData] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(null)

  const loadQr = useCallback(async () => {
    try {
      const data = await getMyQrCodes()
      if (data.qrCodes.length > 0) {
        setQrData(data.qrCodes[0])
        setLastRefresh(new Date())
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    loadQr()
    const refreshInterval = setInterval(loadQr, 55 * 60 * 1000)
    return () => clearInterval(refreshInterval)
  }, [loadQr])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      await generateQrCode()
      await loadQr()
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col relative overflow-hidden">
      {/* Background sync */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

      {/* Navbar pro épurée style top bar */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all text-sm font-bold"
          >
            ←
          </button>
          <div className="flex items-center gap-2">
            <Logo size={24} />
            <span className="font-black text-sm tracking-tight text-gray-900">fid<span className="text-orange-500">app</span></span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          <span className="text-xs font-bold text-orange-700 uppercase tracking-wider">Comptoir Actif</span>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-xl mx-auto px-6 py-12 w-full flex-1 flex flex-col justify-center relative z-10">
        {qrData ? (
          <div className="animate-fade-in-up">
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/40 border border-gray-100 p-8 sm:p-10 text-center mb-6 relative overflow-hidden">
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full mb-4">
                ✨ Scannez pour valider
              </span>
              <h2 className="font-black text-gray-900 text-3xl mb-2 tracking-tight">{restaurant?.name || 'Votre Commerce'}</h2>
              <p className="text-gray-500 text-sm font-medium max-w-sm mx-auto mb-8">
                Présentez votre appareil photo pour cumuler vos points sans aucune application.
              </p>

              {/* QR Cadre Tech */}
              <div className="flex justify-center mb-8">
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative group transition-all duration-300 hover:shadow-xl">
                  <img src={qrData.qrImage} alt="QR Code Rotatif" className="w-64 h-64 mix-blend-multiply" />
                </div>
              </div>

              {/* Offre - Reprise du composant noir asymétrique de la landing */}
              <div className="bg-gray-900 text-white rounded-2xl p-5 text-center shadow-lg">
                <p className="font-bold text-base tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
                  🔥 {restaurant?.checksRequired || 10} visites = 1 cadeau ou repas offert !
                </p>
              </div>
            </div>

            {/* Sync bar */}
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 flex items-center justify-between text-xs text-gray-400 font-medium">
              <span className="flex items-center gap-2">🛡️ Sécurité Anti-Fraude Active</span>
              {lastRefresh && (
                <span>MàJ : {lastRefresh.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-10 text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Aucun QR généré</h3>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="bg-gray-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-gray-800 transition-all text-sm"
            >
              {generating ? 'Création...' : 'Générer le QR Code Actif'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default QrCodePage