function pad(value) {
  return String(value).padStart(2, '0')
}

function formatDateTime(value) {
  if (!value) return ''

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hour = pad(date.getHours())
  const minute = pad(date.getMinutes())

  return `${year}-${month}-${day} ${hour}:${minute}`
}

function formatAmount(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '¥0.00'

  return `¥${amount.toFixed(2)}`
}

function nowText() {
  return formatDateTime(new Date())
}

module.exports = {
  formatDateTime,
  formatAmount,
  nowText
}
