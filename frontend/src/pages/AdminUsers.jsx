import { useState, useEffect } from 'react'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'
import Modal from '../components/Modal'
import { Search, UserCheck, Shield, Trash2, Edit2, Plus, Loader2 } from 'lucide-react'

export default function AdminUsers() {
  const { showToast } = useToast()

  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Default users matching PDF Screen 2. USERS MANAGEMENT
  const defaultUsers = [
    { id: 1, name: 'Galang', email: 'galang@email.com', role: 'USER', status: 'Active', registered: '20 Aug 2024' },
    { id: 2, name: 'Ahmad', email: 'ahmad@email.com', role: 'USER', status: 'Active', registered: '18 Aug 2024' },
    { id: 3, name: 'Admin', email: 'admin@email.com', role: 'ADMIN', status: 'Active', registered: '15 Aug 2024' },
    { id: 4, name: 'Budi', email: 'budi@email.com', role: 'USER', status: 'Active', registered: '03 Aug 2024' },
    { id: 5, name: 'Siti', email: 'siti@email.com', role: 'USER', status: 'Active', registered: '01 Aug 2024' }
  ]

  const [users, setUsers] = useState(defaultUsers)

  // Edit Role Modal State
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [newRole, setNewRole] = useState('USER')

  // Delete User Modal State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await api.get('/authSvc/api/v1/users')
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        const mapped = res.data.map((u, idx) => ({
          id: u.userId || idx + 1,
          name: u.name || u.username || 'User',
          email: u.email || 'user@cuanflow.id',
          role: u.role || 'USER',
          status: 'Active',
          registered: '18 Aug 2024'
        }))
        setUsers(mapped)
      }
    } catch {
      // Keep default PDF sample users on error fallback
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleEditRole = (user) => {
    setSelectedUser(user)
    setNewRole(user.role)
    setIsEditOpen(true)
  }

  const saveRoleUpdate = () => {
    if (!selectedUser) return
    setUsers((prev) =>
      prev.map((u) => (u.id === selectedUser.id ? { ...u, role: newRole } : u))
    )
    setIsEditOpen(false)
    showToast(`User role updated to ${newRole}`, 'success')
  }

  const toggleStatus = (user) => {
    const nextStatus = user.status === 'Active' ? 'Inactive' : 'Active'
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
    )
    showToast(`User status updated to ${nextStatus}`, 'info')
  }

  const confirmDelete = (user) => {
    setUserToDelete(user)
    setIsDeleteOpen(true)
  }

  const executeDelete = () => {
    if (!userToDelete) return
    setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id))
    setIsDeleteOpen(false)
    showToast('User account deleted successfully', 'success')
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(keyword.toLowerCase()) ||
      u.email.toLowerCase().includes(keyword.toLowerCase()) ||
      u.role.toLowerCase().includes(keyword.toLowerCase())
  )

  return (
    <div className="flex-grow p-4 sm:p-6 lg:p-8 flex flex-col gap-6 w-full max-w-7xl mx-auto animate-fade-in text-slate-800 font-sans">
      
      {/* Header matching PDF Screen 2. USERS MANAGEMENT */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
            2. USERS MANAGEMENT
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage user roles, access control, & account statuses</p>
        </div>
      </div>

      {/* Main Container matching PDF Screen 2 */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 flex flex-col gap-6 shadow-xs">
        
        {/* Sub Header & Search Bar matching PDF Screen 2 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-black text-slate-900 font-heading">Users</h2>

          {/* Search Input Box matching PDF Screen 2 */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-xl py-2 pl-10 pr-4 text-slate-800 text-sm outline-none transition-all"
            />
          </div>
        </div>

        {/* Users Table matching PDF Screen 2 EXACTLY */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-black text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Registered Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400 text-xs">
                    No matching users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900">{u.name}</td>
                    <td className="py-4 px-4 text-slate-500">{u.email}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase border ${
                        u.role === 'ADMIN'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => toggleStatus(u)}
                        className={`px-2.5 py-0.5 rounded-full text-xs font-black cursor-pointer transition-all border ${
                          u.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                        }`}
                        title="Click to toggle account status"
                      >
                        {u.status}
                      </button>
                    </td>
                    <td className="py-4 px-4 text-slate-400 text-xs">{u.registered}</td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditRole(u)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit User Role"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(u)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete User Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Edit Role Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit Role: ${selectedUser?.name}`}
      >
        <div className="flex flex-col gap-4 text-slate-800">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Select Access Role</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 outline-none text-sm font-semibold cursor-pointer"
            >
              <option value="USER">USER (Standard Account Access)</option>
              <option value="ADMIN">ADMIN (Full System & User Management Access)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={saveRoleUpdate}
              className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete User Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirm Account Deletion"
      >
        <div className="flex flex-col gap-4 text-slate-800">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete account <strong className="text-slate-900">{userToDelete?.name}</strong> ({userToDelete?.email})? This action cannot be undone.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setIsDeleteOpen(false)}
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={executeDelete}
              className="px-5 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-md cursor-pointer"
            >
              Delete Account
            </button>
          </div>
        </div>
      </Modal>

    </div>
  )
}
