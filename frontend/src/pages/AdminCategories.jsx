import { useState, useMemo } from 'react'
import { 
  ShieldAlert, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  Layers,
  Info
} from 'lucide-react'
import Modal from '../components/Modal'
import { useToast } from '../contexts/ToastContext'

export default function AdminCategories() {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState('ALL') // 'ALL', 'EXPENSE', 'INCOME'
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState('TERBARU') // 'TERBARU', 'TERLAMA', 'A-Z', 'Z-A'

  // State Modal Tambah / Edit Kategori Master
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add') // 'add' | 'edit'
  const [selectedCategory, setSelectedCategory] = useState(null)

  // State Form Modal
  const [formData, setFormData] = useState({
    name: '',
    type: 'EXPENSE',
    description: '',
    color: '#3B82F6',
    isActive: true
  })

  // State Modal Hapus
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState(null)

  // Data Master Kategori Sistem Standar CuanFlow
  const [categories, setCategories] = useState([
    {
      id: 1,
      name: 'Makanan & Minuman',
      type: 'EXPENSE',
      description: 'Kebutuhan makan harian, belanja bahan pangan, restoran, kafe',
      color: '#EF4444',
      userCount: 20,
      isActive: true,
      isSystemDefault: true
    },
    {
      id: 2,
      name: 'Transportasi',
      type: 'EXPENSE',
      description: 'Bahan bakar, transportasi umum, ojek online, parkir, tol',
      color: '#F97316',
      userCount: 19,
      isActive: true,
      isSystemDefault: true
    },
    {
      id: 3,
      name: 'Gaji Pokok',
      type: 'INCOME',
      description: 'Penghasilan upah kerja bulanan, payroll perusahaan',
      color: '#10B981',
      userCount: 20,
      isActive: true,
      isSystemDefault: true
    },
    {
      id: 4,
      name: 'Tagihan & Utilitas',
      type: 'EXPENSE',
      description: 'Listrik PLN, air PDAM, internet Wi-Fi, pulsa, IPL kost/rumah',
      color: '#8B5CF6',
      userCount: 18,
      isActive: true,
      isSystemDefault: true
    },
    {
      id: 5,
      name: 'Bonus & Tunjangan',
      type: 'INCOME',
      description: 'THR, bonus performa kerja, insentif lembur, komisi penjualan',
      color: '#06B6D4',
      userCount: 16,
      isActive: true,
      isSystemDefault: true
    },
    {
      id: 6,
      name: 'Hiburan & Liburan',
      type: 'EXPENSE',
      description: 'Bioskop, langganan streaming (Netflix, Spotify), tiket wisata, hobi',
      color: '#EC4899',
      userCount: 15,
      isActive: true,
      isSystemDefault: true
    },
    {
      id: 7,
      name: 'Investasi & Bunga',
      type: 'INCOME',
      description: 'Dividen saham, imbal hasil reksadana, bunga deposito, capital gain',
      color: '#3B82F6',
      userCount: 14,
      isActive: true,
      isSystemDefault: true
    },
    {
      id: 8,
      name: 'Pendidikan & Kursus',
      type: 'EXPENSE',
      description: 'Buku, biaya kuliah/sekolah, bootcamp, sertifikasi kompetensi',
      color: '#6366F1',
      userCount: 12,
      isActive: true,
      isSystemDefault: true
    },
    {
      id: 9,
      name: 'Kesehatan & Medis',
      type: 'EXPENSE',
      description: 'Obat-obatan, konsultasi dokter, vitamin, asuransi kesehatan',
      color: '#14B8A6',
      userCount: 15,
      isActive: true,
      isSystemDefault: true
    }
  ])

  // Filter & Pengurutan Kategori
  const filteredCategories = useMemo(() => {
    const list = categories.filter(c => {
      const matchTab = activeTab === 'ALL' || c.type === activeTab
      const matchSearch = 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase())
      return matchTab && matchSearch
    })

    list.sort((a, b) => {
      if (sortOrder === 'TERBARU') return (b.id || 0) - (a.id || 0)
      if (sortOrder === 'TERLAMA') return (a.id || 0) - (b.id || 0)
      if (sortOrder === 'A-Z') return a.name.localeCompare(b.name, 'id', { sensitivity: 'base' })
      if (sortOrder === 'Z-A') return b.name.localeCompare(a.name, 'id', { sensitivity: 'base' })
      return 0
    })

    return list
  }, [categories, activeTab, searchTerm, sortOrder])

  const openAddModal = () => {
    setModalMode('add')
    setFormData({
      name: '',
      type: 'EXPENSE',
      description: '',
      color: '#3B82F6',
      isActive: true
    })
    setIsModalOpen(true)
  }

  const openEditModal = (cat) => {
    setModalMode('edit')
    setSelectedCategory(cat)
    setFormData({
      name: cat.name,
      type: cat.type,
      description: cat.description,
      color: cat.color,
      isActive: cat.isActive
    })
    setIsModalOpen(true)
  }

  const handleSaveCategory = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      showToast('Nama kategori wajib diisi', 'error')
      return
    }

    if (modalMode === 'add') {
      const newCat = {
        id: Date.now(),
        name: formData.name,
        type: formData.type,
        description: formData.description,
        color: formData.color,
        userCount: 0,
        isActive: formData.isActive,
        isSystemDefault: true
      }
      setCategories(prev => [newCat, ...prev])
      showToast('Master kategori sistem berhasil ditambahkan', 'success')
    } else {
      setCategories(prev => prev.map(c => 
        c.id === selectedCategory.id ? { ...c, ...formData } : c
      ))
      showToast('Master kategori sistem berhasil diperbarui', 'success')
    }
    setIsModalOpen(false)
  }

  const toggleCategoryStatus = (cat) => {
    const nextStatus = !cat.isActive
    setCategories(prev => prev.map(c => 
      c.id === cat.id ? { ...c, isActive: nextStatus } : c
    ))
    showToast(`Status kategori "${cat.name}" diubah menjadi ${nextStatus ? 'Aktif' : 'Nonaktif'}`, 'info')
  }

  const confirmDelete = (cat) => {
    setCategoryToDelete(cat)
    setIsDeleteOpen(true)
  }

  const executeDelete = () => {
    if (!categoryToDelete) return
    setCategories(prev => prev.filter(c => c.id !== categoryToDelete.id))
    setIsDeleteOpen(false)
    showToast(`Master kategori "${categoryToDelete.name}" berhasil dihapus`, 'success')
  }

  return (
    <div className="flex-grow p-4 sm:p-6 lg:p-8 flex flex-col gap-6 w-full max-w-7xl mx-auto animate-fade-in text-slate-800 font-sans">
      
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
              Master Kategori Sistem
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
              Template Global
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pengelolaan template kategori bawaan sistem yang otomatis disediakan bagi seluruh pengguna baru CuanFlow
          </p>
        </div>

        {/* Tombol Tambah Master Kategori */}
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Template Kategori</span>
        </button>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-start gap-3 shadow-2xs">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="flex flex-col text-xs text-blue-900">
          <span className="font-extrabold">Informasi Standar Akuntansi:</span>
          <p className="text-blue-700/90 mt-0.5">
            Setiap kategori sistem yang berstatus <strong>Aktif</strong> akan otomatis menjadi pilihan kategori dasar (*Chart of Accounts*) di akun setiap pengguna baru, sehingga pencatatan arus kas pribadi menjadi terstandarisasi.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Bar Pencarian */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Tabs Jenis Kategori */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('EXPENSE')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'EXPENSE'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-rose-600'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Pengeluaran</span>
          </button>
          <button
            onClick={() => setActiveTab('INCOME')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'INCOME'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-emerald-600'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Pemasukan</span>
          </button>
        </div>

        {/* Filter Sortir & Input Pencarian */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
          {/* Dropdown Sortir */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full sm:w-auto bg-white border border-slate-200 focus:border-blue-600 rounded-xl py-2 px-3 text-slate-800 text-xs font-bold outline-none cursor-pointer transition-all shadow-2xs hover:bg-slate-50"
            >
              <option value="TERBARU">🕒 Terbaru</option>
              <option value="TERLAMA">⏳ Terlama</option>
              <option value="A-Z">🔤 Nama (A - Z)</option>
              <option value="Z-A">🔡 Nama (Z - A)</option>
            </select>
          </div>

          {/* Input Pencarian */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama atau keterangan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </div>

      {/* Grid Kartu Kategori */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((cat) => (
          <div
            key={cat.id}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 flex flex-col justify-between gap-4 shadow-2xs hover:shadow-md transition-all group"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span 
                    className="w-4 h-4 rounded-full shrink-0 shadow-xs" 
                    style={{ backgroundColor: cat.color }}
                  />
                  <h3 className="text-sm font-black text-slate-900 font-heading">
                    {cat.name}
                  </h3>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  cat.type === 'INCOME' 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                    : 'bg-rose-50 text-rose-600 border border-rose-200'
                }`}>
                  {cat.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
                </span>
              </div>

              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mt-1">
                {cat.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              {/* Status Toggle Button */}
              <button
                onClick={() => toggleCategoryStatus(cat)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold border transition-all cursor-pointer ${
                  cat.isActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                }`}
                title="Klik untuk mengubah status aktif/nonaktif"
              >
                {cat.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                <span>{cat.isActive ? 'Template Aktif' : 'Nonaktif'}</span>
              </button>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(cat)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                  title="Edit Template"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => confirmDelete(cat)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Hapus Kategori"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Tambah / Edit Kategori */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={modalMode === 'add' ? 'Tambah Template Master Kategori' : 'Edit Template Kategori Sistem'}
        >
          <form onSubmit={handleSaveCategory} className="flex flex-col gap-4 text-xs">
            <div className="flex flex-col gap-1.5">
              <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                Nama Kategori <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Belanja Bulanan"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                  Tipe Aliran Arus Kas
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="EXPENSE">Pengeluaran (Kas Keluar)</option>
                  <option value="INCOME">Pemasukan (Kas Masuk)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                  Warna Label Badge
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-10 h-9 rounded-xl border border-slate-200 cursor-pointer p-0.5"
                  />
                  <span className="font-mono text-xs font-bold text-slate-600">{formData.color}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                Deskripsi & Cakupan Transaksi
              </label>
              <textarea
                rows="3"
                placeholder="Penjelasan jenis pengeluaran/pemasukan yang termasuk dalam kategori ini..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
              />
            </div>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <input
                type="checkbox"
                id="catIsActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 cursor-pointer"
              />
              <label htmlFor="catIsActive" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                Aktifkan sebagai template bawaan bagi user baru
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-md shadow-blue-600/20 cursor-pointer"
              >
                Simpan Master Kategori
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Hapus Kategori */}
      {isDeleteOpen && categoryToDelete && (
        <Modal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          title="Konfirmasi Hapus Master Kategori"
        >
          <div className="flex flex-col gap-4 text-xs">
            <p className="text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus template master kategori <strong>"{categoryToDelete.name}"</strong>?
            </p>
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] leading-relaxed">
              ⚠️ Kategori ini tidak akan lagi muncul sebagai template bagi pengguna baru di masa mendatang.
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={executeDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Hapus Kategori
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  )
}
