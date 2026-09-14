import { Component } from 'react'
import { AlertTriangle, RotateCcw, Home, ChevronDown, ChevronUp } from 'lucide-react'
import CuanFlowLogo from './CuanFlowLogo'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      showDetails: false
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    // Error dapat dicatat ke console atau service log
    console.error('ErrorBoundary tertangkap:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }))
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 font-sans text-slate-800 selection:bg-blue-600/20">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-8 sm:p-10 flex flex-col items-center text-center gap-6 animate-fade-in">
            
            {/* Logo & Warning Badge */}
            <div className="relative">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 shadow-xs">
                <CuanFlowLogo size="md" />
              </div>
              <div className="absolute -bottom-2 -right-2 p-1.5 bg-amber-500 text-white rounded-full shadow-md">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>

            {/* Title & Description */}
            <div className="flex flex-col gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-heading tracking-tight">
                Terjadi Kendala pada Tampilan
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                Sistem mendeteksi kendala teknis saat memuat bagian ini. Jangan khawatir, data keuangan Anda tetap aman tersimpan di database.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
              <button
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-blue-600/20 active:scale-[0.98] cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Muat Ulang Halaman</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-all active:scale-[0.98] cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Kembali ke Beranda</span>
              </button>
            </div>

            {/* Collapsible Error Technical Detail */}
            {this.state.error && (
              <div className="w-full pt-4 border-t border-slate-100 flex flex-col gap-2 text-left">
                <button
                  onClick={this.toggleDetails}
                  className="flex items-center justify-between text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                >
                  <span>Detail Teknis (Pengembang)</span>
                  {this.state.showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {this.state.showDetails && (
                  <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200/80 text-[11px] font-mono text-rose-800 break-words leading-relaxed max-h-48 overflow-y-auto">
                    <strong>{this.state.error?.toString()}</strong>
                    {this.state.errorInfo?.componentStack && (
                      <pre className="mt-2 text-[10px] text-rose-700 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
