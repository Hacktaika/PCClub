import { memo, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import useStore from '../store/useStore'

const Booking = memo(() => {
  const navigate = useNavigate()
  const { pcId } = useParams()
  const { pcs, user, addBooking, updatePCStatus, updateBalance } = useStore()
  
  const [selectedPC, setSelectedPC] = useState(null)
  const [duration, setDuration] = useState(2)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState('')

  useEffect(() => {
    if (pcId) {
      const safePCs = Array.isArray(pcs) ? pcs : []
      const pc = safePCs.find(p => p && p.id === parseInt(pcId))
      if (pc) {
        setSelectedPC(pc)
      }
    }
  }, [pcId, pcs])

  const durations = [1, 2, 3, 4, 5, 6]
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = String(i).padStart(2, '0')
    return `${hour}:00`
  })

  const totalPrice = selectedPC ? selectedPC.pricePerHour * duration : 0
  const canBook = user.balance >= totalPrice && selectedPC?.status === 'available' && selectedTime

  const handleBooking = () => {
    if (!canBook || !selectedPC) return

    const bookingDate = new Date(selectedDate)
    const [hours] = selectedTime.split(':')
    bookingDate.setHours(parseInt(hours), 0, 0, 0)

    const booking = {
      pcId: selectedPC.id,
      pcName: selectedPC.name,
      duration,
      date: bookingDate.toISOString(),
      price: totalPrice,
      status: 'confirmed',
    }

    addBooking(booking)
    updatePCStatus(selectedPC.id, 'booked')
    updateBalance(-totalPrice)

    navigate('/profile')
  }

  if (!selectedPC) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="glass rounded-ios-lg p-6 text-center">
          <p className="text-gray-400 mb-4">ПК не найден</p>
          <button
            onClick={() => navigate('/hall')}
            className="cyber-button bg-gradient-to-r from-cyber-primary to-cyber-secondary text-cyber-darker font-bold py-3 px-6 rounded-ios-lg"
          >
            Выбрать ПК
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* PC Info */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-cyber-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold gradient-text-green">{selectedPC.name}</h1>
          <div className="text-3xl">🖥️</div>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">CPU:</span>
            <span className="text-white">{selectedPC.specs.cpu}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">GPU:</span>
            <span className="text-white">{selectedPC.specs.gpu}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">RAM:</span>
            <span className="text-white">{selectedPC.specs.ram}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Монитор:</span>
            <span className="text-white">{selectedPC.specs.monitor}</span>
          </div>
        </div>
      </motion.div>

      {/* Duration Selection */}
      <div>
        <h2 className="text-lg font-bold text-white mb-3">Длительность</h2>
        <div className="grid grid-cols-3 gap-2">
          {durations.map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={`py-3 rounded-ios-lg font-semibold transition-all ios-press ${
                duration === d
                  ? 'bg-gradient-to-r from-cyber-primary to-cyber-secondary text-cyber-darker shadow-neon'
                  : 'glass text-white'
              }`}
            >
              {d} {d === 1 ? 'час' : d < 5 ? 'часа' : 'часов'}
            </button>
          ))}
        </div>
      </div>

      {/* Date Selection */}
      <div>
        <h2 className="text-lg font-bold text-white mb-3">Дата</h2>
        <input
          type="date"
          min={new Date().toISOString().split('T')[0]}
          value={selectedDate.toISOString().split('T')[0]}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          className="w-full glass rounded-ios-lg p-4 text-white bg-transparent border border-cyber-primary/20 focus:border-cyber-primary focus:outline-none"
        />
      </div>

      {/* Time Selection */}
      <div>
        <h2 className="text-lg font-bold text-white mb-3">Время начала</h2>
        <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
          {timeSlots.map((time) => (
            <button
              key={time}
              onClick={() => setSelectedTime(time)}
              className={`py-2 rounded-ios text-sm font-medium transition-all ios-press ${
                selectedTime === time
                  ? 'bg-gradient-to-r from-cyber-primary to-cyber-secondary text-cyber-darker shadow-neon'
                  : 'glass text-white'
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      {/* Price Summary */}
      <div className="glass rounded-ios-lg p-4 space-y-2">
        <div className="flex justify-between text-gray-400">
          <span>Цена за час:</span>
          <span>{selectedPC.pricePerHour}₽</span>
        </div>
        <div className="flex justify-between text-gray-400">
          <span>Длительность:</span>
          <span>{duration} {duration === 1 ? 'час' : duration < 5 ? 'часа' : 'часов'}</span>
        </div>
        <div className="border-t border-cyber-primary/20 pt-2 flex justify-between">
          <span className="text-white font-semibold">Итого:</span>
          <span className="text-cyber-primary font-bold text-xl">{totalPrice}₽</span>
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>Баланс:</span>
          <span className={user.balance >= totalPrice ? 'text-cyber-primary' : 'text-red-400'}>
            {user.balance}₽
          </span>
        </div>
      </div>

      {/* Book Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleBooking}
        disabled={!canBook}
        className={`w-full cyber-button py-4 rounded-ios-lg font-bold text-lg shadow-neon transition-all ${
          canBook
            ? 'bg-gradient-to-r from-cyber-primary to-cyber-secondary text-cyber-darker'
            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
        }`}
      >
        {canBook ? '✅ Забронировать' : '❌ Недостаточно средств'}
      </motion.button>
    </div>
  )
})

Booking.displayName = 'Booking'

export default Booking
