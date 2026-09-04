import { useState, useEffect } from 'react'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'
import { formatCurrency } from '../utils/currency'
import { downloadBlob } from '../utils/formatters'
import { Download, Calendar } from 'lucide-react'

export default function Reports() {
  const { showToast } = useToast()

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [period, setPeriod] = useState('all_time')
  const [, setLoading] = useState(false)

  const [allTransactions, setAllTransactions] = useState([])
  const [availableMonths, setAvailableMonths] = useState([])
  const [availableYears, setAvailableYears] = useState([])
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0
  })

  const [categoryData, setCategoryData] = useState([])

  const monthNamesId = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]

  const extractAvailablePeriods = (txList) => {
    const monthsMap = new Map()
    const yearsSet = new Set()

    txList.forEach((t) => {
      if (!t.transactionDate) return
      const parts = t.transactionDate.split('-')
      if (parts.length < 3) return
      const yr = Number(parts[0])
      const mo = Number(parts[1])
      yearsSet.add(yr)

      const key = `${yr}-${String(mo).padStart(2, '0')}`
      if (!monthsMap.has(key)) {
        const firstDay = `${yr}-${String(mo).padStart(2, '0')}-01`
        const lastDay = new Date(yr, mo, 0).toISOString().split('T')[0]
        monthsMap.set(key, {
          id: `month_${key}`,
          label: `${monthNamesId[mo - 1]} ${yr}`,
          start: firstDay,
          end: lastDay
        })
      }
    })

    const sortedMonths = Array.from(monthsMap.values()).sort((a, b) => b.id.localeCompare(a.id))
    const sortedYears = Array.from(yearsSet).sort((a, b) => b - a).map((yr) => ({
      id: `year_${yr}`,
      label: `Tahun ${yr}`,
      start: `${yr}-01-01`,
      end: `${yr}-12-31`
    }))

    setAvailableMonths(sortedMonths)
    setAvailableYears(sortedYears)
  }

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
          const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316', '#14B8A6', '#6366F1']
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

  const handlePeriodChange = (val) => {
    setPeriod(val)
    const now = new Date()

    if (val === 'all_time') {
      setStartDate('')
      setEndDate('')
      fetchReports('', '')
    } else if (val === 'this_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
      setStartDate(firstDay)
      setEndDate(lastDay)
      fetchReports(firstDay, lastDay)
    } else if (val === 'last_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]
      setStartDate(firstDay)
      setEndDate(lastDay)
      fetchReports(firstDay, lastDay)
    } else if (val === 'this_year') {
      const firstDay = `${now.getFullYear()}-01-01`
      const lastDay = `${now.getFullYear()}-12-31`
      setStartDate(firstDay)
      setEndDate(lastDay)
      fetchReports(firstDay, lastDay)
    } else if (val.startsWith('month_')) {
      const ym = val.replace('month_', '')
      const [y, m] = ym.split('-')
      const firstDay = `${y}-${m}-01`
      const lastDay = new Date(Number(y), Number(m), 0).toISOString().split('T')[0]
      setStartDate(firstDay)
      setEndDate(lastDay)
      fetchReports(firstDay, lastDay)
    } else if (val.startsWith('year_')) {
      const yr = val.replace('year_', '')
      const firstDay = `${yr}-01-01`
      const lastDay = `${yr}-12-31`
      setStartDate(firstDay)
      setEndDate(lastDay)
      fetchReports(firstDay, lastDay)
    } else if (val === 'custom') {
      // Tunggu input manual tanggal dari user
    }
  }

  const [, setCurrencyTick] = useState(0)

  useEffect(() => {
    const initData = async () => {
      try {
        const resTx = await api.get('/financeSvc/api/v1/transactions?size=500')
        const txList = resTx?.data?.content || (Array.isArray(resTx?.data) ? resTx.data : [])
        setAllTransactions(txList)
        extractAvailablePeriods(txList)
      } catch {
        // Fallback
      }
      fetchReports('', '')
    }
    initData()

    const handleSettingsUpdate = () => setCurrencyTick((prev) => prev + 1)
    window.addEventListener('cuanflow_settings_updated', handleSettingsUpdate)
    return () => window.removeEventListener('cuanflow_settings_updated', handleSettingsUpdate)
  }, [])

  const handleExportExcel = async () => {
    try {
      showToast('Sedang memproses unduh Excel...', 'info')
      let url = '/financeSvc/api/v1/reports/export/excel'
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      if (params.toString()) url += `?${params.toString()}`

      const res = await api.get(url, { responseType: 'blob' })
      const filename = `CuanFlow_Laporan_${new Date().toISOString().split('T')[0]}.xlsx`
      downloadBlob(res, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      showToast('Berhasil mengekspor Laporan ke Excel', 'success')
    } catch (error) {
      showToast('Gagal mengekspor Laporan ke Excel', 'error')
    }
  }

  const handleExportPdf = async () => {
    try {
      showToast('Sedang memproses unduh PDF...', 'info')
      let url = '/financeSvc/api/v1/reports/export/pdf'
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      if (params.toString()) url += `?${params.toString()}`

      const res = await api.get(url, { responseType: 'blob' })
      const filename = `CuanFlow_Laporan_${new Date().toISOString().split('T')[0]}.pdf`
      downloadBlob(res, filename, 'application/pdf')
      showToast('Berhasil mengekspor Laporan ke PDF', 'success')
    } catch (error) {
      showToast('Gagal mengekspor Laporan ke PDF', 'error')
    }
  }

  // Modern Donut Chart Generator dengan Center Total & Hover Details
  const renderSvgPieChart = () => {
    if (!categoryData || categoryData.length === 0) {
      return (
        <div className="w-48 h-48 rounded-full border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-xs text-center p-4">
          <span>Belum ada data pengeluaran</span>
        </div>
      )
    }

    const total = categoryData.reduce((sum, item) => sum + (item.amount || 0), 0) || 1
    let cumulativePercent = 0

    return (
      <div className="relative w-52 h-52 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="38" fill="transparent" stroke="#F1F5F9" strokeWidth="13" />
          {categoryData.map((slice, index) => {
            const pct = (slice.amount / total) * 100
            if (pct <= 0) return null
            const strokeDash = `${pct} ${100 - pct}`
            const strokeOffset = 100 - cumulativePercent
            cumulativePercent += pct

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
                <title>{`${slice.name}: ${formatCurrency(slice.amount)} (${Math.round(pct)}%)`}</title>
              </circle>
            )
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-3">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Total</span>
          <span className="text-xs sm:text-sm font-black text-slate-900 font-heading">
            {formatCurrency(summary.totalExpense)}
          </span>
        </div>
      </div>
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

        <div className="flex bg-blue-600 border border-blue-600 rounded-xl overflow-hidden shadow-md shadow-blue-600/20 self-start sm:self-auto">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all border-r border-blue-700 cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-300" />
            <span>Ekspor Excel</span>
          </button>
          <button
            onClick={handleExportPdf}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-rose-300" />
            <span>Ekspor PDF</span>
          </button>
        </div>
      </div>

      {/* Main Container Card matching Screen 6 PDF */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 flex flex-col gap-8 shadow-xs">
        
        {/* Period Filter Dropdown matching PDF Screen 6 */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex flex-col gap-1.5 min-w-[210px] w-full sm:w-auto">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Periode</label>
            <div className="relative">
              <select
                value={period}
                onChange={(e) => handlePeriodChange(e.target.value)}
                className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-xl py-2.5 px-4 pr-9 text-slate-800 font-extrabold text-sm outline-none cursor-pointer shadow-2xs transition-all appearance-none"
              >
                <option value="all_time">Semua Waktu</option>

                {availableMonths.length > 0 && (
                  <optgroup label="Bulan Transaksi">
                    {availableMonths.map((m) => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                  </optgroup>
                )}

                {availableYears.length > 0 && (
                  <optgroup label="Tahun Transaksi">
                    {availableYears.map((y) => (
                      <option key={y.id} value={y.id}>{y.label}</option>
                    ))}
                  </optgroup>
                )}

                <optgroup label="Kalender Berjalan">
                  <option value="this_month">Bulan Ini</option>
                  <option value="last_month">Bulan Lalu</option>
                  <option value="this_year">Tahun Ini</option>
                </optgroup>

                <option value="custom">Kustom Tanggal...</option>
              </select>
              <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {period === 'custom' && (
            <div className="flex flex-wrap items-center gap-2 animate-fade-in">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none shadow-2xs"
              />
              <span className="text-xs text-slate-400 font-bold">s/d</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none shadow-2xs"
              />
              <button
                type="button"
                onClick={() => {
                  if (!customStart || !customEnd) {
                    showToast('Pilih tanggal awal dan akhir terlebih dahulu', 'warning')
                    return
                  }
                  setStartDate(customStart)
                  setEndDate(customEnd)
                  fetchReports(customStart, customEnd)
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all"
              >
                Terapkan
              </button>
            </div>
          )}
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
              {(() => {
                const filteredTxs = allTransactions.filter((t) => {
                  if (!t.transactionDate) return false
                  if (startDate && t.transactionDate < startDate) return false
                  if (endDate && t.transactionDate > endDate) return false
                  return true
                })

                const formatCompact = (val) => {
                  if (!val || val === 0) return '0'
                  if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)} M`
                  if (val >= 1000000) return `${(val / 1000000).toFixed(val % 1000000 === 0 ? 0 : 1)} jt`
                  if (val >= 1000) return `${(val / 1000).toFixed(0)} rb`
                  return String(val)
                }

                const trendData = (() => {
                  if (filteredTxs.length === 0) {
                    return {
                      hasData: false,
                      maxVal: 10000000,
                      points: [
                        { x: 50, yInc: 140, yExp: 140, inc: 0, exp: 0, label: 'P1' },
                        { x: 130, yInc: 140, yExp: 140, inc: 0, exp: 0, label: 'P2' },
                        { x: 210, yInc: 140, yExp: 140, inc: 0, exp: 0, label: 'P3' },
                        { x: 290, yInc: 140, yExp: 140, inc: 0, exp: 0, label: 'P4' },
                        { x: 370, yInc: 140, yExp: 140, inc: 0, exp: 0, label: 'P5' }
                      ]
                    }
                  }

                  const sorted = [...filteredTxs].sort((a, b) => a.transactionDate.localeCompare(b.transactionDate))
                  const firstDate = new Date(sorted[0].transactionDate)
                  const lastDate = new Date(sorted[sorted.length - 1].transactionDate)
                  const diffMs = Math.max(86400000 * 4, lastDate.getTime() - firstDate.getTime())
                  const sliceMs = diffMs / 4

                  const slices = []
                  for (let i = 0; i < 5; i++) {
                    const targetDate = new Date(firstDate.getTime() + i * sliceMs)
                    const day = targetDate.getDate()
                    const mo = monthNamesId[targetDate.getMonth()]?.slice(0, 3) || 'Bln'
                    slices.push({
                      label: `${day} ${mo}`,
                      targetTime: targetDate.getTime(),
                      inc: 0,
                      exp: 0
                    })
                  }

                  sorted.forEach((t) => {
                    const tTime = new Date(t.transactionDate).getTime()
                    let closestIdx = 0
                    let minDiff = Math.abs(tTime - slices[0].targetTime)
                    for (let i = 1; i < 5; i++) {
                      const d = Math.abs(tTime - slices[i].targetTime)
                      if (d < minDiff) {
                        minDiff = d
                        closestIdx = i
                      }
                    }
                    const amt = Number(t.amount || 0)
                    if (t.type === 'INCOME') {
                      slices[closestIdx].inc += amt
                    } else {
                      slices[closestIdx].exp += amt
                    }
                  })

                  const maxVal = Math.max(1000000, ...slices.map((s) => Math.max(s.inc, s.exp))) * 1.2
                  const xs = [50, 130, 210, 290, 370]
                  const zeroY = 140
                  const usableH = 115

                  const points = slices.map((s, idx) => {
                    const yInc = zeroY - Math.min(usableH, (s.inc / maxVal) * usableH)
                    const yExp = zeroY - Math.min(usableH, (s.exp / maxVal) * usableH)
                    return {
                      x: xs[idx],
                      yInc,
                      yExp,
                      inc: s.inc,
                      exp: s.exp,
                      label: s.label
                    }
                  })

                  return { hasData: true, maxVal, points }
                })()

                const incPointsStr = trendData.points.map((p) => `${p.x},${p.yInc.toFixed(1)}`).join(' ')
                const expPointsStr = trendData.points.map((p) => `${p.x},${p.yExp.toFixed(1)}`).join(' ')

                return (
                  <svg viewBox="0 0 400 160" className="w-full h-full overflow-visible">
                    {/* Y-Axis Grid Lines & Labels */}
                    {[
                      { val: formatCompact(trendData.maxVal * 0.9), y: 25 },
                      { val: formatCompact(trendData.maxVal * 0.6), y: 60 },
                      { val: formatCompact(trendData.maxVal * 0.3), y: 98 },
                      { val: '0', y: 140 }
                    ].map((g, idx) => (
                      <g key={idx}>
                        <line x1="35" y1={g.y} x2="390" y2={g.y} stroke="#E2E8F0" strokeDasharray="3 3" strokeWidth="1" />
                        <text x="25" y={g.y + 4} textAnchor="end" className="text-[10px] fill-slate-400 font-bold">
                          {g.val}
                        </text>
                      </g>
                    ))}

                    {/* SVG Polylines matching curves */}
                    <polyline
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={incPointsStr}
                    />
                    <polyline
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={expPointsStr}
                    />

                    {/* SVG Dots on data points */}
                    {trendData.points.map((pt, idx) => (
                      <g key={idx} className="cursor-pointer">
                        <circle cx={pt.x} cy={pt.yInc} r="4" fill="#10B981" stroke="#FFFFFF" strokeWidth="2">
                          <title>{`${pt.label} Pemasukan: ${formatCurrency(pt.inc)}`}</title>
                        </circle>
                        <circle cx={pt.x} cy={pt.yExp} r="4" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="2">
                          <title>{`${pt.label} Pengeluaran: ${formatCurrency(pt.exp)}`}</title>
                        </circle>
                      </g>
                    ))}

                    {/* X-Axis Labels */}
                    {trendData.points.map((pt, idx) => (
                      <text
                        key={idx}
                        x={pt.x}
                        y="156"
                        textAnchor="middle"
                        className="text-[10px] fill-slate-400 font-bold"
                      >
                        {pt.label}
                      </text>
                    ))}
                  </svg>
                )
              })()}
            </div>
          </div>

          {/* Right Chart: Expense by Category SVG Donut Chart */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 flex flex-col gap-4 shadow-2xs">
            <h3 className="text-base font-black text-slate-900 font-heading">Pengeluaran per Kategori</h3>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-2 min-h-[200px]">
              {/* Modern SVG Donut Chart */}
              <div className="shrink-0 flex items-center justify-center">
                {renderSvgPieChart()}
              </div>

              {/* Category Legend List dengan Persentase & Nominal Rapi */}
              <div className="flex-1 flex flex-col gap-2.5 w-full max-h-[220px] overflow-y-auto pr-1">
                {categoryData.length === 0 ? (
                  <span className="text-xs text-slate-400">Tidak ada pengeluaran pada periode ini.</span>
                ) : (
                  categoryData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 text-xs font-bold text-slate-700 hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="w-3 h-3 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: item.color }} />
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

      </div>

    </div>
  )
}
