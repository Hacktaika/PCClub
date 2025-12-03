import { memo, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'

const Modal = memo(({ isOpen, onClose, children, className = '', zIndex = 50 }) => {
  // Блокируем скролл при открытой модалке
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen])

  // Определяем, нужно ли выравнивание снизу (для модалок снизу)
  const isBottomModal = useMemo(() => className.includes('items-end'), [className])

  if (typeof window === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex ${isBottomModal ? 'items-end' : 'items-center justify-center'} p-4`}
          onClick={onClose}
          style={{ zIndex }}
        >
          <motion.div
            initial={isBottomModal ? { y: '100%' } : { scale: 0.95, opacity: 0, y: 20 }}
            animate={isBottomModal ? { y: 0 } : { scale: 1, opacity: 1, y: 0 }}
            exit={isBottomModal ? { y: '100%' } : { scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2, type: 'spring', damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className={`glass-card rounded-3xl p-5 max-w-sm w-full mx-auto max-h-[90vh] overflow-y-auto ${className}`}
            style={{ willChange: 'transform, opacity', zIndex: zIndex + 1 }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
})

Modal.displayName = 'Modal'

export default Modal

