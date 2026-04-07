import { createFileRoute, Link } from '@tanstack/react-router'
import { DollarSign, Scaling } from 'lucide-react'

export const Route = createFileRoute('/')({ component: HomePage })

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Good morning!'
  if (hour >= 12 && hour < 17) return 'Good afternoon!'
  if (hour >= 17 && hour < 21) return 'Good evening!'
  return 'Good night!'
}

function HomePage() {
  return (
    <div className="max-w-5xl mx-auto w-full px-4 py-8">
      <section className="mb-10">
        <p className="text-muted-foreground text-sm mb-1">{getGreeting()}</p>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
          What are we baking today?
        </h1>
      </section>

      <section>
        <h2 className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-4">
          Calculators
        </h2>
        <div className="flex flex-col gap-4">
          <Link to="/calculators/cake-cost" className="block no-underline">
            <article className="bg-card border-2 border-border rounded-md p-6 shadow-[4px_4px_0px_0px_var(--border)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_var(--border)] transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-secondary/20 rounded-md p-1.5">
                  <DollarSign className="h-5 w-5 text-secondary" />
                </div>
                <h3 className="font-semibold text-card-foreground text-lg">
                  Cake Cost
                </h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Calculate the total cost of your cake based on ingredients and portions.
              </p>
            </article>
          </Link>
          <Link to="/calculators/pan-scaling" className="block no-underline">
            <article className="bg-card border-2 border-border rounded-md p-6 shadow-[4px_4px_0px_0px_var(--border)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_var(--border)] transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-secondary/20 rounded-md p-1.5">
                  <Scaling className="h-5 w-5 text-secondary" />
                </div>
                <h3 className="font-semibold text-card-foreground text-lg">
                  Pan Scaling
                </h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Calculate the ingredient multiplier when switching between round pan sizes.
              </p>
            </article>
          </Link>
        </div>
      </section>
    </div>
  )
}
