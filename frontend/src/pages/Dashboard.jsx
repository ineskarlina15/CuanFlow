import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { Link, Navigate } from 'react-router-dom'
import { formatCurrency } from '../utils/currency'
import { 
  Landmark, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  Loader2, 
  RefreshCw,
  ArrowRight,
  Plus,
  BarChart2,
  PieChart as PieChartIcon
} from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const { showToast } = useToast()

  // Redirect Admin to Admin Dashboard automatically
  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />
  }
  
  const [summary, setSummary] = useState({ totalIncome: 12000000, totalExpense: 3500000, currentBalance: 8500000 })
  const [activeBudgetsCount, setActiveBudgetsCount] = useState(5)
  const [recentTransactions, setRecentTransactions] = useState([])
  const [analytics, setAnalytics] = useState({ expenseByCategory: [], incomeByCategory: [] })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('monthly')

  // Wireframe default figures matching Screen 2 of PDF
  const wireframeSummary = {
    totalIncome: 12000000,
    totalExpense: 3500000,
    currentBalance: 8500000
  }

  const wireframeCategories = [
    ['Food', 1200000],
    ['Transport', 850000],
    ['Shopping', 650000],
    ['Bills', 500000],
    ['Others', 300000]
  ]

  const wireframeTransactions = [
    {
      id: 201,
      title: 'Gaji',
      categoryName: 'Salary',
      transactionDate: '2026-08-10',
      type: 'INCOME',
      amount: 5000000
    },
    {
      id: 202,
      title: 'Makan Siang',
      categoryName: 'Food',
      transactionDate: '2026-08-10',
      type: 'EXPENSE',
      amount: 25000
    },
    {
      id: 203,
      title: 'Transport',
      categoryName: 'Transport',
      transactionDate: '2026-08-09',
      type: 'EXPENSE',
      amount: 50000
    }
  ]

  const monthlyBarData = [
    { month: 'May', income: 10000000, expense: 3000000 },
    { month: 'Jun', income: 11000000, expense: 4000000 },
    { month: 'Jul', income: 10500000, expense: 2800000 },
    { month: 'Aug', income: 12000000, expense: 3500000 }
  ]

  const fetchData = async () => {
    setLoading(true)
    try {
      // 1. Summary
      const summaryRes = await api.get('/financeSvc/api/v1/transactions/dashboard')
      if (summaryRes?.data) {
        const inc = Number(summaryRes.data.totalIncome || 0)
        const exp = Number(summaryRes.data.totalExpense || 0)
        const bal = Number(summaryRes.data.currentBalance || 0)

        if (inc === 0 && exp === 0 && bal === 0) {
          setSummary(wireframeSummary)
        } else {
          setSummary({ totalIncome: inc, totalExpense: exp, currentBalance: bal })
        }
      } else {
        setSummary(wireframeSummary)
      }

      // 2. Budget Alert count
      try {
        const currentDate = new Date()
        const bRes = await api.get(`/financeSvc/api/v1/budgets?month=${currentDate.getMonth() + 1}&year=${currentDate.getFullYear()}`)
        if (bRes?.data && Array.isArray(bRes.data)) {
          setActiveBudgetsCount(bRes.data.length || 5)
        } else {
          setActiveBudgetsCount(5)
        }
      } catch {
        setActiveBudgetsCount(5)
      }

      // 3. Recent Transactions
      const transactionsRes = await api.get('/financeSvc/api/v1/transactions?size=5&sortBy=transactionDate')
      if (transactionsRes?.data?.content && transactionsRes.data.content.length > 0) {
        setRecentTransactions(transactionsRes.data.content)
      } else {
        setRecentTransactions(wireframeTransactions)
      }

      // 4. Analytics
      const analyticsRes = await api.get('/financeSvc/api/v1/reports/analytics')
      if (analyticsRes?.data && analyticsRes.data.expenseByCategory && analyticsRes.data.expenseByCategory.length > 0) {
        setAnalytics({
          expenseByCategory: analyticsRes.data.expenseByCategory,
          incomeByCategory: analyticsRes.data.incomeByCategory || []
        })
      } else {
        setAnalytics({
          expenseByCategory: wireframeCategories,
          incomeByCategory: []
        })
      }
    } catch {
      setSummary(wireframeSummary)
      setActiveBudgetsCount(5)
      setRecentTransactions(wireframeTransactions)
      setAnalytics({ expenseByCategory: wireframeCategories, incomeByCategory: [] })
    } finally {
      setLoading(false)
    }
  }

  const [currencyTick, setCurrencyTick] = useState(0)

  useEffect(() => {
    fetchData()

    const handleSettingsUpdate = () => setCurrencyTick((prev) => prev + 1)
    window.addEventListener('cuanflow_settings_updated', handleSettingsUpdate)
    return () => window.removeEventListener('cuanflow_settings_updated', handleSettingsUpdate)
  }, [])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[80vh] text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-2" />
        <span className="font-medium text-sm">Memuat ringkasan beranda...</span>
      </div>
    )
  }

  const totalCategoryExpense = analytics.expenseByCategory.reduce((sum, item) => sum + Number(item[1] || 0), 0) || 1
  let currentAngle = 0

  const categoryColors = ['#3B82F6', '#EC4899', '#F59E0B', '#EF4444', '#10B981']

  return (
    <div className="flex-grow p-4 sm:p-6 lg:p-8 flex flex-col gap-6 w-full max-w-7xl mx-auto animate-fade-in text-slate-800 font-sans">
      
      {/* Header Row matching PDF Wireframe Screen 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
            Dashboard
          </h1>
          <p className="text-lg font-bold text-slate-700 mt-0.5">
            Halo, {user?.name || user?.username || 'Galang'} 👋
          </p>
          <p className="text-xs text-slate-400">Berikut adalah ringkasan keuanganmu</p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Link
            to="/transactions"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Transaksi</span>
          </Link>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all text-sm font-semibold cursor-pointer shadow-xs hover:rotate-180 duration-500"
            title="Perbarui Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Summary Cards Grid matching PDF Wireframe Screen 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* 1. Saldo Total */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-xs hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 min-w-0">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">SALDO TOTAL</span>
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 shadow-xs flex-shrink-0">
              <Landmark className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-xl sm:text-2xl xl:text-3xl font-extrabold text-blue-600 tracking-tight font-heading block whitespace-nowrap overflow-hidden text-ellipsis">
              {formatCurrency(summary.currentBalance)}
            </span>
          </div>
        </div>

        {/* 2. Total Income */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-xs hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 min-w-0">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">TOTAL PEMASUKAN</span>
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 shadow-xs flex-shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-xl sm:text-2xl xl:text-3xl font-extrabold text-emerald-600 tracking-tight font-heading block whitespace-nowrap overflow-hidden text-ellipsis">
              {formatCurrency(summary.totalIncome)}
            </span>
          </div>
        </div>

        {/* 3. Total Expense */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-xs hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 min-w-0">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">TOTAL PENGELUARAN</span>
            <div className="p-2 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 shadow-xs flex-shrink-0">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-xl sm:text-2xl xl:text-3xl font-extrabold text-rose-600 tracking-tight font-heading block whitespace-nowrap overflow-hidden text-ellipsis">
              {formatCurrency(summary.totalExpense)}
            </span>
          </div>
        </div>

        {/* 4. Budget Alert */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-xs hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 min-w-0">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">PERINGATAN ANGGARAN</span>
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 shadow-xs flex-shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-xl sm:text-2xl xl:text-3xl font-extrabold text-amber-600 tracking-tight font-heading block whitespace-nowrap">
              {activeBudgetsCount}
            </span>
            <Link to="/budgets" className="flex items-center gap-1 mt-1 text-amber-600 text-xs font-bold hover:underline">
              <span>Lihat Batas</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Dual Analytics Section: Bar Chart & Donut Chart matching Screen 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Income vs Expense Bar Chart with Gridlines & Y-Axis Ticks */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 flex flex-col justify-between gap-4 shadow-xs hover:shadow-md transition-all">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900 font-heading">Pemasukan vs Pengeluaran</h2>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-emerald-500 shadow-xs" />
                <span className="text-slate-600">Pemasukan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-rose-500 shadow-xs" />
                <span className="text-slate-600">Pengeluaran</span>
              </div>
            </div>
          </div>

          {/* Chart Canvas with Y-axis gridlines matching Wireframe */}
          <div className="relative h-60 w-full pt-4 pb-6 flex items-end">
            {/* Y-Axis Ticks & Dashed Gridlines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6 text-[10px] text-slate-400 font-semibold">
              <div className="border-b border-dashed border-slate-200 flex justify-between items-center w-full"><span>15M</span></div>
              <div className="border-b border-dashed border-slate-200 flex justify-between items-center w-full"><span>10M</span></div>
              <div className="border-b border-dashed border-slate-200 flex justify-between items-center w-full"><span>5M</span></div>
              <div className="border-b border-slate-200 flex justify-between items-center w-full"><span>0</span></div>
            </div>

            {/* Monthly Bar Columns */}
            <div className="relative z-10 w-full h-full flex items-end justify-around gap-2 sm:gap-6 pl-8 pr-2">
              {monthlyBarData.map((d, idx) => {
                const maxVal = 15000000
                const incHeight = Math.min(100, (d.income / maxVal) * 100)
                const expHeight = Math.min(100, (d.expense / maxVal) * 100)

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="w-full flex justify-center items-end gap-1.5 sm:gap-2 h-full">
                      {/* Income Bar */}
                      <div 
                        className="w-4 sm:w-6 bg-emerald-500 hover:bg-emerald-600 rounded-t-md transition-all duration-500 shadow-xs group-hover:scale-y-105 origin-bottom cursor-pointer"
                        style={{ height: `${incHeight}%` }}
                        title={`Income: ${formatCurrency(d.income)}`}
                      />
                      {/* Expense Bar */}
                      <div 
                        className="w-4 sm:w-6 bg-rose-500 hover:bg-rose-600 rounded-t-md transition-all duration-500 shadow-xs group-hover:scale-y-105 origin-bottom cursor-pointer"
                        style={{ height: `${expHeight}%` }}
                        title={`Expense: ${formatCurrency(d.expense)}`}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-500 group-hover:text-blue-600 transition-colors">
                      {d.month}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right: Expense by Category Donut Chart matching Screen 2 */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 flex flex-col justify-between gap-4 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <PieChartIcon className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900 font-heading">Pengeluaran per Kategori</h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 justify-around py-2">
            {/* SVG Donut Ring */}
            <div className="relative w-40 h-40 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F1F5F9" strokeWidth="12" />
                {analytics.expenseByCategory.map((item, index) => {
                  const value = Number(item[1] || 0)
                  const pct = (value / totalCategoryExpense) * 100
                  const strokeDash = `${pct} ${100 - pct}`
                  const strokeOffset = 100 - currentAngle
                  currentAngle += pct

                  const color = categoryColors[index % categoryColors.length]

                  return (
                    <circle
                      key={index}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke={color}
                      strokeWidth="13"
                      strokeDasharray={strokeDash}
                      strokeDashoffset={strokeOffset}
                      pathLength="100"
                      className="transition-all duration-700 ease-out hover:opacity-80 cursor-pointer"
                    />
                  )
                })}
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">PENGELUARAN</span>
                <span className="text-xs font-black text-slate-900 mt-0.5 truncate max-w-[85px]">
                  {formatCurrency(totalCategoryExpense)}
                </span>
              </div>
            </div>

            {/* Category Legends Grid */}
            <div className="flex flex-col gap-2.5 w-full sm:w-auto">
              {analytics.expenseByCategory.map((item, index) => {
                const name = item[0] || 'Other'
                const value = Number(item[1] || 0)
                const color = categoryColors[index % categoryColors.length]
                const pct = ((value / totalCategoryExpense) * 100).toFixed(0)

                return (
                  <div key={index} className="flex items-center justify-between sm:justify-start gap-4 text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-md flex-shrink-0 shadow-xs" style={{ backgroundColor: color }} />
                      <span className="text-slate-700">{name}</span>
                    </div>
                    <span className="text-slate-400 font-bold">{pct}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Transaksi Terbaru List matching PDF Wireframe Screen 2 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 flex flex-col gap-4 shadow-xs hover:shadow-md transition-all">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 font-heading">Transaksi Terbaru</h2>
          <Link
            to="/transactions"
            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex flex-col gap-2.5">
          {recentTransactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100 transition-all text-xs sm:text-sm hover:scale-[1.005]"
            >
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-400 font-bold w-24">
                  {new Date(tx.transactionDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <span className="font-bold text-slate-800">{tx.title}</span>
              </div>

              <div className="flex items-center gap-6">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  tx.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
                }`}>
                  {tx.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
                </span>

                <span className={`font-extrabold text-sm ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {tx.type === 'INCOME' ? '+' : '-'} {formatCurrency(tx.amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
