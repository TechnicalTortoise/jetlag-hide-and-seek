export function downloadFile(data: string) {
  const blob = new Blob([data], {
    type: 'text/plain',
  })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url

  link.download = `jetlag_${Date.now()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
