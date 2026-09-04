// =========================================================
// CUANFLOW UTILITY FORMATTERS
// Standardisasi Formatting Nominal, Download Blob, & Auto-Capitalize
// =========================================================

/**
 * Mengunduh file binary (Blob/ArrayBuffer) secara aman tanpa korup
 */
export function downloadBlob(data, filename, defaultMime = 'application/octet-stream') {
  let blob = null

  if (data instanceof Blob) {
    blob = data
  } else if (data?.data instanceof Blob) {
    blob = data.data
  } else if (data instanceof ArrayBuffer || (data && typeof data === 'object')) {
    blob = new Blob([data], { type: defaultMime })
  } else {
    blob = new Blob([String(data)], { type: defaultMime })
  }

  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()

  setTimeout(() => {
    window.URL.revokeObjectURL(url)
    a.remove()
  }, 100)
}

/**
 * Mendapatkan simbol prefix mata uang aktif
 */
export function getCurrencyPrefix() {
  const curr = localStorage.getItem('cuanflow_currency') || 'IDR'
  if (curr === 'USD') return '$ '
  if (curr === 'EUR') return '€ '
  return 'Rp '
}

/**
 * Memformat string/angka menjadi tampilan input dengan pemisah ribuan
 * Contoh: 1500000 -> 1.500.000
 */
export function formatAmountInput(val) {
  if (val === null || val === undefined || val === '') return ''
  const cleaned = String(val).replace(/[^0-9]/g, '')
  if (!cleaned) return ''
  return new Intl.NumberFormat('id-ID').format(Number(cleaned))
}

/**
 * Mengubah string berformat ribuan kembali menjadi angka murni
 * Contoh: "1.500.000" atau "Rp 1.500.000" -> 1500000
 */
export function parseAmountInput(formattedStr) {
  if (!formattedStr) return 0
  const digitsOnly = String(formattedStr).replace(/[^0-9]/g, '')
  return digitsOnly ? Number(digitsOnly) : 0
}

/**
 * Mengubah huruf pertama setiap kata menjadi huruf besar (Title Case)
 * Kecuali jika string kosong
 */
export function capitalizeWords(str) {
  if (!str || typeof str !== 'string') return ''
  return str.replace(/\b\w/g, (char) => char.toUpperCase())
}

/**
 * Mengubah huruf pertama kalimat menjadi huruf besar
 */
export function capitalizeFirstLetter(str) {
  if (!str || typeof str !== 'string') return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}
