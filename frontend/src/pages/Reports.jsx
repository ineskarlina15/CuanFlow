import { useState, useEffect, useMemo } from 'react'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { formatCurrency } from '../utils/currency'
import { downloadBlob } from '../utils/formatters'
import { 
  Download, Calendar, Printer, FileText, PieChart, TrendingUp, 
  BarChart3, Wallet, ArrowUpRight, ArrowDownRight, ShieldCheck, 
  Scale, Sparkles
} from 'lucide-react'

export default function Reports() {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [period, setPeriod] = useState('all_time')

  // Tab Menu Laporan: 'statement' (Laba Rugi), 'analytics' (Grafik Tren), 'all' (Semua)
  const [activeTab, setActiveTab] = useState('statement')

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
  const [incomeCategoryData, setIncomeCategoryData] = useState([])

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

        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316', '#14B8A6', '#6366F1']

        if (expList.length > 0) {
          const mapped = expList.map((item, idx) => ({
            name: (item[0] || 'Lainnya').replace('& Beverage', ''),
            amount: Number(item[1] || 0),
            color: colors[idx % colors.length],
            percent: totalExp > 0 ? Math.round((Number(item[1] || 0) / totalExp) * 100) : 0
          }))
          setCategoryData(mapped)
        } else {
          setCategoryData([])
        }

        if (incList.length > 0) {
          const mappedInc = incList.map((item, idx) => ({
            name: (item[0] || 'Lainnya'),
            amount: Number(item[1] || 0),
            color: colors[(idx + 2) % colors.length],
            percent: totalInc > 0 ? Math.round((Number(item[1] || 0) / totalInc) * 100) : 0
          }))
          setIncomeCategoryData(mappedInc)
        } else {
          setIncomeCategoryData([])
        }
      }
    } catch {
      setSummary({ totalIncome: 0, totalExpense: 0, netBalance: 0 })
      setCategoryData([])
      setIncomeCategoryData([])
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
      // Tunggu input manual
    }
  }

  const [currencyTick, setCurrencyTick] = useState(0)

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

  // Filter transaksi aktif berdasarkan periode
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((t) => {
      if (!t.transactionDate) return false
      if (startDate && t.transactionDate < startDate) return false
      if (endDate && t.transactionDate > endDate) return false
      return true
    })
  }, [allTransactions, startDate, endDate])


  // Analisis Perputaran Kas per Metode Pembayaran
  const paymentMethodStats = useMemo(() => {
    const map = {}
    filteredTransactions.forEach((t) => {
      const pm = t.paymentMethod || 'TUNAI'
      if (!map[pm]) {
        map[pm] = { name: pm, income: 0, expense: 0, count: 0 }
      }
      const amt = Number(t.amount || 0)
      if (t.type === 'INCOME') map[pm].income += amt
      else map[pm].expense += amt
      map[pm].count += 1
    })
    return Object.values(map).sort((a, b) => (b.income + b.expense) - (a.income + a.expense))
  }, [filteredTransactions])

  // Indikator Rasio Finansial Akuntansi
  const financialRatios = useMemo(() => {
    const inc = summary.totalIncome || 0
    const exp = summary.totalExpense || 0
    const net = summary.netBalance || 0

    const savingsRate = inc > 0 ? (net / inc) * 100 : 0
    const expenseRatio = inc > 0 ? (exp / inc) * 100 : (exp > 0 ? 100 : 0)

    let healthStatus = 'Sehat'
    let healthColor = 'text-emerald-600 bg-emerald-50 border-emerald-200'
    if (net < 0) {
      healthStatus = 'Defisit (Perlu Efisiensi)'
      healthColor = 'text-rose-600 bg-rose-50 border-rose-200'
    } else if (savingsRate >= 30) {
      healthStatus = 'Sangat Sehat (Surplus Prima)'
      healthColor = 'text-emerald-600 bg-emerald-50 border-emerald-200'
    } else if (savingsRate >= 10) {
      healthStatus = 'Cukup Sehat (Surplus Wajar)'
      healthColor = 'text-blue-600 bg-blue-50 border-blue-200'
    } else {
      healthStatus = 'Waspada (Surplus Tipis)'
      healthColor = 'text-amber-600 bg-amber-50 border-amber-200'
    }

    return { savingsRate, expenseRatio, healthStatus, healthColor }
  }, [summary])

  // Label periode aktif untuk ditampilkan di header laporan
  const activePeriodLabel = useMemo(() => {
    if (period === 'all_time') return 'Semua Waktu (All Time)'
    if (period === 'this_month') return 'Bulan Ini'
    if (period === 'last_month') return 'Bulan Lalu'
    if (period === 'this_year') return 'Tahun Ini'
    if (period.startsWith('month_')) {
      const match = availableMonths.find((m) => m.id === period)
      return match ? match.label : period
    }
    if (period.startsWith('year_')) {
      const match = availableYears.find((y) => y.id === period)
      return match ? match.label : period
    }
    if (period === 'custom' && customStart && customEnd) {
      return `${customStart} s/d ${customEnd}`
    }
    return 'Periode Terpilih'
  }, [period, availableMonths, availableYears, customStart, customEnd])

  // Mata uang aktif mengikuti pengaturan aplikasi (IDR, USD, EUR)
  const activeCurrency = useMemo(() => {
    return localStorage.getItem('cuanflow_currency') || 'IDR'
  }, [currencyTick])

  const activeCurrencyLabel = useMemo(() => {
    if (activeCurrency === 'USD') return 'USD (US Dollar)'
    if (activeCurrency === 'EUR') return 'EUR (Euro)'
    return 'IDR (Rupiah)'
  }, [activeCurrency])

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
    } catch {
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
    } catch {
      showToast('Gagal mengekspor Laporan ke PDF', 'error')
    }
  }

  const handlePrint = () => {
    window.print()
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
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Total Beban</span>
          <span className="text-xs sm:text-sm font-black text-slate-900 font-heading">
            {formatCurrency(summary.totalExpense)}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-grow p-4 sm:p-6 lg:p-8 flex flex-col gap-6 w-full max-w-7xl mx-auto animate-fade-in text-slate-800 font-sans print:p-0 print:max-w-full">
      
      {/* ============================================================ */}
      {/* 1. HEADER HALAMAN & ACTION BAR                                */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800">
              Modul Pelaporan Keuangan
            </span>
            <span className="text-xs text-slate-400 font-bold">•</span>
            <span className="text-xs text-slate-500 font-bold">Sistem Akuntansi CuanFlow</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading mt-1">
            LAPORAN KEUANGAN
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Laporan kinerja finansial, laba rugi, buku rekapitulasi mutasi kas, dan analitik
          </p>
        </div>

        {/* Action Buttons: Cetak, Excel, PDF */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-2xs transition-all cursor-pointer hover:border-slate-300"
            title="Cetak Laporan Keuangan ke Kertas atau PDF Cetak"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak Laporan</span>
          </button>

          <div className="flex bg-blue-600 border border-blue-600 rounded-xl overflow-hidden shadow-md shadow-blue-600/20">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all border-r border-blue-700 cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-300" />
              <span>Ekspor Excel</span>
            </button>
            <button
              onClick={handleExportPdf}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-rose-300" />
              <span>Ekspor PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. KONTTAINER UTAMA LAPORAN                                   */}
      {/* ============================================================ */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 flex flex-col gap-6 shadow-xs print:border-none print:p-0 print:shadow-none">
        
        {/* KOP RESMI LAPORAN KEUANGAN (Official Statement Document Header) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0 text-blue-300">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-blue-300">
                  Laporan Akuntansi Resmi
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Terverifikasi
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mt-0.5 font-heading">
                LAPORAN KINERJA KEUANGAN & ARUS KAS
              </h2>
              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-300 mt-1">
                <span>Entitas: <strong className="text-white">{user?.name || 'Ines Karlina'}</strong></span>
                <span>•</span>
                <span>Periode: <strong className="text-amber-300">{activePeriodLabel}</strong></span>
                <span>•</span>
                <span>Mata Uang: <strong className="text-white">{activeCurrencyLabel}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end text-xs text-slate-300 border-t md:border-t-0 border-slate-700/60 pt-3 md:pt-0 w-full md:w-auto">
            <span className="text-[11px] text-slate-400">Tanggal Terbit Dokumen:</span>
            <span className="font-extrabold text-white">
              {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span className={`mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${financialRatios.healthColor}`}>
              {financialRatios.healthStatus}
            </span>
          </div>
        </div>

        {/* BAR FILTER PERIODE & NAVIGASI TAB */}
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 pb-4 border-b border-slate-100 print:hidden">
          
          {/* Dropdown Periode */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex flex-col gap-1 min-w-[220px]">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                Filter Periode Laporan
              </label>
              <div className="relative">
                <select
                  value={period}
                  onChange={(e) => handlePeriodChange(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-200 hover:border-slate-300 rounded-xl py-2 px-3.5 pr-9 text-slate-800 font-extrabold text-xs outline-none cursor-pointer shadow-2xs transition-all appearance-none"
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

                  <option value="custom">Kustom Rentang Tanggal...</option>
                </select>
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {period === 'custom' && (
              <div className="flex flex-wrap items-center gap-2 pt-4 sm:pt-4 animate-fade-in">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none shadow-2xs"
                />
                <span className="text-xs text-slate-400 font-bold">s/d</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none shadow-2xs"
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
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all"
                >
                  Terapkan
                </button>
              </div>
            )}
          </div>

          {/* TAB NAVIGASI LAPORAN */}
          <div className="flex bg-slate-100 p-1 rounded-2xl self-start lg:self-auto overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('statement')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'statement'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Laporan Laba Rugi</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Grafik & Analitik</span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Tinjauan Lengkap</span>
            </button>
          </div>
        </div>

        {/* 3 KARTU KPI KEUANGAN (Selalu Tampil / Executive KPI Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Total Pemasukan */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 flex items-center justify-between shadow-2xs">
            <div className="flex flex-col">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                Total Pemasukan (Income)
              </span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-heading mt-1">
                {formatCurrency(summary.totalIncome)}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 font-semibold">
                {incomeCategoryData.length} sumber kategori pendapatan
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Total Pengeluaran */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 flex items-center justify-between shadow-2xs">
            <div className="flex flex-col">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                Total Beban (Expense)
              </span>
              <span className="text-2xl sm:text-3xl font-black text-rose-600 font-heading mt-1">
                {formatCurrency(summary.totalExpense)}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 font-semibold">
                {categoryData.length} pos beban operasional
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <ArrowDownRight className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Surplus/Defisit Bersih */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 flex items-center justify-between shadow-2xs">
            <div className="flex flex-col">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                Surplus / Defisit Bersih
              </span>
              <span className={`text-2xl sm:text-3xl font-black font-heading mt-1 ${
                summary.netBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {formatCurrency(summary.netBalance)}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 font-semibold">
                Savings Rate: <strong className="text-slate-700">{financialRatios.savingsRate.toFixed(1)}%</strong>
              </span>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              summary.netBalance >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
              <Wallet className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: LAPORAN LABA RUGI FORMAL (INCOME STATEMENT)           */}
        {/* ============================================================ */}
        {(activeTab === 'statement' || activeTab === 'all') && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900 font-heading flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>Laporan Laba Rugi / Kinerja Finansial</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Format baku pelaporan pendapatan operasional dan beban pengeluaran entitas
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-slate-500">Status Kinerja:</span>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-black border ${financialRatios.healthColor}`}>
                  {financialRatios.healthStatus}
                </span>
              </div>
            </div>

            {/* Tabel Laba Rugi Format Standar Akuntansi */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 font-black border-b border-slate-200 uppercase tracking-wider">
                    <th className="py-3 px-4 w-12">No</th>
                    <th className="py-3 px-4">Pos Akun / Kategori Keuangan</th>
                    <th className="py-3 px-4 text-center w-28">Porsi (%)</th>
                    <th className="py-3 px-4 text-right w-44">Jumlah Nominal ({activeCurrency})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {/* BAGIAN I: PENDAPATAN */}
                  <tr className="bg-emerald-50/50 text-emerald-900 font-black">
                    <td colSpan={4} className="py-2.5 px-4 tracking-wider text-xs">
                      I. PENDAPATAN (INCOME & REVENUES)
                    </td>
                  </tr>
                  {incomeCategoryData.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-3 px-4 text-slate-400 italic text-center">
                        Tidak ada transaksi pendapatan pada periode ini.
                      </td>
                    </tr>
                  ) : (
                    incomeCategoryData.map((inc, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-4 text-slate-400 font-bold">{idx + 1}</td>
                        <td className="py-2.5 px-4 text-slate-800 font-bold flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: inc.color }} />
                          <span>{inc.name}</span>
                        </td>
                        <td className="py-2.5 px-4 text-center text-slate-500 font-bold">
                          {inc.percent}%
                        </td>
                        <td className="py-2.5 px-4 text-right font-black text-emerald-600">
                          {formatCurrency(inc.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                  {/* Subtotal Pendapatan */}
                  <tr className="bg-emerald-50/80 text-emerald-950 font-black border-t border-emerald-200">
                    <td colSpan={2} className="py-3 px-4 font-black">
                      TOTAL PENDAPATAN BERSIH (A)
                    </td>
                    <td className="py-3 px-4 text-center font-black">100%</td>
                    <td className="py-3 px-4 text-right font-black text-sm text-emerald-700">
                      {formatCurrency(summary.totalIncome)}
                    </td>
                  </tr>

                  {/* BAGIAN II: BEBAN / PENGELUARAN */}
                  <tr className="bg-rose-50/50 text-rose-900 font-black">
                    <td colSpan={4} className="py-2.5 px-4 tracking-wider text-xs">
                      II. BEBAN & PENGELUARAN OPERASIONAL (EXPENSES)
                    </td>
                  </tr>
                  {categoryData.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-3 px-4 text-slate-400 italic text-center">
                        Tidak ada transaksi beban pengeluaran pada periode ini.
                      </td>
                    </tr>
                  ) : (
                    categoryData.map((exp, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-4 text-slate-400 font-bold">{idx + 1}</td>
                        <td className="py-2.5 px-4 text-slate-800 font-bold flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: exp.color }} />
                          <span>{exp.name}</span>
                        </td>
                        <td className="py-2.5 px-4 text-center text-slate-500 font-bold">
                          {exp.percent}%
                        </td>
                        <td className="py-2.5 px-4 text-right font-black text-rose-600">
                          {formatCurrency(exp.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                  {/* Subtotal Beban */}
                  <tr className="bg-rose-50/80 text-rose-950 font-black border-t border-rose-200">
                    <td colSpan={2} className="py-3 px-4 font-black">
                      TOTAL BEBAN OPERASIONAL (B)
                    </td>
                    <td className="py-3 px-4 text-center font-black">100%</td>
                    <td className="py-3 px-4 text-right font-black text-sm text-rose-700">
                      {formatCurrency(summary.totalExpense)}
                    </td>
                  </tr>

                  {/* BAGIAN III: SURPLUS / DEFISIT BERSIH */}
                  <tr className="bg-slate-900 text-white font-black text-sm border-t-2 border-slate-900">
                    <td colSpan={2} className="py-3.5 px-4 font-black tracking-wide">
                      SURPLUS / (DEFISIT) BERSIH PERIODE (A - B)
                    </td>
                    <td className="py-3.5 px-4 text-center font-extrabold text-xs text-slate-300">
                      Margin: {financialRatios.savingsRate.toFixed(1)}%
                    </td>
                    <td className={`py-3.5 px-4 text-right font-black text-base ${
                      summary.netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {formatCurrency(summary.netBalance)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Catatan Analisis Keuangan & Rasio Kinerja */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-blue-800 text-xs font-extrabold">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span>Tingkat Tabungan (Savings Rate)</span>
                </div>
                <span className="text-xl font-black text-blue-950">
                  {financialRatios.savingsRate.toFixed(1)}%
                </span>
                <p className="text-[11px] text-slate-500 font-medium">
                  {financialRatios.savingsRate >= 20 
                    ? 'Sangat baik! Di atas standar ideal akuntansi personal (20%).' 
                    : 'Masih di bawah ambang ideal 20%, disarankan menekan pos beban.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-amber-800 text-xs font-extrabold">
                  <Scale className="w-4 h-4 text-amber-600" />
                  <span>Rasio Beban (Operating Ratio)</span>
                </div>
                <span className="text-xl font-black text-amber-950">
                  {financialRatios.expenseRatio.toFixed(1)}%
                </span>
                <p className="text-[11px] text-slate-500 font-medium">
                  Persentase pendapatan yang terpakai untuk seluruh pos kebutuhan belanja.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-slate-700 text-xs font-extrabold">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Catatan Evaluasi Akuntansi</span>
                </div>
                <span className="text-xs font-bold text-slate-800 leading-relaxed">
                  {summary.netBalance >= 0 
                    ? `Entitas membukukan surplus sebesar ${formatCurrency(summary.netBalance)}. Kapasitas likuiditas prima.` 
                    : `Entitas membukukan defisit operasional ${formatCurrency(Math.abs(summary.netBalance))}. Perlu pengetatan anggaran.`}
                </span>
              </div>
            </div>
          </div>
        )}


        {/* ============================================================ */}
        {/* TAB 3: GRAFIK & ANALITIK (VISUAL CHARTS)                     */}
        {/* ============================================================ */}
        {(activeTab === 'analytics' || activeTab === 'all') && (
          <div className="flex flex-col gap-6 pt-4 border-t border-slate-100 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-black text-slate-900 font-heading flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-blue-600" />
                  <span>Visualisasi Tren & Distribusi Keuangan</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Grafik perbandingan arus kas masuk vs keluar dan rincian komposisi belanja
                </p>
              </div>
            </div>

            {/* Grid 2 Grafik Utama */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              
              {/* Grafik Kiri: Tren Pemasukan vs Pengeluaran */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 flex flex-col gap-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900 font-heading">
                    Tren Pemasukan vs Pengeluaran
                  </h4>
                  <div className="flex items-center gap-3 text-[11px] font-bold">
                    <span className="flex items-center gap-1.5 text-emerald-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Pemasukan
                    </span>
                    <span className="flex items-center gap-1.5 text-blue-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Pengeluaran
                    </span>
                  </div>
                </div>

                <div className="relative w-full h-56 pt-2">
                  {(() => {
                    const formatCompact = (val) => {
                      if (!val || val === 0) return '0'
                      if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)} M`
                      if (val >= 1000000) return `${(val / 1000000).toFixed(val % 1000000 === 0 ? 0 : 1)} jt`
                      if (val >= 1000) return `${(val / 1000).toFixed(0)} rb`
                      return String(val)
                    }

                    const trendData = (() => {
                      if (filteredTransactions.length === 0) {
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

                      const sorted = [...filteredTransactions].sort((a, b) => a.transactionDate.localeCompare(b.transactionDate))
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

              {/* Grafik Kanan: Donut Pengeluaran per Kategori */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 flex flex-col gap-4 shadow-2xs">
                <h4 className="text-sm font-black text-slate-900 font-heading">
                  Pengeluaran per Kategori Beban
                </h4>

                <div className="flex flex-col sm:flex-row items-center gap-6 pt-1 min-h-[200px]">
                  <div className="shrink-0 flex items-center justify-center">
                    {renderSvgPieChart()}
                  </div>

                  <div className="flex-1 flex flex-col gap-2 w-full max-h-[210px] overflow-y-auto pr-1">
                    {categoryData.length === 0 ? (
                      <span className="text-xs text-slate-400">Tidak ada pos beban pada periode ini.</span>
                    ) : (
                      categoryData.map((item, idx) => (
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

            {/* Analisis Distribusi Metode Pembayaran */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 flex flex-col gap-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-900 font-heading flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Arus Kas Berdasarkan Metode Pembayaran / Rekening</span>
                </h4>
                <span className="text-xs text-slate-400 font-bold">
                  {paymentMethodStats.length} Metode Aktif
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
                {paymentMethodStats.length === 0 ? (
                  <div className="col-span-4 text-center text-slate-400 text-xs py-4">
                    Belum ada data transaksi metode pembayaran.
                  </div>
                ) : (
                  paymentMethodStats.map((pm, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-800 uppercase tracking-wide">{pm.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                          {pm.count}x
                        </span>
                      </div>
                      <div className="flex flex-col text-[11px] gap-0.5 mt-1 font-semibold">
                        <div className="flex justify-between text-emerald-600">
                          <span>Masuk:</span>
                          <span>{formatCurrency(pm.income)}</span>
                        </div>
                        <div className="flex justify-between text-rose-600">
                          <span>Keluar:</span>
                          <span>{formatCurrency(pm.expense)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* 4. LEMBAR PENGESAHAN DOKUMEN / AUDIT SIGN-OFF FOOTER          */}
        {/* ============================================================ */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 text-xs text-slate-500">
          <div className="flex flex-col gap-1">
            <span className="font-extrabold text-slate-700">Dokumen Pelaporan Keuangan Personal</span>
            <span>ID Dokumen: <code className="text-slate-600 font-mono">RPT-{new Date().getFullYear()}{String(new Date().getMonth()+1).padStart(2,'0')}-{user?.id || '01'}</code></span>
            <span className="text-[11px] text-slate-400">
              Laporan ini dihasilkan secara otomatis oleh modul Sistem Informasi Akuntansi CuanFlow.
            </span>
          </div>

          <div className="flex flex-col items-center sm:items-end border-t sm:border-t-0 pt-3 sm:pt-0 w-full sm:w-auto">
            <span className="text-[11px] text-slate-400">Disusun & Disahkan oleh:</span>
            <span className="text-sm font-black text-slate-900 mt-0.5 font-heading">
              {user?.name || 'Ines Karlina'}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              Pemilik Rekening / Entitas Keuangan
            </span>
          </div>
        </div>

      </div>

    </div>
  )
}
