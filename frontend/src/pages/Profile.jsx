import { useState, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import api from '../services/api'
import { User, Mail, Camera, Save, Loader2, Key, Check, ShieldCheck, Upload, Eye, EyeOff } from 'lucide-react'

// Predefined Avatars
const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=250&q=80'
]

export default function Profile() {
  const { user, token, updateUser } = useAuth()
  const { showToast } = useToast()

  const [name, setName] = useState(user?.name || '')
  const [email] = useState(user?.email || '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef(null)

  // Handle Photo File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast('Harap pilih file gambar (JPG, PNG, WebP)', 'error')
      return
    }

    if (file.size > 3 * 1024 * 1024) {
      showToast('Ukuran file maksimal 3MB', 'error')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxDim = 150
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width)
            width = maxDim
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height)
            height = maxDim
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7)
        setAvatarUrl(compressedBase64)
        showToast('Foto profil berhasil dimuat & dioptimasi! Klik Save Changes untuk menyimpan.', 'success')
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()

    if (!name.trim()) {
      showToast('Nama lengkap tidak boleh kosong', 'error')
      return
    }

    // Password Validation
    if (newPassword) {
      if (newPassword.length < 6) {
        showToast('Password baru minimal 6 karakter', 'error')
        return
      }
      if (!currentPassword) {
        showToast('Harap masukkan Password Lama (Current Password) untuk memverifikasi perubahan password', 'error')
        return
      }
      if (confirmPassword && newPassword !== confirmPassword) {
        showToast('Konfirmasi password baru tidak cocok', 'error')
        return
      }
    }

    setSaving(true)

    try {
      // Send PUT request to Backend User Controller
      const response = await api.put(
        '/authSvc/api/v1/users/profile',
        {
          name: name.trim(),
          avatarUrl: avatarUrl,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword ? newPassword.trim() : undefined
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const updatedData = response.data?.data || {}

      // Update Local State & Context
      updateUser({
        name: updatedData.name || name.trim(),
        avatarUrl: updatedData.avatarUrl || avatarUrl
      })

      showToast('Profil & Password berhasil diperbarui!', 'success')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Gagal memperbarui profil'
      showToast(errMsg, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex-grow p-4 sm:p-6 lg:p-8 flex flex-col gap-6 w-full max-w-4xl mx-auto animate-fade-in text-slate-800 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
          Profil Pengguna
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Kelola informasi akun, foto profil, dan kata sandi Anda
        </p>
      </div>

      {/* User Avatar & Photo Upload Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
        <div className="relative group">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-4xl text-white shadow-lg overflow-hidden shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              (name || 'G').charAt(0).toUpperCase()
            )}
          </div>
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-2 -right-2 p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
            title="Upload Foto Profil"
          >
            <Camera className="w-4 h-4" />
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
        </div>

        <div className="flex flex-col text-center sm:text-left gap-1 flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h2 className="text-2xl font-black text-slate-900 font-heading">{user?.name || name}</h2>
            <ShieldCheck className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-sm font-semibold text-slate-500">{user?.email}</span>

          <div className="mt-3 flex items-center justify-center sm:justify-start gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Foto</span>
            </button>

            <span className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
              {user?.role || 'USER'}
            </span>
          </div>
        </div>
      </div>

      {/* Preset Avatar Selectors */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 flex flex-col gap-4 shadow-sm">
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Pilihan Avatar Bawaan</h3>
        <div className="flex flex-wrap items-center gap-4">
          {AVATAR_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setAvatarUrl(preset)
                showToast('Avatar terpilih! Klik Save Changes untuk menyimpan.', 'info')
              }}
              className={`w-12 h-12 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer relative ${
                avatarUrl === preset ? 'border-blue-600 ring-2 ring-blue-600/30 scale-105' : 'border-slate-200 hover:border-blue-400'
              }`}
            >
              <img src={preset} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
              {avatarUrl === preset && (
                <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center text-white">
                  <Check className="w-4 h-4 font-bold" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Update Account & Password Settings Form */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
        <h3 className="text-lg font-black text-slate-900 font-heading">Pengaturan Akun & Keamanan</h3>

        <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-extrabold uppercase text-slate-600 tracking-wider">Nama Lengkap</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama Lengkap Anda"
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl py-3 pl-10 pr-4 text-slate-800 outline-none text-sm font-medium transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-extrabold uppercase text-slate-600 tracking-wider">Alamat Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                disabled
                value={email}
                className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-xl py-3 pl-10 pr-4 text-sm font-medium cursor-not-allowed"
              />
            </div>
          </div>

          <hr className="my-2 border-slate-200" />

          <div>
            <h4 className="text-sm font-black text-slate-900 font-heading">Ubah Password</h4>
            <p className="text-xs text-slate-500 font-medium">Kosongkan bidang ini jika Anda tidak ingin mengubah password.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold uppercase text-slate-600 tracking-wider">Password Lama (Current)</label>
              <div className="relative">
                <Key className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="Masukkan password saat ini"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl py-3 pl-10 pr-10 text-slate-800 outline-none text-sm font-medium transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer focus:outline-none"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold uppercase text-slate-600 tracking-wider">Password Baru (New)</label>
              <div className="relative">
                <Key className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Minimal 6 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl py-3 pl-10 pr-10 text-slate-800 outline-none text-sm font-medium transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer focus:outline-none"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {newPassword && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold uppercase text-slate-600 tracking-wider">Konfirmasi Password Baru</label>
              <div className="relative">
                <Key className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Ketik ulang password baru Anda"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl py-3 pl-10 pr-10 text-slate-800 outline-none text-sm font-medium transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-2 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md shadow-blue-600/20 active:scale-[0.98] cursor-pointer self-start disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            <span>Simpan Perubahan (Save Changes)</span>
          </button>
        </form>
      </div>
    </div>
  )
}

