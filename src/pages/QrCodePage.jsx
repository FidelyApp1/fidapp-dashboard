import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateQrCode, getMyQrCodes } from '../api/client'
import { useQuery } from '@tanstack/react-query'

const QrCodePage = () => {
  const navigate = useNavigate()
  const [generating, setGenerating] = useState(false)

  const { data, refetch } = useQuery({
    queryKey: ['qrcodes'],
    queryFn: getMyQrCodes
  })

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

  const handlePrint = (qr) => {
    const win = window.open('', '_blank')
    win.document.write(`
      <html>
        <head>
          <title>QR Code - FidApp</title>
          <style>
            body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #fff; }
            .card { border: 2px solid #f97316; border-radius: 24px; padding: 40px; text-align: center; max-width: 400px; }
            h1 { color: #f97316; font-size: 28px; margin-bottom: 4px; }
            p { color: #9ca3af; font-size: 14px; margin-bottom: 24px; }
            img { width: 280px; height: 280px; }
            .footer { margin-top: 20px; font-size: 12px; color: #d1d5db; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>🃏 FidApp</h1>
            <p>Scannez pour gagner des récompenses</p>
            <img id="qr-img" src="${qr.qrImage}" />
            <div class="footer">Sécurisé par FidApp • Maroc</div>
          </div>
          <script>
            // Attend que l'image soit bien chargée avant de lancer l'impression
            document.getElementById('qr-img').onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `)
    win.document.close()
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
                    
                    {/* CORRECTION ICI : Rétablissement de la balise ouvrante <a> */}
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