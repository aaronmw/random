"use client"

import { IconButton } from "@/app/components/IconButton"
import Image from "next/image"

export default function AboutPage() {
  return (
    <div
      className="
        flex
        h-full
        w-full
        flex-col
        items-center
        justify-center
        gap-6
        p-12
      "
    >
      <div
        className="
          relative
          size-[100px]
          overflow-hidden
          rounded-full
          bg-cover
        "
      >
        <Image
          alt="Photo of Me"
          src="/headshot.png"
          fill={true}
        />
      </div>

      <div className="text-lg">Aaron M. Wright</div>

      <div
        className="
          flex
          items-center
          gap-3
          text-lg
        "
      >
        <IconButton
          iconName="figma"
          iconVariant="brands"
          label="Figma"
          onClick={() => window.open("https://www.figma.com/@aaronmw")}
        />
        <IconButton
          iconName="github"
          iconVariant="brands"
          label="Github"
          onClick={() => window.open("https://github.com/aaronmw/random")}
        />
        <IconButton
          iconName="linkedin"
          iconVariant="brands"
          label="LinkedIn"
          onClick={() =>
            window.open("https://www.linkedin.com/in/aaron-wright-849a887/")
          }
        />
        <IconButton
          iconName="envelope"
          label="Email"
          onClick={() => window.open("mailto:aaronmw@gmail.com?subject=Randy")}
        />
        <IconButton
          iconName="instagram"
          iconVariant="brands"
          label="Instagram"
          onClick={() => window.open("https://www.instagram.com/aaronmw/")}
        />
        <IconButton
          className="
            flex
            size-10
            items-center
            justify-center
            rounded-full
            border-4
            border-amber-300
            bg-amber-500
            text-white
            hover:bg-amber-400
          "
          iconName="cup-togo"
          iconVariant="solid"
          label="Tip Jar"
          onClick={() => window.open("https://ko-fi.com/aaronwright")}
        />
      </div>

      <div>
        I&rsquo;m a Product Designer in Toronto, Canada. I sometimes build Figma
        plugins to accelerate tedious tasks.
      </div>
    </div>
  )
}
