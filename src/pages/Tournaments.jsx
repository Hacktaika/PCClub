import { memo } from 'react'
import { motion } from 'framer-motion'
import useStore from '../store/useStore'

const Tournaments = memo(() => {
  const { tournaments, user, joinTournament, updateBalance } = useStore()

  const handleJoin = (tournament) => {
    if (user.balance >= tournament.entryFee && tournament.participants < tournament.maxParticipants) {
      joinTournament(tournament.id)
      updateBalance(-tournament.entryFee)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold gradient-text-green mb-2">Турниры</h1>
        <p className="text-gray-400 text-sm">Участвуй и выигрывай призы</p>
      </div>

      {/* Tournaments List */}
      <div className="space-y-4">
        {tournaments.map((tournament, index) => {
          const canJoin = user.balance >= tournament.entryFee && 
                         tournament.participants < tournament.maxParticipants &&
                         tournament.status === 'open'
          const progress = (tournament.participants / tournament.maxParticipants) * 100

          return (
            <motion.div
              key={tournament.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-cyber-lg p-5 relative overflow-hidden"
            >
              {/* Background gradient */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyber-purple/20 to-cyber-pink/20 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">{tournament.name}</h2>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>🎮</span>
                      <span>{tournament.game}</span>
                    </div>
                  </div>
                  <div className="text-3xl">🏆</div>
                </div>

                {/* Prize Info */}
                <div className="glass rounded-ios-lg p-3 mb-3 bg-gradient-to-r from-cyber-orange/20 to-cyber-pink/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-400">Призовой фонд</div>
                      <div className="text-2xl font-bold gradient-text-green">{tournament.prize}₽</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">Взнос</div>
                      <div className="text-lg font-bold text-cyber-primary">{tournament.entryFee}₽</div>
                    </div>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                  <span>📅</span>
                  <span>{formatDate(tournament.date)}</span>
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>Участники</span>
                    <span>{tournament.participants} / {tournament.maxParticipants}</span>
                  </div>
                  <div className="h-2 bg-cyber-dark rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-gradient-to-r from-cyber-primary to-cyber-secondary"
                    />
                  </div>
                </div>

                {/* Join Button */}
                <button
                  onClick={() => handleJoin(tournament)}
                  disabled={!canJoin}
                  className={`w-full cyber-button py-3 rounded-ios-lg font-bold transition-all ${
                    canJoin
                      ? 'bg-gradient-to-r from-cyber-primary to-cyber-secondary text-cyber-darker shadow-neon'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {canJoin
                    ? '✅ Участвовать'
                    : tournament.participants >= tournament.maxParticipants
                    ? '❌ Мест нет'
                    : user.balance < tournament.entryFee
                    ? '❌ Недостаточно средств'
                    : '❌ Недоступно'}
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass rounded-ios-lg p-4"
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div className="text-sm text-gray-400">
            <p className="font-semibold text-white mb-1">Как это работает?</p>
            <p>Оплати взнос и участвуй в турнире. Победитель получает весь призовой фонд!</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
})

Tournaments.displayName = 'Tournaments'

export default Tournaments
