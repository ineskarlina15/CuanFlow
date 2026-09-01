import { Link } from 'react-router-dom'
import { Lock, ArrowLeft } from 'lucide-react'

export default function Forbidden() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center shadow-lg border border-slate-200">
        <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-rose-600" />
        </div>
        
        <h1 className="text-4xl font-black text-slate-900 mb-2 font-heading tracking-tight">403</h1>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Access Forbidden</h2>
        
        <p className="text-sm text-slate-500 mb-8 leading-relaxed">
          Maaf, kamu tidak memiliki hak akses yang cukup untuk melihat halaman ini. Halaman ini mungkin khusus untuk Administrator.
        </p>

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-600/20 transition-all active:scale-[0.98]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard</span>
        </Link>
      </div>
    </div>
  )
}
