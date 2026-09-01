import { Link } from 'react-router-dom'
import { ServerCrash, RefreshCw } from 'lucide-react'

export default function ServerError() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center shadow-lg border border-slate-200">
        <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ServerCrash className="w-8 h-8 text-rose-600" />
        </div>
        
        <h1 className="text-4xl font-black text-slate-900 mb-2 font-heading tracking-tight">500</h1>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Internal Server Error</h2>
        
        <p className="text-sm text-slate-500 mb-8 leading-relaxed">
          Terjadi kesalahan pada server kami. Sistem sedang tidak dapat memproses permintaan kamu saat ini. Silakan coba beberapa saat lagi.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex justify-center items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-600/20 transition-all active:scale-[0.98] cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Coba Lagi</span>
          </button>
          
          <Link
            to="/dashboard"
            className="inline-flex justify-center items-center gap-2 px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl transition-all active:scale-[0.98]"
          >
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
