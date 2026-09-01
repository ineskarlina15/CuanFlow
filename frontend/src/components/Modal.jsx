import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children }) {
  const modalRef = useRef(null)

  // Escape key close handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden' // Lock scroll when open
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-4 pt-20 sm:pt-20 overflow-y-auto">
      {/* Backdrop with higher z-index */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      {/* Pure White Modal Dialog Body matching Screen 4 of PDF Wireframe */}
      <div 
        ref={modalRef}
        className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl p-6 sm:p-7 z-10 animate-modal-scale text-slate-800 my-auto"
      >
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <h3 className="text-xl font-black text-slate-900 font-heading">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto pr-1.5 scrollbar-thin">
          {children}
        </div>
      </div>
    </div>
  )
}
