import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Scaling } from "lucide-react"
import { panScalingCoefficient } from "#/lib/pan-scaling"

export const Route = createFileRoute("/calculators/pan-scaling")({
  component: PanScalingPage,
})

const inputClasses =
  "bg-background border-2 border-border rounded-md px-3 py-2 text-sm font-bold text-foreground placeholder:text-muted-foreground focus:outline-none focus:shadow-[2px_2px_0px_0px_var(--border)] transition-shadow w-28"

const badgeClasses =
  "text-xs font-bold uppercase bg-secondary text-secondary-foreground border-2 border-border rounded px-2 py-1 shadow-[2px_2px_0px_0px_var(--border)] select-none shrink-0"

function PanScalingPage() {
  const [original, setOriginal] = useState("15")
  const [target, setTarget] = useState("")

  const origNum = parseFloat(original)
  const targNum = parseFloat(target)
  const valid =
    !isNaN(origNum) && !isNaN(targNum) && origNum > 0 && targNum > 0
  const coefficient = valid ? panScalingCoefficient(targNum, origNum) : null

  return (
    <div className="max-w-5xl mx-auto w-full px-4 py-8">
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Scaling size={28} className="text-foreground" />
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
            Pan Size Scaling
          </h1>
        </div>
        <p className="text-muted-foreground text-sm mt-1">
          Calculate the ingredient multiplier when switching pan sizes
        </p>
      </section>

      <div className="bg-card border-2 border-border rounded-md p-6 shadow-[4px_4px_0px_0px_var(--border)]">
        <div className="flex flex-col md:flex-row gap-6">
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1 block">
              Original Size
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={original}
                onChange={(e) => setOriginal(e.target.value)}
                min="0.1"
                step="0.1"
                placeholder="15"
                className={inputClasses}
              />
              <span className={badgeClasses}>CM</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1 block">
              Target Size
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                min="0.1"
                step="0.1"
                placeholder=""
                className={inputClasses}
              />
              <span className={badgeClasses}>CM</span>
            </div>
          </div>
        </div>

        {coefficient !== null && (
          <div className="mt-6 bg-secondary border-2 border-border rounded-md px-4 py-3 shadow-[4px_4px_0px_0px_var(--border)] flex justify-between items-center">
            <span className="font-bold text-sm uppercase tracking-wide text-secondary-foreground">
              Scale Factor
            </span>
            <div className="text-right">
              <span className="font-bold text-lg tabular-nums text-secondary-foreground">
                {coefficient}&times;
              </span>
              {coefficient === 1 && (
                <p className="text-xs text-secondary-foreground/70 mt-0.5">
                  No scaling needed
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
