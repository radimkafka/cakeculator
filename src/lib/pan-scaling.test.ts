import { describe, it, expect } from 'vitest'
import { panScalingCoefficient } from './pan-scaling'

describe('panScalingCoefficient', () => {
  it('returns 1 for same size', () => {
    expect(panScalingCoefficient(15, 15)).toBe(1)
  })

  it('returns 4 for double diameter', () => {
    expect(panScalingCoefficient(30, 15)).toBe(4)
  })

  it('returns 0.25 for half diameter', () => {
    expect(panScalingCoefficient(7.5, 15)).toBe(0.25)
  })

  it('returns 1.78 for 20 to 15 scale-up', () => {
    expect(panScalingCoefficient(20, 15)).toBe(1.78)
  })

  it('returns 1.28 for 17 to 15 scale-up', () => {
    expect(panScalingCoefficient(17, 15)).toBe(1.28)
  })

  it('returns 1.44 for 18 to 15 scale-up', () => {
    expect(panScalingCoefficient(18, 15)).toBe(1.44)
  })

  it('returns 0 for zero original diameter', () => {
    expect(panScalingCoefficient(20, 0)).toBe(0)
  })

  it('returns 0 for zero target diameter', () => {
    expect(panScalingCoefficient(0, 15)).toBe(0)
  })

  it('returns 0 for negative original diameter', () => {
    expect(panScalingCoefficient(20, -5)).toBe(0)
  })

  it('returns 0 for negative target diameter', () => {
    expect(panScalingCoefficient(-5, 15)).toBe(0)
  })
})
