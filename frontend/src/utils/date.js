// Local date-only helpers (no timezone surprises)
export function parseDateOnly(dateStr) {
  // dateStr: 'YYYY-MM-DD'
  if (!dateStr) return null
  const [y, m, d] = dateStr.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

export function startOfToday() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

export function compareDateStr(a, b) {
  const da = parseDateOnly(a)
  const db = parseDateOnly(b)
  if (!da && !db) return 0
  if (!da) return 1
  if (!db) return -1
  return da - db
}

export function addDays(date, days) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  d.setDate(d.getDate() + days)
  return d
}

export function isSameDayStr(a, b) {
  return compareDateStr(a, b) === 0
}