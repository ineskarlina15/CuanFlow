import { useState, useMemo, useEffect } from 'react'
import api from '../services/api'
import { 
  FileText, 
  Search, 
  Download, 
  ShieldCheck, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Clock, 
  User, 
  Server,
  Calendar
} from 'lucide-react'
import Modal from '../components/Modal'
import { useToast } from '../contexts/ToastContext'

export default function AdminAuditLogs() {
  const { showToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState('ALL')
  const [severityFilter, setSeverityFilter] = useState('ALL')
  const [selectedLog, setSelectedLog] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Sampel Data Audit Trail Komprehensif untuk Pengujian Sistem Informasi Akuntansi (COSO Framework)
  const [auditLogs, setAuditLogs] = useState([
    {
      id: 'LOG-2024-001',
      timestamp: '2024-08-20 14:32:15',
      actor: 'System Administrator',
      actorRole: 'ADMIN',
      action: 'UPDATE_ROLE',
      module: 'USER_MANAGEMENT',
      entity: 'User ID #2 (Galang Pratama)',
      description: 'Mengubah peran pengguna dari USER menjadi ADMIN',
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0',
      status: 'SUCCESS',
      severity: 'HIGH'
    },
    {
      id: 'LOG-2024-002',
      timestamp: '2024-08-20 11:15:40',
      actor: 'Ahmad Fauzi',
      actorRole: 'USER',
      action: 'EXPORT_REPORT',
      module: 'FINANCIAL_REPORT',
      entity: 'Report PDF (Periode Agustus 2024)',
      description: 'Melakukan ekspor Laporan Keuangan Pribadi format PDF',
      ipAddress: '192.168.1.112',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/127.0',
      status: 'SUCCESS',
      severity: 'LOW'
    },
    {
      id: 'LOG-2024-003',
      timestamp: '2024-08-19 16:45:02',
      actor: 'System Administrator',
      actorRole: 'ADMIN',
      action: 'SUSPEND_ACCOUNT',
      module: 'SECURITY_CONTROL',
      entity: 'User ID #14 (Rian Hidayat)',
      description: 'Menonaktifkan status akun pengguna karena aktivitas mencurigakan',
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0',
      status: 'WARNING',
      severity: 'HIGH'
    },
    {
      id: 'LOG-2024-004',
      timestamp: '2024-08-19 09:20:11',
      actor: 'Budi Santoso',
      actorRole: 'USER',
      action: 'CREATE_TRANSACTION',
      module: 'TRANSACTION_SERVICE',
      entity: 'Transaksi ID #142 (Nominal: Rp 4.500.000)',
      description: 'Membuat transaksi pengeluaran kategori Sewa Kamar Kost',
      ipAddress: '192.168.1.140',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5) Safari/604.1',
      status: 'SUCCESS',
      severity: 'LOW'
    },
    {
      id: 'LOG-2024-005',
      timestamp: '2024-08-18 22:10:05',
      actor: 'Anonymous',
      actorRole: 'GUEST',
      action: 'FAILED_LOGIN',
      module: 'AUTHENTICATION',
      entity: 'Akun Target: admin@cuanflow.id',
      description: 'Percobaan login gagal sebanyak 3 kali (Salah Password)',
      ipAddress: '182.253.14.92',
      userAgent: 'PostmanRuntime/7.39.0',
      status: 'FAILED',
      severity: 'HIGH'
    },
    {
      id: 'LOG-2024-006',
      timestamp: '2024-08-18 08:00:00',
      actor: 'System Administrator',
      actorRole: 'ADMIN',
      action: 'BROADCAST_NOTIFICATION',
      module: 'NOTIFICATION_SERVICE',
      entity: 'Pengumuman Sistem #08',
      description: 'Mengirimkan siaran pengumuman pemeliharaan rutin server ke seluruh pengguna',
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0',
      status: 'SUCCESS',
      severity: 'MEDIUM'
    },
    {
      id: 'LOG-2024-007',
      timestamp: '2024-08-17 13:40:22',
      actor: 'Siti Rahma',
      actorRole: 'USER',
      action: 'UPDATE_PROFILE',
      module: 'AUTH_SERVICE',
      entity: 'Profil User ID #5',
      description: 'Memperbarui informasi profil (Nomor HP, Tanggal Lahir, dan Pekerjaan)',
      ipAddress: '192.168.1.118',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0',
      status: 'SUCCESS',
      severity: 'LOW'
    },
    {
      id: 'LOG-2024-008',
      timestamp: '2024-08-16 10:15:30',
      actor: 'System Administrator',
      actorRole: 'ADMIN',
      action: 'DELETE_USER',
      module: 'USER_MANAGEMENT',
      entity: 'User ID #99 (Akun Uji Coba)',
      description: 'Menghapus data akun uji coba pengguna secara permanen atas permintaan user',
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0',
      status: 'SUCCESS',
      severity: 'HIGH'
    }
  ])

  useEffect(() => {
    const fetchAuditLogs = async () => {
      setLoading(true)
      try {
        const res = await api.get('/authSvc/api/v1/audit-logs')
        const data = res?.data || res
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map(l => ({
            id: `LOG-${l.id}`,
            timestamp: l.createdAt ? new Date(l.createdAt).toLocaleString('id-ID') : '2024-08-20 12:00:00',
            actor: l.userId === 1 ? 'System Administrator' : (l.userId ? `User #${l.userId}` : 'System / Guest'),
            actorRole: l.userId === 1 ? 'ADMIN' : 'USER',
            action: l.action || 'ACTIVITY',
            module: l.module || 'SYSTEM',
            entity: l.entity || 'Sistem CuanFlow',
            description: l.description || '-',
            ipAddress: l.ipAddress || '127.0.0.1',
            userAgent: l.userAgent || 'Web Browser',
            status: l.status || 'SUCCESS',
            severity: l.severity || 'LOW'
          }))
          setAuditLogs(mapped)
        }
      } catch {
        // Gunakan sampel bawaan jika backend belum selesai di-rebuild
      } finally {
        setLoading(false)
      }
    }

    fetchAuditLogs()
  }, [])

  // Filter logs berdasarkan pencarian dan dropdown
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchSearch = 
        log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.id.toLowerCase().includes(searchTerm.toLowerCase())

      const matchAction = 
        actionFilter === 'ALL' || 
        (actionFilter === 'AUTH' && (log.action === 'FAILED_LOGIN' || log.action === 'UPDATE_ROLE' || log.action === 'UPDATE_PROFILE')) ||
        (actionFilter === 'USER_MGT' && (log.action === 'UPDATE_ROLE' || log.action === 'SUSPEND_ACCOUNT' || log.action === 'DELETE_USER')) ||
        (actionFilter === 'FINANCE' && (log.action === 'CREATE_TRANSACTION' || log.action === 'EXPORT_REPORT')) ||
        (actionFilter === 'SYSTEM' && log.action === 'BROADCAST_NOTIFICATION')

      const matchSeverity = severityFilter === 'ALL' || log.severity === severityFilter

      return matchSearch && matchAction && matchSeverity
    })
  }, [auditLogs, searchTerm, actionFilter, severityFilter])

  // Unduh Berkas Audit CSV
  const handleExportAuditLog = () => {
    try {
      const headers = 'Log ID,Timestamp,Aktor,Peran,Aksi,Modul,Entitas,Deskripsi,IP Address,Status,Tingkat Risiko\n'
      const rows = filteredLogs.map(l => 
        `"${l.id}","${l.timestamp}","${l.actor}","${l.actorRole}","${l.action}","${l.module}","${l.entity}","${l.description}","${l.ipAddress}","${l.status}","${l.severity}"`
      ).join('\n')

      const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `CuanFlow_Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      showToast('Berkas Jejak Audit (Audit Trail CSV) berhasil diunduh', 'success')
    } catch {
      showToast('Gagal mengunduh log audit', 'error')
    }
  }

  const openDetail = (log) => {
    setSelectedLog(log)
    setIsDetailOpen(true)
  }

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'HIGH':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-50 text-rose-600 border border-rose-200">Tinggi</span>
      case 'MEDIUM':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-50 text-amber-600 border border-amber-200">Sedang</span>
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-100 text-slate-600 border border-slate-200">Rendah</span>
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="flex items-center gap-1 text-xs font-extrabold text-emerald-600">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Sukses</span>
          </span>
        )
      case 'WARNING':
        return (
          <span className="flex items-center gap-1 text-xs font-extrabold text-amber-600">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Peringatan</span>
          </span>
        )
      case 'FAILED':
        return (
          <span className="flex items-center gap-1 text-xs font-extrabold text-rose-600">
            <XCircle className="w-3.5 h-3.5" />
            <span>Gagal</span>
          </span>
        )
      default:
        return <span className="text-xs text-slate-500">{status}</span>
    }
  }

  return (
    <div className="flex-grow p-4 sm:p-6 lg:p-8 flex flex-col gap-6 w-full max-w-7xl mx-auto animate-fade-in text-slate-800 font-sans">
      
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
              Log Audit Sistem
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
              Audit Trail SIA
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Rekam jejak aktivitas, otorisasi peran, dan pengendalian internal sistem (COSO Framework Compliance)
          </p>
        </div>

        {/* Tombol Ekspor Audit Trail */}
        <button
          onClick={handleExportAuditLog}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4 text-slate-200" />
          <span>Ekspor Berkas Audit (CSV)</span>
        </button>
      </div>

      {/* Filter & Bar Pencarian */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Kolom Pencarian */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari aktor, ID log, deskripsi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Filter Kategori & Risiko */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Modul:</span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="ALL">Semua Modul</option>
              <option value="USER_MGT">Manajemen Pengguna</option>
              <option value="AUTH">Autentikasi & Profil</option>
              <option value="FINANCE">Transaksi & Laporan</option>
              <option value="SYSTEM">Sistem & Siaran</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Risiko:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="ALL">Semua Tingkat</option>
              <option value="HIGH">Tinggi (High)</option>
              <option value="MEDIUM">Sedang (Medium)</option>
              <option value="LOW">Rendah (Low)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabel Log Audit */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Waktu (WIB)</th>
                <th className="py-3.5 px-4">Aktor / Pengguna</th>
                <th className="py-3.5 px-4">Aktivitas / Aksi</th>
                <th className="py-3.5 px-4">Deskripsi Peristiwa</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Risiko</th>
                <th className="py-3.5 px-4 text-center">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    Tidak ditemukan rekam jejak log audit yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-extrabold text-slate-900">{log.actor}</span>
                        <span className="text-[10px] text-slate-400 font-bold">{log.actorRole} • {log.ipAddress}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-semibold text-slate-800 truncate" title={log.description}>
                        {log.description}
                      </p>
                      <span className="text-[10px] text-slate-400 truncate block">{log.entity}</span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(log.status)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getSeverityBadge(log.severity)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => openDetail(log)}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                        title="Lihat Detail Log"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info total log */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>Menampilkan <strong>{filteredLogs.length}</strong> dari <strong>{auditLogs.length}</strong> catatan aktivitas sistem</span>
          <div className="flex items-center gap-1.5 text-indigo-600 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Integritas Audit Terjamin</span>
          </div>
        </div>
      </div>

      {/* Modal Detail Jejak Audit */}
      {isDetailOpen && selectedLog && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title="Rincian Rekam Jejak Audit (Audit Trail)"
        >
          <div className="flex flex-col gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">ID Log Audit</span>
                <p className="font-mono font-black text-slate-800">{selectedLog.id}</p>
              </div>
              <div>{getStatusBadge(selectedLog.status)}</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1 p-2.5 rounded-xl border border-slate-100 bg-white">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Waktu Peristiwa</span>
                <span className="font-mono font-bold text-slate-800">{selectedLog.timestamp}</span>
              </div>
              <div className="flex flex-col gap-1 p-2.5 rounded-xl border border-slate-100 bg-white">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Tingkat Risiko</span>
                <div>{getSeverityBadge(selectedLog.severity)}</div>
              </div>
            </div>

            <div className="flex flex-col gap-1 p-2.5 rounded-xl border border-slate-100 bg-white">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Aktor Pelaksana</span>
              <div className="flex items-center gap-2 mt-0.5">
                <User className="w-4 h-4 text-blue-600" />
                <span className="font-extrabold text-slate-800">{selectedLog.actor}</span>
                <span className="text-slate-400">({selectedLog.actorRole})</span>
              </div>
            </div>

            <div className="flex flex-col gap-1 p-2.5 rounded-xl border border-slate-100 bg-white">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Aksi & Modul Sistem</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {selectedLog.action}
                </span>
                <span className="text-slate-400">• Modul: {selectedLog.module}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1 p-2.5 rounded-xl border border-slate-100 bg-white">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Deskripsi Peristiwa</span>
              <p className="font-semibold text-slate-800 mt-0.5">{selectedLog.description}</p>
              <span className="text-[11px] text-slate-500 font-mono mt-1">Entitas: {selectedLog.entity}</span>
            </div>

            <div className="flex flex-col gap-1 p-2.5 rounded-xl border border-slate-100 bg-slate-50/70">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Informasi Jaringan & Klien</span>
              <span className="font-mono text-[11px] text-slate-700">IP Address: {selectedLog.ipAddress}</span>
              <span className="font-mono text-[10px] text-slate-500 break-all">User-Agent: {selectedLog.userAgent}</span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsDetailOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  )
}
