import { memo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useStore from '../store/useStore'

const Layout = memo(({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useStore()

  const navItems = [
    { path: '/', icon: '🏠', label: 'Главная' },
    { path: '/hall', icon: '🖥️', label: 'Зал' },
    { path: '/shop', icon: '🛒', label: 'Магазин' },
    { path: '/social', icon: '👥', label: 'Соцсеть' },
    { path: '/profile', icon: '👤', label: 'Профиль' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-cyber-darker via-cyber-dark to-[#1a1f3a]">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-strong sticky top-0 z-50 border-b border-white/10"
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-xl">
              🎮
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">ПК Клуб</h1>
              <p className="text-xs text-gray-400">Бронирование</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="glass-card px-3 py-1.5 rounded-lg flex items-center gap-2">
              <span className="text-emerald-400 font-semibold">{user.balance}₽</span>
            </div>
            <button
              onClick={() => navigate('/qr')}
              className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-xl transition-all ios-press"
            >
              📱
            </button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 pb-20">
        {children}
      </main>

      {/* iOS Dock Navigation */}
      <motion.nav
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-0 left-0 right-0 z-50 pb-4"
      >
        <div className="px-6 max-w-md mx-auto">
          <div className="glass-dock rounded-3xl px-6 py-3">
            <div className="flex items-center justify-around">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <motion.button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    whileHover={{ scale: 1.1, y: -4 }}
                    whileTap={{ scale: 0.9 }}
                    className="relative flex items-center justify-center transition-all"
                  >
                    {/* Icon Container */}
                    <motion.div
                      animate={{
                        scale: isActive ? 1.15 : 1,
                        y: isActive ? -3 : 0,
                      }}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all ${
                        isActive
                          ? 'bg-white/25 shadow-lg'
                          : 'bg-white/5'
                      }`}
                    >
                      {item.icon}
                    </motion.div>
                  </motion.button>
                )
              })}
            </div>
          </div>
        </div>
      </motion.nav>
    </div>
  )
})

Layout.displayName = 'Layout'

export default Layout
