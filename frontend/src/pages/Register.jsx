import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import CuanFlowLogo from '../components/CuanFlowLogo'
import { User, Mail, Lock, Loader2, ArrowLeft, Eye, EyeOff, Phone } from 'lucide-react'

export default function Register() {
  const { register } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validateField = (field, value, currentForm) => {
    let error = ''
    if (field === 'name') {
      if (!value.trim()) error = 'Nama Lengkap wajib diisi'
      else if (value.trim().length < 3) error = 'Nama minimal 3 karakter'
      else if (value.trim().length > 50) error = 'Nama maksimal 50 karakter'
    } else if (field === 'username') {
      if (!value.trim()) error = 'Username wajib diisi'
      else if (value.trim().length < 3) error = 'Username minimal 3 karakter'
      else if (value.trim().length > 30) error = 'Username maksimal 30 karakter'
      else if (!/^[a-zA-Z0-9_]+$/.test(value.trim())) error = 'Username hanya boleh huruf, angka, dan underscore'
    } else if (field === 'email') {
      if (!value.trim()) error = 'Alamat email wajib diisi'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) error = 'Format email tidak valid (contoh: user@mail.com)'
    } else if (field === 'phone') {
      if (!value.trim()) error = 'Nomor HP wajib diisi'
      else if (!/^(08|62|\+62)[0-9]{8,13}$/.test(value.trim())) error = 'Nomor HP tidak valid (diawali 08/62, 10-15 digit)'
    } else if (field === 'password') {
      if (!value) error = 'Kata sandi wajib diisi'
      else if (value.length < 6) error = 'Kata sandi minimal 6 karakter'
      else if (value.length > 50) error = 'Kata sandi maksimal 50 karakter'
      if (currentForm.confirmPassword && value !== currentForm.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Konfirmasi kata sandi tidak cocok' }))
      } else if (currentForm.confirmPassword && value === currentForm.confirmPassword) {
        setErrors(prev => { const n = { ...prev }; delete n.confirmPassword; return n })
      }
    } else if (field === 'confirmPassword') {
      if (!value) error = 'Konfirmasi kata sandi wajib diisi'
      else if (value !== currentForm.password) error = 'Konfirmasi kata sandi tidak cocok'
    }
    return error
  }

  const handleChange = (field, value) => {
    const nextForm = { ...formData, [field]: value }
    setFormData(nextForm)
    const err = validateField(field, value, nextForm)
    setErrors(prev => ({ ...prev, [field]: err }))
  }

  const validateAll = () => {
    const newErrors = {}
    Object.keys(formData).forEach(key => {
      const err = validateField(key, formData[key], formData)
      if (err) newErrors[key] = err
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateAll()) return

    setLoading(true)
    try {
      await register(formData.name, formData.username, formData.email, formData.password, formData.phone)
      showToast('Pendaftaran berhasil! Silakan masuk ke akun baru Anda.', 'success')
      navigate('/login')
    } catch (err) {
      showToast(err.message || 'Pendaftaran gagal', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-slate-800 animate-fade-in relative">
      {/* Top Back to Homepage Link */}
      <Link
        to="/"
        className="fixed top-6 left-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:bg-slate-100 text-xs font-bold transition-all shadow-xs cursor-pointer z-50"
      >
        <ArrowLeft className="w-4 h-4 text-blue-600" />
        <span>Kembali ke Homepage</span>
      </Link>
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-10 flex flex-col items-center gap-6 my-8">
        
        {/* CuanFlow Logo */}
        <div className="flex flex-col items-center gap-2 mb-2">
          <CuanFlowLogo size="lg" />
        </div>

        {/* Header Title */}
        <div className="text-center">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-heading">
            Buat Akun
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Mulai kelola alur keuangan pribadimu
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Nama Lengkap</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Masukkan Nama Lengkap"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full bg-slate-50 border ${
                  errors.name ? 'border-rose-500' : 'border-slate-200 focus:border-blue-600'
                } rounded-xl py-3 pl-10 pr-4 text-slate-800 placeholder-slate-400 outline-none text-sm transition-all`}
              />
            </div>
            {errors.name && <span className="text-xs text-rose-500 font-medium">{errors.name}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Username</label>
            <input
              type="text"
              placeholder="masukkan_username"
              value={formData.username}
              onChange={(e) => handleChange('username', e.target.value)}
              className={`w-full bg-slate-50 border ${
                errors.username ? 'border-rose-500' : 'border-slate-200 focus:border-blue-600'
              } rounded-xl py-3 px-4 text-slate-800 placeholder-slate-400 outline-none text-sm transition-all`}
            />
            {errors.username && <span className="text-xs text-rose-500 font-medium">{errors.username}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Alamat Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full bg-slate-50 border ${
                  errors.email ? 'border-rose-500' : 'border-slate-200 focus:border-blue-600'
                } rounded-xl py-3 pl-10 pr-4 text-slate-800 placeholder-slate-400 outline-none text-sm transition-all`}
              />
            </div>
            {errors.email && <span className="text-xs text-rose-500 font-medium">{errors.email}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Nomor HP</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                placeholder="08xxxxxxxxxx"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className={`w-full bg-slate-50 border ${
                  errors.phone ? 'border-rose-500' : 'border-slate-200 focus:border-blue-600'
                } rounded-xl py-3 pl-10 pr-4 text-slate-800 placeholder-slate-400 outline-none text-sm transition-all`}
              />
            </div>
            {errors.phone && <span className="text-xs text-rose-500 font-medium">{errors.phone}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Kata Sandi</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className={`w-full bg-slate-50 border ${
                  errors.password ? 'border-rose-500' : 'border-slate-200 focus:border-blue-600'
                } rounded-xl py-3 pl-10 pr-10 text-slate-800 placeholder-slate-400 outline-none text-sm transition-all`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <span className="text-xs text-rose-500 font-medium">{errors.password}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Konfirmasi Kata Sandi</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                className={`w-full bg-slate-50 border ${
                  errors.confirmPassword ? 'border-rose-500' : 'border-slate-200 focus:border-blue-600'
                } rounded-xl py-3 pl-10 pr-10 text-slate-800 placeholder-slate-400 outline-none text-sm transition-all`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && <span className="text-xs text-rose-500 font-medium">{errors.confirmPassword}</span>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Daftar Akun</span>}
          </button>
        </form>

        <p className="text-sm text-slate-500 text-center">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-bold text-blue-600 hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  )
}
