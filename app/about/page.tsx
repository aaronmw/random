'use client'

import { Icon } from '@/components/Icon'
import Image from 'next/image'

export default function AboutPage() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-9 p-12">
      <div className="relative size-[100px] overflow-hidden rounded-full bg-cover">
        <Image
          alt="Photo of Me"
          src="/headshot.png"
          fill={true}
        />
      </div>

      <div className="text-lg">Aaron M. Wright</div>

      <div className="flex items-center gap-5 text-lg">
        {(
          [
            ['Figma', 'brands:figma', 'https://www.figma.com/@aaronmw'],
            ['Github', 'brands:github', 'https://github.com/aaronmw/random'],
            [
              'LinkedIn',
              'brands:linkedin',
              'https://www.linkedin.com/in/aaron-wright-849a887/',
            ],
            [
              'Email',
              'solid:envelope',
              'mailto:aaronmw@gmail.com?subject=Randy',
            ],
            [
              'Instagram',
              'brands:instagram',
              'https://www.instagram.com/aaronmw/',
            ],
            ['Tip Jar', 'solid:dollar-sign', 'https://ko-fi.com/aaronwright'],
          ] as const
        ).map(([label, icon, href]) => (
          <a
            key={href}
            className="button-icon"
            href={href}
          >
            <Icon name={icon} />
            <span className="sr-only">{label}</span>
          </a>
        ))}
      </div>

      <div>
        I&rsquo;m a Product Designer in Toronto, Canada. I sometimes build Figma
        plugins to accelerate tedious tasks.
      </div>
    </div>
  )
}
