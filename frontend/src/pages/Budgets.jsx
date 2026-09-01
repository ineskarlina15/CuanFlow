import { useEffect, useState } from 'react'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'
import Modal from '../components/Modal'
import { formatCurrency, getAlertThreshold } from '../utils/currency'
import { Landmark, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

export default function Budgets() {
  const { showToast } = useToast()
  
  const [budgets, setBudgets] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  // Current Month/Year selection
  const currentDate = new Date()
  const [month, setMonth] = useState(currentDate.getMonth() + 1)
  const [year, setYear] = useState(currentDate.getFullYear())

  // Modal forms
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState('add')
  const [selectedBudget, setSelectedBudget] = useState(null)
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    month: month,
    year: year
  })
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)

  // Delete modal
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [budgetToDelete, setBudgetToDelete] = useState(null)

  const fetchCategories = async () => {
    try {
      const res = await api.get('/financeSvc/api/v1/categories')
      if (res?.data) {
        setCategories(res.data)
        if (res.data.length > 0 && !formData.categoryId) {
          setFormData((prev) => ({ ...prev, categoryId: res.data[0].id }))
        }
      }
    } catch {
      showToast('Gagal memuat kategori', 'error')
    }
  }

  const fetchBudgets = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/financeSvc/api/v1/budgets?month=${month}&year=${year}`)
      if (res?.data) {
        setBudgets(res.data)
      }
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

  const openModal = (type, budgetRes = null) => {
    setModalType(type)
    setFormErrors({})
    if (type === 'edit' && budgetRes) {
      setSelectedBudget(budgetRes)
      setFormData({
        categoryId: budgetRes.budget.category?.id || '',
        amount: budgetRes.budget.amount || '',
        month: budgetRes.budget.month || month,
        year: budgetRes.budget.year || year
      })
    } else {
      setSelectedBudget(null)
      setFormData({
        categoryId: categories[0]?.id || '',
        amount: '',
        month: month,
        year: year
      })
    }
    setIsModalOpen(true)
  }

  const validate = () => {
    const errors = {}
    if (!formData.categoryId) errors.categoryId = 'Kategori wajib diisi'
    if (!formData.amount || Number(formData.amount) <= 0) {
      errors.amount = 'Nominal harus lebih dari 0'
    } else if (Number(formData.amount) > 9999999999999) { // Max 13 digits for DB precision 15,2 constraint
      errors.amount = 'Batas maksimal terlampaui (Maks: Rp 9.999.999.999.999)'
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
        year: Number(formData.year)
      }

      if (modalType === 'add') {
        await api.post('/financeSvc/api/v1/budgets', payload)
        showToast('Anggaran berhasil dikonfigurasi!', 'success')
      } else {
        await api.put(`/financeSvc/api/v1/budgets/${selectedBudget.budget.id}`, payload)
        showToast('Anggaran berhasil diperbarui!', 'success')
      }
      setIsModalOpen(false)
      fetchBudgets()
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

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]

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

  return (
    <div className="flex-grow p-4 sm:p-6 lg:p-8 flex flex-col gap-6 w-full max-w-7xl mx-auto animate-fade-in text-slate-800 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">Anggaran</h1>
          <p className="text-xs text-slate-400 mt-1">Tetapkan batas dan pantau pengeluaran berdasarkan kategori</p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Month Selector Navigation */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white shadow-xs">
            <button
              onClick={handlePrevMonth}
              className="text-slate-500 hover:text-slate-900 p-1 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold text-slate-800 min-w-[120px] text-center">
              {monthNames[month - 1]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="text-slate-500 hover:text-slate-900 p-1 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => openModal('add')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Atur Anggaran</span>
          </button>
        </div>
      </div>

      {/* Budgets Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px] text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-2" />
          <span>Memuat anggaran...</span>
        </div>
      ) : budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] border border-slate-200 rounded-2xl bg-white p-8 text-center shadow-xs">
          <Landmark className="w-12 h-12 text-slate-300 mb-3" />
          <h3 className="text-lg font-black text-slate-800 font-heading">Belum Ada Anggaran</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Tetapkan target anggaran bulan ini untuk memantau pengeluaran.
          </p>
          <button
            onClick={() => openModal('add')}
            className="mt-4 px-5 py-2.5 text-sm font-bold text-blue-600 hover:bg-blue-50 border border-blue-200 bg-white rounded-xl transition-all cursor-pointer"
          >
            Buat Batas Anggaran
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((bRes) => {
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
                      <span className="text-base font-black text-slate-900">Anggaran {bRes.budget.category?.name}</span>
                      <span className="text-xs text-slate-500 font-semibold mt-0.5">{formatCurrency(bRes.budget.amount)}</span>
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

      {/* Set/Edit Budget Modal matching Screen 4 */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalType === 'add' ? 'Konfigurasi Anggaran' : 'Edit Anggaran'}
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4 text-slate-800">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Kategori</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className={`w-full bg-slate-50 border ${
                formErrors.categoryId ? 'border-rose-500' : 'border-slate-200 focus:border-blue-600'
              } rounded-xl py-3 px-3.5 text-slate-800 outline-none text-sm font-medium cursor-pointer transition-all`}
              disabled={modalType === 'edit'}
            >
              <option value="">Pilih Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {formErrors.categoryId && <span className="text-xs text-rose-500 font-semibold">{formErrors.categoryId}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Batas Limit Bulanan (IDR)</label>
            <input
              type="number"
              placeholder="1000000"
              max="9999999999999"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className={`w-full bg-slate-50 border ${
                formErrors.amount ? 'border-rose-500' : 'border-slate-200 focus:border-blue-600'
              } rounded-xl py-3 px-4 text-slate-800 outline-none text-sm font-medium transition-all`}
            />
            {formErrors.amount && <span className="text-xs text-rose-500 font-semibold">{formErrors.amount}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Bulan</label>
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
              <label className="text-xs font-bold text-slate-700">Tahun</label>
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
