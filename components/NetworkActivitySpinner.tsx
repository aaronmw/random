'use client'

import { Icon } from '@/components/Icon'
import { useNetworkActivity } from '@/lib/hooks/useNetworkActivity'
import { twJoin } from 'tailwind-merge'

export function NetworkActivitySpinner() {
  const { isActive } = useNetworkActivity()

  return (
    <div
      className={twJoin(
        'fixed bottom-4 right-4 z-50',
        'transition-opacity duration-300 ease-in-out',
        isActive ? 'opacity-100' : 'opacity-0 pointer-events-none',
      )}
    >
      <div className="flex items-center justify-center size-8 rounded-full bg-bg border border-border shadow-lg">
        <Icon
          name="loader"
          className="animate-spin text-text-secondary"
        />
      </div>
    </div>
  )
}
