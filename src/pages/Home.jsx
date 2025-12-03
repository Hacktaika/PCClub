import { memo, useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../store/useStore'

const Home = memo(() => {
  const navigate = useNavigate()
  const { user, bookings, pcs, addBooking, updatePCStatus, updateBalance, refreshPCStatuses } = useStore()
  
  // Автоматическое обновление статусов ПК при загрузке
  useEffect(() => {
    // Обновляем статусы один раз при монтировании
    refreshPCStatuses()
    // Обновляем каждую минуту
    const interval = setInterval(() => {
      refreshPCStatuses()
    }, 60000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Пустой массив зависимостей - выполняется только при монтировании
  const [selectedPC, setSelectedPC] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState(2)
  const [selectedTime, setSelectedTime] = useState('')

  const availablePCs = (Array.isArray(pcs) ? pcs : []).filter(pc => pc.status === 'available').length
  const activeBookings = (Array.isArray(bookings) ? bookings : []).filter(b => {
    if (!b || !b.date) return false
    const bookingDate = new Date(b.date)
    return bookingDate > new Date()
  }).length

  const stats = [
    { label: 'Доступно ПК', value: availablePCs, icon: '🖥️' },
    { label: 'Активные брони', value: activeBookings, icon: '📅' },
    { label: 'Рейтинг', value: user.rating, icon: '⭐' },
    { label: 'Уровень', value: user.level, icon: '🎯' },
  ]

  const durations = [1, 2, 3, 4, 5, 6]

  // Генерируем временные слоты на сегодня и завтра
  const generateTimeSlots = () => {
    const now = new Date()
    const slots = []
    const today = new Date(now)
    today.setHours(0, 0, 0, 0)
    
    // Слоты на сегодня (от текущего часа + 1)
    const currentHour = now.getHours()
    for (let i = currentHour + 1; i < 24; i++) {
      slots.push({
        time: `${String(i).padStart(2, '0')}:00`,
        date: new Date(today),
        hour: i,
        isToday: true
      })
    }
    
    // Слоты на завтра
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    for (let i = 0; i < 24; i++) {
      slots.push({
        time: `${String(i).padStart(2, '0')}:00`,
        date: new Date(tomorrow),
        hour: i,
        isToday: false
      })
    }
    
    return slots.slice(0, 24) // Максимум 24 слота
  }

  const timeSlots = generateTimeSlots()

  // Проверяем доступность временных слотов для выбранного ПК
  const getTimeSlotAvailability = useMemo(() => {
    if (!selectedPC) return {}
    
    const pcBookings = bookings.filter(b => 
      b.pcId === selectedPC.id && new Date(b.date) > new Date()
    )
    
    const availability = {}
    
    timeSlots.forEach(slot => {
      const slotStart = new Date(slot.date)
      slotStart.setHours(slot.hour, 0, 0, 0)
      const slotEnd = new Date(slotStart.getTime() + selectedDuration * 60 * 60 * 1000)
      
      // Проверяем пересечения с существующими бронированиями
      const isAvailable = !pcBookings.some(booking => {
        const bookingStart = new Date(booking.date)
        const bookingEnd = new Date(bookingStart.getTime() + booking.duration * 60 * 60 * 1000)
        
        // Проверяем пересечение временных интервалов
        return (slotStart < bookingEnd && slotEnd > bookingStart)
      })
      
      availability[slot.time] = isAvailable
    })
    
    return availability
  }, [selectedPC, bookings, selectedDuration, timeSlots])

  // Находим следующее доступное время
  const getNextAvailableTime = () => {
    const availability = getTimeSlotAvailability
    const now = new Date()
    
    for (const slot of timeSlots) {
      if (availability[slot.time]) {
        const slotDate = new Date(slot.date)
        slotDate.setHours(slot.hour, 0, 0, 0)
        
        const diffMs = slotDate.getTime() - now.getTime()
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
        
        if (diffHours > 0) {
          return `${diffHours}ч ${diffMinutes}м`
        } else if (diffMinutes > 0) {
          return `${diffMinutes}м`
        } else {
          return 'Сейчас'
        }
      }
    }
    
    return null
  }

  const isDayFullyBooked = useMemo(() => {
    const availability = getTimeSlotAvailability
    return Object.values(availability).every(avail => !avail)
  }, [getTimeSlotAvailability])

  const nextAvailableTime = getNextAvailableTime()

  const getPCStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'from-emerald-500/20 to-blue-500/20'
      case 'booked':
        return 'from-orange-500/20 to-pink-500/20'
      case 'occupied':
        return 'from-purple-500/20 to-blue-500/20'
      case 'maintenance':
        return 'from-gray-600/20 to-gray-800/20'
      default:
        return 'from-gray-600/20 to-gray-800/20'
    }
  }

  const getPCStatusLabel = (status) => {
    switch (status) {
      case 'available':
        return 'Свободен'
      case 'booked':
        return 'Забронирован'
      case 'occupied':
        return 'Занят'
      case 'maintenance':
        return 'Ремонт'
      default:
        return 'Неизвестно'
    }
  }

  const handlePCClick = (pc) => {
    if (pc.status === 'available') {
      setSelectedPC(pc)
      setShowBookingModal(true)
      setSelectedTime('')
      setSelectedDuration(2)
    } else {
      setSelectedPC(pc)
    }
  }

  const handleConfirmBooking = () => {
    if (!selectedPC || !selectedTime) return

    const slot = timeSlots.find(s => s.time === selectedTime)
    if (!slot) return

    const bookingDate = new Date(slot.date)
    bookingDate.setHours(slot.hour, 0, 0, 0)

    const booking = {
      pcId: selectedPC.id,
      pcName: selectedPC.name,
      duration: selectedDuration,
      date: bookingDate.toISOString(),
      price: selectedPC.pricePerHour * selectedDuration,
      status: 'confirmed',
    }

    if (user.balance >= booking.price) {
      addBooking(booking)
      updatePCStatus(selectedPC.id, 'booked')
      updateBalance(-booking.price)
      setShowBookingModal(false)
      setSelectedPC(null)
    }
  }

  // Вычисляем время освобождения для ПК
  const getPCFreeTime = (pc) => {
    if (!pc || pc.status === 'available') return null
    
    const safeBookings = Array.isArray(bookings) ? bookings : []
    const pcBookings = safeBookings.filter(b => {
      if (!b || b.pcId !== pc.id || !b.date || !b.duration) return false
      try {
        const bookingDate = new Date(b.date)
        const bookingEnd = new Date(bookingDate.getTime() + b.duration * 60 * 60 * 1000)
        return bookingEnd > new Date()
      } catch (e) {
        return false
      }
    }).sort((a, b) => {
      try {
        return new Date(a.date) - new Date(b.date)
      } catch (e) {
        return 0
      }
    })

    if (pcBookings.length === 0) return null

    const nextBooking = pcBookings[0]
    const bookingDate = new Date(nextBooking.date)
    const bookingEnd = new Date(bookingDate.getTime() + nextBooking.duration * 60 * 60 * 1000)
    
    const now = new Date()
    if (bookingEnd <= now) return null

    const diffMs = bookingEnd.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffHours > 0) {
      return `${diffHours}ч ${diffMinutes}м`
    } else if (diffMinutes > 0) {
      return `${diffMinutes}м`
    }
    
    return bookingEnd.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }

  // Группируем ПК по рядам (показываем первые 3 ряда на главной)
  const rows = Array.from({ length: 3 }, (_, i) => i + 1)
  const safePCs = Array.isArray(pcs) ? pcs : []
  // Фильтруем ПК по рядам и сортируем по колонкам
  const pcsByRow = rows.map(row => {
    const rowPCs = safePCs.filter(pc => {
      if (!pc || !pc.position) return false
      return pc.position.row === row
    })
    // Сортируем по колонкам для правильного отображения
    return rowPCs.sort((a, b) => (a.position?.col || 0) - (b.position?.col || 0))
  })

  const totalPrice = selectedPC ? selectedPC.pricePerHour * selectedDuration : 0
  const canBook = selectedPC && selectedTime && user.balance >= totalPrice && getTimeSlotAvailability[selectedTime]

  return (
    <div className="container mx-auto px-4 py-4 space-y-4">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-5 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-white mb-1">
            Добро пожаловать, {user.name}!
          </h1>
          <p className="text-gray-400 mb-3 text-sm">
            Выбери ПК и начни играть
          </p>
          <div className="flex items-center gap-3">
            <div className="glass-card px-3 py-2 rounded-xl flex items-center gap-2">
              <span className="text-xl">{user.avatar}</span>
              <div>
                <div className="text-xs font-semibold text-gray-400">Баланс</div>
                <div className="text-base font-bold text-emerald-400">{user.balance}₽</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-2">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card rounded-xl p-2.5 text-center"
          >
            <div className="text-lg mb-1">{stat.icon}</div>
            <div className="text-base font-bold text-emerald-400">{stat.value}</div>
            <div className="text-[9px] text-gray-400 mt-0.5">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Hall Map Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-xl">💻</span> Карта зала
          </h2>
          <button
            onClick={() => navigate('/hall')}
            className="glass-card px-3 py-1 rounded-lg text-xs text-gray-300"
          >
            Все ПК →
          </button>
        </div>

        {/* Hall Map Grid */}
        <div className="glass-card rounded-2xl p-2.5 space-y-2">
          {rows.map((row) => {
            const rowPCs = pcsByRow[row - 1] || []
            
            // Если нет ПК в ряду, все равно показываем пустые ячейки
            return (
              <div key={row} className="space-y-1">
                <div className="text-[10px] text-gray-500 px-1">Ряд {row}</div>
                <div className="grid grid-cols-5 gap-1">
                  {Array.from({ length: 5 }, (_, col) => {
                    const pc = rowPCs.find(p => p && p.position && p.position.col === col + 1)
                    if (!pc) {
                      // Показываем пустую ячейку с номером места
                      return (
                        <div 
                          key={col} 
                          className="aspect-square rounded-lg bg-gray-800/20 flex items-center justify-center"
                        >
                          <span className="text-[8px] text-gray-600">-</span>
                        </div>
                      )
                    }

                    const isSelected = selectedPC?.id === pc.id
                    const freeTime = getPCFreeTime(pc)

                    return (
                      <motion.button
                        key={pc.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ 
                          opacity: 1, 
                          scale: isSelected ? 1.05 : 1,
                        }}
                        whileHover={{ scale: pc.status === 'available' ? 1.03 : 1 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handlePCClick(pc)}
                        disabled={pc.status !== 'available'}
                        className={`aspect-square glass-card rounded-lg p-1 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br ${getPCStatusColor(pc.status)} transition-all ${
                          pc.status === 'available' ? 'cursor-pointer' : 'opacity-70'
                        } ${isSelected ? 'ring-2 ring-emerald-400 shadow-lg shadow-emerald-400/30' : ''}`}
                      >
                        <div className="text-[10px] font-bold text-white leading-tight">{pc.name}</div>
                        <div className="text-[7px] text-gray-300 mt-0.5 leading-tight text-center">
                          {getPCStatusLabel(pc.status)}
                        </div>
                        {freeTime && (
                          <div className="text-[7px] text-emerald-400 mt-0.5 font-medium leading-tight">
                            {freeTime}
                          </div>
                        )}
                        {pc.status === 'available' && (
                          <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && selectedPC && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => {
              setShowBookingModal(false)
              setSelectedPC(null)
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card rounded-3xl p-6 max-w-sm w-full mx-4"
            >
              <h3 className="text-xl font-bold text-white mb-4">{selectedPC.name}</h3>
              
              {/* Day Fully Booked Warning */}
              {isDayFullyBooked && (
                <div className="mb-4 p-3 rounded-xl bg-orange-500/20 border border-orange-500/30">
                  <div className="text-sm text-orange-400 font-medium mb-1">
                    Весь день забронирован
                  </div>
                  {nextAvailableTime && (
                    <div className="text-xs text-gray-300">
                      Следующее свободное время через: {nextAvailableTime}
                    </div>
                  )}
                </div>
              )}

              {/* Next Available Time Info */}
              {!isDayFullyBooked && nextAvailableTime && !selectedTime && (
                <div className="mb-4 p-3 rounded-xl bg-blue-500/20 border border-blue-500/30">
                  <div className="text-xs text-blue-400">
                    Ближайшее свободное время через: {nextAvailableTime}
                  </div>
                </div>
              )}
              
              {/* Duration Selection */}
              <div className="mb-4">
                <div className="text-xs text-gray-400 mb-2">Длительность</div>
                <div className="grid grid-cols-3 gap-2">
                  {durations.map((d) => (
                    <button
                      key={d}
                      onClick={() => setSelectedDuration(d)}
                      className={`py-2 rounded-xl text-sm font-medium transition-all ${
                        selectedDuration === d
                          ? 'bg-emerald-500/30 text-emerald-400 border border-emerald-500/50'
                          : 'glass-card text-gray-300'
                      }`}
                    >
                      {d}ч
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              <div className="mb-4">
                <div className="text-xs text-gray-400 mb-2">Время начала</div>
                <div className="grid grid-cols-4 gap-1.5 max-h-40 overflow-y-auto">
                  {timeSlots.map((slot) => {
                    const isAvailable = getTimeSlotAvailability[slot.time]
                    const isSelected = selectedTime === slot.time
                    
                    return (
                      <button
                        key={`${slot.date}-${slot.time}`}
                        onClick={() => isAvailable && setSelectedTime(slot.time)}
                        disabled={!isAvailable}
                        className={`py-1.5 rounded-xl text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-emerald-500/30 text-emerald-400 border border-emerald-500/50'
                            : isAvailable
                            ? 'glass-card text-gray-300'
                            : 'bg-gray-800/30 text-gray-500 cursor-not-allowed opacity-50'
                        }`}
                      >
                        {slot.time}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Price Summary */}
              <div className="glass-card rounded-xl p-3 mb-4 space-y-1">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Цена за час:</span>
                  <span>{selectedPC.pricePerHour}₽</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Длительность:</span>
                  <span>{selectedDuration}ч</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between">
                  <span className="text-white font-semibold text-sm">Итого:</span>
                  <span className="text-emerald-400 font-bold">{totalPrice}₽</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Баланс:</span>
                  <span className={user.balance >= totalPrice ? 'text-emerald-400' : 'text-red-400'}>
                    {user.balance}₽
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowBookingModal(false)
                    setSelectedPC(null)
                  }}
                  className="flex-1 glass-card py-2.5 rounded-xl text-white font-medium text-sm"
                >
                  Отмена
                </button>
                <button
                  onClick={handleConfirmBooking}
                  disabled={!canBook}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    canBook
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Забронировать
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PC Details Modal (for occupied/booked PCs) */}
      <AnimatePresence>
        {selectedPC && !showBookingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedPC(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card rounded-3xl p-6 max-w-sm w-full mx-4"
            >
              <h3 className="text-xl font-bold text-white mb-4">{selectedPC.name}</h3>
              
              <div className="space-y-3 mb-4">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Статус</div>
                  <div className="text-white font-semibold">{getPCStatusLabel(selectedPC.status)}</div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-400 mb-1">Характеристики</div>
                  <div className="space-y-1 text-sm text-white">
                    <div>CPU: {selectedPC.specs.cpu}</div>
                    <div>GPU: {selectedPC.specs.gpu}</div>
                    <div>RAM: {selectedPC.specs.ram}</div>
                    <div>Монитор: {selectedPC.specs.monitor}</div>
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-400 mb-1">Цена</div>
                  <div className="text-emerald-400 font-bold">{selectedPC.pricePerHour}₽/час</div>
                </div>
              </div>

              <button
                onClick={() => setSelectedPC(null)}
                className="w-full glass-card py-2.5 rounded-xl text-white font-medium text-sm"
              >
                Закрыть
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

Home.displayName = 'Home'

export default Home
