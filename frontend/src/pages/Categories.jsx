import { useEffect, useState, useMemo } from 'react'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'
import Modal from '../components/Modal'
import { capitalizeWords } from '../utils/formatters'
import { 
  ShieldAlert, Plus, Edit2, Trash2, Tag, Loader2, Search, ArrowDownUp,
  ChevronLeft, ChevronRight, Filter, RotateCcw, Layers, ArrowDownCircle, ArrowUpCircle
} from 'lucide-react'

export default function Categories() {
  const { showToast } = useToast()

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL') // ALL, EXPENSE, INCOME
  const [sortBy, setSortBy] = useState('newest') // newest, oldest, az, za
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(8)

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
        setCategories([])
      }
    } catch {
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // Reset pagination ke halaman 1 saat pencarian, filter, atau jumlah per hal berganti
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, typeFilter, sortBy, itemsPerPage])

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
    if (!formData.name.trim()) {
      showToast('Nama kategori wajib diisi', 'error')
      return
    }
    if (formData.name.trim().length < 3 || formData.name.trim().length > 30) {
      showToast('Nama kategori harus antara 3 hingga 30 karakter', 'error')
      return
    }
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

  // Ringkasan Kategori
  const summaryStats = useMemo(() => {
    const expenseCount = categories.filter(c => String(c.type || '').toUpperCase() === 'EXPENSE').length
    const incomeCount = categories.filter(c => String(c.type || '').toUpperCase() === 'INCOME').length
    return {
      total: categories.length,
      expense: expenseCount,
      income: incomeCount
    }
  }, [categories])

  const filteredAndSortedCategories = useMemo(() => {
    let result = [...categories]

    // Filter Tipe Kategori
    if (typeFilter !== 'ALL') {
      result = result.filter(c => String(c.type || '').toUpperCase() === typeFilter)
    }

    // Pencarian Nama
    if (searchQuery.trim()) {
      result = result.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // Pengurutan
    switch (sortBy) {
      case 'az':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'za':
        result.sort((a, b) => b.name.localeCompare(a.name))
        break
      case 'newest':
        result.sort((a, b) => b.id - a.id)
        break
      case 'oldest':
        result.sort((a, b) => a.id - b.id)
        break
      default:
        break
    }

    return result
  }, [categories, searchQuery, typeFilter, sortBy])

  // Kalkulasi Pagination
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedCategories.length / itemsPerPage))
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredAndSortedCategories.slice(start, start + itemsPerPage)
  }, [filteredAndSortedCategories, currentPage, itemsPerPage])

  const handleResetFilters = () => {
    setSearchQuery('')
    setTypeFilter('ALL')
    setSortBy('newest')
  }

  const hasActiveFilters = searchQuery.trim() !== '' || typeFilter !== 'ALL' || sortBy !== 'newest'

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

      {/* Ringkasan Metrik Kategori */}
      {categories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-xs flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-400">Total Kategori</span>
              <span className="text-xl font-black text-slate-900 mt-1">
                {summaryStats.total}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 font-medium">Kategori terdaftar</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-xs flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-400">Kategori Pengeluaran</span>
              <span className="text-xl font-black text-rose-600 mt-1">
                {summaryStats.expense}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 font-medium">Batas belanja & biaya</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <ArrowDownCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-xs flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-400">Kategori Pemasukan</span>
              <span className="text-xl font-black text-emerald-600 mt-1">
                {summaryStats.income}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 font-medium">Sumber dana & penerimaan</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ArrowUpCircle className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Kontrol Pencarian, Filter Tipe, dan Pengurutan */}
      {categories.length > 0 && (
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
          {/* Pencarian */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-slate-200 rounded-xl py-2 pl-9.5 pr-4 text-xs text-slate-800 font-medium focus:border-blue-600 outline-none bg-slate-50 transition-all"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter Tipe */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value="ALL">Semua Tipe</option>
                <option value="EXPENSE">🔴 Pengeluaran</option>
                <option value="INCOME">🟢 Pemasukan</option>
              </select>
            </div>

            {/* Pengurutan */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <ArrowDownUp className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
                <option value="az">Nama: A - Z</option>
                <option value="za">Nama: Z - A</option>
              </select>
            </div>

            {/* Pilihan Data per Halaman */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-600 font-medium">
              <span>Per Hal:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
              >
                <option value={8}>8</option>
                <option value={12}>12</option>
                <option value={16}>16</option>
                <option value={20}>20</option>
              </select>
            </div>

            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                title="Reset filter"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Categories Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px] text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-2" />
          <span>Memuat kategori...</span>
        </div>
      ) : filteredAndSortedCategories.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-sm border border-slate-200 rounded-2xl bg-white shadow-xs">
          {hasActiveFilters ? 'Tidak ada kategori yang cocok dengan kriteria pencarian.' : 'Belum ada kategori yang dibuat.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {paginatedCategories.map((cat) => (
            <div
              key={cat.id}
              className="p-5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between shadow-xs hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border ${
                  cat.type === 'INCOME' 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                    : 'bg-rose-50 border-rose-200 text-rose-600'
                }`}>
                  <Tag className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900 text-base line-clamp-1">{cat.name}</span>
                  <span className={`text-xs font-semibold capitalize ${
                    cat.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-400'
                  }`}>
                    {cat.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openModal('edit', cat)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                  title="Edit Kategori"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => { setCatToDelete(cat); setIsDeleteOpen(true); }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Hapus Kategori"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls (Sebelumnya / Prev & Selanjutnya / Next) */}
      {!loading && filteredAndSortedCategories.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">
            Menampilkan <span className="font-bold text-slate-900">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredAndSortedCategories.length)}</span> - <span className="font-bold text-slate-900">{Math.min(currentPage * itemsPerPage, filteredAndSortedCategories.length)}</span> dari <span className="font-bold text-slate-900">{filteredAndSortedCategories.length}</span> kategori
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
              onChange={(e) => setFormData((prev) => ({ ...prev, name: capitalizeWords(e.target.value) }))}
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
