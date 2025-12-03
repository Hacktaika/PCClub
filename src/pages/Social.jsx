import { memo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../store/useStore'

const Social = memo(() => {
  const { onlineUsers, user, chatRequests, sendChatRequest, findBlindDatePair, toggleDeadHourNotifications, notifications } = useStore()
  const [filter, setFilter] = useState('all')
  const [message, setMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [sendingUserId, setSendingUserId] = useState(null)
  const [showPairModal, setShowPairModal] = useState(false)
  const [foundPair, setFoundPair] = useState(null)

  const games = ['all', 'CS2', 'Valorant', 'Dota 2']
  const filteredUsers = onlineUsers.filter(user =>
    filter === 'all' || user.game === filter
  )

  // Проверяем, был ли уже отправлен запрос пользователю
  const hasSentRequest = (userId) => {
    return chatRequests.some(
      req => req.fromUserId === user.id && req.toUserId === userId
    )
  }

  const handleSendMessage = async (userId) => {
    // Проверяем, не был ли уже отправлен запрос
    if (hasSentRequest(userId)) {
      setMessage({
        success: false,
        message: 'Запрос уже отправлен этому пользователю'
      })
      setTimeout(() => setMessage(null), 3000)
      return
    }

    setSendingUserId(userId)
    setIsLoading(true)
    
    // Симуляция отправки запроса
    setTimeout(() => {
      const result = sendChatRequest(userId)
      setMessage(result)
      setIsLoading(false)
      setTimeout(() => {
        setMessage(null)
        setSendingUserId(null)
      }, 3000)
    }, 500)
  }

  const handleFindPair = async () => {
    setIsLoading(true)
    // Симуляция поиска пары
    setTimeout(() => {
      const result = findBlindDatePair()
      if (result.success && result.pair) {
        setFoundPair(result.pair)
        setShowPairModal(true)
        setMessage(result)
      } else {
        setMessage(result)
      }
      setIsLoading(false)
      setTimeout(() => setMessage(null), 4000)
    }, 1000)
  }

  const handleToggleNotifications = () => {
    const result = toggleDeadHourNotifications()
    setMessage(result)
    setTimeout(() => setMessage(null), 3000)
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Соцсеть</h1>
        <p className="text-gray-400 text-sm">Найди партнёра для игры</p>
      </div>

      {/* Message Notification */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-xl ${
              message.success
                ? 'bg-emerald-500/20 border border-emerald-500/30'
                : 'bg-red-500/20 border border-red-500/30'
            }`}
          >
            <div className={`text-sm font-medium ${
              message.success ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {message.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {games.map((game) => (
          <button
            key={game}
            onClick={() => setFilter(game)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              filter === game
                ? 'bg-emerald-500/30 text-emerald-400 border border-emerald-500/50'
                : 'glass-card text-gray-300'
            }`}
          >
            {game === 'all' ? 'Все игры' : game}
          </button>
        ))}
      </div>

      {/* Online Stats */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400">Онлайн сейчас</div>
            <div className="text-2xl font-bold text-emerald-400">{onlineUsers.length}</div>
          </div>
          <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {filteredUsers.map((targetUser, index) => {
          const requestSent = hasSentRequest(targetUser.id)
          const isSending = sendingUserId === targetUser.id && isLoading
          
          return (
            <motion.div
              key={targetUser.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-2xl">
                  {targetUser.avatar}
                </div>
                <div>
                  <div className="font-semibold text-white">{targetUser.name}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>🎮 {targetUser.game}</span>
                    <span>•</span>
                    <span className="text-emerald-400">⭐ {targetUser.rating}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-xs text-emerald-400">Онлайн</span>
                </div>
                <motion.button
                  onClick={() => handleSendMessage(targetUser.id)}
                  disabled={isLoading || requestSent}
                  whileHover={{ scale: requestSent ? 1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    requestSent
                      ? 'bg-emerald-500/30 text-emerald-400 border border-emerald-500/50 cursor-default'
                      : 'glass-card text-white hover:bg-emerald-500/20'
                  } ${isLoading && !isSending ? 'opacity-50' : ''}`}
                >
                  {isSending ? 'Отправка...' : requestSent ? '✓ Запрос на чат' : 'Написать'}
                </motion.button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Special Features */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white">Специальные функции</h2>
        
        {/* Blind Date Gaming */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-card rounded-xl p-4 bg-gradient-to-r from-pink-500/20 to-purple-500/20"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">💑</span>
            <div className="flex-1">
              <h3 className="font-bold text-white mb-1">Blind Date Gaming</h3>
              <p className="text-sm text-gray-400 mb-3">
                Свидание вслепую для игры. Подбор пары по играм и рейтингу. -50% на 3 часа!
              </p>
              <motion.button
                onClick={handleFindPair}
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full glass-card py-2.5 rounded-xl text-sm font-medium text-white hover:bg-emerald-500/20 transition-all disabled:opacity-50 border border-orange-500/50"
              >
                {isLoading ? 'Поиск пары...' : 'Найти пару'}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Dead Hour */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-card rounded-xl p-4 bg-gradient-to-r from-orange-500/20 to-pink-500/20"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚡</span>
            <div className="flex-1">
              <h3 className="font-bold text-white mb-1">Dead Hour</h3>
              <p className="text-sm text-gray-400 mb-3">
                Случайный бесплатный час! Получи уведомление за 10 минут до начала.
              </p>
              <motion.button
                onClick={handleToggleNotifications}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full glass-card py-2.5 rounded-xl text-sm font-medium text-white hover:bg-emerald-500/20 transition-all ${
                  notifications.deadHour ? 'border border-emerald-500/50' : ''
                }`}
              >
                {notifications.deadHour ? '✓ Уведомления включены' : 'Включить уведомления'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Blind Date Pair Modal */}
      <AnimatePresence>
        {showPairModal && foundPair && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowPairModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card rounded-3xl p-6 max-w-sm w-full"
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-6xl mb-4"
                >
                  💑
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">Найдена пара!</h2>
                <p className="text-gray-400 text-sm">Идеальный партнёр для игры</p>
              </div>

              {/* Found Pair Info */}
              <div className="glass-card rounded-2xl p-5 mb-4 bg-gradient-to-r from-pink-500/20 to-purple-500/20">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-4xl">
                    {foundPair.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="text-xl font-bold text-white mb-1">{foundPair.name}</div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <span>🎮 {foundPair.game}</span>
                      <span>•</span>
                      <span className="text-emerald-400">⭐ {foundPair.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between text-gray-300">
                    <span>Совпадение по играм:</span>
                    <span className="text-emerald-400 font-semibold">✓ Да</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-300">
                    <span>Разница в рейтинге:</span>
                    <span className="text-emerald-400 font-semibold">
                      {Math.abs(foundPair.rating - user.rating)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Discount Info */}
              <div className="glass-card rounded-xl p-4 mb-4 bg-emerald-500/10 border border-emerald-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Ваша скидка</div>
                    <div className="text-2xl font-bold text-emerald-400">-50%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400 mb-1">Длительность</div>
                    <div className="text-lg font-bold text-white">3 часа</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowPairModal(false)
                    setFoundPair(null)
                  }}
                  className="flex-1 glass-card py-3 rounded-xl text-white font-medium text-sm"
                >
                  Закрыть
                </button>
                <motion.button
                  onClick={() => {
                    if (foundPair && !hasSentRequest(foundPair.id)) {
                      handleSendMessage(foundPair.id)
                    }
                    setShowPairModal(false)
                    setFoundPair(null)
                  }}
                  disabled={foundPair && hasSentRequest(foundPair.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                    foundPair && hasSentRequest(foundPair.id)
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  }`}
                >
                  {foundPair && hasSentRequest(foundPair.id) ? 'Запрос отправлен' : 'Отправить запрос'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

Social.displayName = 'Social'

export default Social
