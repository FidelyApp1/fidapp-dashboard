import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateQrCode, getMyQrCodes } from '../api/client'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'

const QrCodePage = () => {
  const navigate = useNavigate()
  const { restaurant } = useAuth() // 🔑 Récupération du restaurant depuis le contexte Auth
  const [generating, setGenerating] = useState(false)

  const { data, refetch } = useQuery({
    queryKey: ['qrcodes'],
    queryFn: getMyQrCodes
  })

  // 🖨️ Fonction handlePrint utilisant le contexte du restaurant
  const handlePrint = (qr) => {
    const win = window.open('', '_blank')
    win.document.write(`
      <html>
        <head>
          <title>QR Code - FidApp</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
               font-family: 'Helvetica Neue', sans-serif; 
               display: flex; 
               align-items: center; 
               justify-content: center; 
               min-height: 100vh; 
               background: #fff;
            }
            .card { 
               width: 380px;
               border-radius: 24px; 
               padding: 40px 32px; 
               text-align: center;
               border: 2px solid #f97316;
               position: relative;
               overflow: hidden;
            }
            .top-bar {
              background: #f97316;
              position: absolute;
              top: 0; left: 0; right: 0;
              height: 8px;
            }
            .logo-wrap {
              width: 64px;
              height: 64px;
              background: #f97316;
              border-radius: 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 16px;
              font-size: 32px;
            }
            h1 { 
               color: #1a1a1a; 
               font-size: 28px; 
               font-weight: 800;
               letter-spacing: -0.5px;
               margin-bottom: 4px;
            }
            .tagline {
              color: #f97316;
              font-size: 13px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 24px;
            }
            .qr-wrap {
              background: #fff;
              border: 2px solid #f1f1f1;
              border-radius: 16px;
              padding: 16px;
              display: inline-block;
              margin-bottom: 24px;
            }
            img { 
               width: 240px; 
               height: 240px; 
               display: block;
            }
            .steps {
              background: #fff7ed;
              border-radius: 12px;
              padding: 16px;
              margin-bottom: 20px;
              text-align: left;
            }
            .step {
              display: flex;
              align-items: center;
              gap: 10px;
              margin-bottom: 8px;
              font-size: 13px;
              color: #374151;
            }
            .step:last-child { margin-bottom: 0; }
            .step-num {
              width: 22px;
              height: 22px;
              background: #f97316;
              color: white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 11px;
              font-weight: 700;
              flex-shrink: 0;
            }
            .reward-badge {
              background: #f97316;
              color: white;
              border-radius: 99px;
              padding: 8px 20px;
              font-size: 13px;
              font-weight: 700;
              display: inline-block;
              margin-bottom: 16px;
            }
            .footer { 
               font-size: 11px; 
               color: #9ca3af;
            }
            .footer strong { color: #f97316; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="top-bar"></div>
            <div class="logo-wrap">🃏</div>
            <h1>FidApp</h1>
            <p class="tagline">Carte de fidélité digitale</p>
            
            <div class="qr-wrap">
              <img src="${qr.qrImage}" />
            </div>
            <div class="reward-badge">
              🎁 ${restaurant?.checksRequired || 10} visites = 1 repas gratuit
            </div>
            <div class="steps">
              <div class="step">
                <div class="step-num">1</div>
                <span>Scannez ce QR code avec votre téléphone</span>
              </div>
              <div class="step">
                <div class="step-num">2</div>
                <span>Entrez votre numéro de téléphone</span>
              </div>
              <div class="step">
                <div class="step-num">3</div>
                <span>Accumulez des points à chaque visite</span>
              </div>
            </div>
            <div class="footer">
              Powered by <strong>FidApp.ma</strong> • Sécurisé & gratuit pour vous
            </div>
          </div>
          <script>window.onload = () => window.print()</script>
        </body>
      </html>
    `)
    win.document.close()
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      await generateQrCode()
      refetch()
    } catch (err) {
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-gray-400 hover:text-gray-600 text-sm"
        >
          ← Retour
        </button>
        <h1 className="font-semibold text-gray-800">Mes QR Codes</h1>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-50 p-6 mb-6">
          <h2 className="font-semibold text-gray-700 mb-1">Générer un QR Code</h2>
          <p className="text-gray-400 text-sm mb-4">
            Placez-le sur vos tables ou au comptoir pour que vos clients scannent
          </p>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold px-6 py-3 rounded-xl transition-all"
          >
            {generating ? 'Génération...' : '+ Nouveau QR Code'}
          </button>
        </div>

        <div className="space-y-6">
          {data?.qrCodes?.map((qr) => (
            <div key={qr.id} className="bg-white rounded-2xl shadow-sm border border-gray-50 p-6">
              <div className="flex items-start gap-6">
                <div className="bg-gray-50 rounded-2xl p-3 flex-shrink-0">
                  <img
                    src={qr.qrImage}
                    alt="QR Code"
                    className="w-36 h-36"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-green-100 text-green-600 text-xs px-3 py-1 rounded-full font-medium">
                      Actif
                    </span>
                    <span className="text-xs text-gray-300">
                      {new Date(qr.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2 mb-4">
                    <p className="font-mono text-xs text-gray-400 break-all">{qr.code}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePrint(qr)}
                      className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all"
                    >
                      Imprimer
                    </button>
                    
                    <a
                      href={qr.scanUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="border border-orange-200 text-orange-500 hover:bg-orange-50 text-sm font-medium px-4 py-2 rounded-xl transition-all inline-block text-center"
                    >
                      Tester
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default QrCodePage