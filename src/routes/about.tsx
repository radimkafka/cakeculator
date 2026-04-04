import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: AboutPage,
})

function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto w-full px-4 py-12">
      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-6">
        About
      </h1>
      <div className="bg-card border-2 border-border rounded-md p-6 shadow-[4px_4px_0px_0px_var(--border)]">
        <p className="text-muted-foreground leading-relaxed">
          Cakeculator is a progressive web app built for bakers. Whether
          you&apos;re converting between metric and imperial units, scaling a
          recipe for a different number of servings, or juggling multiple
          timers during a complex bake, cakeculator has you covered. It works
          offline, runs on any device, and keeps your baking math simple.
        </p>
      </div>
    </div>
  )
}
