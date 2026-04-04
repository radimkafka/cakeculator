import { Link } from '@tanstack/react-router'
import ThemeToggle from '#/components/ThemeToggle'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background">
      <div className="max-w-5xl mx-auto w-full px-4 flex items-center justify-between py-3">
        <Link to="/" className="no-underline">
          <span className="font-serif text-xl font-bold">
            <span className="text-foreground">cake</span>
            <span className="text-accent">culator</span>
          </span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  )
}
