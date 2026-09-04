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

  // Arahkan Admin ke Dashboard Admin secara otomatis
  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />
  }
  
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, currentBalance: 0 })
  const [activeBudgetsCount, setActiveBudgetsCount] = useState(0)
  const [recentTransactions, setRecentTransactions] = useState([])
  const [analytics, setAnalytics] = useState({ expenseByCategory: [], incomeByCategory: [] })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('monthly')
  const [chartView, setChartView] = useState('line') // 'line' | 'bar'
  const [monthlyBarData, setMonthlyBarData] = useState([])
  const [availableYears, setAvailableYears] = useState([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [allTransactions, setAllTransactions] = useState([])

  const updateBarDataForYear = (transactions, targetYear) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    const monthlyData = monthNames.map((m, i) => ({ month: m, monthIndex: i, income: 0, expense: 0 }))

    transactions.forEach(tx => {
      if (!tx.transactionDate) return
      const txDate = new Date(tx.transactionDate)
      if (txDate.getFullYear() === targetYear) {
        const monthIndex = txDate.getMonth()
        if (tx.type === 'INCOME') {
          monthlyData[monthIndex].income += Number(tx.amount || 0)
        } else {
          monthlyData[monthIndex].expense += Number(tx.amount || 0)
        }
      }
    })
    setMonthlyBarData(monthlyData)
  }

  const handleYearChange = (newYear) => {
    const y = Number(newYear)
    setSelectedYear(y)
    updateBarDataForYear(allTransactions, y)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      // 1. Summary
      const summaryRes = await api.get('/financeSvc/api/v1/transactions/dashboard')
      if (summaryRes?.data) {
        const inc = Number(summaryRes.data.totalIncome || 0)
        const exp = Number(summaryRes.data.totalExpense || 0)
        const bal = Number(summaryRes.data.currentBalance || 0)
        setSummary({ totalIncome: inc, totalExpense: exp, currentBalance: bal })
      }

      // 2. Budget Alert count
      try {
        const currentDate = new Date()
        const bRes = await api.get(`/financeSvc/api/v1/budgets?month=${currentDate.getMonth() + 1}&year=${currentDate.getFullYear()}`)
        if (bRes?.data && Array.isArray(bRes.data)) {
          setActiveBudgetsCount(bRes.data.length || 0)
        }
      } catch {
        setActiveBudgetsCount(0)
      }

      // 3. Recent Transactions
      const transactionsRes = await api.get('/financeSvc/api/v1/transactions?size=5&sortBy=transactionDate')
      if (transactionsRes?.data?.content && transactionsRes.data.content.length > 0) {
        setRecentTransactions(transactionsRes.data.content)
      } else {
        setRecentTransactions([])
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
          expenseByCategory: [],
          incomeByCategory: []
        })
      }

      // 5. Monthly Bar Data (Ambil seluruh transaksi dan deteksi tahun secara dinamis)
      const allTxRes = await api.get('/financeSvc/api/v1/transactions?size=1000')
      const transactions = allTxRes?.data?.content || []
      setAllTransactions(transactions)

      const currentYear = new Date().getFullYear()
      const yearsSet = new Set(transactions.map(t => new Date(t.transactionDate).getFullYear()).filter(Boolean))
      yearsSet.add(currentYear)
      const sortedYears = Array.from(yearsSet).sort((a, b) => b - a)
      setAvailableYears(sortedYears)

      // Cari tahun yang memiliki data transaksi paling aktif (jika tahun saat ini belum ada datanya)
      let initialYear = currentYear
      const currentYearHasData = transactions.some(t => new Date(t.transactionDate).getFullYear() === currentYear)
      if (!currentYearHasData && sortedYears.length > 0) {
        const yearWithData = sortedYears.find(y => transactions.some(t => new Date(t.transactionDate).getFullYear() === y))
        if (yearWithData) initialYear = yearWithData
      }

      setSelectedYear(initialYear)
      updateBarDataForYear(transactions, initialYear)

    } catch {
      setSummary({ totalIncome: 0, totalExpense: 0, currentBalance: 0 })
      setActiveBudgetsCount(0)
      setRecentTransactions([])
      setAnalytics({ expenseByCategory: [], incomeByCategory: [] })
      setMonthlyBarData([])
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

  const categoryColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
    '#EC4899', '#06B6D4', '#F97316', '#14B8A6', '#6366F1'
  ]

  const formattedCategories = analytics.expenseByCategory.map((item, idx) => {
    const name = (item[0] || 'Lainnya').replace('& Beverage', '')
    const amount = Number(item[1] || 0)
    const percent = totalCategoryExpense > 0 ? Math.round((amount / totalCategoryExpense) * 100) : 0
    return {
      name,
      amount,
      percent,
      color: categoryColors[idx % categoryColors.length]
    }
  })

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

      {/* Dual Analytics Section: Line/Bar Chart & Donut Chart matching Laporan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Income vs Expense Chart (Line / Bar Toggle) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 flex flex-col justify-between gap-4 shadow-xs hover:shadow-md transition-all">
          <div className="flex flex-wrap justify-between items-center border-b border-slate-100 pb-3 gap-3">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900 font-heading">Pemasukan vs Pengeluaran</h2>
              {availableYears.length > 1 ? (
                <select
                  value={selectedYear}
                  onChange={(e) => handleYearChange(e.target.value)}
                  className="ml-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg px-2.5 py-1 outline-none cursor-pointer transition-colors"
                >
                  {availableYears.map(yr => (
                    <option key={yr} value={yr}>Tahun {yr}</option>
                  ))}
                </select>
              ) : (
                <span className="ml-1 text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  Tahun {selectedYear}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Toggle Garis / Batang */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                <button
                  onClick={() => setChartView('line')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    chartView === 'line'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Lihat Tren Garis"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Garis</span>
                </button>
                <button
                  onClick={() => setChartView('bar')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    chartView === 'bar'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Lihat Grafik Batang"
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span>Batang</span>
                </button>
              </div>

              {/* Legend Indicator */}
              <div className="hidden sm:flex items-center gap-3 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
                  <span className="text-slate-600">Pemasukan</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs" />
                  <span className="text-slate-600">Pengeluaran</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Canvas Area */}
          <div className="relative h-64 w-full pt-2 pb-2 flex items-end">
            {(() => {
              const maxDataVal = Math.max(0, ...monthlyBarData.map(m => Math.max(m.income, m.expense)))
              const chartMax = maxDataVal > 0 ? maxDataVal : 10000000
              const maxVal = chartMax * 1.15
              const formatCompact = (val) => {
                if (!val || val === 0) return '0'
                if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)} M`
                if (val >= 1000000) return `${(val / 1000000).toFixed(val % 1000000 === 0 ? 0 : 1)} jt`
                if (val >= 1000) return `${(val / 1000).toFixed(0)} rb`
                return String(val)
              }

              if (chartView === 'line') {
                const width = 500
                const usableWidth = width - 60
                const usableHeight = 115
                const zeroY = 135

                const pointsData = monthlyBarData.map((d, i) => {
                  const x = 40 + (i / 11) * usableWidth
                  const yInc = zeroY - Math.min(usableHeight, (d.income / maxVal) * usableHeight)
                  const yExp = zeroY - Math.min(usableHeight, (d.expense / maxVal) * usableHeight)
                  return { ...d, x, yInc, yExp }
                })

                const incPointsStr = pointsData.map(p => `${p.x.toFixed(1)},${p.yInc.toFixed(1)}`).join(' ')
                const expPointsStr = pointsData.map(p => `${p.x.toFixed(1)},${p.yExp.toFixed(1)}`).join(' ')

                return (
                  <div className="w-full h-full relative">
                    <svg viewBox="0 0 500 160" className="w-full h-full overflow-visible">
                      {/* Grid Lines & Y-Axis Labels */}
                      {[
                        { label: formatCompact(chartMax), y: 20 },
                        { label: formatCompact(chartMax * 0.66), y: 58 },
                        { label: formatCompact(chartMax * 0.33), y: 96 },
                        { label: '0', y: zeroY }
                      ].map((g, idx) => (
                        <g key={idx}>
                          <line x1="38" y1={g.y} x2="495" y2={g.y} stroke="#E2E8F0" strokeDasharray="3 3" strokeWidth="1" />
                          <text x="32" y={g.y + 4} textAnchor="end" className="text-[10px] fill-slate-400 font-bold">
                            {g.label}
                          </text>
                        </g>
                      ))}

                      {/* Line Polylines matching Laporan */}
                      <polyline
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={incPointsStr}
                        className="drop-shadow-xs"
                      />
                      <polyline
                        fill="none"
                        stroke="#F43F5E"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={expPointsStr}
                        className="drop-shadow-xs"
                      />

                      {/* Dots on Data Points */}
                      {pointsData.map((pt, idx) => (
                        <g key={idx} className="cursor-pointer group">
                          {pt.income > 0 && (
                            <circle
                              cx={pt.x}
                              cy={pt.yInc}
                              r="4.5"
                              fill="#10B981"
                              stroke="#FFFFFF"
                              strokeWidth="2"
                              className="hover:r-6 transition-all"
                            >
                              <title>{`${pt.month} ${selectedYear} Pemasukan: ${formatCurrency(pt.income)}`}</title>
                            </circle>
                          )}
                          {pt.expense > 0 && (
                            <circle
                              cx={pt.x}
                              cy={pt.yExp}
                              r="4.5"
                              fill="#F43F5E"
                              stroke="#FFFFFF"
                              strokeWidth="2"
                              className="hover:r-6 transition-all"
                            >
                              <title>{`${pt.month} ${selectedYear} Pengeluaran: ${formatCurrency(pt.expense)}`}</title>
                            </circle>
                          )}
                          <text
                            x={pt.x}
                            y="155"
                            textAnchor="middle"
                            className={`text-[10px] font-bold ${
                              pt.income > 0 || pt.expense > 0 ? 'fill-blue-600 font-extrabold' : 'fill-slate-400'
                            }`}
                          >
                            {pt.month}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>
                )
              }

              // Mode Batang (Bar Chart)
              return (
                <div className="relative w-full h-full overflow-x-auto overflow-y-hidden">
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6 text-[10px] text-slate-400 font-semibold min-w-[500px]">
                    <div className="border-b border-dashed border-slate-200 flex justify-between items-center w-full"><span>{formatCompact(chartMax)}</span></div>
                    <div className="border-b border-dashed border-slate-200 flex justify-between items-center w-full"><span>{formatCompact(chartMax * 0.66)}</span></div>
                    <div className="border-b border-dashed border-slate-200 flex justify-between items-center w-full"><span>{formatCompact(chartMax * 0.33)}</span></div>
                    <div className="border-b border-slate-200 flex justify-between items-center w-full"><span>0</span></div>
                  </div>

                  <div className="relative z-10 w-full h-full flex items-end justify-between gap-1 sm:gap-2 pl-10 pr-2 min-w-[500px]">
                    {monthlyBarData.map((d, idx) => {
                      const hasData = d.income > 0 || d.expense > 0
                      const incHeight = d.income > 0 ? Math.max(6, Math.min(100, (d.income / maxVal) * 100)) : 0
                      const expHeight = d.expense > 0 ? Math.max(6, Math.min(100, (d.expense / maxVal) * 100)) : 0

                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                          {hasData && (
                            <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 absolute -top-14 z-30 bg-slate-900/95 text-white text-[10px] font-medium py-1.5 px-2.5 rounded-lg shadow-xl pointer-events-none whitespace-nowrap flex flex-col gap-0.5 border border-slate-700">
                              <span className="font-bold text-slate-300 text-[10px] border-b border-slate-800 pb-0.5">{d.month} {selectedYear}</span>
                              {d.income > 0 && <span className="text-emerald-400">Masuk: {formatCurrency(d.income)}</span>}
                              {d.expense > 0 && <span className="text-rose-400">Keluar: {formatCurrency(d.expense)}</span>}
                            </div>
                          )}

                          <div className="w-full flex justify-center items-end gap-1 sm:gap-1.5 h-full">
                            <div 
                              className={`w-3 sm:w-4.5 rounded-t-md transition-all duration-500 shadow-xs origin-bottom cursor-pointer ${
                                d.income > 0 
                                  ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 hover:brightness-110' 
                                  : 'bg-transparent'
                              }`}
                              style={{ height: `${incHeight}%` }}
                            />
                            <div 
                              className={`w-3 sm:w-4.5 rounded-t-md transition-all duration-500 shadow-xs origin-bottom cursor-pointer ${
                                d.expense > 0 
                                  ? 'bg-gradient-to-t from-rose-600 to-rose-400 hover:brightness-110' 
                                  : 'bg-transparent'
                              }`}
                              style={{ height: `${expHeight}%` }}
                            />
                          </div>
                          <span className={`text-[11px] font-bold transition-colors ${
                            hasData ? 'text-blue-600 font-extrabold' : 'text-slate-400 group-hover:text-blue-600'
                          }`}>
                            {d.month}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })()}
          </div>
        </div>

        {/* Right: Modern Donut Chart & Legend matching Laporan */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 flex flex-col justify-between gap-4 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <PieChartIcon className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900 font-heading">Pengeluaran per Kategori</h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 justify-around py-1">
            {/* Modern Donut SVG dengan Center Total */}
            <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#F1F5F9" strokeWidth="13" />
                {(() => {
                  let cumulative = 0
                  return formattedCategories.map((slice, index) => {
                    const pct = (slice.amount / totalCategoryExpense) * 100
                    if (pct <= 0) return null
                    const strokeDash = `${pct} ${100 - pct}`
                    const strokeOffset = 100 - cumulative
                    cumulative += pct

                    return (
                      <circle
                        key={index}
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke={slice.color}
                        strokeWidth="13"
                        strokeDasharray={strokeDash}
                        strokeDashoffset={strokeOffset}
                        pathLength="100"
                        className="transition-all duration-300 hover:stroke-[15px] cursor-pointer"
                      >
                        <title>{`${slice.name}: ${formatCurrency(slice.amount)} (${slice.percent}%)`}</title>
                      </circle>
                    )
                  })
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-3">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Total</span>
                <span className="text-xs sm:text-sm font-black text-slate-900 font-heading truncate max-w-[85px]">
                  {formatCurrency(totalCategoryExpense)}
                </span>
              </div>
            </div>

            {/* Category Legend List dengan Persentase & Nominal Rapi seperti di Laporan */}
            <div className="flex-1 flex flex-col gap-2 w-full max-h-[220px] overflow-y-auto pr-1">
              {formattedCategories.length === 0 ? (
                <span className="text-xs text-slate-400">Belum ada pengeluaran pada periode ini.</span>
              ) : (
                formattedCategories.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 text-xs font-bold text-slate-700 hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: item.color }} />
                      <span className="truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-slate-500 font-medium">{formatCurrency(item.amount)}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700">
                        {item.percent}%
                      </span>
                    </div>
                  </div>
                ))
              )}
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
