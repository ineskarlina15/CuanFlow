import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { 
  Users, 
  Receipt, 
  ArrowRight, 
  ShieldCheck, 
  FileText, 
  Megaphone, 
  Activity, 
  Server, 
  Database,
  Coins
} from 'lucide-react'

export default function AdminDashboard() {
  const [, setLoading] = useState(false)
  const [currency, setCurrency] = useState(localStorage.getItem('cuanflow_currency') || 'IDR')

  const [stats, setStats] = useState({
    totalUsers: '20',
    totalTransactions: '15,420',
    totalIncome: 850000000,
    totalExpense: 420000000
  })

  const [recentUsers, setRecentUsers] = useState([
    { id: 1, name: 'System Administrator', email: 'admin@cuanflow.id', role: 'ADMIN', status: 'Aktif', registered: '01 Jan 2024' },
    { id: 2, name: 'Galang Pratama', email: 'galang@email.com', role: 'USER', status: 'Aktif', registered: '20 Agt 2024' },
    { id: 3, name: 'Ahmad Fauzi', email: 'ahmad@email.com', role: 'USER', status: 'Aktif', registered: '18 Agt 2024' },
    { id: 4, name: 'Budi Santoso', email: 'budi@email.com', role: 'USER', status: 'Aktif', registered: '03 Agt 2024' },
    { id: 5, name: 'Siti Rahma', email: 'siti@email.com', role: 'USER', status: 'Aktif', registered: '01 Agt 2024' }
  ])

  // Custom format currency according to active currency selector
  const formatAdminCurrency = (valInIdr) => {
    const num = Number(valInIdr) || 0
    if (currency === 'USD') {
      const inUsd = num / 16000
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(inUsd)
    }
    if (currency === 'EUR') {
      const inEur = num / 17500
      return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(inEur)
    }
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)
  }

  const handleCurrencyChange = (newCur) => {
    setCurrency(newCur)
    localStorage.setItem('cuanflow_currency', newCur)
  }

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true)
      try {
        const res = await api.get('/authSvc/api/v1/users')
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const mapped = res.data.slice(0, 5).map((u, idx) => ({
            id: u.userId || idx + 1,
            name: u.name || u.username || 'User',
            email: u.email || 'user@cuanflow.id',
            role: u.role || 'USER',
            status: u.isActive !== false ? 'Aktif' : 'Nonaktif',
            registered: u.createdAt 
              ? new Date(u.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
              : '2024'
          }))
          setRecentUsers(mapped)
          setStats((prev) => ({
            ...prev,
            totalUsers: res.data.length.toLocaleString()
          }))
        }
      } catch {
        // Fallback demo state matching system defaults
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [])

  return (
    <div className="flex-grow p-4 sm:p-6 lg:p-8 flex flex-col gap-6 w-full max-w-7xl mx-auto animate-fade-in text-slate-800 font-sans">
      
      {/* Header with Quick Currency Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
              Dasbor Sistem Admin
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-100 text-blue-700 border border-blue-200">
              Sistem Aktif
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Ringkasan infrastruktur, analitik pengguna, & volume transaksi platform CuanFlow</p>
        </div>

        {/* Quick Currency Switcher */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-2xs self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-2 text-slate-400">
            <Coins className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold hidden md:inline">Mata Uang:</span>
          </div>
          <button
            onClick={() => handleCurrencyChange('IDR')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              currency === 'IDR'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            IDR (Rp)
          </button>
          <button
            onClick={() => handleCurrencyChange('USD')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              currency === 'USD'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            USD ($)
          </button>
          <button
            onClick={() => handleCurrencyChange('EUR')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              currency === 'EUR'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            EUR (€)
          </button>
        </div>
      </div>

      {/* Quick Admin Action Banner / Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/admin/users"
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition-all group cursor-pointer"
        >
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Users className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-extrabold text-slate-800">Kelola Pengguna</span>
            <span className="text-[10px] text-slate-400">Atur hak akses & status</span>
          </div>
        </Link>

        <Link
          to="/admin/audit-logs"
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-400 hover:shadow-md transition-all group cursor-pointer"
        >
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <FileText className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-extrabold text-slate-800">Log Audit Sistem</span>
            <span className="text-[10px] text-slate-400">Jejak audit pengendalian</span>
          </div>
        </Link>

        <Link
          to="/admin/categories"
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-400 hover:shadow-md transition-all group cursor-pointer"
        >
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-extrabold text-slate-800">Master Kategori</span>
            <span className="text-[10px] text-slate-400">Template kategori sistem</span>
          </div>
        </Link>

        <Link
          to="/admin/broadcast"
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-400 hover:shadow-md transition-all group cursor-pointer"
        >
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <Megaphone className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-extrabold text-slate-800">Siaran Notifikasi</span>
            <span className="text-[10px] text-slate-400">Kirim pengumuman massal</span>
          </div>
        </Link>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total Users */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 flex flex-col gap-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Total Pengguna</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
            {stats.totalUsers}
          </span>
          <span className="text-[11px] text-slate-400">Terdaftar di database sistem</span>
        </div>

        {/* Card 2: Total Transactions */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 flex flex-col gap-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Total Transaksi</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
            {stats.totalTransactions}
          </span>
          <span className="text-[11px] text-slate-400">Volume akumulasi transaksi</span>
        </div>

        {/* Card 3: Total Income */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 flex flex-col gap-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Total Pemasukan</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Platform</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-heading truncate">
            {formatAdminCurrency(stats.totalIncome)}
          </span>
          <span className="text-[11px] text-emerald-600/80 font-medium">Perputaran kas masuk platform</span>
        </div>

        {/* Card 4: Total Expense */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 flex flex-col gap-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Total Pengeluaran</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">Platform</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-rose-600 font-heading truncate">
            {formatAdminCurrency(stats.totalExpense)}
          </span>
          <span className="text-[11px] text-rose-600/80 font-medium">Perputaran kas keluar platform</span>
        </div>

      </div>

      {/* Middle Dual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Chart: User Growth */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 flex flex-col gap-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 font-heading">Pertumbuhan Pengguna</h3>
              <p className="text-xs text-slate-400">Akumulasi registrasi akun dalam 6 bulan terakhir</p>
            </div>
            <span className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-100">
              +32.4% Tren
            </span>
          </div>

          <div className="relative w-full h-48 pt-2">
            <svg viewBox="0 0 400 140" className="w-full h-full overflow-visible">
              {[
                { val: '100k', y: 15 },
                { val: '75k', y: 45 },
                { val: '50k', y: 75 },
                { val: '25k', y: 105 },
                { val: '0', y: 135 }
              ].map((g, idx) => (
                <g key={idx}>
                  <line x1="35" y1={g.y} x2="390" y2={g.y} stroke="#F1F5F9" strokeDasharray="3 3" strokeWidth="1" />
                  <text x="25" y={g.y + 4} textAnchor="end" className="text-[10px] fill-slate-400 font-bold">
                    {g.val}
                  </text>
                </g>
              ))}

              <polyline
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="50,115 110,85 170,95 230,65 290,75 350,35"
              />

              {[
                { x: 50, y: 115 },
                { x: 110, y: 85 },
                { x: 170, y: 95 },
                { x: 230, y: 65 },
                { x: 290, y: 75 },
                { x: 350, y: 35 }
              ].map((pt, idx) => (
                <circle key={idx} cx={pt.x} cy={pt.y} r="3.5" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="2" />
              ))}
            </svg>
          </div>
        </div>

        {/* Right Chart: Transaction Activity */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 flex flex-col gap-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 font-heading">Aktivitas Transaksi</h3>
              <p className="text-xs text-slate-400">Frekuensi posting transaksi per jam operasional</p>
            </div>
            <span className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100">
              Optimal
            </span>
          </div>

          <div className="relative w-full h-48 pt-2 flex items-end justify-between gap-1.5 px-2 border-b border-slate-100">
            {[40, 65, 30, 80, 55, 90, 70, 45, 60, 85, 95, 75, 50, 65, 80, 70, 60, 40].map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                <div
                  className="w-full rounded-t-xs bg-blue-500 hover:bg-blue-600 transition-all duration-300"
                  style={{ height: `${val}%` }}
                  title={`Volume: ${val}%`}
                />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* System Health / Status Indicators Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-extrabold text-slate-800">Status Server: Online</span>
            </div>
            <p className="text-[11px] text-slate-400">Arsitektur Microservices (Auth, Finance, Notif) Berjalan Normal</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs font-bold text-slate-600">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-600" />
            <span>Database: PostgreSQL Terkoneksi</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Latensi: ~35 ms</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Keamanan: RBAC JWT Aktif</span>
          </div>
        </div>
      </div>

      {/* Bottom Table: Recent Users */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 flex flex-col gap-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 font-heading">Pengguna Terbaru</h3>
            <p className="text-xs text-slate-400">Daftar pengguna terdaftar paling akhir di sistem</p>
          </div>
          <Link
            to="/admin/users"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>Lihat Semua Pengguna</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Nama</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Peran</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Terdaftar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
              {recentUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{u.name}</td>
                  <td className="py-3.5 px-4 text-slate-500">{u.email}</td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-800">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      u.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
                      u.status === 'Aktif'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 text-xs">{u.registered}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
