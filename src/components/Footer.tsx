export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t-2 border-border bg-background">
      <div className="max-w-5xl mx-auto w-full px-4 py-6 flex flex-col items-center gap-1 text-center">
        <p className="text-muted-foreground text-sm">
          &copy; {year} cakeculator
        </p>
        <p className="text-muted-foreground text-sm">
          Baking utilities for everyone
        </p>
      </div>
    </footer>
  )
}
