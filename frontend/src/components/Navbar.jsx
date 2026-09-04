import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import CuanFlowLogo from './CuanFlowLogo'
import { Bell, Menu, User, LogOut, ChevronDown, Home, Loader2, Info, AlertTriangle } from 'lucide-react'
import Modal from './Modal'
import api from '../services/api'

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  
  const [profileOpen, setProfileOpen] = useState(false)
  
  // Notification Dropdown State
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loadingNotifs, setLoadingNotifs] = useState(false)
  
  // Logout Modal State
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  const fetchNotifs = async () => {
    try {
      const res = await api.get('/notifSvc/api/v1/notifications')
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
      const count = list.filter(n => !n.isRead && !n.read).length
      setUnreadCount(count)
      setNotifications(list.slice(0, 5))
    } catch {
      // Fallback
    }
  }

  useEffect(() => {
    fetchNotifs()
    const handleNotifUpdate = () => fetchNotifs()
    window.addEventListener('cuanflow_notifications_updated', handleNotifUpdate)
    return () => window.removeEventListener('cuanflow_notifications_updated', handleNotifUpdate)
  }, [])

  const handleLogout = () => {
    setIsLogoutModalOpen(false)
    logout()
  }

  const getNotifIcon = (type) => {
    switch (type) {
      case 'BUDGET_ALERT':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />
      case 'INFO':
        return <Info className="w-4 h-4 text-blue-500" />
      default:
        return <Bell className="w-4 h-4 text-slate-500" />
    }
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 h-16 border-b border-slate-200 bg-white/95 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 shadow-xs transition-colors">
        
        {/* Far Left Pojok Corner Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden text-slate-600 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <CuanFlowLogo size="md" />
          </Link>
        </div>

        {/* Far Right Top Header Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Back to Public Homepage Button */}
          <Link
            to="/"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-xs"
            title="Kembali ke Homepage Utama"
          >
            <Home className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Homepage</span>
          </Link>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
              className="relative p-2.5 text-slate-600 hover:text-blue-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Notifikasi"
              title="Notifikasi"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-xs animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl border border-slate-200 bg-white shadow-xl flex flex-col overflow-hidden z-20 animate-fade-in origin-top-right">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-slate-900">Notifikasi</h3>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-600">
                          {unreadCount} baru
                        </span>
                      )}
                    </div>
                    <Link 
                      to="/notifications" 
                      onClick={() => setNotifOpen(false)}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      Lihat Semua
                    </Link>
                  </div>
                  
                  <div className="max-h-[300px] overflow-y-auto flex flex-col divide-y divide-slate-100">
                    {loadingNotifs ? (
                      <div className="flex items-center justify-center p-6 text-slate-400">
                        <Loader2 className="w-5 h-5 animate-spin" />
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-500 text-xs font-medium">
                        Belum ada notifikasi baru.
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={async () => {
                            try {
                              await api.patch(`/notifSvc/api/v1/notifications/${n.id}/read`)
                              setUnreadCount(prev => Math.max(0, prev - 1))
                              setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, isRead: true, read: true } : item))
                              window.dispatchEvent(new Event('cuanflow_notifications_updated'))
                            } catch {}
                          }}
                          className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 items-start ${
                            !n.isRead && !n.read ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <div className={`mt-0.5 p-1.5 rounded-full shrink-0 ${n.type === 'BUDGET_ALERT' ? 'bg-rose-100' : 'bg-blue-100'}`}>
                            {getNotifIcon(n.type)}
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-bold text-slate-800 leading-tight">{n.title}</span>
                            <span className="text-[11px] text-slate-500 line-clamp-2">{n.message}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Profile Info */}
          {user && (
            <div className="relative">
              <button
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                className="flex items-center gap-2.5 p-1.5 pr-2 rounded-xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-md overflow-hidden shrink-0">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    (user?.name || user?.username || 'G').charAt(0).toUpperCase()
                  )}
                </div>
                <div className="hidden sm:flex flex-col items-start text-left">
                  <span className="text-xs font-bold text-slate-800 leading-none">
                    {user?.name || user?.username || 'Galang'}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 mt-0.5 leading-none uppercase">
                    {user?.role || 'USER'}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setProfileOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-200 bg-white shadow-xl p-1.5 z-20 animate-fade-in origin-top-right">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-400">Masuk sebagai</p>
                      <p className="text-sm font-bold text-slate-800 truncate">{user.email || 'galang@email.com'}</p>
                    </div>
                    
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        <User className="w-4 h-4 text-blue-600" />
                        <span>Profil Saya</span>
                      </Link>

                      <button
                        onClick={() => {
                          setProfileOpen(false)
                          setIsLogoutModalOpen(true)
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Keluar</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Konfirmasi Keluar"
      >
        <div className="flex flex-col items-center justify-center text-center gap-3 py-2">
          <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shadow-inner mb-2">
            <LogOut className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-900">Apakah Anda yakin ingin keluar?</h3>
          <p className="text-sm text-slate-500 max-w-[280px]">
            Sesi Anda akan berakhir dan Anda harus masuk kembali untuk mengakses CuanFlow.
          </p>
          
          <div className="flex gap-3 mt-4 w-full">
            <button
              onClick={() => setIsLogoutModalOpen(false)}
              className="flex-1 py-3 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-700 text-sm font-bold cursor-pointer transition-all"
            >
              Batal
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 rounded-xl text-white text-sm font-bold cursor-pointer shadow-lg shadow-rose-600/30 transition-all"
            >
              Ya, Keluar
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
