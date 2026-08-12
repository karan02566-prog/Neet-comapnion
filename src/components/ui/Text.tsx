import type { ElementType, ReactNode } from 'react'

type Variant = 'display' | 'heading' | 'subheading' | 'body' | 'caption' | 'meta'

const styles: Record<Variant, string> = {
  display: 'text-6xl md:text-8xl font-bold tracking-tight leading-none',
  heading: 'text-3xl md:text-4xl font-bold tracking-tight',
  subheading: 'text-xl md:text-2xl font-medium',
  body: 'text-base text-neutral leading-relaxed',
  caption: 'text-sm text-neutral',
  meta: 'text-xs uppercase tracking-widest text-neutral',
}

const defaultTags: Record<Variant, ElementType> = {
  display: 'h1',
  heading: 'h2',
  subheading: 'h3',
  body: 'p',
  caption: 'span',
  meta: 'span',
}

interface TextProps {
  variant: Variant
  as?: ElementType
  className?: string
  children: ReactNode
}

function Text({ variant, as, className = '', children }: TextProps) {
  const Tag = as ?? defaultTags[variant]
  return <Tag className={`${styles[variant]} ${className}`}>{children}</Tag>
}

export default Text