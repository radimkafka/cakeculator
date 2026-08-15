import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Cylinder } from "lucide-react";
import { equivalentRoundDiameter, type RoundingMode } from "#/lib/pan-converter";
import { panScalingCoefficient } from "#/lib/pan-scaling";

export const Route = createFileRoute("/calculators/pan-converter")({
  component: PanConverterPage,
});

const inputClasses =
  "bg-background border-2 border-border rounded-md px-3 py-2 text-sm font-bold text-foreground placeholder:text-muted-foreground focus:outline-none focus:shadow-[2px_2px_0px_0px_var(--border)] transition-shadow w-28";

const badgeClasses =
  "text-xs font-bold uppercase bg-secondary text-secondary-foreground border-2 border-border rounded px-2 py-1 shadow-[2px_2px_0px_0px_var(--border)] select-none shrink-0";

const ROUNDING_OPTIONS: { id: RoundingMode; label: string }[] = [
  { id: "none", label: "None" },
  { id: "round", label: "Round" },
  { id: "ceil", label: "Ceil" },
];
 
function RoundingSelector({
  value,
  onChange,
}: {
  value: RoundingMode;
  onChange: (value: RoundingMode) => void;
}) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1 block">
        Rounding
      </label>
      <div className="flex items-center gap-1.5">
        {ROUNDING_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={
              option.id === value
                ? "text-xs font-bold uppercase bg-secondary text-secondary-foreground border-2 border-border rounded-md px-3 py-2.5 shadow-[2px_2px_0px_0px_var(--border)] select-none cursor-pointer"
                : "text-xs font-bold uppercase bg-background text-muted-foreground border-2 border-border rounded-md px-3 py-2.5 select-none cursor-pointer hover:text-foreground transition-colors"
            }
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function DimensionInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1 block">
        {label}
      </label>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min="0.1"
          step="0.1"
          placeholder={placeholder}
          className={inputClasses}
        />
        <span className={badgeClasses}>CM</span>
      </div>
    </div>
  );
}

function PanConverterPage() {
  const [width, setWidth] = useState("");
  const [length, setLength] = useState("");
  const [rectHeight, setRectHeight] = useState("");
  const [roundHeight, setRoundHeight] = useState("");
  const [recipeDiameter, setRecipeDiameter] = useState("");
  const [rounding, setRounding] = useState<RoundingMode>("none");

  const widthNum = parseFloat(width);
  const lengthNum = parseFloat(length);
  const rectHeightNum = parseFloat(rectHeight);
  const roundHeightNum = parseFloat(roundHeight);
  const recipeNum = parseFloat(recipeDiameter);

  const valid = widthNum > 0 && lengthNum > 0 && rectHeightNum > 0 && roundHeightNum > 0;
  const diameter = valid
    ? equivalentRoundDiameter(widthNum, lengthNum, rectHeightNum, roundHeightNum, rounding)
    : null;
  const coefficient =
    diameter !== null && recipeNum > 0 ? panScalingCoefficient(diameter, recipeNum) : null;

  return (
    <div className="max-w-5xl mx-auto w-full px-4 py-8">
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Cylinder size={28} className="text-foreground" />
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
            Pan Converter
          </h1>
        </div>
        <p className="text-muted-foreground text-sm mt-1">
          Find the round pan diameter matching the volume of a rectangular dish
        </p>
      </section>

      <div className="bg-card border-2 border-border rounded-md p-6 shadow-[4px_4px_0px_0px_var(--border)]">
        <h2 className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-4">
          Rectangular Dish
        </h2>
        <div className="flex flex-col md:flex-row gap-6">
          <DimensionInput label="Width" value={width} onChange={setWidth} placeholder="20" />
          <DimensionInput label="Length" value={length} onChange={setLength} placeholder="30" />
          <DimensionInput
            label="Height"
            value={rectHeight}
            onChange={setRectHeight}
            placeholder="5"
          />
        </div>

        <h2 className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-4 mt-8">
          Round Pan
        </h2>
        <div className="flex flex-col md:flex-row gap-6">
          <DimensionInput
            label="Height"
            value={roundHeight}
            onChange={setRoundHeight}
            placeholder="5"
          />
          <DimensionInput
            label="Recipe Diameter (Optional)"
            value={recipeDiameter}
            onChange={setRecipeDiameter}
            placeholder="15"
          />
          <RoundingSelector value={rounding} onChange={setRounding} />
        </div>

        {diameter !== null && (
          <div className="mt-6 bg-secondary border-2 border-border rounded-md px-4 py-3 shadow-[4px_4px_0px_0px_var(--border)] flex justify-between items-center">
            <span className="font-bold text-sm uppercase tracking-wide text-secondary-foreground">
              Equivalent Diameter
            </span>
            <span className="font-bold text-lg tabular-nums text-secondary-foreground">
              {diameter} cm
            </span>
          </div>
        )}

        {coefficient !== null && (
          <div className="mt-4 bg-secondary border-2 border-border rounded-md px-4 py-3 shadow-[4px_4px_0px_0px_var(--border)] flex justify-between items-center">
            <span className="font-bold text-sm uppercase tracking-wide text-secondary-foreground">
              Scale Factor
            </span>
            <div className="text-right">
              <span className="font-bold text-lg tabular-nums text-secondary-foreground">
                {coefficient}&times;
              </span>
              {coefficient === 1 && (
                <p className="text-xs text-secondary-foreground/70 mt-0.5">No scaling needed</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
