import { useState, useEffect } from 'react'
import { Bell, Globe, Save } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'

export default function Settings() {
  const { showToast } = useToast()
  
  const [currency, setCurrency] = useState(() => localStorage.getItem('cuanflow_currency') || 'IDR')
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => localStorage.getItem('cuanflow_notif_enabled') !== 'false')
  const [budgetAlertThreshold, setBudgetAlertThreshold] = useState(() => localStorage.getItem('cuanflow_alert_threshold') || '80')

  useEffect(() => {
    const savedCurrency = localStorage.getItem('cuanflow_currency')
    if (savedCurrency) setCurrency(savedCurrency)
    
    const savedNotif = localStorage.getItem('cuanflow_notif_enabled')
    if (savedNotif !== null) setNotificationsEnabled(savedNotif !== 'false')

    const savedThreshold = localStorage.getItem('cuanflow_alert_threshold')
    if (savedThreshold) setBudgetAlertThreshold(savedThreshold)
  }, [])

  const handleSave = (e) => {
    e.preventDefault()
    localStorage.setItem('cuanflow_currency', currency)
    localStorage.setItem('cuanflow_notif_enabled', notificationsEnabled)
    localStorage.setItem('cuanflow_alert_threshold', budgetAlertThreshold)

    // Notify all app components to re-render with new currency/threshold
    window.dispatchEvent(new Event('cuanflow_settings_updated'))

    showToast(`Pengaturan berhasil disimpan! Mata Uang: ${currency}, Ambang Batas Peringatan: ${budgetAlertThreshold}%`, 'success')
  }

  return (
    <div className="flex-grow p-4 sm:p-6 lg:p-8 flex flex-col gap-6 w-full max-w-7xl mx-auto animate-fade-in text-slate-800 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
            Pengaturan Akun
          </h1>
          <p className="text-xs text-slate-400 mt-1">Kelola preferensi aplikasi dan keamanan Anda</p>
        </div>
      </div>

      {/* Settings Form Card */}
      <form onSubmit={handleSave} className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 flex flex-col gap-6 shadow-xs max-w-3xl">
        
        {/* Preference 1: Currency */}
        <div className="flex flex-col gap-2 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-sm font-black text-slate-900 font-heading">
            <Globe className="w-4 h-4 text-blue-600" />
            <span>Mata Uang & Format</span>
          </div>
          <p className="text-xs text-slate-400">Pilih mata uang utama untuk semua total keuangan</p>
          
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="mt-2 w-full sm:w-72 bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-800 text-sm font-semibold outline-none focus:border-blue-600 cursor-pointer transition-all"
          >
            <option value="IDR">IDR - Indonesian Rupiah (Rp)</option>
            <option value="USD">USD - US Dollar ($)</option>
            <option value="EUR">EUR - Euro (€)</option>
          </select>
        </div>

        {/* Preference 2: Notification Alerts */}
        <div className="flex flex-col gap-2 pb-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sm font-black text-slate-900 font-heading">
                <Bell className="w-4 h-4 text-amber-500" />
                <span>Peringatan Anggaran & Notifikasi</span>
              </div>
              <p className="text-xs text-slate-400">Terima peringatan saat pengeluaran mendekati batas anggaran</p>
            </div>

            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
              className="w-5 h-5 accent-blue-600 cursor-pointer"
            />
          </div>

          {notificationsEnabled && (
            <div className="mt-3 flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Ambang Batas Peringatan (%)</label>
              <select
                value={budgetAlertThreshold}
                onChange={(e) => setBudgetAlertThreshold(e.target.value)}
                className="w-full sm:w-72 bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-800 text-sm font-semibold outline-none focus:border-blue-600 cursor-pointer transition-all"
              >
                <option value="50">50% dari Anggaran</option>
                <option value="70">70% dari Anggaran</option>
                <option value="80">80% dari Anggaran (Disarankan)</option>
                <option value="90">90% dari Anggaran</option>
                <option value="100">100% dari Anggaran</option>
              </select>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Pengaturan</span>
          </button>
        </div>
      </form>
    </div>
  )
}
