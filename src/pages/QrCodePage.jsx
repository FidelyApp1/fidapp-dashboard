import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyQrCodes, generateQrCode } from '../api/client'
import { useAuth } from '../context/AuthContext'

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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-gray-600 text-sm">
          ← Retour
        </button>
        <h1 className="font-semibold text-gray-800">QR Code</h1>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-400">Auto-refresh</span>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-8">
        {qrData ? (
          <>
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 text-center mb-4">
              <div className="mb-4">
                <p className="font-bold text-gray-800 text-xl">{restaurant?.name}</p>
                <p className="text-gray-400 text-sm mt-1">Scannez pour gagner des points 🎁</p>
              </div>

              <div className="flex justify-center mb-6">
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <img src={qrData.qrImage} alt="QR Code" className="w-64 h-64" />
                </div>
              </div>

              <div className="bg-orange-50 rounded-2xl p-4">
                <p className="text-orange-600 font-semibold text-sm">
                  🎁 {restaurant?.checksRequired || 10} visites = 1 repas gratuit
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Scannez avec votre téléphone • Gratuit & sans installation
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600 font-medium">QR Code actif et sécurisé</span>
                </div>
                {lastRefresh && (
                  <span className="text-xs text-gray-300">
                    Mis à jour à {lastRefresh.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Le QR code se renouvelle automatiquement toutes les heures pour sécuriser les check-ins.
              </p>
            </div>

            <button
              onClick={loadQr}
              className="w-full border border-orange-200 text-orange-500 hover:bg-orange-50 font-semibold py-3 rounded-xl transition-all text-sm"
            >
              🔄 Rafraîchir manuellement
            </button>
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-4xl mb-4">🔲</p>
            <p className="text-gray-500 mb-6">Aucun QR code généré</p>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold px-8 py-3 rounded-xl transition-all"
            >
              {generating ? 'Génération...' : '+ Générer mon QR Code'}
            </button>
          </div>
        )}

        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <h3 className="font-semibold text-blue-800 text-sm mb-2">💡 Comment utiliser</h3>
          <div className="space-y-1">
            <p className="text-blue-600 text-xs">• Affichez cette page sur une tablette ou un écran au comptoir</p>
            <p className="text-blue-600 text-xs">• Le client scanne avec son téléphone — zéro installation</p>
            <p className="text-blue-600 text-xs">• Le QR se renouvelle automatiquement — pas besoin de rien faire</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QrCodePage