import { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react'

const ToastContext = createContext(null)

let toastCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    toastCounter++;
    const id = `${Date.now()}-${toastCounter}`
    setToasts((prev) => [...prev, { id, message, type }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />
      case 'error':
        return <XCircle className="w-5 h-5 text-rose-400" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />
      case 'info':
      default:
        return <Info className="w-5 h-5 text-sky-400" />
    }
  }

  const getBorderColor = (type) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/20 bg-emerald-950/20'
      case 'error':
        return 'border-rose-500/20 bg-rose-950/20'
      case 'warning':
        return 'border-amber-500/20 bg-amber-950/20'
      case 'info':
      default:
        return 'border-sky-500/20 bg-sky-950/20'
    }
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Portal/Container */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl animate-slide-in-right pointer-events-auto ${getBorderColor(toast.type)}`}
            role="alert"
          >
            <div className="flex-shrink-0">{getIcon(toast.type)}</div>
            <div className="flex-1 text-sm font-medium text-slate-200">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
