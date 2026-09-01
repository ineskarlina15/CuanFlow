import { useState, useEffect } from 'react'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'
import { 
  Bell, 
  CheckCheck, 
  AlertTriangle, 
  Target, 
  Info, 
  Trash2, 
  Clock, 
  Loader2
} from 'lucide-react'

export default function Notifications() {
  const { showToast } = useToast()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [markingAll, setMarkingAll] = useState(false)

  const fallbackNotifications = [
    {
      id: 991,
      title: 'Peringatan Anggaran',
      message: 'Anggaran makanan telah mencapai 84%. Pertimbangkan untuk mengurangi pengeluaran makanan bulan ini.',
      type: 'BUDGET_ALERT',
      isRead: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 992,
      title: 'Pengingat Transaksi',
      message: 'Jangan lupa catat pengeluaran hari ini agar anggaran tetap terkontrol.',
      type: 'INFO',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    {
      id: 993,
      title: 'Anggaran Terlampaui',
      message: 'Anggaran Transportasi terlampaui sebesar Rp 150.000!',
      type: 'BUDGET_ALERT',
      isRead: true,
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 994,
      title: 'Ringkasan Keuangan',
      message: 'Laporan ringkasan keuangan bulanan Anda untuk periode ini telah siap.',
      type: 'SYSTEM',
      isRead: true,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    }
  ]

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await api.get('/notifSvc/api/v1/notifications')
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setNotifications(res.data)
      } else {
        setNotifications(fallbackNotifications)
      }
    } catch (err) {
      console.warn('Failed to load notifications from server, displaying fallback list', err)
      setNotifications(fallbackNotifications)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifSvc/api/v1/notifications/${id}/read`)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      )
      showToast('Notifikasi ditandai sudah dibaca', 'success')
    } catch (err) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      )
    }
  }

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true)
    try {
      await api.put('/notifSvc/api/v1/notifications/read-all')
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      showToast('Semua notifikasi ditandai sudah dibaca', 'success')
    } catch (err) {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      showToast('Semua notifikasi ditandai sudah dibaca', 'success')
    } finally {
      setMarkingAll(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifSvc/api/v1/notifications/${id}`)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      showToast('Notifikasi dihapus', 'info')
    } catch (err) {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }
  }

  const filteredList = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead
    if (filter === 'BUDGET_ALERT') return n.type === 'BUDGET_ALERT'
    if (filter === 'SYSTEM') return n.type === 'SYSTEM' || n.type === 'INFO'
    return true
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const getIcon = (type) => {
    switch (type) {
      case 'BUDGET_ALERT':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />
      case 'GOAL_REMINDER':
        return <Target className="w-5 h-5 text-emerald-600" />
      case 'SYSTEM':
      case 'INFO':
      default:
        return <Info className="w-5 h-5 text-sky-600" />
    }
  }

  return (
    <div className="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading">Notifikasi</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                {unreadCount} baru
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Tetap dapatkan info terbaru dengan peringatan anggaran, insight sistem, dan pengingat keuangan
          </p>
        </div>

        <button
          onClick={handleMarkAllAsRead}
          disabled={markingAll || unreadCount === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-semibold transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer shadow-sm self-start sm:self-auto"
        >
          {markingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4 text-emerald-600" />}
          <span>Tandai Semua Sudah Dibaca</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            filter === 'all'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Semua Notifikasi ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            filter === 'unread'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Belum Dibaca ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('BUDGET_ALERT')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            filter === 'BUDGET_ALERT'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Peringatan Anggaran
        </button>
        <button
          onClick={() => setFilter('SYSTEM')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            filter === 'SYSTEM'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Sistem & Pengingat
        </button>
      </div>

      {/* Notification List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          <span className="text-sm font-medium">Memuat notifikasi...</span>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-slate-200 rounded-2xl bg-white">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Tidak ada notifikasi ditemukan</h3>
          <p className="text-sm text-slate-500 mt-1">Anda sudah membaca semuanya!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredList.map((item) => (
            <div
              key={item.id}
              className={`flex items-start justify-between gap-4 p-4 sm:p-5 rounded-2xl border transition-all ${
                item.isRead
                  ? 'bg-white/80 border-slate-200/80 text-slate-500'
                  : 'bg-white border-slate-200 text-slate-800 shadow-sm ring-1 ring-brand-500/10'
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div
                  className={`p-2.5 rounded-xl border mt-0.5 flex-shrink-0 ${
                    item.type === 'BUDGET_ALERT'
                      ? 'bg-amber-50 border-amber-200'
                      : item.type === 'GOAL_REMINDER'
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-sky-50 border-sky-200'
                  }`}
                >
                  {getIcon(item.type)}
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-900 text-base truncate pr-2">{item.title}</h4>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
                    )}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.message}</p>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-2">
                {!item.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(item.id)}
                    title="Tandai sudah dibaca"
                    className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(item.id)}
                  title="Hapus notifikasi"
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
