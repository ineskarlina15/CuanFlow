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
  Search, Plus, Filter, ChevronLeft, ChevronRight, Edit2, Trash2, 
  Paperclip, Calendar, DollarSign, Wallet, FileText, Loader2, Tag, Eye, Info
} from 'lucide-react'

export default function Transactions() {
  const { showToast } = useToast()

  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [availableTags, setAvailableTags] = useState([])
  const [loading, setLoading] = useState(true)

  // State Filter & Halaman (Pagination)
  const [keyword, setKeyword] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [sortBy, setSortBy] = useState('transactionDate')
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  // CRUD Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState('add')
  const [selectedTx, setSelectedTx] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    type: 'EXPENSE',
    amount: '',
    categoryId: '',
    transactionDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'CASH',
    description: '',
    tagIds: []
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)

  // State Modal Detail Data
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [detailTx, setDetailTx] = useState(null)

  // State Modal Konfirmasi Hapus
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [txToDelete, setTxToDelete] = useState(null)

  // State Modal Preview Lampiran
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')

  const openDetail = (tx) => {
    setDetailTx(tx)
    setIsDetailOpen(true)
  }

  // Ambil Kategori & Transaksi
  const fetchCategories = async () => {
    try {
      const res = await api.get('/financeSvc/api/v1/categories')
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setCategories(res.data)
      } else {
        setCategories([])
      }
    } catch {
      setCategories([])
    }
  }

  const fetchTags = async () => {
    try {
      const res = await api.get('/financeSvc/api/v1/tags')
      if (res?.data && Array.isArray(res.data)) {
        setAvailableTags(res.data)
      } else {
        setAvailableTags([])
      }
    } catch {
      setAvailableTags([])
    }
  }

  const fetchTransactions = async (overrideParams = {}) => {
    setLoading(true)
    try {
      const activeKeyword = overrideParams.keyword !== undefined ? overrideParams.keyword : keyword
      const activeCategoryId = overrideParams.categoryId !== undefined ? overrideParams.categoryId : categoryId
      const activeType = overrideParams.type !== undefined ? overrideParams.type : typeFilter
      const activeStartDate = overrideParams.startDate !== undefined ? overrideParams.startDate : startDate
      const activeEndDate = overrideParams.endDate !== undefined ? overrideParams.endDate : endDate
      const activePage = overrideParams.page !== undefined ? overrideParams.page : page
      const activeSize = overrideParams.size !== undefined ? overrideParams.size : size

      let url = `/financeSvc/api/v1/transactions?page=${activePage}&size=${activeSize}&sortBy=${sortBy}`
      if (activeKeyword) url += `&keyword=${encodeURIComponent(activeKeyword)}`
      if (activeCategoryId) url += `&categoryId=${activeCategoryId}`
      if (activeType) url += `&type=${activeType}`
      if (activeStartDate) url += `&startDate=${activeStartDate}`
      if (activeEndDate) url += `&endDate=${activeEndDate}`

      const res = await api.get(url)
      if (res?.data) {
        let list = [...(res.data.content || [])]
        if (sortBy === 'transactionDate_desc') {
          list.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate))
        } else if (sortBy === 'transactionDate_asc') {
          list.sort((a, b) => new Date(a.transactionDate) - new Date(b.transactionDate))
        } else if (sortBy === 'title_asc') {
          list.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
        } else if (sortBy === 'title_desc') {
          list.sort((a, b) => (b.title || '').localeCompare(a.title || ''))
        }
        setTransactions(list)
        setTotalPages(res.data.totalPages || 0)
        setTotalElements(res.data.totalElements || 0)
      }
    } catch (err) {
      showToast(err.message || 'Gagal memuat transaksi', 'error')
    } finally {
      setLoading(false)
    }
  }

  const [, setCurrencyTick] = useState(0)

  useEffect(() => {
    fetchCategories()
    fetchTags()

    const handleSettingsUpdate = () => setCurrencyTick((prev) => prev + 1)
    window.addEventListener('cuanflow_settings_updated', handleSettingsUpdate)
    return () => window.removeEventListener('cuanflow_settings_updated', handleSettingsUpdate)
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [page, size, categoryId, typeFilter, startDate, endDate, sortBy])

  const handleApplyFilter = () => {
    setPage(0)
    fetchTransactions({ page: 0 })
    showToast('Filter Diterapkan', 'info')
  }

  const handleResetFilter = () => {
    setKeyword('')
    setCategoryId('')
    setTypeFilter('')
    setStartDate('')
    setEndDate('')
    setPage(0)
    fetchTransactions({ keyword: '', categoryId: '', type: '', startDate: '', endDate: '', page: 0 })
    showToast('Filter Direset', 'info')
  }

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      handleApplyFilter()
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)
  }

  // Buka Modal Tambah/Edit
  const openModal = (type, tx = null) => {
    if (categories.length === 0 && type === 'add') {
      showToast('Anda harus membuat kategori terlebih dahulu sebelum menambah transaksi.', 'error')
      return
    }
    setModalType(type)
    setSelectedFile(null)
    setFormErrors({})
    if (type === 'edit' && tx) {
      setSelectedTx(tx)
      setFormData({
        title: tx.title || '',
        type: tx.type || 'EXPENSE',
        amount: tx.amount || '',
        categoryId: tx.categoryId ? String(tx.categoryId) : (categories[0]?.id ? String(categories[0].id) : ''),
        transactionDate: tx.transactionDate || '',
        paymentMethod: tx.paymentMethod || 'CASH',
        description: tx.description || '',
        tagIds: tx.tags ? tx.tags.map(t => t.id) : []
      })
    } else {
      setSelectedTx(null)
      const initialType = 'EXPENSE'
      const matchingCats = categories.filter(c => !c.type || c.type === initialType)
      const defaultCatId = matchingCats.length > 0 ? String(matchingCats[0].id) : (categories[0]?.id ? String(categories[0].id) : '')
      setFormData({
        title: '',
        type: initialType,
        amount: '',
        categoryId: defaultCatId,
        transactionDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'CASH',
        description: '',
        tagIds: []
      })
    }
    setIsModalOpen(true)
  }

  const handleTypeChange = (newType) => {
    const matchingCats = categories.filter(c => !c.type || c.type === newType)
    const nextCatId = matchingCats.length > 0 ? String(matchingCats[0].id) : (categories[0]?.id ? String(categories[0].id) : '')
    setFormData(prev => ({ ...prev, type: newType, categoryId: nextCatId }))
  }

  const validateForm = async () => {
    const errors = {}
    if (!formData.title) errors.title = 'Judul wajib diisi'
    
    if (!formData.amount) {
      errors.amount = 'Nominal wajib diisi'
    } else if (Number(formData.amount) < 1000) {
      errors.amount = 'Nominal minimal Rp 1.000'
    } else if (Number(formData.amount) > 1000000000) {
      errors.amount = 'Nominal maksimal Rp 1.000.000.000 (1 Miliar)'
    }

    if (!formData.categoryId) errors.categoryId = 'Kategori wajib dipilih'
    if (!formData.transactionDate) errors.transactionDate = 'Tanggal wajib diisi'
    
    if (formData.description && formData.description.length > 100) {
      errors.description = 'Deskripsi maksimal 100 karakter'
    }
    
    // Validasi Anggaran untuk pengeluaran (expense)
    if (formData.type === 'EXPENSE' && formData.categoryId && formData.transactionDate) {
      try {
        const d = new Date(formData.transactionDate)
        const month = d.getMonth() + 1
        const year = d.getFullYear()
        const bRes = await api.get(`/financeSvc/api/v1/budgets?month=${month}&year=${year}`)
        const budgets = bRes.data || []
        const hasBudget = budgets.some(b => String(b.budget?.category?.id) === String(formData.categoryId))
        if (!hasBudget) {
          errors.categoryId = 'Anggaran untuk kategori ini belum ada di bulan/tahun tersebut'
          showToast('Anggaran untuk kategori ini belum ada. Silakan buat anggaran terlebih dahulu.', 'error')
        }
      } catch (err) {
        // Anggap berhasil jika endpoint gagal atau hanya tampilkan peringatan
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const isValid = await validateForm()
    if (!isValid) return

    setSaving(true)
    try {
      const payload = {
        title: formData.title,
        type: formData.type,
        amount: Number(formData.amount),
        categoryId: Number(formData.categoryId),
        transactionDate: formData.transactionDate,
        paymentMethod: formData.paymentMethod,
        description: formData.description,
        tagIds: formData.tagIds
      }

      const multipart = new FormData()
      multipart.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }))
      if (selectedFile) {
        multipart.append('file', selectedFile)
      }

      if (modalType === 'add') {
        await api.post('/financeSvc/api/v1/transactions', multipart, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        showToast('Transaksi berhasil ditambahkan!', 'success')
      } else {
        await api.put(`/financeSvc/api/v1/transactions/${selectedTx.id}`, multipart, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        showToast('Transaksi berhasil diperbarui!', 'success')
      }

      setIsModalOpen(false)
      fetchTransactions()
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan transaksi', 'error')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = (tx) => {
    setTxToDelete(tx)
    setIsDeleteOpen(true)
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/financeSvc/api/v1/transactions/${txToDelete.id}`)
      showToast('Transaksi berhasil dihapus!', 'success')
      setIsDeleteOpen(false)
      fetchTransactions()
    } catch (err) {
      showToast(err.message || 'Gagal menghapus transaksi', 'error')
    }
  }

  const handleDownloadAttachment = async (txId) => {
    try {
      const res = await api.get(`/financeSvc/api/v1/transactions/${txId}/attachments`)
      if (res?.data && res.data.length > 0) {
        const attachment = res.data[0]
        if (attachment.fileUrl) {
          setPreviewUrl(`http://localhost:8024/financeSvc/${attachment.fileUrl}`)
          setIsPreviewOpen(true)
        } else {
          showToast('URL file lampiran tidak valid', 'error')
        }
      } else {
        showToast('Tidak ada lampiran untuk transaksi ini', 'info')
      }
    } catch {
      showToast('Gagal memuat info lampiran', 'error')
    }
  }

  return (
    <div className="flex-grow p-4 sm:p-6 lg:p-8 flex flex-col gap-6 w-full max-w-7xl mx-auto animate-fade-in text-slate-800 font-sans">
      
      {/* Header matching PDF Screen 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
            Transaksi
          </h1>
          <p className="text-xs text-slate-400 mt-1">Lihat dan kelola buku besar transaksi Anda</p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => openModal('add')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Transaksi</span>
          </button>
        </div>
      </div>

      {/* Filters Panel matching Screen 3 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-xl py-2 pl-10 pr-4 text-slate-800 text-sm outline-none transition-all"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryId}
            onChange={(e) => { setCategoryId(e.target.value); setPage(0); }}
            className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3.5 text-slate-700 text-sm font-semibold outline-none cursor-pointer"
          >
            <option value="">Kategori: Semua</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* Status / Tipe Dropdown (Syarat Wajib Item 6: Filter Status) */}
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
            className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3.5 text-slate-700 text-sm font-semibold outline-none cursor-pointer"
          >
            <option value="">Status/Tipe: Semua</option>
            <option value="INCOME">Pemasukan (Income)</option>
            <option value="EXPENSE">Pengeluaran (Expense)</option>
          </select>

          {/* Sorting Dropdown (Requirement Item 6 PDF) */}
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(0); }}
            className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3.5 text-slate-700 text-sm font-extrabold outline-none cursor-pointer"
            title="Urutkan Data (Sorting)"
          >
            <option value="transactionDate_desc">Sorting: Terbaru (Newest)</option>
            <option value="transactionDate_asc">Sorting: Terlama (Oldest)</option>
            <option value="title_asc">Sorting: A - Z (Nama)</option>
            <option value="title_desc">Sorting: Z - A (Nama)</option>
          </select>

          {/* Date Picker */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
              className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-700 text-sm outline-none cursor-pointer"
            />
            <span>ke</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(0); }}
              className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-700 text-sm outline-none cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          {(keyword || categoryId || typeFilter || startDate || endDate) && (
            <button
              onClick={handleResetFilter}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 text-sm font-bold transition-all cursor-pointer"
            >
              Reset
            </button>
          )}

          <button 
            onClick={handleApplyFilter}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Filter className="w-4 h-4" />
            <span>Terapkan Filter</span>
          </button>
        </div>
      </div>

      {/* Active Filter Result Count Indicator */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
        <span>
          {(keyword || categoryId || typeFilter || startDate || endDate) ? (
            <span className="text-blue-600 font-extrabold">
              🔍 Filter Aktif: Menampilkan {transactions.length} data transaksi
            </span>
          ) : (
            <span>Menampilkan {transactions.length} transaksi</span>
          )}
        </span>
      </div>

      {/* Transactions Ledger Table matching Screen 3 */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        {loading ? (
          <div className="flex items-center justify-center min-h-[300px] text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-2" />
            <span>Memuat transaksi...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex items-center justify-center min-h-[250px] text-slate-400 text-sm font-medium">
            Tidak ada transaksi yang cocok dengan kriteria Anda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Tanggal</th>
                  <th className="py-4 px-6">Deskripsi</th>
                  <th className="py-4 px-6">Tipe</th>
                  <th className="py-4 px-6">Kategori & Tag</th>
                  <th className="py-4 px-6">Nominal</th>
                  <th className="py-4 px-6 text-center">Lampiran</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 text-slate-500 font-bold text-xs">
                      {new Date(tx.transactionDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{tx.title}</span>
                        {tx.description && <span className="text-xs text-slate-400 line-clamp-1">{tx.description}</span>}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 text-xs font-extrabold rounded-full ${
                        tx.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {tx.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1.5">
                        <span className="w-max px-2.5 py-1 text-xs font-semibold rounded-full border border-slate-200 bg-slate-100 text-slate-700">
                          {tx.categoryName || 'General'}
                        </span>
                        {tx.tags && tx.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {tx.tags.map(tag => (
                              <span key={tag.id} className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-50 text-blue-600 border border-blue-100">
                                #{tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-black ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'} {formatCurrency(tx.amount)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center flex justify-center">
                      <button
                        onClick={() => handleDownloadAttachment(tx.id)}
                        className="inline-flex items-center justify-center p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors cursor-pointer group shadow-xs"
                        title="Lihat Lampiran (jika ada)"
                      >
                        <Paperclip className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openDetail(tx)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Lihat Detail Transaksi"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openModal('edit', tx)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(tx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination UI Interaktif (Sesuai Ketentuan 7 S1) */}
        {!loading && transactions.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-slate-500">
                Menampilkan halaman <span className="text-slate-700 font-extrabold">{page + 1}</span> dari <span className="text-slate-700 font-extrabold">{totalPages || 1}</span> 
                <span className="ml-1 text-slate-400 font-medium">({totalElements} Total Data)</span>
              </span>

              {/* Pilihan Jumlah Data Per Halaman */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                <span>Tampilkan:</span>
                <select
                  value={size}
                  onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}
                  className="bg-white border border-slate-200 rounded-lg py-1 px-2 text-slate-700 font-bold outline-none cursor-pointer"
                >
                  <option value={5}>5 / hal</option>
                  <option value={10}>10 / hal</option>
                  <option value={20}>20 / hal</option>
                  <option value={50}>50 / hal</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1.5 self-end md:self-auto flex-wrap">
              <button
                onClick={() => setPage((old) => Math.max(0, old - 1))}
                disabled={page === 0}
                className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-bold text-xs hover:bg-white hover:shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>

              {/* Tombol Nomor Halaman */}
              {Array.from({ length: totalPages || 1 }, (_, i) => i).map((pageNum) => {
                if (
                  pageNum === 0 ||
                  pageNum === (totalPages - 1) ||
                  (pageNum >= page - 2 && pageNum <= page + 2)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        page === pageNum
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  )
                } else if (pageNum === page - 3 || pageNum === page + 3) {
                  return <span key={pageNum} className="text-slate-400 text-xs px-1">...</span>
                }
                return null
              })}

              <button
                onClick={() => setPage((old) => (old + 1 < totalPages ? old + 1 : old))}
                disabled={page >= totalPages - 1}
                className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-bold text-xs hover:bg-white hover:shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Transaction Modal matching Screen 4 of PDF Wireframe */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalType === 'add' ? 'Tambah Transaksi' : 'Edit Transaksi'}
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4 text-slate-800">
          
          {/* Income vs Expense Radio Toggle matching Screen 4 */}
          <div className="grid grid-cols-2 gap-3 p-1 rounded-2xl bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => handleTypeChange('EXPENSE')}
              className={`py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                formData.type === 'EXPENSE'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('INCOME')}
              className={`py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                formData.type === 'INCOME'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pemasukan
            </button>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Judul</label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Gaji, Belanjaan, dll."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: capitalizeWords(e.target.value) })}
                className={`w-full bg-slate-50 border ${
                  formErrors.title ? 'border-rose-500' : 'border-slate-200 focus:border-blue-600'
                } rounded-xl py-3 pl-10 pr-4 text-slate-800 outline-none text-sm font-medium transition-all`}
              />
            </div>
            {formErrors.title && <span className="text-xs text-rose-500 font-semibold">{formErrors.title}</span>}
          </div>

          {/* Amount & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">
                Nominal ({getCurrencyPrefix().trim()})
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-xs font-bold text-slate-400 select-none">
                  {getCurrencyPrefix()}
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="50.000"
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
              <label className="text-xs font-bold text-slate-700">Kategori</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className={`w-full bg-slate-50 border ${
                  formErrors.categoryId ? 'border-rose-500' : 'border-slate-200 focus:border-blue-600'
                } rounded-xl py-3 px-3.5 text-slate-800 outline-none text-sm font-medium cursor-pointer transition-all`}
              >
                <option value="">Pilih Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {formErrors.categoryId && <span className="text-xs text-rose-500 font-semibold">{formErrors.categoryId}</span>}
            </div>
          </div>

          {/* Tags Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Tag (Opsional)</label>
            <div className="relative">
              <Tag className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <div className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-2 min-h-[46px] flex flex-wrap gap-1.5 items-center">
                {availableTags.length === 0 ? (
                  <span className="text-xs text-slate-400 font-medium py-1">Belum ada tag. Buat di menu Tag.</span>
                ) : (
                  availableTags.map(tag => {
                    const isSelected = formData.tagIds.includes(tag.id)
                    return (
                      <button
                        type="button"
                        key={tag.id}
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            tagIds: isSelected 
                              ? prev.tagIds.filter(id => id !== tag.id)
                              : [...prev.tagIds, tag.id]
                          }))
                        }}
                        className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all border cursor-pointer ${
                          isSelected 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600'
                        }`}
                      >
                        #{tag.name}
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Tanggal Transaksi</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={formData.transactionDate}
                  onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                  className={`w-full bg-slate-50 border ${
                    formErrors.transactionDate ? 'border-rose-500' : 'border-slate-200 focus:border-blue-600'
                  } rounded-xl py-3 pl-10 pr-4 text-slate-800 outline-none text-sm font-medium cursor-pointer transition-all`}
                />
              </div>
              {formErrors.transactionDate && <span className="text-xs text-rose-500 font-semibold">{formErrors.transactionDate}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Metode Pembayaran</label>
              <div className="relative">
                <Wallet className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-xl py-3 pl-10 pr-4 text-slate-800 outline-none text-sm font-medium cursor-pointer transition-all"
                >
                  <option value="CASH">Tunai</option>
                  <option value="BANK_TRANSFER">Transfer Bank</option>
                  <option value="E_WALLET">E-Wallet</option>
                  <option value="DEBIT_CARD">Kartu Debit</option>
                  <option value="CREDIT_CARD">Kartu Kredit</option>
                  <option value="OTHER">Lainnya</option>
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Deskripsi</label>
            <textarea
              placeholder="Tambahkan catatan pembayaran, tag, atau detail..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className={`w-full bg-slate-50 border ${
                formErrors.description ? 'border-rose-500' : 'border-slate-200 focus:border-blue-600'
              } rounded-xl py-3 px-4 text-slate-800 outline-none text-sm font-medium resize-none transition-all`}
            />
            {formErrors.description && <span className="text-xs text-rose-500 font-semibold">{formErrors.description}</span>}
          </div>

          {/* File Attachment */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Lampiran (Struk JPG/PNG/PDF)</label>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
            />
          </div>

          {/* Action Buttons matching PDF Screen 4 */}
          <div className="flex items-center justify-end gap-3 mt-4">
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
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Simpan Transaksi</span>}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Hapus Transaksi"
      >
        <div className="flex flex-col gap-4 text-center">
          <p className="text-sm text-slate-600">
            Apakah Anda yakin ingin menghapus transaksi <span className="font-bold text-slate-900">"{txToDelete?.title}"</span>?
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

      {/* Modal Preview Lampiran */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Pratinjau Lampiran"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-full flex justify-center overflow-auto max-h-[60vh] bg-slate-50 rounded-xl p-2 border border-slate-100">
            {previewUrl.toLowerCase().endsWith('.pdf') ? (
              <iframe src={previewUrl} className="w-full h-[60vh] rounded-lg" title="PDF Preview" />
            ) : (
              <img src={previewUrl} alt="Lampiran" className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-sm" />
            )}
          </div>
          <div className="w-full flex justify-end gap-3 mt-2">
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-bold transition-all cursor-pointer"
            >
              Tutup
            </button>
            <a
              href={previewUrl}
              download
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
            >
              Unduh File
            </a>
          </div>
        </div>
      </Modal>

      {/* Modal Detail Data Transaksi (Sesuai Ketentuan 5 S1) */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Detail Data Transaksi"
      >
        {detailTx && (
          <div className="flex flex-col gap-4 text-slate-800 text-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 font-semibold">Judul Transaksi</span>
                <span className="text-base font-black text-slate-900">{detailTx.title}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                detailTx.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}>
                {detailTx.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div>
                <span className="text-xs text-slate-400 block font-semibold">Nominal</span>
                <span className={`text-lg font-black ${detailTx.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {detailTx.type === 'INCOME' ? '+' : '-'} {formatCurrency(detailTx.amount)}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-semibold">Tanggal Transaksi</span>
                <span className="font-bold text-slate-700">
                  {new Date(detailTx.transactionDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-semibold">Kategori</span>
                <span className="font-bold text-slate-700">{detailTx.categoryName || 'General'}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-semibold">Metode Pembayaran</span>
                <span className="font-bold text-slate-700">{detailTx.paymentMethod || 'Tunai (CASH)'}</span>
              </div>
            </div>

            {detailTx.tags && detailTx.tags.length > 0 && (
              <div>
                <span className="text-xs text-slate-400 block font-semibold mb-1.5">Tag Terkait</span>
                <div className="flex flex-wrap gap-1.5">
                  {detailTx.tags.map(t => (
                    <span key={t.id} className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-blue-50 text-blue-600 border border-blue-100">
                      #{t.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <span className="text-xs text-slate-400 block font-semibold mb-1">Catatan / Deskripsi</span>
              <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs leading-relaxed">
                {detailTx.description || 'Tidak ada catatan tambahan untuk transaksi ini.'}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleDownloadAttachment(detailTx.id)}
                className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>Download / Cek Lampiran Struk</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="px-5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer border border-slate-200"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
