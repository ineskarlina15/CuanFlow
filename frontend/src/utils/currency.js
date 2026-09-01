export const formatCurrency = (valInIdr) => {
  const currency = localStorage.getItem('cuanflow_currency') || 'IDR'
  const num = Number(valInIdr) || 0

  if (currency === 'USD') {
    const inUsd = num / 16000
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(inUsd)
  }

  if (currency === 'EUR') {
    const inEur = num / 17500
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(inEur)
  }

  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)
}

export const getAlertThreshold = () => {
  return Number(localStorage.getItem('cuanflow_alert_threshold') || 80)
}
