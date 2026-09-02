import { useState, useEffect } from 'react'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'
import { formatCurrency } from '../utils/currency'
import { Download, Calendar } from 'lucide-react'

export default function Reports() {
  const { showToast } = useToast()

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [period, setPeriod] = useState('this_month')
  const [, setLoading] = useState(false)

  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0
  })

  const [categoryData, setCategoryData] = useState([])

  // Grafik garis tren saat ini belum didukung oleh API, biarkan kosong untuk sementara
  const [trendPoints, setTrendPoints] = useState([])

  const fetchReports = async (overrideStart = null, overrideEnd = null) => {
    setLoading(true)
    try {
      const activeStart = overrideStart !== null ? overrideStart : startDate
      const activeEnd = overrideEnd !== null ? overrideEnd : endDate

      let query = ''
      if (activeStart && activeEnd) {
        query = `?startDate=${activeStart}&endDate=${activeEnd}`
      }

      const res = await api.get(`/financeSvc/api/v1/reports/analytics${query}`)
      if (res?.data) {
        const expList = res.data.expenseByCategory || []
        const incList = res.data.incomeByCategory || []

        const totalInc = incList.reduce((sum, item) => sum + Number(item[1] || 0), 0)
        const totalExp = expList.reduce((sum, item) => sum + Number(item[1] || 0), 0)

        setSummary({
          totalIncome: totalInc || 0,
          totalExpense: totalExp || 0,
          netBalance: (totalInc || 0) - (totalExp || 0)
        })

        if (expList.length > 0) {
          const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']
          const mapped = expList.map((item, idx) => ({
            name: (item[0] || 'Others').replace('& Beverage', ''),
            amount: Number(item[1] || 0),
            color: colors[idx % colors.length],
            percent: totalExp > 0 ? Math.round((Number(item[1] || 0) / totalExp) * 100) : 0
          }))
          setCategoryData(mapped)
        } else {
          setCategoryData([])
        }
      }
    } catch {
      setSummary({ totalIncome: 0, totalExpense: 0, netBalance: 0 })
      setCategoryData([])
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setStartDate('')
    setEndDate('')
    setPeriod('this_month')
    fetchReports('', '')
    showToast('Filter laporan diatur ulang', 'info')
  }

  const [, setCurrencyTick] = useState(0)

  useEffect(() => {
    fetchReports()
    const handleSettingsUpdate = () => setCurrencyTick((prev) => prev + 1)
    window.addEventListener('cuanflow_settings_updated', handleSettingsUpdate)
    return () => window.removeEventListener('cuanflow_settings_updated', handleSettingsUpdate)
  }, [])

  const handleExportCSV = () => {
    const rows = [
      ['Judul Laporan', '6. LAPORAN'],
      ['Periode', period],
      ['Total Pemasukan', summary.totalIncome],
      ['Total Pengeluaran', summary.totalExpense],
      ['Saldo Bersih', summary.netBalance],
      [],
      ['Rincian Kategori'],
      ...categoryData.map((item) => [item.name, item.amount, `${item.percent}%`])
    ]
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `CuanFlow_Laporan_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Laporan keuangan diekspor ke CSV', 'success')
  }

  // SVG Solid Pie Chart Generator matching PDF Screen 6 EXACTLY
  const renderSvgPieChart = () => {
    if (!categoryData || categoryData.length === 0) return null

    // If only 1 category slice, render full circle
    if (categoryData.length === 1) {
      return (
        <svg viewBox="0 0 200 200" className="w-48 h-48 drop-shadow-md">
          <circle cx="100" cy="100" r="80" fill={categoryData[0].color || '#3B82F6'} />
        </svg>
      )
    }

    let cumulativeAngle = 0
    const total = categoryData.reduce((sum, item) => sum + (item.amount || 0), 0) || 1

    const slices = categoryData.map((slice, index) => {
      const slicePercent = slice.amount / total
      if (slicePercent <= 0) return null

      const startAngle = cumulativeAngle
      const angle = slicePercent * 360
      cumulativeAngle += angle
      const endAngle = cumulativeAngle

      const startRad = ((startAngle - 90) * Math.PI) / 180
      const endRad = ((endAngle - 90) * Math.PI) / 180

      const x1 = 100 + 80 * Math.cos(startRad)
      const y1 = 100 + 80 * Math.sin(startRad)
      const x2 = 100 + 80 * Math.cos(endRad)
      const y2 = 100 + 80 * Math.sin(endRad)

      const largeArcFlag = angle > 180 ? 1 : 0

      const pathData = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z`

      return (
        <path
          key={index}
          d={pathData}
          fill={slice.color}
          className="hover:opacity-90 transition-opacity cursor-pointer stroke-white stroke-2"
        >
          <title>{`${slice.name}: ${formatCurrency(slice.amount)} (${Math.round(slicePercent * 100)}%)`}</title>
        </path>
      )
    })

    return (
      <svg viewBox="0 0 200 200" className="w-48 h-48 drop-shadow-md">
        {slices}
      </svg>
    )
  }

  return (
    <div className="flex-grow p-4 sm:p-6 lg:p-8 flex flex-col gap-6 w-full max-w-7xl mx-auto animate-fade-in text-slate-800 font-sans">
      
      {/* Header matching PDF 6. REPORTS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
            LAPORAN
          </h1>
          <p className="text-xs text-slate-400 mt-1">Analisis keuangan, tren garis, dan rincian pai pengeluaran</p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md shadow-blue-600/20 active:scale-[0.98] cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Ekspor Laporan CSV</span>
        </button>
      </div>

      {/* Main Container Card matching Screen 6 PDF */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 flex flex-col gap-8 shadow-xs">
        
        {/* Period Filter Dropdown matching PDF Screen 6 */}
        <div className="flex flex-col gap-1.5 w-48">
          <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Periode</label>
          <div className="relative">
            <select
              value={period}
              onChange={(e) => {
                setPeriod(e.target.value)
                const now = new Date()
                if (e.target.value === 'this_month') {
                  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
                  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
                  setStartDate(firstDay)
                  setEndDate(lastDay)
                  fetchReports(firstDay, lastDay)
                } else if (e.target.value === 'last_month') {
                  const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]
                  const lastDay = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]
                  setStartDate(firstDay)
                  setEndDate(lastDay)
                  fetchReports(firstDay, lastDay)
                } else {
                  handleReset()
                }
              }}
              className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-xl py-2.5 px-4 pr-8 text-slate-800 font-extrabold text-sm outline-none cursor-pointer shadow-2xs transition-all appearance-none"
            >
              <option value="this_month">Bulan Ini</option>
              <option value="last_month">Bulan Lalu</option>
              <option value="this_year">Tahun Ini</option>
              <option value="all_time">Semua Waktu</option>
            </select>
            <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Top 3 Stat Cards matching PDF Screen 6 EXACTLY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Total Income */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 flex flex-col gap-3 shadow-2xs">
            <span className="text-xs font-extrabold text-slate-500">Total Income</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-500 font-heading">
              {formatCurrency(summary.totalIncome)}
            </span>
          </div>

          {/* Card 2: Total Expense */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 flex flex-col gap-3 shadow-2xs">
            <span className="text-xs font-extrabold text-slate-500">Total Expense</span>
            <span className="text-2xl sm:text-3xl font-black text-rose-500 font-heading">
              {formatCurrency(summary.totalExpense)}
            </span>
          </div>

          {/* Card 3: Net Balance */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 flex flex-col gap-3 shadow-2xs">
            <span className="text-xs font-extrabold text-slate-500">Net Balance</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-500 font-heading">
              {formatCurrency(summary.netBalance)}
            </span>
          </div>
        </div>

        {/* Dual Charts Grid matching PDF Screen 6 EXACTLY */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Chart: Income vs Expense SVG Line Chart */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 flex flex-col gap-4 shadow-2xs">
            <h3 className="text-base font-black text-slate-900 font-heading">Pemasukan vs Pengeluaran</h3>

            <div className="relative w-full h-56 pt-2">
              <svg viewBox="0 0 400 160" className="w-full h-full overflow-visible">
                {/* Y-Axis Grid Lines & Labels matching PDF Screen 6 */}
                {[
                  { val: 100, y: 20 },
                  { val: 75, y: 50 },
                  { val: 50, y: 80 },
                  { val: 25, y: 110 },
                  { val: 0, y: 140 }
                ].map((g, idx) => (
                  <g key={idx}>
                    <line x1="35" y1={g.y} x2="390" y2={g.y} stroke="#E2E8F0" strokeDasharray="3 3" strokeWidth="1" />
                    <text x="25" y={g.y + 4} textAnchor="end" className="text-[10px] fill-slate-400 font-bold">
                      {g.val}
                    </text>
                  </g>
                ))}

                {/* SVG Polylines matching PDF curves */}
                <polyline
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="50,96 130,62 210,88 290,56 370,68"
                />
                <polyline
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="50,116 130,102 210,72 290,92 370,80"
                />

                {/* SVG Dots on data points */}
                {[
                  { x: 50, y1: 96, y2: 116 },
                  { x: 130, y1: 62, y2: 102 },
                  { x: 210, y1: 88, y2: 72 },
                  { x: 290, y1: 56, y2: 92 },
                  { x: 370, y1: 68, y2: 80 }
                ].map((pt, idx) => (
                  <g key={idx}>
                    <circle cx={pt.x} cy={pt.y1} r="4" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
                    <circle cx={pt.x} cy={pt.y2} r="4" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="2" />
                  </g>
                ))}

                {/* X-Axis Labels matching PDF Screen 6 */}
                {['1 Agt', '8 Agt', '15 Agt', '22 Agt', '29 Agt'].map((lbl, idx) => (
                  <text
                    key={idx}
                    x={50 + idx * 80}
                    y="156"
                    textAnchor="middle"
                    className="text-[10px] fill-slate-400 font-bold"
                  >
                    {lbl}
                  </text>
                ))}
              </svg>
            </div>
          </div>

          {/* Right Chart: Expense by Category SVG Pie Chart */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 flex flex-col gap-4 shadow-2xs">
            <h3 className="text-base font-black text-slate-900 font-heading">Pengeluaran per Kategori</h3>

            <div className="flex flex-col sm:flex-row items-center gap-8 pt-2 min-h-[200px]">
              {/* Solid SVG Pie Chart matching PDF Screen 6 */}
              <div className="shrink-0 flex items-center justify-center">
                {renderSvgPieChart()}
              </div>

              {/* Category Legend List matching PDF Screen 6 EXACTLY */}
              <div className="flex-1 flex flex-col gap-3 w-full">
                {categoryData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs font-bold text-slate-700">
                    <span className="w-3.5 h-3.5 rounded-xs shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="min-w-[80px]">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
