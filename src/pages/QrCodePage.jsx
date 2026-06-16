import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateQrCode, getMyQrCodes } from '../api/client'
import { useAuth } from '../context/AuthContext'

const QrCodePage = () => {
  const navigate = useNavigate()
  const { restaurant } = useAuth()
  const [qrData, setQrData] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [timeLeft, setTimeLeft] = useState(3300) // Valeur par défaut (55 min)

  // 1️⃣ Génération d'un nouveau QR Code
  const handleGenerate = useCallback(async () => {
    setGenerating(true)
    try {
      await generateQrCode()
      const data = await getMyQrCodes()
      if (data?.qrCodes && data.qrCodes.length > 0) {
        setQrData(data.qrCodes[0])
      }
    } catch (err) {
      console.error("Erreur lors de la génération du QR Code :", err)
    } finally {
      setGenerating(false)
    }
  }, [])

  // 2️⃣ Chargement du QR Code existant ou déclenchement asynchrone de la génération
  const loadQr = useCallback(async () => {
    try {
      const data = await getMyQrCodes()
      if (data?.qrCodes && data.qrCodes.length > 0) {
        setQrData(data.qrCodes[0])
      } else {
        // Force React à finir son rendu actuel avant de déclencher la génération
        Promise.resolve().then(() => {
          handleGenerate()
        })
      }
    } catch (err) {
      console.error("Erreur lors du chargement du QR Code :", err)
    }
  }, [handleGenerate])

  // 3️⃣ Premier chargement et rafraîchissement global toutes les 55 minutes
  useEffect(() => {
    loadQr()
    const refreshInterval = setInterval(loadQr, 55 * 60 * 1000)
    return () => clearInterval(refreshInterval)
  }, [loadQr])

  // 4️⃣ Synchronisation du compte à rebours basé sur l'expiration du JWT
  useEffect(() => {
    if (!qrData?.code) return

    try {
      // Décodage de la charge utile du JWT (payload)
      const token = qrData.code
      const payload = JSON.parse(atob(token.split('.')[1]))
      const expiresAt = payload.exp * 1000

      const updateTimer = () => {
        const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
        setTimeLeft(remaining)
        
        if (remaining === 0) {
          loadQr()
        }
      }

      updateTimer() // Exécution immédiate pour éviter le saut d'affichage
      const timer = setInterval(updateTimer, 1000)
      
      return () => clearInterval(timer)
    } catch (error) {
      console.error("Erreur lors du décodage du token JWT :", error)
      setTimeLeft(3300) // Repli de secours sur 55 min
    }
  }, [qrData, loadQr])

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handlePrint = () => {
    if (!qrData) return
    const win = window.open('', '_blank')
    win.document.write(`
      <html>
        <head>
          <title>QR Code - FidApp</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Helvetica Neue', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #fff; }
            .card { width: 380px; border-radius: 24px; padding: 40px 32px; text-align: center; border: 2px solid #f97316; position: relative; overflow: hidden; }
            .top-bar { background: #f97316; position: absolute; top: 0; left: 0; right: 0; height: 8px; }
            .logo-wrap { width: 64px; height: 64px; background: #f97316; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 32px; }
            h1 { color: #1a1a1a; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 4px; }
            .tagline { color: #f97316; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 24px; }
            .qr-wrap { background: #fff; border: 2px solid #f1f1f1; border-radius: 16px; padding: 16px; display: inline-block; margin-bottom: 24px; }
            img { width: 240px; height: 240px; display: block; }
            .steps { background: #fff7ed; border-radius: 12px; padding: 16px; margin-bottom: 20px; text-align: left; }
            .step { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-size: 13px; color: #374151; }
            .step:last-child { margin-bottom: 0; }
            .step-num { width: 22px; height: 22px; background: #f97316; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
            .reward-badge { background: #f97316; color: white; border-radius: 99px; padding: 8px 20px; font-size: 13px; font-weight: 700; display: inline-block; margin-bottom: 16px; }
            .footer { font-size: 11px; color: #9ca3af; }
            .footer strong { color: #f97316; }
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="top-bar"></div>
            <div class="logo-wrap">🃏</div>
            <h1>FidApp</h1>
            <p class="tagline">Carte de fidélité digitale</p>
            <div class="qr-wrap"><img src="${qrData.qrImage}" /></div>
            <div class="reward-badge">🎁 ${restaurant?.checksRequired || 10} visites = 1 repas gratuit</div>
            <div class="steps">
              <div class="step"><div class="step-num">1</div><span>Scannez ce QR code avec votre téléphone</span></div>
              <div class="step"><div class="step-num">2</div><span>Entrez votre numéro de téléphone</span></div>
              <div class="step"><div class="step-num">3</div><span>Accumulez des points à chaque visite</span></div>
            </div>
            <div class="footer">Powered by <strong>FidApp.ma</strong> • Sécurisé & gratuit pour vous</div>
          </div>
          <script>window.onload = () => window.print()</script>
        </body>
      </html>
    `)
    win.document.close()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-gray-600 text-sm">
          ← Retour
        </button>
        <h1 className="font-semibold text-gray-800">QR Code Rotatif</h1>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-8">
        {qrData ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-gray-800">QR Code actif</h2>
                <p className="text-xs text-gray-400 mt-1">Se renouvelle automatiquement</p>
              </div>
              <div className="text-center bg-orange-50 px-4 py-2 rounded-xl">
                <p className="text-xs text-gray-400">Expire dans</p>
                <p className={`text-xl font-bold ${timeLeft < 300 ? 'text-red-500' : 'text-orange-500'}`}>
                  {formatTime(timeLeft)}
                </p>
              </div>
            </div>

            <div className="flex justify-center mb-6">
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <img src={qrData.qrImage} alt="QR Code" className="w-56 h-56" />
              </div>
            </div>

            {timeLeft < 300 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-center">
                <p className="text-red-500 text-sm font-medium">⚠️ QR code bientôt expiré — se renouvelle automatiquement</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-all"
              >
                Imprimer
              </button>
              <button
                onClick={loadQr}
                disabled={generating}
                className="border border-orange-200 text-orange-500 hover:bg-orange-50 font-semibold px-4 py-3 rounded-xl transition-all"
              >
                {generating ? 'Génération...' : 'Rafraîchir'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 text-center">
            <p className="text-gray-400 mb-4">Aucun QR code généré</p>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl"
            >
              {generating ? 'Génération...' : '+ Générer mon QR Code'}
            </button>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <h3 className="font-semibold text-blue-800 text-sm mb-2">🔒 Comment ça marche ?</h3>
          <p className="text-blue-600 text-xs leading-relaxed">
            Le QR code change automatiquement toutes les 55 minutes. Si un client prend une photo et essaie de l'utiliser plus tard depuis chez lui, le code sera expiré et le check-in sera refusé.
          </p>
        </div>
      </div>
    </div>
  )
}

export default QrCodePage