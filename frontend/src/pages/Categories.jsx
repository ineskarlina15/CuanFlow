import { useEffect, useState } from 'react'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'
import Modal from '../components/Modal'
import { ShieldAlert, Plus, Edit2, Trash2, Tag, Loader2 } from 'lucide-react'

export default function Categories() {
  const { showToast } = useToast()

  const defaultCategories = [
    { id: 1, name: 'Salary', type: 'INCOME' },
    { id: 2, name: 'Food & Beverage', type: 'EXPENSE' },
    { id: 3, name: 'Transport', type: 'EXPENSE' },
    { id: 4, name: 'Shopping', type: 'EXPENSE' },
    { id: 5, name: 'Bills & Utilities', type: 'EXPENSE' },
    { id: 6, name: 'Investment', type: 'INCOME' },
    { id: 7, name: 'Others', type: 'EXPENSE' }
  ]

  const [categories, setCategories] = useState(defaultCategories)
  const [loading, setLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState('add')
  const [selectedCat, setSelectedCat] = useState(null)
  const [formData, setFormData] = useState({ name: '', type: 'EXPENSE' })
  const [saving, setSaving] = useState(false)

  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [catToDelete, setCatToDelete] = useState(null)

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const res = await api.get('/financeSvc/api/v1/categories')
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setCategories(res.data)
      } else {
        setCategories(defaultCategories)
      }
    } catch {
      setCategories(defaultCategories)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const openModal = (type, cat = null) => {
    setModalType(type)
    setSelectedCat(cat)
    if (type === 'edit' && cat) {
      setFormData({ name: cat.name, type: cat.type || 'EXPENSE' })
    } else {
      setFormData({ name: '', type: 'EXPENSE' })
    }
    setIsModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return
    setSaving(true)
    const payload = {
      name: formData.name.trim(),
      type: formData.type || 'EXPENSE',
      description: formData.description ? formData.description.trim() : formData.name.trim(),
      icon: formData.icon || 'tag'
    }
    try {
      if (modalType === 'add') {
        await api.post('/financeSvc/api/v1/categories', payload)
        showToast('Kategori berhasil dibuat', 'success')
      } else {
        await api.put(`/financeSvc/api/v1/categories/${selectedCat.id}`, payload)
        showToast('Kategori berhasil diperbarui', 'success')
      }
      setIsModalOpen(false)
      fetchCategories()
    } catch (err) {
      showToast(err.message || 'Aksi gagal', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!catToDelete) return
    try {
      await api.delete(`/financeSvc/api/v1/categories/${catToDelete.id}`)
      showToast('Kategori dihapus', 'info')
      setIsDeleteOpen(false)
      fetchCategories()
    } catch (err) {
      showToast(err.message || 'Gagal menghapus', 'error')
    }
  }

  return (
    <div className="flex-grow p-4 sm:p-6 lg:p-8 flex flex-col gap-6 w-full max-w-7xl mx-auto animate-fade-in text-slate-800 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
            Manajemen Kategori
          </h1>
          <p className="text-xs text-slate-400 mt-1">Konfigurasi kategori pemasukan dan pengeluaran</p>
        </div>

        <button
          onClick={() => openModal('add')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md shadow-blue-600/20 active:scale-[0.98] cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kategori</span>
        </button>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px] text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-2" />
          <span>Memuat kategori...</span>
        </div>
      ) : categories.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-sm border border-slate-200 rounded-2xl bg-white">
          Belum ada kategori yang dibuat.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between shadow-xs hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
                  <Tag className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900 text-base">{cat.name}</span>
                  <span className="text-xs text-slate-400 font-semibold capitalize">{cat.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openModal('edit', cat)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                  title="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => { setCatToDelete(cat); setIsDeleteOpen(true); }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Hapus"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalType === 'add' ? 'Kategori Baru' : 'Edit Kategori'}
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4 text-slate-800">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Nama Kategori</label>
            <input
              type="text"
              required
              placeholder="cth. Listrik, Gaji, Belanjaan"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-xl py-3 px-4 text-slate-800 outline-none text-sm font-medium transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Tipe</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
              className="bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-xl py-3 px-3.5 text-slate-800 outline-none text-sm font-medium cursor-pointer transition-all"
            >
              <option value="EXPENSE">Pengeluaran</option>
              <option value="INCOME">Pemasukan</option>
            </select>
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
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>Simpan Kategori</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Konfirmasi Hapus"
      >
        <div className="flex flex-col gap-4 text-center">
          <p className="text-sm text-slate-600">
            Apakah Anda yakin ingin menghapus kategori <span className="font-bold text-slate-900">{catToDelete?.name}</span>?
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsDeleteOpen(false)}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-100 cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold cursor-pointer"
            >
              Hapus
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
