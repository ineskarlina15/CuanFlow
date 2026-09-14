import { useState, useEffect, useMemo } from 'react'
import { 
  Tag as TagIcon, Plus, Trash2, Search, ArrowDownUp, Edit2, Loader2,
  ChevronLeft, ChevronRight, RotateCcw, Hash, Layers
} from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import Modal from '../components/Modal'
import { capitalizeWords } from '../utils/formatters'
import api from '../services/api'

export default function Tags() {
  const { showToast } = useToast()
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [newTagName, setNewTagName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest') // newest, oldest, az, za
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)

  // State Modal Edit Tag
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [tagToEdit, setTagToEdit] = useState(null)
  const [editTagName, setEditTagName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchTags()
  }, [])

  // Reset pagination ke halaman 1 saat pencarian, filter, atau jumlah per hal berganti
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, sortBy, itemsPerPage])

  const fetchTags = async () => {
    try {
      setLoading(true)
      const res = await api.get('/financeSvc/api/v1/tags')
      if (res?.data) {
        setTags(res.data)
      } else {
        setTags([])
      }
    } catch (err) {
      showToast('Gagal memuat tag', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTag = async (e) => {
    e.preventDefault()
    const trimmedName = newTagName.trim()
    if (!trimmedName) {
      showToast('Nama tag wajib diisi', 'error')
      return
    }
    if (trimmedName.length < 3 || trimmedName.length > 30) {
      showToast('Nama tag harus antara 3 hingga 30 karakter', 'error')
      return
    }

    try {
      const res = await api.post('/financeSvc/api/v1/tags', { name: newTagName.trim() })
      if (res?.data) {
        setTags((prev) => [...prev, res.data])
      }
      setNewTagName('')
      showToast('Tag berhasil ditambahkan', 'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menambahkan tag', 'error')
    }
  }

  const handleOpenEdit = (tag) => {
    setTagToEdit(tag)
    setEditTagName(tag.name)
    setIsEditOpen(true)
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    const trimmed = editTagName.trim()
    if (!trimmed) {
      showToast('Nama tag wajib diisi', 'error')
      return
    }
    if (trimmed.length < 3 || trimmed.length > 30) {
      showToast('Nama tag harus antara 3 hingga 30 karakter', 'error')
      return
    }
    setSaving(true)
    try {
      const res = await api.put(`/financeSvc/api/v1/tags/${tagToEdit.id}`, { name: trimmed })
      if (res?.data) {
        setTags((prev) => prev.map((t) => (t.id === tagToEdit.id ? res.data : t)))
      }
      setIsEditOpen(false)
      showToast('Tag berhasil diperbarui', 'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal memperbarui tag', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTag = async (id) => {
    try {
      await api.delete(`/financeSvc/api/v1/tags/${id}`)
      setTags(tags.filter((t) => t.id !== id))
      showToast('Tag berhasil dihapus', 'info')
    } catch (err) {
      showToast('Gagal menghapus tag', 'error')
    }
  }

  // Tentukan warna stabil untuk konsistensi antarmuka berdasarkan ID atau panjang nama
  const getColorForTag = (name) => {
    const colors = [
      'bg-blue-50 text-blue-700 border-blue-200/80',
      'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      'bg-purple-50 text-purple-700 border-purple-200/80',
      'bg-amber-50 text-amber-700 border-amber-200/80',
      'bg-rose-50 text-rose-700 border-rose-200/80'
    ]
    return colors[name.length % colors.length]
  }

  const filteredAndSortedTags = useMemo(() => {
    let result = [...tags]

    // Pencarian
    if (searchQuery.trim()) {
      result = result.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // Sort
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
  }, [tags, searchQuery, sortBy])

  // Kalkulasi Pagination
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedTags.length / itemsPerPage))
  const paginatedTags = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredAndSortedTags.slice(start, start + itemsPerPage)
  }, [filteredAndSortedTags, currentPage, itemsPerPage])

  const handleResetFilters = () => {
    setSearchQuery('')
    setSortBy('newest')
  }

  const hasActiveFilters = searchQuery.trim() !== '' || sortBy !== 'newest'

  return (
    <div className="flex-grow p-4 sm:p-6 lg:p-8 flex flex-col gap-6 w-full max-w-7xl mx-auto animate-fade-in text-slate-800 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
            Tag Transaksi
          </h1>
          <p className="text-xs text-slate-400 mt-1">Atur dan beri label pada transaksi keuangan Anda untuk memudahkan analisis</p>
        </div>

        {tags.length > 0 && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 shadow-2xs self-start sm:self-auto">
            <Hash className="w-3.5 h-3.5 text-blue-600" />
            <span>Total Tag: <strong className="text-slate-900">{tags.length}</strong></span>
          </div>
        )}
      </div>

      {/* Add New Tag Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
        <form onSubmit={handleAddTag} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <TagIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Masukkan nama tag baru (cth. Liburan, Belanjaan, Proyek)"
              value={newTagName}
              onChange={(e) => setNewTagName(capitalizeWords(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-xl py-2.5 pl-10 pr-4 text-slate-800 text-sm font-medium outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={!newTagName.trim()}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-blue-600/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Tag</span>
          </button>
        </form>
      </div>

      {/* Search and Sort Controls */}
      {tags.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-slate-200 rounded-xl py-2 pl-9.5 pr-4 text-xs text-slate-800 font-medium focus:border-blue-600 outline-none bg-slate-50 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Sort */}
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

            {/* Per Page */}
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
                <option value={24}>24</option>
              </select>
            </div>

            {/* Reset */}
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

      {/* Tags Grid */}
      {loading ? (
        <div className="text-center py-16 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
          <span className="text-xs font-semibold">Memuat tag...</span>
        </div>
      ) : filteredAndSortedTags.length === 0 ? (
        <div className="text-center py-16 text-sm font-semibold text-slate-400 border border-slate-200 rounded-2xl bg-white shadow-xs">
          {hasActiveFilters ? 'Tidak ada tag yang cocok dengan pencarian.' : 'Belum ada tag yang ditambahkan.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {paginatedTags.map((tag) => (
            <div
              key={tag.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center justify-between shadow-xs hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-2.5">
                <span className={`px-3 py-1 rounded-full text-xs font-black border ${getColorForTag(tag.name)}`}>
                  #{tag.name}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(tag)}
                  className="text-slate-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                  title="Edit Nama Tag"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteTag(tag.id)}
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Hapus Tag"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls (Sebelumnya / Prev & Selanjutnya / Next) */}
      {!loading && filteredAndSortedTags.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">
            Menampilkan <span className="font-bold text-slate-900">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredAndSortedTags.length)}</span> - <span className="font-bold text-slate-900">{Math.min(currentPage * itemsPerPage, filteredAndSortedTags.length)}</span> dari <span className="font-bold text-slate-900">{filteredAndSortedTags.length}</span> tag
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

      {/* Modal Edit Tag (Sesuai Ketentuan 5 CRUD S1) */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Tag Transaksi"
      >
        <form onSubmit={handleSaveEdit} className="flex flex-col gap-4 text-slate-800">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Nama Tag</label>
            <input
              type="text"
              value={editTagName}
              onChange={(e) => setEditTagName(capitalizeWords(e.target.value))}
              placeholder="Masukkan nama tag baru..."
              className="bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-xl p-3 text-sm outline-none font-semibold transition-all"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Simpan Perubahan</span>}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
