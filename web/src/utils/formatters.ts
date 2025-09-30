export function thousandPointsFormatter(text: string): string {
  const value = parseInt(text)
  if (value === null || value === undefined || isNaN(value)) {
    return ''
  }

  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}
