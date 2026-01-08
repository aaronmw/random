// Simple counter-based network activity tracker
// Can be used outside React components

let activityCount = 0
let listeners: Set<(isActive: boolean) => void> = new Set()

export function startNetworkActivity() {
  activityCount++
  notifyListeners()
}

export function endNetworkActivity() {
  activityCount = Math.max(0, activityCount - 1)
  notifyListeners()
}

export function isNetworkActive(): boolean {
  return activityCount > 0
}

export function subscribe(listener: (isActive: boolean) => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function notifyListeners() {
  const isActive = activityCount > 0
  listeners.forEach((listener) => listener(isActive))
}
