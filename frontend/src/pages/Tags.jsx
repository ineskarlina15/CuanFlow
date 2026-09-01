import { useState } from 'react'
import { Tag as TagIcon, Plus, Trash2, Edit2, CheckCircle } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'

export default function Tags() {
  const { showToast } = useToast()
  const [tags, setTags] = useState([
    { id: 1, name: 'Personal', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { id: 2, name: 'Work', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    { id: 3, name: 'Urgent', color: 'bg-rose-100 text-rose-700 border-rose-200' },
    { id: 4, name: 'Investment', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    { id: 5, name: 'Subscription', color: 'bg-amber-100 text-amber-700 border-amber-200' }
  ])

  const [newTagName, setNewTagName] = useState('')

  const handleAddTag = (e) => {
    e.preventDefault()
    if (!newTagName.trim()) return

    const colorVariants = [
      'bg-blue-100 text-blue-700 border-blue-200',
      'bg-emerald-100 text-emerald-700 border-emerald-200',
      'bg-purple-100 text-purple-700 border-purple-200',
      'bg-amber-100 text-amber-700 border-amber-200'
    ]
    const randomColor = colorVariants[Math.floor(Math.random() * colorVariants.length)]

    const newTag = {
      id: Date.now(),
      name: newTagName.trim(),
      color: randomColor
    }

    setTags([...tags, newTag])
    setNewTagName('')
    showToast('Tag baru berhasil dibuat!', 'success')
  }

  const handleDeleteTag = (id) => {
    setTags(tags.filter((t) => t.id !== id))
    showToast('Tag dihapus', 'info')
  }

  return (
    <div className="flex-grow p-4 sm:p-6 lg:p-8 flex flex-col gap-6 w-full max-w-7xl mx-auto animate-fade-in text-slate-800 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
            Tag Transaksi
          </h1>
          <p className="text-xs text-slate-400 mt-1">Atur dan beri label pada transaksi keuangan Anda</p>
        </div>
      </div>

      {/* Add New Tag Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
        <form onSubmit={handleAddTag} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <TagIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Masukkan nama tag (cth. Liburan, Belanjaan)"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-xl py-2.5 pl-10 pr-4 text-slate-800 text-sm outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Tag</span>
          </button>
        </form>
      </div>

      {/* Tags Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center justify-between shadow-xs hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-2.5">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${tag.color}`}>
                #{tag.name}
              </span>
            </div>

            <button
              onClick={() => handleDeleteTag(tag.id)}
              className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
              title="Hapus Tag"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
