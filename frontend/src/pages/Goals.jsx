import { useEffect, useState, useMemo } from 'react'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'
import Modal from '../components/Modal'
import { formatCurrency } from '../utils/currency'
import { 
  formatAmountInput, 
  parseAmountInput, 
  getCurrencyPrefix, 
  capitalizeWords, 
  capitalizeFirstLetter 
} from '../utils/formatters'
import { 
  Target, Plus, Edit2, Trash2, Loader2, ArrowUpCircle, Calendar,
  ChevronLeft, ChevronRight, Search, Filter, ArrowUpDown, RotateCcw,
  CheckCircle2, TrendingUp, Wallet, Clock
} from 'lucide-react'

export default function Goals() {
  const { showToast } = useToast()
  
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)

  // Filter, Search, Sort, dan Pagination State
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL') // 'ALL' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE'
  const [sortBy, setSortBy] = useState('DEFAULT') // 'DEFAULT' | 'TARGET_DESC' | 'TARGET_ASC' | 'PERCENT_DESC' | 'DATE_ASC'
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(6)

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState('add') // 'add' | 'edit'
  const [selectedGoal, setSelectedGoal] = useState(null)
  
  const [isTopUpOpen, setIsTopUpOpen] = useState(false)
  const [topUpAmount, setTopUpAmount] = useState('')

  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  // Data Formulir
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    targetDate: new Date().toISOString().split('T')[0],
    description: ''
  })
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const fetchGoals = async () => {
    setLoading(true)
    try {
      const res = await api.get('/financeSvc/api/v1/goals')
      if (res?.data) {
        setGoals(res.data)
      } else {
        setGoals([])
      }
    } catch (err) {
      showToast(err.message || 'Gagal memuat target tabungan', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGoals()
  }, [])

  // Reset pagination ke halaman 1 saat pencarian, filter, atau jumlah per hal berganti
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, sortBy, itemsPerPage])

  // Ringkasan Finansial Tujuan Keuangan
  const summaryStats = useMemo(() => {
    let totalTarget = 0
    let totalCurrent = 0
    let completedCount = 0
    let inProgressCount = 0
    let overdueCount = 0

    const today = new Date()

    goals.forEach((goal) => {
      const cur = Number(goal.currentAmount || 0)
      const tgt = Number(goal.targetAmount || 0)
      totalTarget += tgt
      totalCurrent += cur

      const isCompleted = cur >= tgt && tgt > 0
      const targetDate = new Date(goal.targetDate)
      const isOverdue = !isCompleted && targetDate < today

      if (isCompleted) completedCount++
      else if (isOverdue) overdueCount++
      else inProgressCount++
    })

    const remaining = Math.max(0, totalTarget - totalCurrent)
    const overallPercentage = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0

    return {
      totalTarget,
      totalCurrent,
      remaining,
      overallPercentage,
      completedCount,
      inProgressCount,
      overdueCount,
      totalGoals: goals.length
    }
  }, [goals])

  // Filter & Pengurutan data
  const filteredGoals = useMemo(() => {
    const today = new Date()

    return goals.filter((goal) => {
      const name = (goal.name || '').toLowerCase()
      const desc = (goal.description || '').toLowerCase()
      const q = searchQuery.trim().toLowerCase()

      if (q && !name.includes(q) && !desc.includes(q)) {
        return false
      }

      const cur = Number(goal.currentAmount || 0)
      const tgt = Number(goal.targetAmount || 1)
      const isCompleted = cur >= tgt
      const targetDate = new Date(goal.targetDate)
      const isOverdue = !isCompleted && targetDate < today

      if (statusFilter === 'COMPLETED' && !isCompleted) return false
      if (statusFilter === 'IN_PROGRESS' && (isCompleted || isOverdue)) return false
      if (statusFilter === 'OVERDUE' && (!isOverdue || isCompleted)) return false

      return true
    }).sort((a, b) => {
      if (sortBy === 'TARGET_DESC') {
        return Number(b.targetAmount || 0) - Number(a.targetAmount || 0)
      }
      if (sortBy === 'TARGET_ASC') {
        return Number(a.targetAmount || 0) - Number(b.targetAmount || 0)
      }
      if (sortBy === 'PERCENT_DESC') {
        const pctA = (Number(a.currentAmount || 0) / Number(a.targetAmount || 1))
        const pctB = (Number(b.currentAmount || 0) / Number(b.targetAmount || 1))
        return pctB - pctA
      }
      if (sortBy === 'DATE_ASC') {
        return new Date(a.targetDate) - new Date(b.targetDate)
      }
      return 0
    })
  }, [goals, searchQuery, statusFilter, sortBy])

  // Kalkulasi Pagination
  const totalPages = Math.max(1, Math.ceil(filteredGoals.length / itemsPerPage))
  const paginatedGoals = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredGoals.slice(start, start + itemsPerPage)
  }, [filteredGoals, currentPage, itemsPerPage])

  const openModal = (type, goal = null) => {
    setModalType(type)
    setFormErrors({})
    if (type === 'edit' && goal) {
      setSelectedGoal(goal)
      setFormData({
        name: goal.name || '',
        targetAmount: goal.targetAmount || '',
        targetDate: goal.targetDate || '',
        description: goal.description || ''
      })
    } else {
      setSelectedGoal(null)
      setFormData({
        name: '',
        targetAmount: '',
        targetDate: new Date().toISOString().split('T')[0],
        description: ''
      })
    }
    setIsModalOpen(true)
  }

  const openTopUpModal = (goal) => {
    setSelectedGoal(goal)
    setTopUpAmount('')
    setIsTopUpOpen(true)
  }

  const confirmDelete = (goal) => {
    setSelectedGoal(goal)
    setIsDeleteOpen(true)
  }

  const validate = () => {
    const errors = {}
    if (!formData.name) errors.name = 'Nama target wajib diisi'
    if (!formData.targetAmount) {
      errors.targetAmount = 'Nominal wajib diisi'
    } else if (Number(formData.targetAmount) <= 0) {
      errors.targetAmount = 'Nominal harus lebih dari 0'
    }
    if (!formData.targetDate) errors.targetDate = 'Tanggal target wajib diisi'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      const payload = {
        name: formData.name,
        targetAmount: Number(formData.targetAmount),
        targetDate: formData.targetDate,
        description: formData.description
      }

      if (modalType === 'add') {
        payload.currentAmount = 0
        await api.post('/financeSvc/api/v1/goals', payload)
        showToast('Target tabungan berhasil dibuat!', 'success')
      } else {
        // pertahankan currentAmount yang ada saat mengedit
        payload.currentAmount = selectedGoal.currentAmount || 0
        await api.put(`/financeSvc/api/v1/goals/${selectedGoal.id}`, payload)
        showToast('Target tabungan berhasil diperbarui!', 'success')
      }
      setIsModalOpen(false)
      fetchGoals()
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan target', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleTopUp = async (e) => {
    e.preventDefault()
    if (!topUpAmount || Number(topUpAmount) <= 0) {
      showToast('Masukkan nominal tabungan yang valid', 'error')
      return
    }

    setSaving(true)
    try {
      const newTotal = Number(selectedGoal.currentAmount) + Number(topUpAmount)
      const payload = {
        name: selectedGoal.name,
        targetAmount: selectedGoal.targetAmount,
        targetDate: selectedGoal.targetDate,
        currentAmount: newTotal > selectedGoal.targetAmount ? selectedGoal.targetAmount : newTotal
      }
      
      await api.put(`/financeSvc/api/v1/goals/${selectedGoal.id}`, payload)
      showToast('Tabungan berhasil ditambahkan!', 'success')
      setIsTopUpOpen(false)
      fetchGoals()
    } catch (err) {
      showToast(err.message || 'Gagal menambahkan tabungan', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/financeSvc/api/v1/goals/${selectedGoal.id}`)
      showToast('Target berhasil dihapus!', 'success')
      setIsDeleteOpen(false)
      fetchGoals()
    } catch (err) {
      showToast(err.message || 'Gagal menghapus target', 'error')
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
      {/* Bagian Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
            Tujuan Keuangan
          </h1>
          <p className="text-xs text-slate-400 mt-1">Rencanakan impian dan pantau progres tabungan Anda secara konsisten</p>
        </div>

        <button
          onClick={() => openModal('add')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Tujuan Baru</span>
        </button>
      </div>

      {/* Ringkasan Finansial Tujuan Keuangan (Summary Metric Cards) */}
      {goals.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-xs flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-400">Total Terkumpul</span>
              <span className="text-lg font-black text-blue-600 mt-1">
                {formatCurrency(summaryStats.totalCurrent)}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 font-medium">
                {summaryStats.overallPercentage.toFixed(1)}% dari seluruh target
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-xs flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-400">Total Rencana Target</span>
              <span className="text-lg font-black text-slate-900 mt-1">
                {formatCurrency(summaryStats.totalTarget)}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 font-medium">
                {summaryStats.totalGoals} tujuan keuangan
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-xs flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-400">Sisa Perlu Ditabung</span>
              <span className="text-lg font-black text-amber-600 mt-1">
                {formatCurrency(summaryStats.remaining)}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 font-medium">
                {summaryStats.remaining === 0 ? 'Semua impian tercapai! 🎉' : 'Kekurangan dana tabungan'}
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between gap-2">
            <span className="text-xs font-bold text-slate-400">Status Pencapaian</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/70" title="Tuntas Tercapai">
                {summaryStats.completedCount} Tuntas
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200/70" title="Sedang Berjalan">
                {summaryStats.inProgressCount} Berjalan
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200/70" title="Terlewat Tenggat Waktu">
                {summaryStats.overdueCount} Lewat
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              {summaryStats.completedCount} dari {summaryStats.totalGoals} impian sukses
            </span>
          </div>
        </div>
      )}

      {/* Toolbar Pencarian, Filter Status, Pengurutan, dan Pilihan Jumlah Data */}
      {goals.length > 0 && (
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
          {/* Kolom Pencarian */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama tujuan atau catatan..."
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
                <option value="IN_PROGRESS">🔵 Sedang Berjalan</option>
                <option value="COMPLETED">🟢 Sudah Tercapai</option>
                <option value="OVERDUE">🔴 Terlewat Tenggat</option>
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
                <option value="TARGET_DESC">Target: Tertinggi</option>
                <option value="TARGET_ASC">Target: Terendah</option>
                <option value="PERCENT_DESC">Progres (%): Tertinggi</option>
                <option value="DATE_ASC">Tenggat: Terdekat</option>
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

      {/* Jaringan Konten (Grid) */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px] text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-2" />
          <span>Memuat data...</span>
        </div>
      ) : filteredGoals.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] border border-slate-200 rounded-2xl bg-white p-8 text-center shadow-xs">
          <Target className="w-12 h-12 text-slate-300 mb-3" />
          <h3 className="text-lg font-black text-slate-800 font-heading">
            {hasActiveFilters ? 'Tidak Ada Tujuan yang Cocok' : 'Belum Ada Tujuan Keuangan'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            {hasActiveFilters
              ? 'Coba ganti kata kunci pencarian atau sesuaikan filter status yang Anda pilih.'
              : 'Mulai atur target tabungan untuk barang impian, liburan, atau dana darurat.'}
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
              Buat Tujuan Sekarang
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedGoals.map((goal) => {
            const current = Number(goal.currentAmount || 0)
            const target = Number(goal.targetAmount || 1)
            let pct = (current / target) * 100
            if (pct > 100) pct = 100
            
            const isCompleted = pct === 100

            // Perhitungan sisa hari
            const today = new Date()
            const targetDate = new Date(goal.targetDate)
            const timeDiff = targetDate.getTime() - today.getTime()
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
            
            let daysLabel = `${daysDiff} Hari Lagi`
            let daysColor = 'text-blue-600 bg-blue-50 border border-blue-200/60'
            
            if (isCompleted) {
              daysLabel = 'Tercapai 🎉'
              daysColor = 'text-emerald-700 bg-emerald-50 border border-emerald-200/80'
            } else if (daysDiff < 0) {
              daysLabel = `Terlewat ${Math.abs(daysDiff)} Hari`
              daysColor = 'text-rose-700 bg-rose-50 border border-rose-200/80'
            } else if (daysDiff === 0) {
              daysLabel = 'Hari Ini!'
              daysColor = 'text-amber-700 bg-amber-50 border border-amber-200/80'
            }

            return (
              <div
                key={goal.id}
                className={`relative overflow-hidden rounded-2xl border p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all text-slate-800 ${
                  isCompleted 
                    ? 'bg-emerald-50/40 border-emerald-200/80' 
                    : daysDiff < 0 
                    ? 'bg-rose-50/40 border-rose-200/80' 
                    : 'bg-white border-slate-200'
                }`}
              >
                {/* Header Kartu */}
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase w-max ${daysColor}`}>
                      {daysLabel}
                    </span>
                    <h3 className="text-base font-black text-slate-900 mt-1 line-clamp-1">{goal.name}</h3>
                    {goal.description && (
                      <p className="text-[11px] text-slate-500 font-medium line-clamp-2 mt-0.5 italic">
                        "{goal.description}"
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={() => openModal('edit', goal)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit Tujuan"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => confirmDelete(goal)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Tujuan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Area Bar Progres */}
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex justify-between items-end text-xs font-extrabold">
                    <div className="flex flex-col">
                      <span className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">Terkumpul</span>
                      <span className="text-blue-600 text-sm font-black">{formatCurrency(current)}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">Target</span>
                      <span className="text-slate-800 text-sm font-black">{formatCurrency(target)}</span>
                    </div>
                  </div>
                  
                  <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden mt-1 p-0.5 border border-slate-200/50">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500 shadow-sm' : 'bg-blue-600'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500 font-medium">
                      Sisa: <strong className="text-slate-700">{formatCurrency(Math.max(0, target - current))}</strong>
                    </span>
                    <span className={`font-black ${isCompleted ? 'text-emerald-600' : 'text-blue-600'}`}>
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Footer Aksi */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                  <div className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Target: {new Date(goal.targetDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  
                  {!isCompleted && (
                    <button
                      onClick={() => openTopUpModal(goal)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer border border-blue-200 hover:border-blue-600 shadow-2xs active:scale-95"
                    >
                      <ArrowUpCircle className="w-3.5 h-3.5" />
                      <span>Nabung</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination Controls (Sebelumnya / Prev & Selanjutnya / Next) */}
      {!loading && filteredGoals.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">
            Menampilkan <span className="font-bold text-slate-900">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredGoals.length)}</span> - <span className="font-bold text-slate-900">{Math.min(currentPage * itemsPerPage, filteredGoals.length)}</span> dari <span className="font-bold text-slate-900">{filteredGoals.length}</span> tujuan keuangan
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

      {/* Modal Tambah/Edit Tujuan */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalType === 'add' ? 'Buat Tujuan Baru' : 'Edit Tujuan'}
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4 text-slate-800">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Nama Tujuan</label>
            <div className="relative">
              <Target className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Dana Darurat, Liburan..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: capitalizeWords(e.target.value) })}
                className={`w-full bg-slate-50 border ${
                  formErrors.name ? 'border-rose-500' : 'border-slate-200 focus:border-blue-600'
                } rounded-xl py-3 pl-10 pr-4 text-slate-800 outline-none text-sm font-medium transition-all`}
              />
            </div>
            {formErrors.name && <span className="text-xs text-rose-500 font-semibold">{formErrors.name}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">
              Target Nominal ({getCurrencyPrefix().trim()})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-xs font-bold text-slate-400 select-none">
                {getCurrencyPrefix()}
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="10.000.000"
                value={formatAmountInput(formData.targetAmount)}
                onChange={(e) => {
                  const raw = parseAmountInput(e.target.value)
                  setFormData({ ...formData, targetAmount: raw || '' })
                }}
                className={`w-full bg-slate-50 border ${
                  formErrors.targetAmount ? 'border-rose-500' : 'border-slate-200 focus:border-blue-600'
                } rounded-xl py-3 pl-12 pr-4 text-slate-800 outline-none text-sm font-medium transition-all`}
              />
            </div>
            {formErrors.targetAmount && <span className="text-xs text-rose-500 font-semibold">{formErrors.targetAmount}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Tenggat Waktu (Target Date)</label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                className={`w-full bg-slate-50 border ${
                  formErrors.targetDate ? 'border-rose-500' : 'border-slate-200 focus:border-blue-600'
                } rounded-xl py-3 pl-10 pr-4 text-slate-800 outline-none text-sm font-medium transition-all`}
              />
            </div>
            {formErrors.targetDate && <span className="text-xs text-rose-500 font-semibold">{formErrors.targetDate}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Deskripsi (Opsional)</label>
            <textarea
              placeholder="Tambahkan catatan untuk tujuan ini..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: capitalizeFirstLetter(e.target.value) })}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-xl py-3 px-4 text-slate-800 outline-none text-sm font-medium transition-all resize-none h-20"
            />
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
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Simpan</span>}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Top-Up (Tambah Tabungan) */}
      <Modal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        title={`Nabung: ${selectedGoal?.name}`}
      >
        <form onSubmit={handleTopUp} className="flex flex-col gap-4 text-slate-800">
          
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex justify-between items-center text-sm font-bold text-blue-800 mb-2">
            <span>Sisa Kekurangan:</span>
            <span>{formatCurrency(Number(selectedGoal?.targetAmount || 0) - Number(selectedGoal?.currentAmount || 0))}</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">
              Nominal Tabungan ({getCurrencyPrefix().trim()})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-xs font-bold text-slate-400 select-none">
                {getCurrencyPrefix()}
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="500.000"
                value={formatAmountInput(topUpAmount)}
                onChange={(e) => {
                  const raw = parseAmountInput(e.target.value)
                  setTopUpAmount(raw || '')
                }}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-xl py-3 pl-12 pr-4 text-slate-800 outline-none text-sm font-medium transition-all"
                autoFocus
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => setIsTopUpOpen(false)}
              className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-bold transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Tambah Tabungan</span>}
            </button>
          </div>
        </form>
      </Modal>

      {/* Konfirmasi Hapus */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Hapus Tujuan"
      >
        <div className="flex flex-col gap-4 text-center">
          <p className="text-sm text-slate-600">
            Apakah Anda yakin ingin menghapus tujuan keuangan <span className="font-bold text-slate-900">"{selectedGoal?.name}"</span>?
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
