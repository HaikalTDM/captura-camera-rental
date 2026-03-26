export function extractFirstName(fullName: string | null | undefined): string {
  if (!fullName) return ''

  return fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)[0] || ''
}

export function maskCustomerName(fullName: string | null | undefined): string {
  const firstName = extractFirstName(fullName)

  if (!firstName) {
    return 'Customer'
  }

  if (firstName.length === 1) {
    return '*'
  }

  if (firstName.length === 2) {
    return `${firstName.slice(0, 1)}*`
  }

  if (firstName.length <= 4) {
    return `${firstName.slice(0, 2)}*`
  }

  return `${firstName.slice(0, 3)}***`
}
