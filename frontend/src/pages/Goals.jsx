import { useEffect, useState } from 'react'
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
  Target, Plus, Edit2, Trash2, Loader2, ArrowUpCircle, Calendar, DollarSign
} from 'lucide-react'

export default function Goals() {
  const { showToast } = useToast()
  
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="flex-grow p-4 sm:p-6 lg:p-8 flex flex-col gap-6 w-full max-w-7xl mx-auto animate-fade-in text-slate-800 font-sans">
      {/* Bagian Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
            Tujuan Keuangan
          </h1>
          <p className="text-xs text-slate-400 mt-1">Rencanakan impian dan pantau progres tabungan Anda</p>
        </div>

        <button
          onClick={() => openModal('add')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Tujuan Baru</span>
        </button>
      </div>

      {/* Jaringan Konten (Grid) */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px] text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-2" />
          <span>Memuat data...</span>
        </div>
      ) : goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] border border-slate-200 rounded-2xl bg-white p-8 text-center shadow-xs">
          <Target className="w-12 h-12 text-slate-300 mb-3" />
          <h3 className="text-lg font-black text-slate-800 font-heading">Belum Ada Tujuan Keuangan</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Mulai atur target tabungan untuk barang impian, liburan, atau dana darurat.
          </p>
          <button
            onClick={() => openModal('add')}
            className="mt-4 px-5 py-2.5 text-sm font-bold text-blue-600 hover:bg-blue-50 border border-blue-200 bg-white rounded-xl transition-all cursor-pointer"
          >
            Buat Tujuan Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
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
            let daysColor = 'text-blue-600 bg-blue-50'
            
            if (isCompleted) {
              daysLabel = 'Tercapai 🎉'
              daysColor = 'text-emerald-600 bg-emerald-50'
            } else if (daysDiff < 0) {
              daysLabel = `Terlewat ${Math.abs(daysDiff)} Hari`
              daysColor = 'text-rose-600 bg-rose-50'
            } else if (daysDiff === 0) {
              daysLabel = 'Hari Ini!'
              daysColor = 'text-amber-600 bg-amber-50'
            }

            return (
              <div
                key={goal.id}
                className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all text-slate-800"
              >
                {/* Header Kartu */}
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase w-max ${daysColor}`}>
                      {daysLabel}
                    </span>
                    <h3 className="text-base font-black text-slate-900 mt-1 line-clamp-1">{goal.name}</h3>
                    {goal.description && <p className="text-[11px] text-slate-500 font-medium line-clamp-2 mt-0.5">{goal.description}</p>}
                  </div>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={() => openModal('edit', goal)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => confirmDelete(goal)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Area Bar Progres */}
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex justify-between items-end text-xs font-extrabold">
                    <div className="flex flex-col">
                      <span className="text-slate-400 text-[10px] uppercase tracking-wider">Terkumpul</span>
                      <span className="text-blue-600 text-sm">{formatCurrency(current)}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-slate-400 text-[10px] uppercase tracking-wider">Target</span>
                      <span className="text-slate-700">{formatCurrency(target)}</span>
                    </div>
                  </div>
                  
                  <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden mt-1">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500' : 'bg-blue-600'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-right text-[10px] font-black text-slate-400">{pct.toFixed(0)}%</span>
                </div>

                {/* Footer Aksi */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                  <div className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(goal.targetDate).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                  </div>
                  
                  {!isCompleted && (
                    <button
                      onClick={() => openTopUpModal(goal)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-slate-200 hover:border-blue-200"
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
