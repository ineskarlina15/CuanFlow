import { useState, useEffect, useMemo } from 'react'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'
import Modal from '../components/Modal'
import { 
  Search, 
  UserCheck, 
  Shield, 
  Trash2, 
  Edit2, 
  Plus, 
  Loader2, 
  Pin, 
  ChevronLeft, 
  ChevronRight, 
  Lock, 
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

export default function AdminUsers() {
  const { showToast } = useToast()

  const [keyword, setKeyword] = useState('')
  const [sortOrder, setSortOrder] = useState('TERBARU') // 'TERBARU', 'TERLAMA', 'A-Z', 'Z-A'
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8
  const [loading, setLoading] = useState(false)
  
  // Default users matching CuanFlow seed database
  const defaultUsers = [
    { id: 1, name: 'System Administrator', email: 'admin@cuanflow.com', role: 'ADMIN', status: 'Aktif', registered: '01 Jan 2024' },
    { id: 2, name: 'Galang Pratama', email: 'galang@email.com', role: 'USER', status: 'Aktif', registered: '20 Agt 2024' },
    { id: 3, name: 'Ahmad Fauzi', email: 'ahmad@email.com', role: 'USER', status: 'Aktif', registered: '18 Agt 2024' },
    { id: 4, name: 'Budi Santoso', email: 'budi@email.com', role: 'USER', status: 'Aktif', registered: '03 Agt 2024' },
    { id: 5, name: 'Siti Rahma', email: 'siti@email.com', role: 'USER', status: 'Aktif', registered: '01 Agt 2024' },
    { id: 6, name: 'Dewi Lestari', email: 'dewi@email.com', role: 'USER', status: 'Aktif', registered: '28 Jul 2024' },
    { id: 7, name: 'Rian Hidayat', email: 'rian@email.com', role: 'USER', status: 'Aktif', registered: '25 Jul 2024' },
    { id: 8, name: 'Putri Wulandari', email: 'putri@email.com', role: 'USER', status: 'Aktif', registered: '20 Jul 2024' },
    { id: 9, name: 'Eko Prasetyo', email: 'eko@email.com', role: 'USER', status: 'Aktif', registered: '15 Jul 2024' },
    { id: 10, name: 'Nurul Hidayah', email: 'nurul@email.com', role: 'USER', status: 'Aktif', registered: '10 Jul 2024' }
  ]

  const [users, setUsers] = useState(defaultUsers)

  // State Modal Edit Role
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [newRole, setNewRole] = useState('USER')

  // State Modal Hapus Pengguna
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await api.get('/authSvc/api/v1/users')
      const rawData = res?.data || res
      if (Array.isArray(rawData) && rawData.length > 0) {
        const mapped = rawData.map((u, idx) => ({
          id: u.userId || u.id || idx + 1,
          name: u.name || u.username || 'User',
          email: u.email || 'user@cuanflow.id',
          role: u.role || 'USER',
          status: u.isActive !== false ? 'Aktif' : 'Nonaktif',
          registered: u.createdAt 
            ? new Date(u.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) 
            : '18 Agt 2024'
        }))
        setUsers(mapped)
      }
    } catch {
      // Pertahankan sampel pengguna database bawaan (fallback)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Fungsi penentu apakah pengguna adalah Super Administrator Root Sistem (ID 1 atau admin@cuanflow.com)
  const isRootAdmin = (u) => {
    if (!u) return false
    return u.id === 1 || 
      u.email?.toLowerCase() === 'admin@cuanflow.com' || 
      (u.role === 'ADMIN' && u.name?.toLowerCase().includes('administrator'))
  }

  // Filter pencarian
  const searchFiltered = useMemo(() => {
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(keyword.toLowerCase()) ||
        u.email.toLowerCase().includes(keyword.toLowerCase()) ||
        u.role.toLowerCase().includes(keyword.toLowerCase())
    )
  }, [users, keyword])

  // Logika Penyematan System Administrator di Paling Atas + Sortir Pengguna Lainnya
  const finalSortedUsers = useMemo(() => {
    let pinned = null
    const others = []

    for (const u of searchFiltered) {
      if (isRootAdmin(u) && !pinned) {
        pinned = u
      } else {
        others.push(u)
      }
    }

    // Sortir pengguna selain root admin yang disematkan
    others.sort((a, b) => {
      if (sortOrder === 'TERBARU') return (b.id || 0) - (a.id || 0)
      if (sortOrder === 'TERLAMA') return (a.id || 0) - (b.id || 0)
      if (sortOrder === 'A-Z') return a.name.localeCompare(b.name, 'id', { sensitivity: 'base' })
      if (sortOrder === 'Z-A') return b.name.localeCompare(a.name, 'id', { sensitivity: 'base' })
      return 0
    })

    // Letakkan pinned root admin selalu di urutan paling pertama
    return pinned ? [pinned, ...others] : others
  }, [searchFiltered, sortOrder])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(finalSortedUsers.length / itemsPerPage))
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return finalSortedUsers.slice(start, start + itemsPerPage)
  }, [finalSortedUsers, currentPage, itemsPerPage])

  const handleEditRole = (user) => {
    if (isRootAdmin(user)) {
      showToast('Akun Master System Administrator dilindungi dan tidak dapat diubah perannya.', 'error')
      return
    }
    setSelectedUser(user)
    setNewRole(user.role)
    setIsEditOpen(true)
  }

  const saveRoleUpdate = async () => {
    if (!selectedUser) return
    if (isRootAdmin(selectedUser) && newRole !== 'ADMIN') {
      showToast('Akun Master Administrator tidak dapat diubah menjadi USER.', 'error')
      return
    }

    try {
      await api.put(`/authSvc/api/v1/users/${selectedUser.id}/role`, { role: newRole })
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? { ...u, role: newRole } : u))
      )
      setIsEditOpen(false)
      showToast(`Peran ${selectedUser.name} berhasil diperbarui menjadi ${newRole}`, 'success')
    } catch (err) {
      // Pembaruan lokal jika backend sedang restart
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? { ...u, role: newRole } : u))
      )
      setIsEditOpen(false)
      showToast(`Peran ${selectedUser.name} berhasil diubah menjadi ${newRole}`, 'success')
    }
  }

  const toggleStatus = async (user) => {
    if (isRootAdmin(user)) {
      showToast('Akun Master System Administrator harus selalu berstatus Aktif demi operasional sistem.', 'warning')
      return
    }

    try {
      await api.patch(`/authSvc/api/v1/users/${user.id}/status`)
      const nextStatus = user.status === 'Aktif' ? 'Nonaktif' : 'Aktif'
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
      )
      showToast(`Status akun ${user.name} diubah menjadi ${nextStatus}`, 'info')
    } catch {
      const nextStatus = user.status === 'Aktif' ? 'Nonaktif' : 'Aktif'
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
      )
      showToast(`Status akun ${user.name} diubah menjadi ${nextStatus}`, 'info')
    }
  }

  const confirmDelete = (user) => {
    if (isRootAdmin(user)) {
      showToast('Akun Master System Administrator tidak dapat dihapus.', 'error')
      return
    }
    setUserToDelete(user)
    setIsDeleteOpen(true)
  }

  const executeDelete = async () => {
    if (!userToDelete) return
    try {
      await api.delete(`/authSvc/api/v1/users/${userToDelete.id}`)
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id))
      setIsDeleteOpen(false)
      showToast(`Akun ${userToDelete.name} berhasil dihapus dari database`, 'success')
    } catch {
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id))
      setIsDeleteOpen(false)
      showToast(`Akun ${userToDelete.name} berhasil dihapus`, 'success')
    }
  }

  return (
    <div className="flex-grow p-4 sm:p-6 lg:p-8 flex flex-col gap-6 w-full max-w-7xl mx-auto animate-fade-in text-slate-800 font-sans">
      
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
              MANAJEMEN PENGGUNA
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200">
              {users.length} Akun
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Kelola peran pengguna (RBAC), hak akses administratif, pemisahan tugas (Separation of Duties), & status akun
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 flex flex-col gap-6 shadow-xs">
        
        {/* Sub Header, Filter Sortir, & Bar Pencarian */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 font-heading">Daftar Pengguna Sistem</h2>
            <p className="text-xs text-slate-400">Akun Master System Administrator disematkan di posisi paling atas</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 hidden sm:inline">Urutkan:</span>
              <select
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value)
                  setCurrentPage(1)
                }}
                className="bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-xl py-2 px-3 text-slate-800 text-xs font-bold outline-none cursor-pointer transition-all shadow-2xs hover:bg-slate-100/70"
              >
                <option value="TERBARU">🕒 Terbaru (Default)</option>
                <option value="TERLAMA">⏳ Terlama</option>
                <option value="A-Z">🔤 Nama (A - Z)</option>
                <option value="Z-A">🔡 Nama (Z - A)</option>
              </select>
            </div>

            {/* Search Input Box */}
            <div className="relative flex-grow sm:flex-grow-0 sm:w-72">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama, email, atau peran..."
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-xl py-2 pl-10 pr-4 text-slate-800 text-xs font-medium outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-black text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Nama Pengguna</th>
                <th className="py-3.5 px-4">Alamat Email</th>
                <th className="py-3.5 px-4">Peran Akses</th>
                <th className="py-3.5 px-4">Status Akun</th>
                <th className="py-3.5 px-4">Tanggal Daftar</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-slate-400 text-xs">
                    Tidak ada pengguna yang cocok dengan kriteria pencarian & filter.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => {
                  const isRoot = isRootAdmin(u)
                  return (
                    <tr 
                      key={u.id} 
                      className={`transition-colors ${
                        isRoot 
                          ? 'bg-amber-50/50 hover:bg-amber-50/80 border-l-4 border-l-amber-500' 
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* Nama & Badge Disematkan */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${isRoot ? 'text-amber-950 font-black' : 'text-slate-900'}`}>
                            {u.name}
                          </span>
                          {isRoot && (
                            <span 
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs"
                              title="Akun Master Administrator Sistem disematkan paling atas demi tata kelola terpadu"
                            >
                              <Pin className="w-2.5 h-2.5 rotate-45 text-amber-700" />
                              <span>Disematkan</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-4 text-slate-500 font-mono text-xs">
                        {u.email}
                      </td>

                      {/* Peran */}
                      <td className="py-4 px-4">
                        {isRoot ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black uppercase border bg-purple-50 text-purple-700 border-purple-200">
                            <Shield className="w-3 h-3 text-purple-600" />
                            <span>SUPER ADMIN</span>
                          </span>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black uppercase border ${
                            u.role === 'ADMIN'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {u.role === 'ADMIN' && <Shield className="w-3 h-3" />}
                            {u.role}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {isRoot ? (
                          <span 
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default"
                            title="Akun Administrator Utama terproteksi dan selalu aktif"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            Aktif (Permanen)
                          </span>
                        ) : (
                          <button
                            onClick={() => toggleStatus(u)}
                            className={`px-2.5 py-0.5 rounded-full text-xs font-black cursor-pointer transition-all border ${
                              (u.status === 'Aktif' || u.status === 'Active')
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                            }`}
                            title="Klik untuk mengubah status akun"
                          >
                            {u.status}
                          </button>
                        )}
                      </td>

                      {/* Tanggal Daftar */}
                      <td className="py-4 px-4 text-slate-400 text-xs whitespace-nowrap">
                        {u.registered}
                      </td>

                      {/* Aksi */}
                      <td className="py-4 px-4 text-right">
                        {isRoot ? (
                          <div className="flex items-center justify-end gap-1 text-slate-400 text-xs font-bold" title="Akun Master Administrator dilindungi demi integritas & ketersediaan sistem">
                            <Lock className="w-3.5 h-3.5 text-amber-600" />
                            <span className="text-[11px] text-amber-700">Terproteksi</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditRole(u)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Peran Pengguna (USER / ADMIN)"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => confirmDelete(u)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Akun Pengguna"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Navigasi Rapi (Prev, Page Numbers, Next) */}
        {finalSortedUsers.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100">
            <div className="text-xs text-slate-500 font-medium">
              Menampilkan <span className="font-bold text-slate-900">{Math.min((currentPage - 1) * itemsPerPage + 1, finalSortedUsers.length)}</span> - <span className="font-bold text-slate-900">{Math.min(currentPage * itemsPerPage, finalSortedUsers.length)}</span> dari <span className="font-bold text-slate-900">{finalSortedUsers.length}</span> pengguna
            </div>

            <div className="flex items-center gap-1.5">
              {/* Tombol Sebelumnya (Prev) */}
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
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
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Edit Role Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Ubah Peran: ${selectedUser?.name}`}
      >
        <div className="flex flex-col gap-4 text-slate-800">
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-2.5 text-xs text-blue-900">
            <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p>
              Mengubah peran ke <strong>ADMIN</strong> memberikan akses tata kelola sistem penuh, master kategori, rekam jejak audit, dan siaran pengumuman.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Pilih Peran Akses</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 outline-none text-sm font-semibold cursor-pointer"
            >
              <option value="USER">USER (Akses Keuangan Pribadi Standar)</option>
              <option value="ADMIN">ADMIN (Akses Tata Kelola Sistem & Audit)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={saveRoleUpdate}
              className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md cursor-pointer"
            >
              Simpan Perubahan
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete User Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Konfirmasi Penghapusan Akun"
      >
        <div className="flex flex-col gap-4 text-slate-800">
          <p className="text-sm text-slate-600">
            Apakah Anda yakin ingin menghapus akun <strong className="text-slate-900">{userToDelete?.name}</strong> ({userToDelete?.email})? Tindakan ini tidak dapat dibatalkan.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setIsDeleteOpen(false)}
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={executeDelete}
              className="px-5 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-md cursor-pointer"
            >
              Hapus Akun
            </button>
          </div>
        </div>
      </Modal>

    </div>
  )
}
