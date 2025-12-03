import { memo } from 'react'
import { motion } from 'framer-motion'

const LoadingScreen = memo(() => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyber-darker via-cyber-dark to-[#1a1f3a]">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-20 h-20 mx-auto mb-4 rounded-full border-4 border-cyber-primary/30 border-t-cyber-primary"
        />
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl font-bold gradient-text-green mb-2"
        >
          Загрузка...
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          className="text-cyber-secondary"
        >
          Подключение к серверу
        </motion.p>
      </div>
    </div>
  )
})

LoadingScreen.displayName = 'LoadingScreen'

export default LoadingScreen
