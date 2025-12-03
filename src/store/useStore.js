import { create } from 'zustand'

// Функция для автоматического обновления статусов ПК на основе бронирований
const updatePCStatusesFromBookings = (pcs, bookings, user) => {
  const now = new Date()
  let updatedUser = { ...user }
  let updatedBookings = [...bookings]
  
  // Убеждаемся, что у пользователя есть все необходимые поля
  if (!updatedUser.totalHours) updatedUser.totalHours = 0
  if (!updatedUser.rating) updatedUser.rating = 1500
  if (!updatedUser.level) updatedUser.level = 1
  
  // Автоматически завершаем прошедшие сессии и начисляем рейтинг
  const completedSessions = updatedBookings.filter(b => {
    if (b.completed) return false
    if (!b.date || !b.duration) return false
    try {
      const bookingDate = new Date(b.date)
      const bookingEnd = new Date(bookingDate.getTime() + b.duration * 60 * 60 * 1000)
      return bookingEnd <= now
    } catch (e) {
      return false
    }
  })

  if (completedSessions.length > 0) {
    let totalRatingGain = 0
    let totalHoursGain = 0

    completedSessions.forEach(booking => {
      const baseRating = 10
      const durationBonus = (booking.duration || 0) * 5
      const ratingGain = baseRating + durationBonus
      totalRatingGain += ratingGain
      totalHoursGain += (booking.duration || 0)
    })

    const newTotalHours = (updatedUser.totalHours || 0) + totalHoursGain
    const newRating = (updatedUser.rating || 1500) + totalRatingGain
    const newLevel = Math.floor(newTotalHours / 100) + 1

    updatedUser = {
      ...updatedUser,
      totalHours: newTotalHours,
      rating: newRating,
      level: newLevel,
    }

    updatedBookings = updatedBookings.map(b => {
      if (!b.date || !b.duration) return b
      try {
        const bookingDate = new Date(b.date)
        const bookingEnd = new Date(bookingDate.getTime() + b.duration * 60 * 60 * 1000)
        if (bookingEnd <= now && !b.completed) {
          return { ...b, completed: true, completedAt: now.toISOString() }
        }
      } catch (e) {
        // Игнорируем некорректные даты
      }
      return b
    })
  }
  
  const updatedPCs = (pcs || []).map(pc => {
    // Находим активные бронирования для этого ПК
    const activeBookings = updatedBookings.filter(b => {
      if (!b || b.pcId !== pc.id || b.completed) return false
      if (!b.date || !b.duration) return false
      try {
        const bookingDate = new Date(b.date)
        const bookingEnd = new Date(bookingDate.getTime() + b.duration * 60 * 60 * 1000)
        return bookingEnd > now
      } catch (e) {
        return false
      }
    })

    if (activeBookings.length === 0) {
      // Если нет активных бронирований, проверяем не занят ли ПК сейчас
      return pc.status === 'occupied' ? pc : { ...pc, status: 'available' }
    }

    // Сортируем по времени начала
    activeBookings.sort((a, b) => {
      try {
        return new Date(a.date) - new Date(b.date)
      } catch (e) {
        return 0
      }
    })
    const nextBooking = activeBookings[0]
    if (!nextBooking || !nextBooking.date || !nextBooking.duration) return pc
    
    try {
      const bookingStart = new Date(nextBooking.date)
      const bookingEnd = new Date(bookingStart.getTime() + nextBooking.duration * 60 * 60 * 1000)

      // Если бронирование уже началось - ПК занят
      if (bookingStart <= now && bookingEnd > now) {
        return { ...pc, status: 'occupied' }
      }
      
      // Если бронирование еще не началось - ПК забронирован
      if (bookingStart > now) {
        return { ...pc, status: 'booked' }
      }
    } catch (e) {
      // Игнорируем ошибки парсинга дат
    }

    return pc
  })

  return { pcs: updatedPCs, bookings: updatedBookings, user: updatedUser }
}

const useStore = create((set, get) => {
  // Инициализация ПК
  const getInitialPCs = () => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      name: `PC-${String(i + 1).padStart(2, '0')}`,
      status: i < 5 ? 'occupied' : i < 10 ? 'booked' : 'available',
      specs: {
        cpu: i < 10 ? 'Intel i9-13900K' : i < 20 ? 'Intel i7-13700K' : 'Intel i5-13600K',
        gpu: i < 10 ? 'RTX 4090' : i < 20 ? 'RTX 4070' : 'RTX 4060',
        ram: i < 10 ? '64GB DDR5' : i < 20 ? '32GB DDR5' : '16GB DDR5',
        monitor: i < 10 ? '240Hz 4K' : '144Hz 2K',
      },
      pricePerHour: i < 10 ? 300 : i < 20 ? 200 : 150,
      position: {
        row: Math.floor(i / 5) + 1,
        col: (i % 5) + 1,
      },
      lastUsed: null,
    }))
  }

  return {
    // Пользователь
    user: {
      id: Date.now().toString(),
      name: 'Геймер',
      avatar: '🎮',
      balance: 10000000,
      rating: 1500,
      level: 1,
      games: ['CS2', 'Valorant', 'Dota 2'],
      totalHours: 0,
      achievements: [],
    },

      // Бронирования
      bookings: [],
      
      // История покупок
      purchaseHistory: [],
        
        // ПК в зале (6 рядов по 5 ПК) - всегда инициализируем
        pcs: getInitialPCs(),

      // Магазин
      shopItems: [
        { id: 1, name: 'Кола', price: 150, category: 'drinks', image: '🥤', stock: 100 },
        { id: 2, name: 'Энергетик', price: 200, category: 'drinks', image: '⚡', stock: 50 },
        { id: 3, name: 'Чипсы', price: 180, category: 'snacks', image: '🍿', stock: 80 },
        { id: 4, name: 'Пицца', price: 500, category: 'food', image: '🍕', stock: 20 },
        { id: 5, name: 'Футболка', price: 1500, category: 'merch', image: '👕', stock: 15 },
        { id: 6, name: 'Пополнение Steam', price: 1000, category: 'gaming', image: '🎮', stock: 999 },
        { id: 7, name: 'Мышь Razer', price: 5000, category: 'devices', image: '🖱️', stock: 5 },
        { id: 8, name: 'Клавиатура', price: 6000, category: 'devices', image: '⌨️', stock: 3 },
      ],

      // Турниры
      tournaments: [
        {
          id: 1,
          name: 'CS2 Weekly',
          game: 'Counter-Strike 2',
          entryFee: 500,
          prize: 5000,
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          participants: 12,
          maxParticipants: 16,
          status: 'open',
        },
        {
          id: 2,
          name: 'Valorant Open',
          game: 'Valorant',
          entryFee: 300,
          prize: 3000,
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          participants: 8,
          maxParticipants: 16,
          status: 'open',
        },
        {
          id: 3,
          name: 'Dota 2 Championship',
          game: 'Dota 2',
          entryFee: 1000,
          prize: 15000,
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          participants: 24,
          maxParticipants: 32,
          status: 'open',
        },
      ],

      // Социальная сеть
      onlineUsers: [
        { id: 1, name: 'ProGamer', avatar: '🎮', rating: 2500, game: 'CS2', status: 'online' },
        { id: 2, name: 'NoobSlayer', avatar: '⚔️', rating: 1800, game: 'Valorant', status: 'online' },
        { id: 3, name: 'CyberNinja', avatar: '🥷', rating: 2200, game: 'Dota 2', status: 'online' },
        { id: 4, name: 'GamerGirl', avatar: '👾', rating: 2100, game: 'Valorant', status: 'online' },
        { id: 5, name: 'ElitePlayer', avatar: '🔥', rating: 2800, game: 'CS2', status: 'online' },
      ],

      // Корзина магазина
      cart: [],

      // Чат и сообщения
      chatRequests: [],
      messages: [],

      // Настройки уведомлений
      notifications: {
        deadHour: false,
        blindDate: false,
      },

      // Действия
      setUser: (user) => set({ user }),
      
      updateBalance: (amount) => {
        const state = get()
        const newBalance = Math.max(0, state.user.balance + amount)
        set({
          user: { ...state.user, balance: newBalance },
        })
        return newBalance
      },
      
      addBooking: (booking) => {
        const state = get()
        const newBooking = {
          ...booking,
          id: Date.now(),
          createdAt: new Date().toISOString(),
          completed: false,
        }
        const updatedBookings = [...state.bookings, newBooking]
        const result = updatePCStatusesFromBookings(state.pcs, updatedBookings, state.user)
        
        set({
          bookings: result.bookings,
          pcs: result.pcs,
          user: result.user,
        })
        return newBooking.id
      },

      // Завершение сессии - начисление рейтинга и часов
      completeSession: (bookingId) => {
        const state = get()
        const booking = state.bookings.find(b => b.id === bookingId)
        
        if (!booking || booking.completed) {
          return { success: false, message: 'Сессия не найдена или уже завершена' }
        }

        // Начисляем рейтинг (базовый + бонус за длительность)
        const baseRating = 10
        const durationBonus = booking.duration * 5
        const ratingGain = baseRating + durationBonus

        // Обновляем часы и рейтинг
        const newTotalHours = state.user.totalHours + booking.duration
        const newRating = state.user.rating + ratingGain
        
        // Вычисляем новый уровень (каждые 100 часов = +1 уровень)
        const newLevel = Math.floor(newTotalHours / 100) + 1

        // Обновляем бронирование как завершенное
        const updatedBookings = state.bookings.map(b =>
          b.id === bookingId ? { ...b, completed: true, completedAt: new Date().toISOString() } : b
        )

        set({
          user: {
            ...state.user,
            totalHours: newTotalHours,
            rating: newRating,
            level: newLevel,
          },
          bookings: updatedBookings,
        })

        return {
          success: true,
          message: `Сессия завершена! +${ratingGain} рейтинга, +${booking.duration} часов`,
          ratingGain,
          newLevel,
        }
      },
      
      cancelBooking: (bookingId) => {
        const state = get()
        const booking = state.bookings.find(b => b.id === bookingId)
        
        if (!booking) {
          return { success: false, message: 'Бронирование не найдено' }
        }

        const bookingDate = new Date(booking.date)
        const now = new Date()
        const hoursUntilBooking = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60)

        let refundAmount = 0
        let message = 'Бронирование отменено'

        // Если отмена за 2+ часа до начала - возвращаем деньги
        if (hoursUntilBooking >= 2) {
          refundAmount = booking.price
          const newBalance = state.user.balance + refundAmount
          message = `Бронирование отменено. Возвращено ${refundAmount}₽`
          
          const updatedBookings = state.bookings.filter((b) => b.id !== bookingId)
          const result = updatePCStatusesFromBookings(state.pcs, updatedBookings, { ...state.user, balance: newBalance })
          
          set({
            bookings: result.bookings,
            pcs: result.pcs,
            user: result.user,
          })
        } else if (hoursUntilBooking > 0) {
          message = 'Бронирование отменено. Деньги не возвращаются (менее 2 часов до начала)'
          const updatedBookings = state.bookings.filter((b) => b.id !== bookingId)
          const result = updatePCStatusesFromBookings(state.pcs, updatedBookings, state.user)
          
          set({
            bookings: result.bookings,
            pcs: result.pcs,
            user: result.user,
          })
        } else {
          message = 'Бронирование отменено'
          const updatedBookings = state.bookings.filter((b) => b.id !== bookingId)
          const result = updatePCStatusesFromBookings(state.pcs, updatedBookings, state.user)
          
          set({
            bookings: result.bookings,
            pcs: result.pcs,
            user: result.user,
          })
        }

        return { success: true, message, refundAmount }
      },
      
      updatePCStatus: (pcId, status) => {
        const state = get()
        const updatedPCs = state.pcs.map((pc) =>
          pc.id === pcId ? { ...pc, status, lastUsed: status === 'occupied' ? new Date().toISOString() : pc.lastUsed } : pc
        )
        set({ pcs: updatedPCs })
      },
      
      // Автоматическое обновление статусов ПК
      refreshPCStatuses: () => {
        const state = get()
        // Убеждаемся, что pcs - это массив
        const currentPCs = Array.isArray(state.pcs) ? state.pcs : []
        const currentBookings = Array.isArray(state.bookings) ? state.bookings : []
        const currentUser = state.user || {}
        
        const result = updatePCStatusesFromBookings(currentPCs, currentBookings, currentUser)
        set({ 
          pcs: Array.isArray(result.pcs) ? result.pcs : currentPCs,
          bookings: Array.isArray(result.bookings) ? result.bookings : currentBookings,
          user: result.user || currentUser,
        })
      },
      
      addToCart: (item) => set((state) => ({
        cart: [...state.cart, { ...item, cartId: Date.now() }],
      })),
      
      removeFromCart: (cartId) => set((state) => ({
        cart: state.cart.filter((item) => item.cartId !== cartId),
      })),
      
      clearCart: () => set({ cart: [] }),
      
      purchaseCart: () => {
        const state = get()
        const cartTotal = state.cart.reduce((sum, item) => sum + item.price, 0)
        
        if (state.user.balance >= cartTotal && state.cart.length > 0) {
          // Обновляем баланс
          const newBalance = state.user.balance - cartTotal
          
          // Обновляем остатки товаров
          const updatedShopItems = state.shopItems.map(item => {
            const cartItem = state.cart.find(ci => ci.id === item.id)
            if (cartItem) {
              return { ...item, stock: Math.max(0, item.stock - 1) }
            }
            return item
          })
          
          // Сохраняем покупку в историю
          const purchase = {
            id: Date.now(),
            items: state.cart.map(item => ({
              id: item.id,
              name: item.name,
              image: item.image,
              price: item.price,
            })),
            total: cartTotal,
            date: new Date().toISOString(),
          }
          
          set({
            user: { ...state.user, balance: newBalance },
            shopItems: updatedShopItems,
            cart: [],
            purchaseHistory: [...state.purchaseHistory, purchase],
          })
          
          return { success: true, message: 'Покупка успешно завершена!' }
        }
        
        return { success: false, message: 'Недостаточно средств' }
      },
      
      joinTournament: (tournamentId) => {
        const state = get()
        const tournament = state.tournaments.find(t => t.id === tournamentId)
        
        if (!tournament) return { success: false, message: 'Турнир не найден' }
        if (tournament.participants >= tournament.maxParticipants) {
          return { success: false, message: 'Мест нет' }
        }
        if (state.user.balance < tournament.entryFee) {
          return { success: false, message: 'Недостаточно средств' }
        }
        
        const newBalance = state.user.balance - tournament.entryFee
        const updatedTournaments = state.tournaments.map((t) =>
          t.id === tournamentId
            ? { ...t, participants: t.participants + 1 }
            : t
        )
        
        set({
          user: { ...state.user, balance: newBalance },
          tournaments: updatedTournaments,
        })
        
        return { success: true, message: 'Вы успешно зарегистрированы на турнир!' }
      },
      
      // Отправка сообщения в чат
      sendChatRequest: (userId) => {
        const state = get()
        const targetUser = state.onlineUsers.find(u => u.id === userId)
        
        if (!targetUser) {
          return { success: false, message: 'Пользователь не найден' }
        }

        // Проверяем, не был ли уже отправлен запрос этому пользователю
        const existingRequest = state.chatRequests.find(
          req => req.fromUserId === state.user.id && req.toUserId === userId
        )

        if (existingRequest) {
          return { 
            success: false, 
            message: 'Запрос уже отправлен этому пользователю' 
          }
        }

        const newRequest = {
          id: Date.now(),
          fromUserId: state.user.id,
          fromUserName: state.user.name,
          toUserId: userId,
          toUserName: targetUser.name,
          status: 'pending',
          createdAt: new Date().toISOString(),
        }

        set({
          chatRequests: [...state.chatRequests, newRequest],
        })

        return { 
          success: true, 
          message: `Запрос на чат отправлен пользователю ${targetUser.name}. Ожидайте ответа!` 
        }
      },
      
      // Подбор пары для Blind Date Gaming
      findBlindDatePair: () => {
        const state = get()
        
        // Находим пользователей с похожими играми и рейтингом
        const userGames = state.user.games || []
        const userRating = state.user.rating || 1500
        
        const potentialPairs = state.onlineUsers.filter(u => {
          // Ищем пользователей с пересекающимися играми
          const hasCommonGame = userGames.some(game => u.game === game)
          
          // Рейтинг в пределах ±300
          const ratingDiff = Math.abs((u.rating || 1500) - userRating)
          
          return hasCommonGame && ratingDiff <= 300 && u.id.toString() !== state.user.id.toString()
        })

        if (potentialPairs.length === 0) {
          return { 
            success: false, 
            message: 'Подходящая пара не найдена. Попробуйте позже!' 
          }
        }

        // Выбираем случайную пару
        const selectedPair = potentialPairs[Math.floor(Math.random() * potentialPairs.length)]
        
        // Создаем запрос на чат через прямое обращение к функции
        const targetUser = state.onlineUsers.find(u => u.id === selectedPair.id)
        
        if (!targetUser) {
          return { success: false, message: 'Пользователь не найден' }
        }

        const newRequest = {
          id: Date.now(),
          fromUserId: state.user.id,
          fromUserName: state.user.name,
          toUserId: selectedPair.id,
          toUserName: selectedPair.name,
          status: 'pending',
          type: 'blindDate',
          discount: 50,
          duration: 3,
          createdAt: new Date().toISOString(),
        }

        set({
          chatRequests: [...state.chatRequests, newRequest],
          notifications: {
            ...state.notifications,
            blindDate: true,
          },
        })
        
        return {
          success: true,
          message: `Найдена пара: ${selectedPair.name}! Запрос на чат отправлен. Вы получите скидку -50% на 3 часа при подтверждении.`,
          pair: selectedPair,
        }
      },
      
      // Включение/выключение уведомлений Dead Hour
      toggleDeadHourNotifications: () => {
        const state = get()
        const newValue = !state.notifications.deadHour
        
        set({
          notifications: {
            ...state.notifications,
            deadHour: newValue,
          },
        })
        
        return {
          success: true,
          enabled: newValue,
          message: newValue 
            ? 'Уведомления Dead Hour включены! Вы получите уведомление за 10 минут до начала бесплатного часа.'
            : 'Уведомления Dead Hour выключены.',
        }
      },
      
      addOnlineUser: (user) => set((state) => ({
        onlineUsers: [...state.onlineUsers, user],
      })),

      // Отправка запроса в чат
      sendChatRequest: (targetUserId) => {
        const state = get()
        const targetUser = state.onlineUsers.find(u => u.id === targetUserId)
        
        if (!targetUser) {
          return { success: false, message: 'Пользователь не найден' }
        }

        const chatRequest = {
          id: Date.now(),
          fromUserId: state.user.id,
          fromUserName: state.user.name,
          toUserId: targetUserId,
          toUserName: targetUser.name,
          status: 'pending',
          createdAt: new Date().toISOString(),
        }

        set((state) => ({
          chatRequests: [...state.chatRequests, chatRequest],
        }))

        return { 
          success: true, 
          message: `Запрос на чат отправлен пользователю ${targetUser.name}!` 
        }
      },

      // Поиск пары для Blind Date Gaming
      findBlindDatePair: () => {
        const state = get()
        
        // Ищем пользователя с похожим рейтингом и играми
        const compatibleUsers = state.onlineUsers.filter(u => {
          const ratingDiff = Math.abs(u.rating - state.user.rating)
          const hasCommonGame = state.user.games.some(game => u.game === game)
          return ratingDiff <= 300 && hasCommonGame && u.id !== state.user.id
        })

        if (compatibleUsers.length === 0) {
          return { 
            success: false, 
            message: 'Подходящая пара не найдена. Попробуйте позже!' 
          }
        }

        // Выбираем случайного пользователя
        const pair = compatibleUsers[Math.floor(Math.random() * compatibleUsers.length)]
        
        // Создаем специальное бронирование со скидкой 50%
        const booking = {
          id: Date.now(),
          type: 'blindDate',
          pairUserId: pair.id,
          pairUserName: pair.name,
          discount: 50,
          duration: 3,
          createdAt: new Date().toISOString(),
        }

        set((state) => ({
          notifications: {
            ...state.notifications,
            blindDate: true,
          },
        }))

        return { 
          success: true, 
          message: `Найдена пара: ${pair.name}! Скидка -50% на 3 часа активирована.` 
        }
      },

      // Переключение уведомлений Dead Hour
      toggleDeadHourNotifications: () => {
        const state = get()
        const newValue = !state.notifications.deadHour
        
        set({
          notifications: {
            ...state.notifications,
            deadHour: newValue,
          },
        })

        return { 
          success: true, 
          message: newValue 
            ? 'Уведомления Dead Hour включены! Вы получите уведомление за 10 минут до начала.' 
            : 'Уведомления Dead Hour отключены.' 
        }
      },
  }
})

export default useStore
