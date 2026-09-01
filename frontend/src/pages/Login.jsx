import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import CuanFlowLogo from '../components/CuanFlowLogo'
import { Mail, Lock, Loader2, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    if (!email.trim()) newErrors.email = 'Email or Username is required'
    if (!password) newErrors.password = 'Password is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      await login(email, password)
      showToast('Welcome back to CuanFlow!', 'success')
      navigate('/dashboard')
    } catch (err) {
      showToast(err.message || 'Login failed. Please check your credentials.', 'error')
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
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-10 flex flex-col items-center gap-6">
        
        {/* Official CuanFlow Logo matching Screen 1 */}
        <div className="flex flex-col items-center gap-2 mb-2">
          <CuanFlowLogo size="lg" />
        </div>

        {/* Welcome Back Titles */}
        <div className="text-center">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-heading">
            Welcome Back!
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Login to your account
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          {/* Email / Username Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Email or Username</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full bg-slate-50 border ${
                  errors.email ? 'border-rose-500' : 'border-slate-200 focus:border-blue-600'
                } rounded-xl py-3 pl-10 pr-4 text-slate-800 placeholder-slate-400 outline-none text-sm transition-all`}
              />
            </div>
            {errors.email && <span className="text-xs text-rose-500 font-medium">{errors.email}</span>}
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700">Password</label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline">
              Lupa Password?
            </Link>
          </div>

          {/* Login Button matching Royal Blue PDF Wireframe */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Login</span>}
          </button>
        </form>

        {/* Footer Register Link */}
        <p className="text-sm text-slate-500 text-center">
          Belum punya akun?{' '}
          <Link to="/register" className="font-bold text-blue-600 hover:underline">
            Daftar Sekarang
          </Link>
        </p>
      </div>
    </div>
  )
}
