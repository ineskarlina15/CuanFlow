import { useEffect, useState, useMemo } from 'react'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'
import Modal from '../components/Modal'
import { formatCurrency, getAlertThreshold } from '../utils/currency'
import { formatAmountInput, parseAmountInput, getCurrencyPrefix, capitalizeFirstLetter } from '../utils/formatters'
import { 
  Landmark, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Loader2, Calendar, Info,
  Search, Filter, ArrowUpDown, TrendingUp, AlertTriangle, CheckCircle2, Wallet, RotateCcw
} from 'lucide-react'

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

export default function Budgets() {
  const { showToast } = useToast()
  
  const [budgets, setBudgets] = useState([])
  const [allBudgets, setAllBudgets] = useState([])
  const [viewMode, setViewMode] = useState('MONTHLY') // 'MONTHLY' | 'ALL'
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  // Current Month/Year selection
  const currentDate = new Date()
  const currentMonthNum = currentDate.getMonth() + 1
  const currentYearNum = currentDate.getFullYear()
  const [month, setMonth] = useState(currentMonthNum)
  const [year, setYear] = useState(currentYearNum)

  // Filter, Search, Sort, dan Pagination State
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL') // 'ALL' | 'SAFE' | 'WARNING' | 'EXCEEDED'
  const [sortBy, setSortBy] = useState('DEFAULT') // 'DEFAULT' | 'AMOUNT_DESC' | 'AMOUNT_ASC' | 'PERCENT_DESC' | 'NAME_ASC'
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(6)

  // Formulir Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState('add')
  const [selectedBudget, setSelectedBudget] = useState(null)
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    month: currentMonthNum,
    year: currentYearNum,
    description: ''
  })
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)

  // Modal Hapus
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [budgetToDelete, setBudgetToDelete] = useState(null)

  const fetchCategories = async () => {
    try {
      const res = await api.get('/financeSvc/api/v1/categories')
      if (res?.data) {
        setCategories(res.data)
        const firstExpense = res.data.find(c => String(c.type || '').toUpperCase() === 'EXPENSE')
        if (firstExpense && !formData.categoryId) {
          setFormData((prev) => ({ ...prev, categoryId: firstExpense.id }))
        }
      }
    } catch {
      showToast('Gagal memuat kategori', 'error')
    }
  }

  const fetchBudgets = async (targetMonth = month, targetYear = year) => {
    setLoading(true)
    try {
      const [resMonthly, resAll] = await Promise.all([
        api.get(`/financeSvc/api/v1/budgets?month=${targetMonth}&year=${targetYear}`),
        api.get('/financeSvc/api/v1/budgets')
      ])

      const rawMonthly = resMonthly?.data !== undefined ? resMonthly.data : resMonthly
      setBudgets(Array.isArray(rawMonthly) ? rawMonthly : [])

      const rawAll = resAll?.data !== undefined ? resAll.data : resAll
      setAllBudgets(Array.isArray(rawAll) ? rawAll : [])
    } catch (err) {
      showToast(err.message || 'Gagal memuat anggaran', 'error')
    } finally {
      setLoading(false)
    }
  }

  const [, setSettingsTick] = useState(0)

  useEffect(() => {
    fetchCategories()

    const handleSettingsUpdate = () => setSettingsTick((prev) => prev + 1)
    window.addEventListener('cuanflow_settings_updated', handleSettingsUpdate)
    return () => window.removeEventListener('cuanflow_settings_updated', handleSettingsUpdate)
  }, [])

  useEffect(() => {
    fetchBudgets()
  }, [month, year])

  // Reset pagination ke halaman 1 saat filter, pencarian, mode, atau bulan berganti
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, sortBy, viewMode, month, year, itemsPerPage])

  // Hitung daftar periode yang memiliki data anggaran dari allBudgets
  const availablePeriods = useMemo(() => {
    const map = {}
    allBudgets.forEach((bRes) => {
      const m = bRes.budget?.month
      const y = bRes.budget?.year
      if (m && y) {
        const key = `${y}-${m}`
        if (!map[key]) {
          map[key] = { month: m, year: y, count: 0, label: `${monthNames[m - 1]} ${y}` }
        }
        map[key].count += 1
      }
    })
    return Object.values(map).sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year
      return b.month - a.month
    })
  }, [allBudgets])

  const rawList = viewMode === 'ALL' ? allBudgets : budgets

  // Ringkasan Finansial Anggaran
  const summaryStats = useMemo(() => {
    const userThreshold = getAlertThreshold()
    let totalBudget = 0
    let totalUsed = 0
    let safeCount = 0
    let warningCount = 0
    let exceededCount = 0

    rawList.forEach((bRes) => {
      const amt = Number(bRes.budget?.amount || 0)
      const used = Number(bRes.usedAmount || 0)
      totalBudget += amt
      totalUsed += used

      const pct = bRes.percentageUsed || 0
      if (pct > 100) exceededCount++
      else if (pct >= userThreshold) warningCount++
      else safeCount++
    })

    const remaining = totalBudget - totalUsed
    const overallPercentage = totalBudget > 0 ? (totalUsed / totalBudget) * 100 : 0

    return {
      totalBudget,
      totalUsed,
      remaining,
      overallPercentage,
      safeCount,
      warningCount,
      exceededCount,
      totalCount: rawList.length
    }
  }, [rawList])

  // Filter & Pengurutan data
  const filteredBudgets = useMemo(() => {
    const userThreshold = getAlertThreshold()

    return rawList.filter((bRes) => {
      const catName = (bRes.budget?.category?.name || '').toLowerCase()
      const desc = (bRes.budget?.description || '').toLowerCase()
      const q = searchQuery.trim().toLowerCase()

      if (q && !catName.includes(q) && !desc.includes(q)) {
        return false
      }

      const pct = bRes.percentageUsed || 0
      if (statusFilter === 'SAFE' && (pct >= userThreshold || pct > 100)) return false
      if (statusFilter === 'WARNING' && (pct < userThreshold || pct > 100)) return false
      if (statusFilter === 'EXCEEDED' && pct <= 100) return false

      return true
    }).sort((a, b) => {
      if (sortBy === 'AMOUNT_DESC') {
        return Number(b.budget?.amount || 0) - Number(a.budget?.amount || 0)
      }
      if (sortBy === 'AMOUNT_ASC') {
        return Number(a.budget?.amount || 0) - Number(b.budget?.amount || 0)
      }
      if (sortBy === 'PERCENT_DESC') {
        return Number(b.percentageUsed || 0) - Number(a.percentageUsed || 0)
      }
      if (sortBy === 'NAME_ASC') {
        return (a.budget?.category?.name || '').localeCompare(b.budget?.category?.name || '')
      }
      return 0
    })
  }, [rawList, searchQuery, statusFilter, sortBy])

  // Pagination Calculation
  const totalPages = Math.max(1, Math.ceil(filteredBudgets.length / itemsPerPage))
  const paginatedBudgets = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredBudgets.slice(start, start + itemsPerPage)
  }, [filteredBudgets, currentPage, itemsPerPage])

  const openModal = (type, budgetRes = null) => {
    setModalType(type)
    setFormErrors({})
    if (type === 'edit' && budgetRes) {
      setSelectedBudget(budgetRes)
      setFormData({
        categoryId: budgetRes.budget.category?.id || '',
        amount: budgetRes.budget.amount || '',
        month: budgetRes.budget.month || month,
        year: budgetRes.budget.year || year,
        description: budgetRes.budget.description || ''
      })
    } else {
      setSelectedBudget(null)
      const firstExpense = categories.find(c => String(c.type || '').toUpperCase() === 'EXPENSE') || categories[0]
      setFormData({
        categoryId: firstExpense?.id || '',
        amount: '',
        month: month,
        year: year,
        description: ''
      })
    }
    setIsModalOpen(true)
  }

  // Hanya tampilkan kategori jenis Pengeluaran (EXPENSE) untuk konfigurasi batas anggaran
  const expenseCategories = useMemo(() => {
    return categories.filter(c => {
      const isExpense = String(c.type || '').toUpperCase() === 'EXPENSE'
      const isCurrentSelected = modalType === 'edit' && String(c.id) === String(formData.categoryId)
      return isExpense || isCurrentSelected
    })
  }, [categories, modalType, formData.categoryId])

  const validate = () => {
    const errors = {}
    if (!formData.categoryId) errors.categoryId = 'Kategori wajib diisi'
    
    if (!formData.amount) {
      errors.amount = 'Nominal wajib diisi'
    } else if (Number(formData.amount) < 1000) {
      errors.amount = 'Nominal minimal Rp 1.000'
    } else if (Number(formData.amount) > 1000000000) {
      errors.amount = 'Nominal maksimal Rp 1.000.000.000 (1 Miliar)'
    }

    if (modalType === 'add') {
      const existing = allBudgets.find(
        (b) =>
          String(b.budget?.category?.id) === String(formData.categoryId) &&
          Number(b.budget?.month) === Number(formData.month) &&
          Number(b.budget?.year) === Number(formData.year)
      )
      if (existing) {
        errors.categoryId = `Kategori ini sudah memiliki anggaran pada ${monthNames[Number(formData.month) - 1]} ${formData.year}`
        showToast(`Kategori ini sudah memiliki anggaran pada ${monthNames[Number(formData.month) - 1]} ${formData.year}.`, 'error')
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      const payload = {
        categoryId: Number(formData.categoryId),
        amount: Number(formData.amount),
        month: Number(formData.month),
        year: Number(formData.year),
        description: formData.description
      }

      if (modalType === 'add') {
        await api.post('/financeSvc/api/v1/budgets', payload)
        showToast('Anggaran berhasil dikonfigurasi!', 'success')
      } else {
        await api.put(`/financeSvc/api/v1/budgets/${selectedBudget.budget.id}`, payload)
        showToast('Anggaran berhasil diperbarui!', 'success')
      }
      const targetMonth = Number(formData.month)
      const targetYear = Number(formData.year)
      setIsModalOpen(false)
      setMonth(targetMonth)
      setYear(targetYear)
      setViewMode('MONTHLY')
      fetchBudgets(targetMonth, targetYear)
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan anggaran', 'error')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = (budgetRes) => {
    setBudgetToDelete(budgetRes)
    setIsDeleteOpen(true)
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/financeSvc/api/v1/budgets/${budgetToDelete.budget.id}`)
      showToast('Anggaran berhasil dihapus!', 'success')
      setIsDeleteOpen(false)
      fetchBudgets()
    } catch (err) {
      showToast(err.message || 'Gagal menghapus anggaran', 'error')
    }
  }

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12)
      setYear((prev) => prev - 1)
    } else {
      setMonth((prev) => prev - 1)
    }
  }

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1)
      setYear((prev) => prev + 1)
    } else {
      setMonth((prev) => prev + 1)
    }
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setStatusFilter('ALL')
    setSortBy('DEFAULT')
  }

  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'ALL' || sortBy !== 'DEFAULT'

  return (
    <div className="flex-grow p-4 sm:p-6 lg:p-8 flex flex-col gap-6 w-full max-w-7xl mx-auto animate-fade-in text-slate-800 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">Anggaran</h1>
          <p className="text-xs text-slate-400 mt-1">Tetapkan batas dan pantau pengeluaran berdasarkan kategori</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          {/* View Mode Toggle: Per Bulan vs Semua Periode */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold shadow-xs">
            <button
              onClick={() => setViewMode('MONTHLY')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'MONTHLY'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Per Bulan
            </button>
            <button
              onClick={() => setViewMode('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'ALL'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Semua Periode</span>
              {allBudgets.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  viewMode === 'ALL' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                }`}>
                  {allBudgets.length}
                </span>
              )}
            </button>
          </div>

          {/* Month Selector Navigation (Hanya tampil saat mode Per Bulan) */}
          {viewMode === 'MONTHLY' && (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white shadow-xs">
                <button
                  onClick={handlePrevMonth}
                  className="text-slate-500 hover:text-slate-900 p-1 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                  title="Bulan Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold text-slate-800 min-w-[125px] text-center select-none">
                  {monthNames[month - 1]} {year}
                </span>
                <button
                  onClick={handleNextMonth}
                  className="text-slate-500 hover:text-slate-900 p-1 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                  title="Bulan Berikutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Tombol Cepat Kembali ke Bulan Ini jika sedang melihat bulan lain */}
              {(month !== currentMonthNum || year !== currentYearNum) && (
                <button
                  onClick={() => {
                    setMonth(currentMonthNum)
                    setYear(currentYearNum)
                  }}
                  className="px-2.5 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 bg-white border border-blue-200 rounded-xl transition-all cursor-pointer shadow-2xs"
                  title="Kembali ke Bulan Berjalan"
                >
                  Bulan Ini
                </button>
              )}
            </div>
          )}

          <button
            onClick={() => openModal('add')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Atur Anggaran</span>
          </button>
        </div>
      </div>

      {/* Ringkasan Finansial (Summary Metric Cards) */}
      {rawList.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-xs flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-400">Total Anggaran Disiapkan</span>
              <span className="text-lg font-black text-slate-900 mt-1">
                {formatCurrency(summaryStats.totalBudget)}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 font-medium">
                {summaryStats.totalCount} kategori anggaran aktif
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-xs flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-400">Total Pengeluaran Terpakai</span>
              <span className="text-lg font-black text-rose-600 mt-1">
                {formatCurrency(summaryStats.totalUsed)}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 font-medium">
                {summaryStats.overallPercentage.toFixed(1)}% dari total limit
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-xs flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-400">Sisa Saldo Anggaran</span>
              <span className={`text-lg font-black mt-1 ${summaryStats.remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatCurrency(summaryStats.remaining)}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 font-medium">
                {summaryStats.remaining >= 0 ? 'Tersedia untuk dibelanjakan' : 'Melebihi target anggaran'}
              </span>
            </div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              summaryStats.remaining >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between gap-2">
            <span className="text-xs font-bold text-slate-400">Kondisi Status Anggaran</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/70" title="Aman (Safe)">
                {summaryStats.safeCount} Aman
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200/70" title="Peringatan (Warning)">
                {summaryStats.warningCount} Waspada
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200/70" title="Melebihi (Exceeded)">
                {summaryStats.exceededCount} Lewat
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              Ambang batas waspada: {getAlertThreshold()}%
            </span>
          </div>
        </div>
      )}

      {/* Banner Rekomendasi Periode jika Bulan Aktif Kosong namun ada Anggaran di Bulan Lain */}
      {viewMode === 'MONTHLY' && budgets.length === 0 && availablePeriods.length > 0 && (
        <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-slate-800 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl mt-0.5 shrink-0 shadow-2xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">
                Tidak ada anggaran di {monthNames[month - 1]} {year}
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                Ditemukan total <span className="font-bold text-blue-700">{allBudgets.length} anggaran</span> di periode lain. Klik tombol di bawah untuk langsung melihat:
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {availablePeriods.map((p) => (
              <button
                key={`${p.year}-${p.month}`}
                onClick={() => {
                  setMonth(p.month)
                  setYear(p.year)
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-2 ${
                  p.month === month && p.year === year
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 shadow-2xs'
                }`}
              >
                <span>📅 {p.label}</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                  p.month === month && p.year === year ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {p.count}
                </span>
              </button>
            ))}
            <button
              onClick={() => setViewMode('ALL')}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all cursor-pointer shadow-xs ml-auto md:ml-0"
            >
              Lihat Semua
            </button>
          </div>
        </div>
      )}

      {/* Toolbar Pencarian, Filter Status, Pengurutan, dan Pilihan Jumlah Data */}
      {rawList.length > 0 && (
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
          {/* Kolom Pencarian */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari anggaran atau kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-xl text-xs text-slate-800 font-medium outline-none transition-all"
            />
          </div>

          {/* Filter & Sort Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter Status */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value="ALL">Semua Status</option>
                <option value="SAFE">🟢 Aman (Safe)</option>
                <option value="WARNING">🟡 Waspada (Warning)</option>
                <option value="EXCEEDED">🔴 Lewat Batas (Exceeded)</option>
              </select>
            </div>

            {/* Pengurutan (Sort By) */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value="DEFAULT">Urutkan: Bawaan</option>
                <option value="AMOUNT_DESC">Nominal: Tertinggi</option>
                <option value="AMOUNT_ASC">Nominal: Terendah</option>
                <option value="PERCENT_DESC">Persentase: Tertinggi</option>
                <option value="NAME_ASC">Kategori: A - Z</option>
              </select>
            </div>

            {/* Jumlah Item per Halaman */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-600 font-medium">
              <span>Per Hal:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
              >
                <option value={6}>6</option>
                <option value={9}>9</option>
                <option value={12}>12</option>
              </select>
            </div>

            {/* Tombol Reset jika filter aktif */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                title="Reset pencarian dan filter"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Budgets Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px] text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-2" />
          <span>Memuat anggaran...</span>
        </div>
      ) : filteredBudgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] border border-slate-200 rounded-2xl bg-white p-8 text-center shadow-xs">
          <Landmark className="w-12 h-12 text-slate-300 mb-3" />
          <h3 className="text-lg font-black text-slate-800 font-heading">
            {hasActiveFilters
              ? 'Tidak Ada Anggaran yang Cocok'
              : viewMode === 'ALL'
              ? 'Belum Ada Anggaran Sama Sekali'
              : 'Belum Ada Anggaran'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            {hasActiveFilters
              ? 'Coba ganti kata kunci pencarian atau sesuaikan filter status yang Anda pilih.'
              : viewMode === 'ALL'
              ? 'Anda belum menetapkan batas anggaran untuk periode apapun.'
              : `Tetapkan target anggaran bulan ${monthNames[month - 1]} ${year} untuk memantau pengeluaran.`}
          </p>
          {hasActiveFilters ? (
            <button
              onClick={handleResetFilters}
              className="mt-4 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 border border-slate-200 bg-white rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              Reset Filter
            </button>
          ) : (
            <button
              onClick={() => openModal('add')}
              className="mt-4 px-5 py-2.5 text-sm font-bold text-blue-600 hover:bg-blue-50 border border-blue-200 bg-white rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              Buat Batas Anggaran
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedBudgets.map((bRes) => {
            const userThreshold = getAlertThreshold()
            const pct = Math.min(bRes.percentageUsed || 0, 100)
            const isExceeded = bRes.percentageUsed > 100
            const isWarning = bRes.percentageUsed >= userThreshold && bRes.percentageUsed <= 100

            let progressColor = 'bg-blue-600'
            let textColor = 'text-blue-600'
            if (isExceeded) {
              progressColor = 'bg-rose-600'
              textColor = 'text-rose-600'
            } else if (isWarning) {
              progressColor = 'bg-amber-500'
              textColor = 'text-amber-600'
            }

            return (
              <div
                key={bRes.budget.id}
                className={`relative overflow-hidden rounded-2xl border p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all text-slate-800 ${
                  isExceeded
                    ? 'bg-rose-50/70 border-rose-200/90'
                    : isWarning
                    ? 'bg-amber-50/70 border-amber-200/90'
                    : 'bg-emerald-50/50 border-emerald-200/80'
                }`}
              >
                {/* Header info matching PDF */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">
                      {bRes.budget.category?.name?.toLowerCase().includes('food') ? '🍔' :
                       bRes.budget.category?.name?.toLowerCase().includes('transport') ? '🚗' :
                       bRes.budget.category?.name?.toLowerCase().includes('shop') ? '🛍️' :
                       bRes.budget.category?.name?.toLowerCase().includes('bill') ? '⚡' : '💼'}
                    </span>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-black text-slate-900">Anggaran {bRes.budget.category?.name}</span>
                        {viewMode === 'ALL' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100/80 text-blue-800 border border-blue-200 shadow-2xs">
                            <Calendar className="w-2.5 h-2.5" />
                            {monthNames[bRes.budget.month - 1]} {bRes.budget.year}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 font-semibold mt-0.5">{formatCurrency(bRes.budget.amount)}</span>
                      {bRes.budget.description && (
                        <span className="text-[10px] text-slate-400 mt-0.5 italic line-clamp-1">
                          "{bRes.budget.description}"
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => openModal('edit', bRes)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white/80 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => confirmDelete(bRes)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white/80 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar and Percentage matching PDF */}
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex justify-between items-center text-xs font-extrabold">
                    <span className="text-slate-500">Terpakai: {formatCurrency(bRes.usedAmount)}</span>
                    <span className={`text-sm ${textColor}`}>{(bRes.percentageUsed || 0).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-200/80 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Remaining Sisa & Status Badge matching PDF Wireframe Screen 5 */}
                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between mt-1">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700">
                    <span>Sisa:</span>
                    <span className={isExceeded ? 'text-rose-700' : isWarning ? 'text-amber-700' : 'text-emerald-700'}>
                      {formatCurrency(bRes.budget.amount - bRes.usedAmount)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-black uppercase text-slate-500">Status:</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase border ${
                      isExceeded
                        ? 'bg-rose-100 text-rose-700 border-rose-300'
                        : isWarning
                        ? 'bg-amber-100 text-amber-700 border-amber-300'
                        : 'bg-emerald-100 text-emerald-700 border-emerald-300'
                    }`}>
                      {isExceeded ? 'EXCEEDED' : isWarning ? 'WARNING' : 'SAFE'}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination Controls (Sebelumnya / Prev & Selanjutnya / Next) */}
      {!loading && filteredBudgets.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">
            Menampilkan <span className="font-bold text-slate-900">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredBudgets.length)}</span> - <span className="font-bold text-slate-900">{Math.min(currentPage * itemsPerPage, filteredBudgets.length)}</span> dari <span className="font-bold text-slate-900">{filteredBudgets.length}</span> anggaran
            {totalPages > 1 && (
              <span className="text-slate-400 ml-2">(Halaman {currentPage} dari {totalPages})</span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Tombol Sebelumnya (Prev) */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>

            {/* Angka Halaman */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    currentPage === page
                      ? 'bg-blue-600 text-white shadow-xs shadow-blue-600/20'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            {/* Tombol Selanjutnya (Next) */}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Set/Edit Budget Modal matching Screen 4 */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalType === 'add' ? 'Konfigurasi Anggaran' : 'Edit Anggaran'}
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4 text-slate-800">
          
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex flex-col gap-1">
             <p className="text-xs text-blue-700 font-medium leading-relaxed">
               Bulan dan Tahun di bawah ini menentukan pada periode mana batas anggaran ini berlaku. Secara bawaan, periode akan mengikuti bulan yang sedang Anda lihat di halaman sebelumnya.
             </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Kategori Pengeluaran</label>
              <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md">
                Batas Pengeluaran
              </span>
            </div>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className={`w-full bg-slate-50 border ${
                formErrors.categoryId ? 'border-rose-500' : 'border-slate-200 focus:border-blue-600'
              } rounded-xl py-3 px-3.5 text-slate-800 outline-none text-sm font-medium cursor-pointer transition-all`}
              disabled={modalType === 'edit'}
            >
              <option value="">Pilih Kategori Pengeluaran</option>
              {expenseCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {formErrors.categoryId && <span className="text-xs text-rose-500 font-semibold">{formErrors.categoryId}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">
              Batas Limit Bulanan ({getCurrencyPrefix().trim()})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-xs font-bold text-slate-400 select-none">
                {getCurrencyPrefix()}
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="1.000.000"
                value={formatAmountInput(formData.amount)}
                onChange={(e) => {
                  const raw = parseAmountInput(e.target.value)
                  setFormData({ ...formData, amount: raw || '' })
                }}
                className={`w-full bg-slate-50 border ${
                  formErrors.amount ? 'border-rose-500' : 'border-slate-200 focus:border-blue-600'
                } rounded-xl py-3 pl-12 pr-4 text-slate-800 outline-none text-sm font-medium transition-all`}
              />
            </div>
            {formErrors.amount && <span className="text-xs text-rose-500 font-semibold">{formErrors.amount}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Deskripsi / Catatan Tambahan (Opsional)</label>
            <textarea
              placeholder="Contoh: Anggaran belanja bulanan keluarga..."
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: capitalizeFirstLetter(e.target.value) })}
              rows="2"
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-xl py-3 px-4 text-slate-800 outline-none text-sm font-medium resize-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Bulan (Periode)</label>
              <select
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-xl py-3 px-3.5 text-slate-800 outline-none text-sm font-medium cursor-pointer transition-all"
                disabled={modalType === 'edit'}
              >
                {monthNames.map((mName, i) => (
                  <option key={i} value={i + 1}>{mName}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Tahun (Periode)</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-xl py-3 px-4 text-slate-800 outline-none text-sm font-medium transition-all"
                disabled={modalType === 'edit'}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-bold transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Simpan Batas</span>}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Hapus Batas Anggaran"
      >
        <div className="flex flex-col gap-4 text-center">
          <p className="text-sm text-slate-600">
            Apakah Anda yakin ingin menghapus batas anggaran untuk kategori{' '}
            <span className="font-bold text-slate-900">"{budgetToDelete?.budget.category?.name}"</span>?
          </p>
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => setIsDeleteOpen(false)}
              className="flex-1 py-3 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-700 text-sm font-bold cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 rounded-xl text-white text-sm font-bold cursor-pointer"
            >
              Hapus
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
