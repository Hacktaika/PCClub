import { memo, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../store/useStore'

const Profile = memo(() => {
  const navigate = useNavigate()
  const { user, bookings, cancelBooking, purchaseHistory } = useStore()
  const [cancelMessage, setCancelMessage] = useState(null)
  const [activeTab, setActiveTab] = useState('bookings') // 'bookings' или 'purchases'

  const activeBookings = useMemo(() => bookings.filter(b => {
    const bookingDate = new Date(b.date)
    return bookingDate > new Date() && !b.completed
  }).sort((a, b) => new Date(a.date) - new Date(b.date)), [bookings])

  const pastBookings = useMemo(() => bookings.filter(b => {
    const bookingDate = new Date(b.date)
    return bookingDate <= new Date() || b.completed
  }), [bookings])

  const totalSpent = useMemo(() => bookings.filter(b => !b.completed || new Date(b.date) <= new Date()).reduce((sum, b) => sum + b.price, 0), [bookings])
  const totalHours = useMemo(() => user.totalHours || pastBookings.reduce((sum, b) => sum + (b.completed ? b.duration : 0), 0), [user.totalHours, pastBookings])

  const handleCancelBooking = useCallback((bookingId) => {
    const result = cancelBooking(bookingId)
    if (result) {
      setCancelMessage(result)
      setTimeout(() => setCancelMessage(null), 3000)
    }
  }, [cancelBooking])

  // Вычисляем время до начала бронирования
  const getTimeUntilBooking = (bookingDate) => {
    const now = new Date()
    const booking = new Date(bookingDate)
    const diffMs = booking.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diffHours > 0) {
      return `${diffHours}ч ${diffMinutes}м`
    } else if (diffMinutes > 0) {
      return `${diffMinutes}м`
    }
    return 'Скоро'
  }

  // Проверяем, можно ли вернуть деньги
  const canRefund = (bookingDate) => {
    const now = new Date()
    const booking = new Date(bookingDate)
    const diffHours = (booking.getTime() - now.getTime()) / (1000 * 60 * 60)
    return diffHours >= 2
  }

  return (
    <div className="container mx-auto px-4 py-4 space-y-4">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-5 text-center"
      >
        <div className="w-20 h-20 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-4xl">
          {user.avatar}
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">{user.name}</h1>
        <div className="flex items-center justify-center gap-4 mt-3">
          <div className="glass-card px-3 py-1.5 rounded-xl">
            <div className="text-xs text-gray-400">Уровень</div>
            <div className="text-lg font-bold text-emerald-400">{user.level}</div>
          </div>
          <div className="glass-card px-3 py-1.5 rounded-xl">
            <div className="text-xs text-gray-400">Рейтинг</div>
            <div className="text-lg font-bold text-emerald-400">{user.rating}</div>
          </div>
        </div>
      </motion.div>

      {/* Cancel Message */}
      <AnimatePresence>
        {cancelMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-3 rounded-xl ${
              cancelMessage.success
                ? 'bg-emerald-500/20 border border-emerald-500/30'
                : 'bg-red-500/20 border border-red-500/30'
            }`}
          >
            <div className={`text-sm font-medium ${
              cancelMessage.success ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {cancelMessage.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="glass-card rounded-xl p-3 text-center">
          <div className="text-xl mb-1">💰</div>
          <div className="text-xs text-gray-400">Баланс</div>
          <div className="text-sm font-bold text-emerald-400">{user.balance}₽</div>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <div className="text-xl mb-1">⏱️</div>
          <div className="text-xs text-gray-400">Часов</div>
          <div className="text-sm font-bold text-emerald-400">{totalHours}</div>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <div className="text-xl mb-1">💸</div>
          <div className="text-xs text-gray-400">Потрачено</div>
          <div className="text-sm font-bold text-emerald-400">{totalSpent}₽</div>
        </div>
      </div>

      {/* Active Bookings */}
      {activeBookings.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-white mb-3">Активные бронирования</h2>
          <div className="space-y-2">
            {activeBookings.map((booking) => {
              const timeUntil = getTimeUntilBooking(booking.date)
              const willRefund = canRefund(booking.date)
              
              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-card rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-semibold text-white">{booking.pcName}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(booking.date).toLocaleString('ru-RU')}
                      </div>
                      <div className="text-xs text-emerald-400 mt-1">
                        До начала: {timeUntil}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-400 font-bold">{booking.duration}ч</div>
                      <div className="text-xs text-gray-400">{booking.price}₽</div>
                    </div>
                  </div>
                  {willRefund && (
                    <div className="text-xs text-emerald-400 mb-2">
                      ✓ При отмене вернётся {booking.price}₽
                    </div>
                  )}
                  {!willRefund && (
                    <div className="text-xs text-orange-400 mb-2">
                      ⚠ Менее 2ч до начала - деньги не вернутся
                    </div>
                  )}
                  <button
                    onClick={() => handleCancelBooking(booking.id)}
                    className="w-full mt-2 glass-card py-2 rounded-xl text-sm text-red-400 font-medium hover:bg-red-400/10 transition-all"
                  >
                    Отменить бронь
                  </button>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* History Tabs */}
      <div>
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'bookings'
                ? 'bg-emerald-500/30 text-emerald-400 border border-emerald-500/50'
                : 'glass-card text-gray-300'
            }`}
          >
            Бронирования
          </button>
          <button
            onClick={() => setActiveTab('purchases')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'purchases'
                ? 'bg-emerald-500/30 text-emerald-400 border border-emerald-500/50'
                : 'glass-card text-gray-300'
            }`}
          >
            Покупки
          </button>
        </div>

        {/* Bookings History */}
        {activeTab === 'bookings' && (
          <div>
            <h2 className="text-lg font-bold text-white mb-3">История бронирований</h2>
            {pastBookings.length > 0 ? (
              <div className="space-y-2">
                {pastBookings.map((booking) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card rounded-xl p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">💻</div>
                      <div>
                        <div className="font-semibold text-white text-sm">{booking.pcName}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(booking.date).toLocaleString('ru-RU', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        {booking.completed && (
                          <div className="text-xs text-emerald-400 mt-1">✓ Завершено</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-400 font-bold text-sm">{booking.duration}ч</div>
                      <div className="text-xs text-gray-400">{booking.price}₽</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="glass-card rounded-xl p-6 text-center text-gray-400">
                <div className="text-4xl mb-2">📅</div>
                <p>Нет завершенных бронирований</p>
              </div>
            )}
          </div>
        )}

        {/* Purchases History */}
        {activeTab === 'purchases' && (
          <div>
            <h2 className="text-lg font-bold text-white mb-3">История покупок</h2>
            {purchaseHistory && purchaseHistory.length > 0 ? (
              <div className="space-y-2">
                {purchaseHistory.slice().reverse().map((purchase) => (
                  <motion.div
                    key={purchase.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-gray-400">
                        {new Date(purchase.date).toLocaleString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      <div className="text-emerald-400 font-bold">{purchase.total}₽</div>
                    </div>
                    <div className="space-y-1">
                      {purchase.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{item.image}</span>
                            <span className="text-white">{item.name}</span>
                          </div>
                          <span className="text-gray-400">{item.price}₽</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="glass-card rounded-xl p-6 text-center text-gray-400">
                <div className="text-4xl mb-2">🛒</div>
                <p>Нет покупок</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Games */}
      <div>
        <h2 className="text-lg font-bold text-white mb-3">Любимые игры</h2>
        <div className="flex flex-wrap gap-2">
          {user.games.map((game) => (
            <div
              key={game}
              className="glass-card px-3 py-1.5 rounded-xl text-sm font-medium text-white"
            >
              {game}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={() => navigate('/hall')}
          className="w-full bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/30"
        >
          🖥️ Забронировать ПК
        </button>
        <button
          onClick={() => navigate('/qr')}
          className="w-full glass-card py-3 rounded-xl text-white font-medium"
        >
          📱 Мой QR-код
        </button>
      </div>
    </div>
  )
})

Profile.displayName = 'Profile'

export default Profile
