import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import CuanFlowLogo from './CuanFlowLogo'
import { Bell, Menu, User, LogOut, ChevronDown, Home } from 'lucide-react'

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)

  return (
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
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Back to Public Homepage Button */}
        <Link
          to="/"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-xs"
          title="Kembali ke Homepage Utama"
        >
          <Home className="w-4 h-4 text-blue-600" />
          <span className="hidden sm:inline">Homepage</span>
        </Link>

        {/* Notifications Bell Icon */}
        <Link
          to="/notifications"
          className="relative p-2.5 text-slate-600 hover:text-blue-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white animate-pulse" />
        </Link>

        {/* User Profile Info */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setProfileOpen((prev) => !prev)}
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
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-sm font-bold text-slate-800 truncate">{user.email || 'galang@email.com'}</p>
                  </div>
                  
                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                    >
                      <User className="w-4 h-4 text-blue-600" />
                      <span>My Profile</span>
                    </Link>

                    <button
                      onClick={() => {
                        setProfileOpen(false)
                        logout()
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
