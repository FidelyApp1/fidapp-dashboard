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

  // Sécurité : Auto-refresh automatique toutes les 55 minutes
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
      {/* Background Grille Tech */}
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
        
        {/* Indicateur de Refresh Automatique Synchro */}
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          <span className="text-xs font-bold text-orange-700 uppercase tracking-wider">Auto-refresh Actif</span>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-xl mx-auto px-6 py-12 w-full flex-1 flex flex-col justify-center relative z-10">
        {qrData ? (
          <div className="w-full">
            
            {/* Carte Principale du QR */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/40 border border-gray-100 p-8 sm:p-10 text-center relative overflow-hidden">
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full mb-4">
                ✨ Scannez pour valider
              </span>
              <h2 className="font-black text-gray-900 text-3xl mb-2 tracking-tight">{restaurant?.name || 'Votre Commerce'}</h2>
              <p className="text-gray-500 text-sm font-medium max-w-sm mx-auto mb-8">
                Présentez votre appareil photo pour cumuler vos points sans aucune application.
              </p>

              {/* Cadre Tech QR */}
              <div className="flex justify-center mb-8">
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative group transition-all duration-300 hover:shadow-xl">
                  <img src={qrData.qrImage} alt="QR Code" className="w-64 h-64 mix-blend-multiply" />
                </div>
              </div>

              {/* Bannière Offre Bento-style */}
              <div className="bg-gray-900 text-white rounded-2xl p-5 text-center shadow-lg">
                <p className="font-bold text-base tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
                  🔥 {restaurant?.checksRequired || 10} visites = 1 repas gratuit
                </p>
                <p className="text-gray-400 text-xs mt-1 font-medium">
                  Scannez avec votre téléphone • Gratuit & sans installation
                </p>
              </div>
            </div>

            {/* Sync & Security Bar */}
            <div className="mt-5 bg-gray-50 rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between border-b border-gray-200/60 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    QR Code actif et sécurisé
                  </span>
                </div>
                {lastRefresh && (
                  <span className="text-xs text-gray-400 font-semibold">
                    Mis à jour : {lastRefresh.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                <strong className="text-gray-700 font-bold">🛡️ Sécurité Anti-Fraude :</strong> Le QR code se renouvelle automatiquement toutes les heures pour empêcher les captures d'écran et sécuriser les check-ins.
              </p>
            </div>

            {/* Bouton de rafraîchissement manuel réintégré */}
            <button
              onClick={loadQr}
              className="w-full mt-4 bg-white border border-gray-200 hover:border-gray-900 text-gray-700 hover:text-gray-900 font-bold py-3.5 rounded-xl transition-all text-sm shadow-sm active:scale-[0.99] flex items-center justify-center gap-2"
            >
              🔄 Rafraîchir manuellement
            </button>

            {/* Box d'utilisation & Guide pratique */}
            <div className="mt-4 bg-orange-50 border border-orange-100 rounded-2xl p-5">
              <h3 className="font-bold text-orange-900 text-sm mb-3 flex items-center gap-1.5">
                💡 Comment utiliser au comptoir
              </h3>
              <ul className="space-y-2 text-xs text-orange-800 font-medium list-none p-0 m-0">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 text-base leading-none">•</span>
                  <span>Affichez cette page sur une tablette ou un smartphone fixé au comptoir.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 text-base leading-none">•</span>
                  <span>Le client scanne la trame en direct — le système valide le timestamp de sécurité.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 text-base leading-none">•</span>
                  <span>Rotation automatique : L'app gère la sécurité des jetons en arrière-plan.</span>
                </li>
              </ul>
            </div>

          </div>
        ) : (
          /* État Vide (Aucun QR généré) */
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-10 text-center">
            <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
              🔲
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-1">Aucun QR code généré</h3>
            <p className="text-gray-400 text-sm font-medium mb-6">Initialisez le flux de sécurité de votre établissement.</p>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white font-bold px-8 py-4 rounded-xl transition-all text-sm shadow-lg active:scale-[0.98]"
            >
              {generating ? 'Génération du flux...' : '+ Générer mon QR Code Actif'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default QrCodePage