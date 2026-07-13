"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

type ScrollRevealProps = {
  children: ReactNode
  className?: string
  /** delay in ms before the reveal transition starts */
  delay?: number
  /** direction the element travels from as it reveals */
  from?: "up" | "down" | "left" | "right" | "scale"
  as?: "div" | "section" | "li"
}

const hiddenTransform: Record<NonNullable<ScrollRevealProps["from"]>, string> = {
  up: "translate-y-10",
  down: "-translate-y-10",
  left: "translate-x-10",
  right: "-translate-x-10",
  scale: "scale-95",
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  from = "up",
  as = "div",
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Respect reduced motion preferences
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const Tag = as as "div"

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      className={`transition-all duration-700 ease-out will-change-transform ${
        visible ? "opacity-100 translate-x-0 translate-y-0 scale-100" : `opacity-0 ${hiddenTransform[from]}`
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  )
}
