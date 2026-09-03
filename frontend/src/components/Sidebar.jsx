import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  LayoutDashboard, 
  Receipt, 
  Landmark, 
  ShieldAlert, 
  Tag, 
  BarChart3, 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  X,
  Home,
  Target
} from 'lucide-react'

export default function Sidebar({ isOpen, onClose }) {
  const { logout, user } = useAuth()

  const links = [
    { to: user?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard', label: 'Beranda', icon: LayoutDashboard },
    ...(user?.role === 'ADMIN' ? [{ to: '/admin/users', label: 'Pengguna', icon: User }] : []),
    { to: '/categories', label: 'Kategori', icon: ShieldAlert },
    { to: '/tags', label: 'Tag', icon: Tag },
    { to: '/budgets', label: 'Anggaran', icon: Landmark },
    { to: '/transactions', label: 'Transaksi', icon: Receipt },
    { to: '/goals', label: 'Tujuan Keuangan', icon: Target },
    { to: '/reports', label: 'Laporan', icon: BarChart3 },
    { to: '/notifications', label: 'Notifikasi', icon: Bell },
    { to: '/profile', label: 'Profil', icon: User },
    { to: '/settings', label: 'Pengaturan', icon: Settings },
  ]

  const activeClass = 'flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30 transition-all duration-200'
  const inactiveClass = 'flex items-center gap-3 px-4 py-3 rounded-xl text-blue-100/80 hover:text-white hover:bg-white/10 transition-all duration-200 font-medium'

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-blue-950/70 backdrop-blur-sm z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Navigation sitting below top header Navbar */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 w-64 border-r border-blue-800/40 bg-[#1E3A8A] p-5 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col gap-4">
          {/* Mobile Close Button */}
          <div className="flex lg:hidden items-center justify-between pb-2 border-b border-blue-700/40">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200">Menu Navigasi</span>
            <button
              onClick={onClose}
              className="text-blue-200 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            {links.map((link) => {
              const Icon = link.icon
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{link.label}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Footer Logout Button */}
        <div className="pt-4 border-t border-blue-700/50 flex flex-col gap-1">
          <button
            onClick={() => {
              onClose()
              logout()
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-rose-300 hover:text-rose-100 hover:bg-rose-500/20 transition-all font-semibold text-sm cursor-pointer w-full"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  )
}
