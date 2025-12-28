export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Method 1: Modern Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch (error) {
    console.log('Clipboard API failed, trying fallback:', error)
  }

  try {
    // Method 2: execCommand fallback
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)

    if (successful) {
      return true
    }
  } catch (error) {
    console.log('execCommand failed:', error)
  }

  try {
    // Method 3: Selection API fallback
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()

    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)

    if (successful) {
      return true
    }
  } catch (error) {
    console.log('Selection API fallback failed:', error)
  }

  return false
}

export function copyToClipboardWithFallback(text: string): void {
  copyToClipboard(text).then(success => {
    if (!success) {
      // Final fallback: prompt user to copy manually
      alert(`Please manually copy this text:\n\n${text}`)
    }
  })
}
