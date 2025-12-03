import { memo, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../store/useStore'
import Modal from '../components/Modal'

const Shop = memo(() => {
  const { shopItems, user, addToCart, cart, removeFromCart, clearCart, purchaseCart } = useStore()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showCart, setShowCart] = useState(false)
  const [purchaseMessage, setPurchaseMessage] = useState(null)
  const [addedItemId, setAddedItemId] = useState(null)

  const categories = useMemo(() => ['all', 'drinks', 'snacks', 'food', 'merch', 'gaming', 'devices'], [])
  const categoryLabels = useMemo(() => ({
    all: 'Все',
    drinks: 'Напитки',
    snacks: 'Закуски',
    food: 'Еда',
    merch: 'Мерч',
    gaming: 'Игры',
    devices: 'Девайсы',
  }), [])

  const filteredItems = useMemo(() => 
    shopItems.filter(item =>
      selectedCategory === 'all' || item.category === selectedCategory
    ), [shopItems, selectedCategory]
  )

  const cartTotal = useMemo(() => 
    cart.reduce((sum, item) => sum + item.price, 0), [cart]
  )

  const handleAddToCart = useCallback((item) => {
    addToCart(item)
    setAddedItemId(item.id)
    setTimeout(() => setAddedItemId(null), 2000)
  }, [addToCart])

  const handlePurchase = useCallback(() => {
    const result = purchaseCart()
    if (result.success) {
      setPurchaseMessage({ type: 'success', text: result.message })
      setTimeout(() => {
        setShowCart(false)
        setPurchaseMessage(null)
      }, 1500)
    } else {
      setPurchaseMessage({ type: 'error', text: result.message })
      setTimeout(() => setPurchaseMessage(null), 3000)
    }
  }, [purchaseCart])

  const handleCloseCart = useCallback(() => {
    setShowCart(false)
    setPurchaseMessage(null)
  }, [])

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Магазин</h1>
        <button
          onClick={() => setShowCart(true)}
          className="relative glass-card px-4 py-2 rounded-xl flex items-center gap-2"
        >
          <span>🛒</span>
          {cart.length > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full text-xs flex items-center justify-center text-white font-bold"
            >
              {cart.length}
            </motion.span>
          )}
        </button>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-emerald-500/30 text-emerald-400 border border-emerald-500/50'
                : 'glass-card text-gray-300'
            }`}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filteredItems.map((item, index) => {
          const isAdded = addedItemId === item.id
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card rounded-xl p-4 flex flex-col relative"
            >
              {/* Success Animation Overlay */}
              <AnimatePresence>
                {isAdded && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.2 }}
                    className="absolute inset-0 bg-emerald-500/20 rounded-xl flex items-center justify-center z-10"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 1] }}
                      exit={{ scale: 0 }}
                      className="text-4xl"
                    >
                      ✅
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="text-4xl mb-2 text-center">{item.image}</div>
              <h3 className="font-semibold text-white mb-1 text-sm">{item.name}</h3>
              <div className="text-emerald-400 font-bold mb-3">{item.price}₽</div>
              <div className="text-xs text-gray-400 mb-3">В наличии: {item.stock}</div>
              <motion.button
                onClick={() => handleAddToCart(item)}
                disabled={item.stock === 0}
                whileHover={{ scale: item.stock > 0 ? 1.05 : 1 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full py-2 rounded-lg text-sm font-medium transition-all relative overflow-hidden ${
                  item.stock > 0
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isAdded ? (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    Добавлено! ✓
                  </motion.span>
                ) : (
                  item.stock > 0 ? 'В корзину' : 'Нет в наличии'
                )}
              </motion.button>
            </motion.div>
          )
        })}
      </div>

      {/* Cart Modal - Поверх навигации */}
      <Modal
        isOpen={showCart}
        onClose={handleCloseCart}
        zIndex={100}
        className="!max-w-full !rounded-t-3xl !rounded-b-none !p-6 pb-24 max-h-[85vh] overflow-y-auto !items-end"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Корзина</h2>
          <button
            onClick={handleCloseCart}
            className="text-2xl text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {purchaseMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 p-3 rounded-xl ${
              purchaseMessage.type === 'success'
                ? 'bg-emerald-500/20 border border-emerald-500/30'
                : 'bg-red-500/20 border border-red-500/30'
            }`}
          >
            <div className={`text-sm font-medium ${
              purchaseMessage.type === 'success' ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {purchaseMessage.text}
            </div>
          </motion.div>
        )}

        {cart.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">🛒</div>
            <p>Корзина пуста</p>
          </div>
        ) : (
          <>
            <div className="space-y-2 mb-4">
              {cart.map((item) => (
                <motion.div
                  key={item.cartId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-card rounded-xl p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.image}</span>
                    <div>
                      <div className="font-semibold text-white">{item.name}</div>
                      <div className="text-sm text-emerald-400">{item.price}₽</div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.cartId)}
                    className="text-red-400 text-xl hover:text-red-300 transition-colors"
                  >
                    ✕
                  </button>
                </motion.div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Итого:</span>
                <span className="text-emerald-400 font-bold text-xl">{cartTotal}₽</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Баланс:</span>
                <span className={user.balance >= cartTotal ? 'text-emerald-400' : 'text-red-400'}>
                  {user.balance}₽
                </span>
              </div>
            </div>

            <div className="flex gap-2 sticky bottom-0 bg-transparent pt-2">
              <button
                onClick={clearCart}
                className="flex-1 glass-card py-3 rounded-xl text-white font-medium"
              >
                Очистить
              </button>
              <motion.button
                onClick={handlePurchase}
                disabled={user.balance < cartTotal || cart.length === 0}
                whileHover={{ scale: user.balance >= cartTotal && cart.length > 0 ? 1.02 : 1 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                  user.balance >= cartTotal && cart.length > 0
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                Купить
              </motion.button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
})

Shop.displayName = 'Shop'

export default Shop
