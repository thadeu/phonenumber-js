import { describe, expect, it } from 'vitest'

import { maskModeFromElement } from './functions.js'
import { digits, fallback, partial } from './index'

function elWithMask(value: string | null): HTMLElement {
  return {
    getAttribute(name: string) {
      return name === 'data-phonenumber-mask' ? value : null
    },
  } as unknown as HTMLElement
}

describe('digits', () => {
  it('strips + and non-digits', () => {
    expect(digits('+34')).toBe('34')
    expect(digits('34')).toBe('34')
  })
})

describe('partial', () => {
  it('formats full stream for Spain mask', () => {
    const m = '+xx xxx xx xx xx'
    expect(partial(m, '34612345678')).toBe('+34 612 34 56 78')
  })

  it('stops when digits run out', () => {
    const m = '+xx xxx xx xx xx'
    expect(partial(m, '34')).toBe('+34')
    expect(partial(m, '346')).toBe('+34 6')
  })

  it('strips non-digits from stream', () => {
    expect(partial('+xx (xx) xxxxx-xxxx', '55-11 98765-4321')).toBe(
      '+55 (11) 98765-4321',
    )
  })
})

describe('fallback', () => {
  it('builds +xx and national x slots', () => {
    expect(fallback('376', 6)).toBe('+xxx xxxxxx')
  })
})

describe('maskModeFromElement', () => {
  it('maps attribute value to mode', () => {
    expect(maskModeFromElement(elWithMask(null))).toBe('vanilla')
    expect(maskModeFromElement(elWithMask(''))).toBe('vanilla')
    expect(maskModeFromElement(elWithMask('  DEFAULT  '))).toBe('vanilla')
    expect(maskModeFromElement(elWithMask('agnostic'))).toBe('vanilla')
    expect(maskModeFromElement(elWithMask('react'))).toBe('react')
    expect(maskModeFromElement(elWithMask('jquery'))).toBe('jquery')
    expect(maskModeFromElement(elWithMask('unknown'))).toBe('vanilla')
  })
})
