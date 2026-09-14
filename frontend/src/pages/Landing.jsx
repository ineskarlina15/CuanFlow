import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import CuanFlowLogo from '../components/CuanFlowLogo'
import { 
  ArrowRight, 
  Wallet, 
  TrendingUp, 
  Bell, 
  PieChart, 
  ShieldCheck, 
  Users, 
  ShieldAlert, 
  Layers, 
  Database,
  Lock,
  Activity,
  LineChart,
  CheckCircle2,
  Filter,
  Globe,
  Download,
  HelpCircle,
  ChevronDown,
  Sparkles,
  Award,
  Zap,
  Clock,
  ChevronRight,
  Menu,
  X,
  Home
} from 'lucide-react'

export default function Landing() {
  const { isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Interactive Calculator State
  const [monthlyIncome, setMonthlyIncome] = useState(10000000)
  const [savingsTargetPct, setSavingsTargetPct] = useState(25)

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  const scrollToTop = (e) => {
    e?.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const calculateSavings = () => {
    const monthlySavings = (monthlyIncome * savingsTargetPct) / 100
    const yearlySavings = monthlySavings * 12
    return {
      monthly: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(monthlySavings),
      yearly: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(yearlySavings)
    }
  }

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#F8FAFC] flex flex-col items-center justify-center gap-4 transition-colors">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-blue-600/30 blur-2xl opacity-40 animate-pulse" />
          <div className="relative p-4 rounded-3xl bg-white shadow-2xl flex items-center justify-center animate-spin-slow">
            <CuanFlowLogo iconOnly size="xl" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-1 mt-4">
          <span className="text-2xl font-black text-blue-900 tracking-tight font-heading">
            CUANFLOW
          </span>
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest animate-pulse">
            Memuat Sistem Keuangan...
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 selection:bg-blue-600/20 selection:text-blue-900 font-sans overflow-x-hidden">
      
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 left-1/3 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[140px] pointer-events-none" />
      <div className="absolute top-[800px] right-1/4 w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[140px] pointer-events-none" />

      {/* Header / Fixed Persistent Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs transition-all duration-300">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-slate-600 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <button onClick={scrollToTop} className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity">
            <CuanFlowLogo size="md" />
          </button>
        </div>

        {/* Navigation Links Desktop */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-bold text-slate-600">
          <a href="#features" className="hover:text-blue-600 transition-colors">Fitur Unggulan</a>
          <a href="#calculator" className="hover:text-blue-600 transition-colors">Simulasi Tabungan</a>
          <a href="#benefits" className="hover:text-blue-600 transition-colors">Keunggulan</a>
          <a href="#testimonials" className="hover:text-blue-600 transition-colors">Ulasan Pengguna</a>
          <a href="#faq" className="hover:text-blue-600 transition-colors">FAQ</a>
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-600/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Ke Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2.5 text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-600/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                Daftar Sekarang
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Mobile Responsive Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 z-40 bg-white border-b border-slate-200 p-6 flex flex-col gap-4 shadow-2xl lg:hidden animate-fade-in">
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="text-slate-800 font-bold text-sm py-2 border-b border-slate-100"
          >
            Fitur Unggulan
          </a>
          <a
            href="#calculator"
            onClick={() => setMobileMenuOpen(false)}
            className="text-slate-800 font-bold text-sm py-2 border-b border-slate-100"
          >
            Simulasi Tabungan
          </a>
          <a
            href="#benefits"
            onClick={() => setMobileMenuOpen(false)}
            className="text-slate-800 font-bold text-sm py-2 border-b border-slate-100"
          >
            Keunggulan
          </a>
          <a
            href="#testimonials"
            onClick={() => setMobileMenuOpen(false)}
            className="text-slate-800 font-bold text-sm py-2 border-b border-slate-100"
          >
            Ulasan Pengguna
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="text-slate-800 font-bold text-sm py-2"
          >
            FAQ
          </a>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative px-4 sm:px-8 pt-24 sm:pt-28 pb-20 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        <div className="flex-1 flex flex-col items-start gap-6 text-left">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-blue-200 bg-white text-slate-800 text-xs font-extrabold shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse shrink-0" />
            <span>Sistem Manajemen Keuangan Pribadi & Pembukuan Kas</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 font-heading leading-[1.15]">
            Kelola Uang Lebih Cerdas,<br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 bg-clip-text text-transparent">
              Capai Kebebasan Finansial.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed font-medium">
            CuanFlow membantu Anda mencatat transaksi harian, mengendalikan anggaran bulanan, menganalisis grafik pengeluaran, serta mendapatkan peringatan dini saat pengeluaran mendekati batas anggaran.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mt-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/transactions"
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-600/25 active:scale-[0.98] cursor-pointer text-base"
                >
                  <span>Kelola Transaksi & Kas</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/reports"
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold rounded-2xl transition-all active:scale-[0.98] cursor-pointer shadow-xs text-base"
                >
                  <span>Lihat Analisis Laporan</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-600/25 active:scale-[0.98] cursor-pointer text-base"
                >
                  <span>Mulai Sekarang (Gratis)</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold rounded-2xl transition-all active:scale-[0.98] cursor-pointer shadow-xs text-base"
                >
                  <span>Masuk Akun</span>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-6 mt-4 pt-6 border-t border-slate-200/80 w-full text-xs font-bold text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>100% Bebas Iklan</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Privasi Terjamin</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Multi Mata Uang</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Visualization Mockup */}
        <div className="flex-1 w-full max-w-lg lg:max-w-none flex items-center justify-center relative">
          <div className="relative w-full rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl flex flex-col gap-6 transform hover:scale-[1.01] transition-all duration-300">
            
            {/* Header Mock Card */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <CuanFlowLogo iconOnly size="md" />
                <div>
                  <h3 className="text-sm font-black text-slate-900">Ringkasan Dompet</h3>
                  <span className="text-xs text-slate-400 font-medium">Bulan September 2026</span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-extrabold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +Rp 8.500.000
              </span>
            </div>

            {/* Income & Expense Quick Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Pemasukan</span>
                <span className="text-lg font-black text-emerald-600">Rp 12.000.000</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Pengeluaran</span>
                <span className="text-lg font-black text-rose-600">Rp 3.500.000</span>
              </div>
            </div>

            {/* Live Budget Warning Alert Mockup */}
            <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/80 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1 text-xs">
                <span className="font-extrabold text-amber-800 uppercase tracking-wider">Peringatan Anggaran (80%)</span>
                <p className="text-amber-900 font-medium">
                  Kategori <strong>Food & Beverage</strong> telah terpakai 85% dari batas bulanan Rp 4.000.000.
                </p>
              </div>
            </div>

            {/* Recent Transaction Item Mockup */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center">
                  SAL
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800">Gaji Bulanan</span>
                  <span className="text-[11px] text-slate-400">10 Sep 2026 • Salary</span>
                </div>
              </div>
              <span className="text-sm font-black text-emerald-600">+Rp 12.000.000</span>
            </div>
          </div>
        </div>
      </section>

      {/* Moving Marquee Horizontal Stats Bar */}
      <section className="border-y border-slate-200/80 bg-white py-6 overflow-hidden">
        <div className="animate-marquee-infinite flex items-center gap-8 whitespace-nowrap">
          {[1, 2, 3].map((loop) => (
            <div key={loop} className="flex items-center gap-8 shrink-0">
              <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
                <span className="text-2xl font-black text-blue-600 font-heading">10.000+</span>
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Pengguna Aktif</span>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
                <span className="text-2xl font-black text-emerald-600 font-heading">Rp 50 M+</span>
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Transaksi Tercatat</span>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
                <span className="text-2xl font-black text-blue-600 font-heading">99.9%</span>
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Akurasi Laporan</span>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
                <span className="text-2xl font-black text-amber-500 font-heading">USD • EUR • IDR</span>
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">3 Mata Uang</span>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
                <span className="text-2xl font-black text-teal-600 font-heading">80% Alert</span>
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Peringatan Anggaran</span>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
                <span className="text-2xl font-black text-indigo-600 font-heading">Microservice</span>
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Arsitektur Cepat</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section: Feature Showcase ("Tunjukkan Apa Guna Ini Itu") */}
      <section id="features" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col gap-16">
        <div className="text-center flex flex-col items-center gap-3">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest bg-blue-50 border border-blue-200 px-4 py-1 rounded-full">
            Fitur & Manfaat Utama
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-heading">
            Semua yang Anda Butuhkan untuk Mengelola Uang
          </h2>
          <p className="text-slate-500 text-sm sm:text-base max-w-2xl font-medium">
            Pelajari guna dan manfaat masing-masing fitur CuanFlow dalam membantu keuangan Anda sehari-hari.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Feature 1: Dashboard Overview */}
          <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-xs hover:shadow-xl transition-all flex flex-col gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <PieChart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900 font-heading">Dashboard Analitik Real-Time</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              <strong>Gunanya:</strong> Memberikan ringkasan instan mengenai Total Pemasukan, Total Pengeluaran, dan Saldo Bersih bulan ini dalam 1 tampilan tanpa perlu menghitung manual.
            </p>
          </div>

          {/* Feature 2: Transaction Ledger & Filter */}
          <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-xs hover:shadow-xl transition-all flex flex-col gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900 font-heading">Buku Kas & Filter Transaksi</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              <strong>Gunanya:</strong> Mencatat seluruh transaksi uang keluar-masuk, serta memudahkan pencarian transaksi spesifik berdasarkan kata kunci, kategori, dan rentang tanggal.
            </p>
          </div>

          {/* Feature 3: Smart Budgeting & Warning Alerts */}
          <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-xs hover:shadow-xl transition-all flex flex-col gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900 font-heading">Anggaran & Warning Notifikasi</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              <strong>Gunanya:</strong> Membatasi pengeluaran per kategori (misal: Makan max Rp 1 Juta) dan memberi peringatan otomatis saat pemakaian mencapai 80% agar tidak boros.
            </p>
          </div>

          {/* Feature 4: Financial Reports & PDF/Excel Export */}
          <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-xs hover:shadow-xl transition-all flex flex-col gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900 font-heading">Laporan & Ekspor PDF & Excel</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              <strong>Gunanya:</strong> Menyediakan diagram breakdown persentase pengeluaran dan memungkinkan Anda mengunduh data laporan bulanan ke file PDF dan Excel untuk pembukuan.
            </p>
          </div>

          {/* Feature 5: Multi-Currency Support */}
          <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-xs hover:shadow-xl transition-all flex flex-col gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900 font-heading">Dukungan Multi-Mata Uang</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              <strong>Gunanya:</strong> Mengonversi dan menampilkan nilai finansial ke mata uang **Rupiah (Rp)**, **US Dollar ($)**, atau **Euro (€)** secara otomatis sesuai kebutuhan.
            </p>
          </div>

          {/* Feature 6: Category Management */}
          <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-xs hover:shadow-xl transition-all flex flex-col gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-all">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900 font-heading">Kategori Kustomisasi</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              <strong>Gunanya:</strong> Membebas pengelompokan jenis pengeluaran & pemasukan (Gaji, Makanan, Transportasi, Belanja) agar pencatatan lebih teratur.
            </p>
          </div>

        </div>
      </section>

      {/* Interactive Savings Estimator Calculator Section */}
      <section id="calculator" className="py-16 px-4 sm:px-8 bg-blue-600 text-white rounded-3xl max-w-7xl mx-auto shadow-2xl relative overflow-hidden my-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
          <div className="flex-1 flex flex-col gap-4">
            <span className="text-xs font-black uppercase tracking-widest text-blue-200 bg-blue-700 px-3.5 py-1 rounded-full w-max">
              Simulasi Keuangan Cerdas
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-heading leading-tight">
              Berapa Banyak Uang yang Bisa Anda Tabung Bersama CuanFlow?
            </h2>
            <p className="text-blue-100 text-sm font-medium leading-relaxed max-w-lg">
              Geser nilai pendapatan dan target tabungan bulanan Anda untuk melihat potensi akumulasi tabungan Anda dalam 1 tahun!
            </p>
          </div>

          <div className="flex-1 w-full max-w-md bg-white text-slate-800 p-8 rounded-3xl shadow-xl flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-500">Pendapatan Bulanan:</span>
                <span className="text-blue-600 font-extrabold text-sm">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(monthlyIncome)}
                </span>
              </div>
              <input
                type="range"
                min="2000000"
                max="50000000"
                step="1000000"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-500">Target Tabungan Bulanan:</span>
                <span className="text-emerald-600 font-extrabold text-sm">{savingsTargetPct}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={savingsTargetPct}
                onChange={(e) => setSavingsTargetPct(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                <span>Estimasi Tabungan Per Bulan:</span>
                <span className="text-slate-900 font-extrabold">{calculateSavings().monthly}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 pt-2 border-t border-slate-200">
                <span>Potensi Tabungan 1 Tahun:</span>
                <span className="text-emerald-600 font-black text-base">{calculateSavings().yearly}</span>
              </div>
            </div>

            {isAuthenticated ? (
              <Link
                to="/budgets"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm text-center rounded-xl transition-all shadow-md active:scale-[0.98]"
              >
                Atur Target Anggaran Sekarang
              </Link>
            ) : (
              <Link
                to="/register"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm text-center rounded-xl transition-all shadow-md active:scale-[0.98]"
              >
                Mulai Menabung Hari Ini
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Why Choose CuanFlow Section */}
      <section id="benefits" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col gap-12">
        <div className="text-center flex flex-col items-center gap-3">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest bg-blue-50 border border-blue-200 px-4 py-1 rounded-full">
            Keunggulan Utama
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-heading">
            Mengapa Memilih CuanFlow?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl border border-slate-200 bg-white flex flex-col gap-3">
            <Zap className="w-8 h-8 text-blue-600" />
            <h3 className="text-base font-black text-slate-900">Performa Super Cepat</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Sistem microservice memastikan pencatatan transaksi terjadi secara serentak tanpa *loading* lama.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white flex flex-col gap-3">
            <Lock className="w-8 h-8 text-emerald-600" />
            <h3 className="text-base font-black text-slate-900">Keamanan Terenkripsi</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Menggunakan autentikasi token JWT dan enkripsi sandi aman untuk menjaga kerahasiaan data Anda.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white flex flex-col gap-3">
            <Globe className="w-8 h-8 text-indigo-600" />
            <h3 className="text-base font-black text-slate-900">Akses Dari Mana Saja</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Tampilan responsif memudahkan Anda mengakses CuanFlow dari Laptop, Tablet, maupun HP.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white flex flex-col gap-3">
            <Award className="w-8 h-8 text-amber-500" />
            <h3 className="text-base font-black text-slate-900">100% Bebas Iklan</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Antarmuka bersih tanpa pop-up iklan yang mengganggu kenyamanan mengelola keuangan Anda.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 px-4 sm:px-8 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          <div className="text-center flex flex-col items-center gap-3">
            <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest bg-blue-50 border border-blue-200 px-4 py-1 rounded-full">
              Ulasan Pengguna
            </span>
            <h2 className="text-3xl font-black text-slate-900 font-heading">
              Kata Mereka Tentang CuanFlow
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col gap-4">
              <p className="text-xs text-slate-600 italic font-medium leading-relaxed">
                "CuanFlow sangat membantu bisnis UMKM kopi saya. Notifikasi batas anggarannya bikin pengeluaran beli bahan tidak pernah kebablasan lagi."
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-slate-200">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                  IK
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900">Ines Karlina</span>
                  <span className="text-[11px] text-slate-400">Pemilik UMKM Kopi</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col gap-4">
              <p className="text-xs text-slate-600 italic font-medium leading-relaxed">
                "Dukungan konversi ke US Dollar ($) di CuanFlow memudahkan saya saat mencatat pemasukan dari klien luar negeri."
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-slate-200">
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                  GP
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900">Galang Pratama</span>
                  <span className="text-[11px] text-slate-400">Freelance Designer</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col gap-4">
              <p className="text-xs text-slate-600 italic font-medium leading-relaxed">
                "Fitur ekspor laporan keuangan ke format PDF dan Excel sangat berguna untuk tugas kuliah akuntansi dan pembukuan bulanan."
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-slate-200">
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                  MA
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900">Mahasiswa Akuntansi</span>
                  <span className="text-[11px] text-slate-400">Pengguna CuanFlow</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="py-20 px-4 sm:px-8 max-w-4xl mx-auto flex flex-col gap-10">
        <div className="text-center flex flex-col items-center gap-3">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest bg-blue-50 border border-blue-200 px-4 py-1 rounded-full">
            Pertanyaan Umum
          </span>
          <h2 className="text-3xl font-black text-slate-900 font-heading">
            Sering Ditanyakan (FAQ)
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          {[
            {
              q: 'Apakah aplikasi CuanFlow ini gratis?',
              a: 'Ya, CuanFlow 100% gratis digunakan tanpa biaya tersembunyi dan bebas dari iklan yang mengganggu.'
            },
            {
              q: 'Bagaimana cara kerja fitur Peringatan Anggaran 80%?',
              a: 'Ketika jumlah transaksi pengeluaran Anda pada suatu kategori mencapai 80% dari batas anggaran bulanan yang Anda tetapkan, sistem secara otomatis akan menampilkan notifikasi peringatan berwarna kuning agar Anda bisa mengerem pengeluaran.'
            },
            {
              q: 'Bagaimana cara mengubah mata uang ke Dollar ($) atau Euro (€)?',
              a: 'Anda cukup masuk ke menu Account Settings di dalam dashboard, lalu pilih currency USD atau EUR dan tekan Save Settings. Seluruh total angka di dashboard akan otomatis terkonversi.'
            },
            {
              q: 'Apakah data laporan keuangan dan transaksi saya bisa diunduh ke PDF dan Excel?',
              a: 'Sangat bisa! Di menu Laporan Keuangan (Reports), terdapat tombol Ekspor PDF dan Ekspor Excel yang dapat mengunduh seluruh rekap transaksi Anda dalam 1x klik.'
            }
          ].map((faq, idx) => (
            <div key={idx} className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-xs">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-5 text-left font-bold text-slate-900 text-sm flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180 text-blue-600' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="p-5 pt-0 text-xs text-slate-500 leading-relaxed font-medium border-t border-slate-100">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="px-4 sm:px-8 pb-20 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 p-10 sm:p-14 text-white text-center flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden">
          {isAuthenticated ? (
            <>
              <h2 className="text-3xl sm:text-4xl font-black font-heading max-w-2xl leading-tight">
                Siap Melanjutkan Pengelolaan Keuangan Anda?
              </h2>
              <p className="text-blue-100 text-sm sm:text-base max-w-lg font-medium">
                Pantau pengeluaran bulanan dan analisis grafik transaksi Anda secara real-time.
              </p>
              <Link
                to="/dashboard"
                className="px-8 py-4 bg-white hover:bg-slate-100 text-blue-700 font-black text-base rounded-2xl transition-all shadow-xl active:scale-[0.98] cursor-pointer mt-2"
              >
                Buka Ringkasan Dashboard
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-3xl sm:text-4xl font-black font-heading max-w-2xl leading-tight">
                Siap Mengatur Keuangan Anda Lebih Cerdas Hari Ini?
              </h2>
              <p className="text-blue-100 text-sm sm:text-base max-w-lg font-medium">
                Bergabunglah bersama ribuan pengguna yang telah merasakan kemudahan mengelola finansial dengan CuanFlow.
              </p>
              <Link
                to="/register"
                className="px-8 py-4 bg-white hover:bg-slate-100 text-blue-700 font-black text-base rounded-2xl transition-all shadow-xl active:scale-[0.98] cursor-pointer mt-2"
              >
                Daftar Akun CuanFlow Sekarang
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Humanized Professional Fintech Footer */}
      <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 px-6 sm:px-12 border-t border-slate-800 font-sans">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <CuanFlowLogo size="md" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-medium max-w-sm">
              CuanFlow adalah platform sistem manajemen keuangan pribadi & bisnis UMKM yang didesain untuk transparansi pencatatan kas, pengelolaan anggaran, dan analisis analitik keuangan berbasis arsitektur microservice modern.
            </p>
            
            {/* Trust Badges */}
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px] font-bold text-slate-300">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>SSL Encrypted 256-Bit</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px] font-bold text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Bank-Level Privacy</span>
              </div>
            </div>
          </div>

          {/* Col 2: Fitur Utama */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-100 font-heading">Fitur Utama</h4>
            <ul className="flex flex-col gap-2 text-xs font-medium text-slate-400">
              <li><a href="#features" className="hover:text-white transition-colors">Dashboard Analitik</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Buku Kas & Filter Transaksi</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Manajemen Anggaran 80%</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Laporan & Ekspor PDF & Excel</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Multi Mata Uang (USD/EUR/IDR)</a></li>
            </ul>
          </div>

          {/* Col 3: Ekosistem Sistem */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-100 font-heading">Ekosistem Aplikasi</h4>
            <ul className="flex flex-col gap-2 text-xs font-medium text-slate-400">
              <li><span className="text-slate-300">Gateway Service (Port 8024)</span></li>
              <li><span className="text-slate-300">Auth Service (Port 8021)</span></li>
              <li><span className="text-slate-300">Finance Service (Port 8022)</span></li>
              <li><span className="text-slate-300">Notification Service (Port 8023)</span></li>
              <li><span className="text-slate-300">PostgreSQL Relational DB</span></li>
            </ul>
          </div>

          {/* Col 4: Pusat Bantuan & Alamat */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-100 font-heading">Bantuan & Kontak</h4>
            <div className="flex flex-col gap-2 text-xs text-slate-400 font-medium">
              <p>Email: <span className="text-slate-200">support@cuanflow.id</span></p>
              <p>Pengembang: <span className="text-slate-200">Ines Karlina</span></p>
              <p>Asal: <span className="text-slate-200">Kota Banjar, Jawa Barat, Indonesia</span></p>
              <p>Lokasi: <span className="text-slate-200">Kota Bandung, Jawa Barat, Indonesia</span></p>
              <div className="mt-2 pt-2 border-t border-slate-800 flex items-center gap-2 text-[11px] text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Sistem Beroperasi 24/7 Normal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium">
          <p>&copy; {new Date().getFullYear()} CuanFlow — Sistem Keuangan Terintegrasi. Seluruh hak cipta dilindungi undang-undang.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Kebijakan Privasi</span>
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Syarat & Ketentuan</span>
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Keamanan</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
