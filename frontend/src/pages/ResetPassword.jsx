import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { KeyRound, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import CuanFlowLogo from '../components/CuanFlowLogo'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { showSuccess, showError } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token')
    if (tokenFromUrl) {
      setToken(tokenFromUrl)
    }
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!token) {
      showError('Token reset password tidak boleh kosong')
      return
    }
    if (!newPassword || newPassword.length < 6) {
      showError('Password baru minimal 6 karakter')
      return
    }
    if (newPassword !== confirmPassword) {
      showError('Konfirmasi password tidak cocok')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token,
          newPassword: newPassword
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Gagal mereset password')
      }

      showSuccess('Password berhasil diperbarui! Silakan login dengan password baru Anda.')
      navigate('/login')
    } catch (err) {
      showError(err.message || 'Token tidak valid atau telah kedaluwarsa')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative font-sans">
      {/* Top Left Return to Homepage Button */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 hover:text-blue-600 font-bold text-xs shadow-xs hover:shadow-md transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-blue-600" />
          <span>Kembali ke Homepage</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <CuanFlowLogo size="lg" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-black text-slate-900 font-heading tracking-tight">
          Reset Password
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 font-medium">
          Masukkan token dan password baru untuk akun CuanFlow Anda.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 border border-slate-200/80 sm:rounded-3xl sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="token" className="block text-xs font-extrabold uppercase text-slate-600 tracking-wider">
                Token Reset Password
              </label>
              <div className="mt-2 relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="token"
                  name="token"
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste token reset password"
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-mono font-medium"
                />
              </div>
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-xs font-extrabold uppercase text-slate-600 tracking-wider">
                Password Baru
              </label>
              <div className="mt-2 relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-extrabold uppercase text-slate-600 tracking-wider">
                Konfirmasi Password Baru
              </label>
              <div className="mt-2 relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md shadow-blue-600/20 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Memperbarui...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan Password Baru</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <Link to="/login" className="text-xs font-bold text-blue-600 hover:text-blue-700">
              Batal dan Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
