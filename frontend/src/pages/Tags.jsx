import { useState, useEffect, useMemo } from 'react'
import { Tag as TagIcon, Plus, Trash2, Search, ArrowDownUp } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import api from '../services/api'

export default function Tags() {
  const { showToast } = useToast()
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [newTagName, setNewTagName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest') // newest, oldest, az, za

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      setLoading(true)
      const res = await api.get('/financeSvc/api/v1/tags')
      if (res.data?.data) {
        setTags(res.data.data)
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
      if (res.data?.data) {
        setTags((prev) => [...prev, res.data.data])
      }
      setNewTagName('')
      showToast('Tag berhasil ditambahkan', 'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menambahkan tag', 'error')
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
      'bg-blue-100 text-blue-700 border-blue-200',
      'bg-emerald-100 text-emerald-700 border-emerald-200',
      'bg-purple-100 text-purple-700 border-purple-200',
      'bg-amber-100 text-amber-700 border-amber-200',
      'bg-rose-100 text-rose-700 border-rose-200'
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
        result.sort((a, b) => b.id - a.id) // Assuming higher ID means newer
        break
      case 'oldest':
        result.sort((a, b) => a.id - b.id)
        break
      default:
        break
    }

    return result
  }, [tags, searchQuery, sortBy])

  return (
    <div className="flex-grow p-4 sm:p-6 lg:p-8 flex flex-col gap-6 w-full max-w-7xl mx-auto animate-fade-in text-slate-800 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
            Tag Transaksi
          </h1>
          <p className="text-xs text-slate-400 mt-1">Atur dan beri label pada transaksi keuangan Anda</p>
        </div>
      </div>

      {/* Add New Tag Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
        <form onSubmit={handleAddTag} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <TagIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Masukkan nama tag (cth. Liburan, Belanjaan)"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-xl py-2.5 pl-10 pr-4 text-slate-800 text-sm outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={!newTagName.trim()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Tag</span>
          </button>
        </form>
      </div>

      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-sm focus:border-blue-500 outline-none"
          />
        </div>
        <div className="relative">
          <ArrowDownUp className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none border border-slate-200 rounded-xl py-2 pl-9 pr-8 text-sm focus:border-blue-500 outline-none bg-white cursor-pointer min-w-[160px]"
          >
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
            <option value="az">A - Z</option>
            <option value="za">Z - A</option>
          </select>
        </div>
      </div>

      {/* Tags Grid */}
      {loading ? (
        <div className="text-center py-10 text-sm font-semibold text-slate-400">Memuat tag...</div>
      ) : filteredAndSortedTags.length === 0 ? (
        <div className="text-center py-10 text-sm font-semibold text-slate-400">
          Belum ada tag yang ditambahkan atau ditemukan.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAndSortedTags.map((tag) => (
            <div
              key={tag.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center justify-between shadow-xs hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-2.5">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getColorForTag(tag.name)}`}>
                  #{tag.name}
                </span>
              </div>

              <button
                onClick={() => handleDeleteTag(tag.id)}
                className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                title="Hapus Tag"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
