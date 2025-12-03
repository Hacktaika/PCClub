import { memo } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { motion } from 'framer-motion'
import useStore from '../store/useStore'

const QRCode = memo(() => {
  const { user } = useStore()
  
  // Генерируем уникальный ID для QR кода
  const qrData = JSON.stringify({
    userId: user.id || 'guest',
    name: user.name,
    timestamp: Date.now(),
  })

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-2xl font-bold gradient-text-green mb-2">Мой QR-код</h1>
          <p className="text-gray-400 text-sm">
            Используй для входа, заказа еды и других действий в клубе
          </p>
        </motion.div>

        {/* QR Code Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-strong rounded-cyber-lg p-8 flex flex-col items-center"
        >
          <div className="glass rounded-ios-xl p-4 mb-4 bg-white">
            <QRCodeSVG
              value={qrData}
              size={200}
              level="H"
              includeMargin={true}
              fgColor="#050815"
              bgColor="#ffffff"
            />
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-white mb-1">{user.name}</div>
            <div className="text-sm text-gray-400">ID: {user.id || 'Guest'}</div>
          </div>
        </motion.div>

        {/* Usage Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-ios-lg p-4 space-y-3"
        >
          <h2 className="font-bold text-white mb-3">Где использовать:</h2>
          
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <span className="text-xl">🚪</span>
              <div>
                <div className="font-semibold text-white text-sm">Вход в клуб</div>
                <div className="text-xs text-gray-400">Покажи QR-код на входе</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-xl">🍕</span>
              <div>
                <div className="font-semibold text-white text-sm">Заказ еды</div>
                <div className="text-xs text-gray-400">Отсканируй на стойке заказа</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-xl">⏱️</span>
              <div>
                <div className="font-semibold text-white text-sm">Продление времени</div>
                <div className="text-xs text-gray-400">Быстрое продление сессии</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-xl">🎮</span>
              <div>
                <div className="font-semibold text-white text-sm">Активация ПК</div>
                <div className="text-xs text-gray-400">Поднеси к монитору</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Share Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full glass py-3 rounded-ios-lg text-white font-medium flex items-center justify-center gap-2"
        >
          <span>📤</span>
          Поделиться QR-кодом
        </motion.button>
      </div>
    </div>
  )
})

QRCode.displayName = 'QRCode'

export default QRCode
