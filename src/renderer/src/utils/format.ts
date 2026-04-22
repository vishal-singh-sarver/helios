export function formatBytes(bytes: number): string {
  if (Number.isNaN(bytes) || bytes < 0) return '—'
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let value = bytes
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

export function formatRelativeDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const diffMs = Date.now() - d.getTime()
  if (diffMs < 0) return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`
  const diffDays = Math.floor(diffMs / 86_400_000)
  if (diffDays < 1) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays <= 6) return `${diffDays} days ago`
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`
}
