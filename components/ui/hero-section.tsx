"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRightIcon } from "lucide-react"
import { Mockup, MockupFrame } from "@/components/ui/mockup"
import { Glow } from "@/components/ui/glow"
import Image from "next/image"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

interface HeroAction {
  text: string
  href: string
  icon?: React.ReactNode
  variant?: "default" | "glow"
}

interface HeroProps {
  badge?: {
    text: string
    action: {
      text: string
      href: string
    }
  }
  title: string
  description: string
  actions: HeroAction[]
  image: {
    light: string
    dark: string
    alt: string
  }
}

export function HeroSection({ badge, title, description, actions, image }: HeroProps) {
  const { resolvedTheme } = useTheme()
  const imageSrc = resolvedTheme === "light" ? image.light : image.dark

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    if (targetId.startsWith("/")) {
      // Let the default navigation behavior handle page navigation
      return
    }

    e.preventDefault()

    const targetElement = document.getElementById(targetId.replace("#", ""))
    if (targetElement) {
      const navHeight = 64 // Height of fixed navigation
      const targetPosition = targetElement.offsetTop - navHeight

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      })
    }
  }

  return (
    <section
      className={cn(
        "bg-background text-foreground",
        "py-6 sm:py-8 md:py-12 lg:py-16 px-4",
        "fade-bottom overflow-hidden pb-0",
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:gap-12 pt-6 sm:pt-8 md:pt-12 lg:pt-16 sm:gap-24">
        <div className="flex flex-col items-center gap-4 sm:gap-6 text-center sm:gap-12">
          {/* Badge */}
          {badge && (
            <Badge variant="outline" className="animate-appear gap-2">
              <span className="text-muted-foreground text-xs sm:text-sm">{badge.text}</span>
              <a href={badge.action.href} className="flex items-center gap-1 text-xs sm:text-sm">
                {badge.action.text}
                <ArrowRightIcon className="h-3 w-3" />
              </a>
            </Badge>
          )}

          {/* Title */}
          <h1 className="relative z-10 inline-block animate-appear bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-semibold leading-tight text-transparent drop-shadow-2xl sm:leading-tight md:leading-tight">
            {title}
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-md md:text-xl relative z-10 max-w-[550px] animate-appear font-medium text-muted-foreground opacity-0 delay-100">
            {description}
          </p>

          {/* Actions */}
          <div className="relative z-10 flex animate-appear justify-center gap-2 sm:gap-4 opacity-0 delay-300 flex-wrap">
            {actions.map((action, index) => (
              <Button key={index} variant={action.variant} size="sm" className="sm:h-10 sm:px-6 min-h-[44px]" asChild>
                <a
                  href={action.href}
                  onClick={(e) => handleSmoothScroll(e, action.href)}
                  className="flex items-center gap-2"
                >
                  {action.icon}
                  {action.text}
                </a>
              </Button>
            ))}
          </div>

          {/* Image with Glow */}
          <div className="relative pt-8 sm:pt-12">
            <MockupFrame className="animate-appear opacity-0 delay-700" size="small">
              <Mockup type="responsive">
                <Image src={imageSrc || "/placeholder.svg"} alt={image.alt} width={1248} height={765} priority />
              </Mockup>
            </MockupFrame>
            <Glow variant="top" className="animate-appear-zoom opacity-0 delay-1000" />
          </div>
        </div>
      </div>
    </section>
  )
}
