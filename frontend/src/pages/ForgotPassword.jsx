import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, ArrowLeft, Send, KeyRound } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import CuanFlowLogo from '../components/CuanFlowLogo'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sentToken, setSentToken] = useState(null)
  const { showSuccess, showError } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) {
      showError('Silakan masukkan alamat email Anda')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Gagal memproses permintaan reset password')
      }

      showSuccess('Token reset password berhasil dikirim!')
      if (data.data) {
        setSentToken(data.data)
      }
    } catch (err) {
      showError(err.message || 'Terjadi kesalahan pada server')
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
          Lupa Password?
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 font-medium">
          Masukkan email akun CuanFlow Anda untuk menerima token reset password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 border border-slate-200/80 sm:rounded-3xl sm:px-10">
          {!sentToken ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-xs font-extrabold uppercase text-slate-600 tracking-wider">
                  Alamat Email
                </label>
                <div className="mt-2 relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
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
                  <span>Memproses...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Kirim Token Reset Password</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="flex flex-col gap-4 text-center">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col items-center gap-2">
                <KeyRound className="w-8 h-8 text-emerald-600 animate-bounce" />
                <h3 className="text-sm font-black text-emerald-900">Token Berhasil Dibuat!</h3>
                <p className="text-xs text-emerald-700 font-medium">
                  Salin token di bawah ini untuk digunakan pada halaman reset password:
                </p>
                <div className="w-full p-3 bg-white border border-emerald-300 rounded-xl font-mono text-xs font-bold text-slate-800 select-all break-all">
                  {sentToken}
                </div>
              </div>

              <button
                onClick={() => navigate(`/reset-password?token=${sentToken}`)}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-600/20 active:scale-[0.98] transition-all"
              >
                Lanjut ke Reset Password
              </button>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <Link to="/login" className="text-xs font-bold text-blue-600 hover:text-blue-700">
              Ingat password Anda? Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
