import { memo, useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../store/useStore'
import Modal from '../components/Modal'

const HallMap = memo(() => {
  const navigate = useNavigate()
  const { pcs, bookings, updatePCStatus, refreshPCStatuses } = useStore()
  
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
  const [filter, setFilter] = useState('all')

  const safePCs = useMemo(() => Array.isArray(pcs) ? pcs : [], [pcs])
  const filteredPCs = useMemo(() => safePCs.filter(pc => {
    if (!pc) return false
    if (filter === 'all') return true
    return pc.status === filter
  }), [safePCs, filter])

  const handleCloseModal = useCallback(() => {
    setSelectedPC(null)
  }, [])

  // Категории рядов
  const rowCategories = {
    1: { name: 'VIP', color: 'from-purple-500/30 to-pink-500/30' },
    2: { name: 'VIP', color: 'from-purple-500/30 to-pink-500/30' },
    3: { name: 'Стандарт', color: 'from-blue-500/30 to-cyan-500/30' },
    4: { name: 'Стандарт', color: 'from-blue-500/30 to-cyan-500/30' },
    5: { name: 'Эконом', color: 'from-gray-500/30 to-gray-600/30' },
    6: { name: 'Эконом', color: 'from-gray-500/30 to-gray-600/30' },
  }

  // Вычисляем время освобождения для ПК
  const getPCFreeTime = (pc) => {
    if (pc.status === 'available') return null
    
    // Находим активные бронирования для этого ПК
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
      navigate(`/booking/${pc.id}`)
    } else {
      setSelectedPC(pc)
    }
  }

  // Группируем ПК по рядам и категориям
  const rows = Array.from({ length: 6 }, (_, i) => i + 1)
  const pcsByRow = rows.map(row => filteredPCs.filter(pc => pc.position.row === row))
  
  // Группируем ряды по категориям
  const groupedRows = useMemo(() => {
    const groups = {}
    rows.forEach(row => {
      const category = rowCategories[row]?.name || 'Другое'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(row)
    })
    return groups
  }, [])

  return (
    <div className="container mx-auto px-3 py-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">💻</span> Карта зала
        </h1>
        <div className="glass-card px-2.5 py-1 rounded-lg text-xs">
          {(Array.isArray(pcs) ? pcs : []).filter(p => p && p.status === 'available').length} свободно
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {['all', 'available', 'booked', 'occupied'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              filter === f
                ? 'bg-emerald-500/30 text-emerald-400 border border-emerald-500/50'
                : 'glass-card text-gray-300'
            }`}
          >
            {f === 'all' ? 'Все' : getPCStatusLabel(f)}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="glass-card rounded-xl p-2.5">
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-gradient-to-r from-emerald-500 to-blue-500" />
            <span className="text-gray-300">Свободен</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-gradient-to-r from-orange-500 to-pink-500" />
            <span className="text-gray-300">Забронирован</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-gradient-to-r from-purple-500 to-blue-500" />
            <span className="text-gray-300">Занят</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-gradient-to-r from-gray-600 to-gray-800" />
            <span className="text-gray-300">Ремонт</span>
          </div>
        </div>
      </div>

      {/* Hall Map by Categories */}
      <div className="space-y-3">
        {Object.entries(groupedRows).map(([category, categoryRows]) => (
          <div key={category} className="space-y-2">
            {/* Category Header */}
            <div className={`glass-card rounded-xl p-2 ${rowCategories[categoryRows[0]]?.color || ''}`}>
              <div className="text-xs font-bold text-white">{category}</div>
            </div>
            
            {/* Rows in Category */}
            {categoryRows.map((row) => {
              const rowPCs = pcsByRow[row - 1]
              if (rowPCs.length === 0) return null

              return (
                <div key={row} className="space-y-1">
                  <div className="text-[10px] text-gray-400 px-1">Ряд {row}</div>
                  <div className="grid grid-cols-5 gap-1">
                    {Array.from({ length: 5 }, (_, col) => {
                      const pc = rowPCs.find(p => p.position.col === col + 1)
                      if (!pc) {
                        return <div key={col} className="aspect-square" />
                      }

                      const freeTime = getPCFreeTime(pc)

                      return (
                        <motion.button
                          key={pc.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handlePCClick(pc)}
                          className={`aspect-square glass-card rounded-lg p-1 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br ${getPCStatusColor(pc.status)} transition-all ${
                            pc.status === 'available' ? 'cursor-pointer' : 'opacity-70'
                          }`}
                        >
                          <div className="text-[10px] font-bold text-white leading-tight">{pc.name}</div>
                          <div className="text-[7px] text-gray-300 mt-0.5 leading-tight text-center">
                            {getPCStatusLabel(pc.status)}
                          </div>
                          {freeTime && (
                            <div className="text-[7px] text-emerald-400 mt-0.5 font-medium">
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
        ))}
      </div>

      {/* PC Details Modal */}
      <Modal
        isOpen={!!selectedPC}
        onClose={handleCloseModal}
        zIndex={100}
      >
        {selectedPC && (
          <>
            <h3 className="text-xl font-bold text-white mb-3">{selectedPC.name}</h3>
            
            <div className="space-y-2.5 mb-4">
              <div>
                <div className="text-xs text-gray-400 mb-1">Место</div>
                <div className="text-white font-semibold">Ряд {selectedPC.position.row}, Место {selectedPC.position.col}</div>
              </div>
              
              <div>
                <div className="text-xs text-gray-400 mb-1">Статус</div>
                <div className="text-white font-semibold">{getPCStatusLabel(selectedPC.status)}</div>
                {getPCFreeTime(selectedPC) && (
                  <div className="text-xs text-emerald-400 mt-1">
                    Освободится через: {getPCFreeTime(selectedPC)}
                  </div>
                )}
              </div>
              
              <div>
                <div className="text-xs text-gray-400 mb-1">Характеристики</div>
                <div className="space-y-0.5 text-xs text-white">
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

            {selectedPC.status === 'available' && (
              <button
                onClick={() => {
                  navigate(`/booking/${selectedPC.id}`)
                  handleCloseModal()
                }}
                className="w-full bg-emerald-500 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-emerald-500/30 mb-2"
              >
                Забронировать
              </button>
            )}
            
            <button
              onClick={handleCloseModal}
              className="w-full glass-card py-2.5 rounded-xl text-white font-medium text-sm"
            >
              Закрыть
            </button>
          </>
        )}
      </Modal>
    </div>
  )
})

HallMap.displayName = 'HallMap'

export default HallMap
