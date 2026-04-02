import { describe, expect, it } from 'vitest'

import pn from './'
import type { ParsedPhone } from './'

describe('Brazil — +55 prefix', () => {
  it('+5512997297095', () => {
    expect(pn('+5512997297095')).toMatchObject({
      code: '+55',
      number: '12997297095',
    })
  })

  it('+5511987654321 — São Paulo', () => {
    expect(pn('+5511987654321')).toMatchObject({
      code: '+55',
      number: '11987654321',
    })
  })

  it('+5521991234567 — Rio de Janeiro', () => {
    expect(pn('+5521991234567')).toMatchObject({
      code: '+55',
      number: '21991234567',
    })
  })

  it('+5534919934504 — ambiguous number resolved as Brazil via +55', () => {
    expect(pn('+5534919934504')).toMatchObject({
      code: '+55',
      number: '34919934504',
    })
  })

  it('+55 with any local number returns code and number', () => {
    expect(pn('+5523987654321')).toMatchObject({
      code: '+55',
      number: '23987654321',
    })
  })

  it('+55 with number not starting with 9 still returns code and number', () => {
    expect(pn('+5511887654321')).toMatchObject({
      code: '+55',
      number: '11887654321',
    })
  })
})

describe('Ambiguous countries — returns correct code', () => {
  const cases = [
    { input: '+27919934504', code: '+27' },
    { input: '+31919934504', code: '+31' },
    { input: '+32919934504', code: '+32' },
    { input: '+33919934504', code: '+33' },
    { input: '+34919934504', code: '+34' },
    { input: '+41919934504', code: '+41' },
    { input: '+43919934504', code: '+43' },
    { input: '+46919934504', code: '+46' },
    { input: '+48919934504', code: '+48' },
    { input: '+51919934504', code: '+51' },
    { input: '+61919934504', code: '+61' },
    { input: '+62919934504', code: '+62' },
    { input: '+64919934504', code: '+64' },
    { input: '+66919934504', code: '+66' },
    { input: '+81919934504', code: '+81' },
    { input: '+84919934504', code: '+84' },
    { input: '+91919934504', code: '+91' },
    { input: '+93919934504', code: '+93' },
    { input: '+94919934504', code: '+94' },
    { input: '+98919934504', code: '+98' },
  ]

  for (const { input, code } of cases) {
    it(`${input} → code: ${code}`, () => {
      expect(pn(input)).toMatchObject({ code, number: expect.any(String) })
    })
  }
})

describe('Other countries', () => {
  it('+351918875750 — Portugal', () => {
    expect(pn('+351918875750')).toMatchObject({
      code: '+351',
      number: '918875750',
    })
  })

  it('+12025550123 — USA', () => {
    expect(pn('+12025550123')).toMatchObject({
      code: '+1',
      number: '2025550123',
    })
  })

  it('+447911123456 — United Kingdom', () => {
    expect(pn('+447911123456')).toMatchObject({
      code: '+44',
      number: '7911123456',
    })
  })

  it('+2348012345678 — Nigeria (3-digit code)', () => {
    expect(pn('+2348012345678')).toMatchObject({
      code: '+234',
      number: '8012345678',
    })
  })

  it('+966512345678 — Saudi Arabia (3-digit code)', () => {
    expect(pn('+966512345678')).toMatchObject({
      code: '+966',
      number: '512345678',
    })
  })
})

describe('DDI without + prefix', () => {
  it('5511987654321 — Brazil without +', () => {
    expect(pn('5511987654321')).toMatchObject({
      code: '+55',
      number: '11987654321',
    })
  })

  it('5534919934504 — ambiguous number resolved as Brazil via 55', () => {
    expect(pn('5534919934504')).toMatchObject({
      code: '+55',
      number: '34919934504',
    })
  })

  it('351918875750 — Portugal without +', () => {
    expect(pn('351918875750')).toMatchObject({
      code: '+351',
      number: '918875750',
    })
  })

  it('34919934504 — Spain without +', () => {
    expect(pn('34919934504')).toMatchObject({
      code: '+34',
      number: '919934504',
    })
  })

  it('447911123456 — United Kingdom without +', () => {
    expect(pn('447911123456')).toMatchObject({
      code: '+44',
      number: '7911123456',
    })
  })

  it('12025550123 — USA without +', () => {
    expect(pn('12025550123')).toMatchObject({
      code: '+1',
      number: '2025550123',
    })
  })
})

describe('ISO country (alpha-2)', () => {
  it('Brazil', () => {
    expect(pn('+5511987654321')).toMatchObject({ country: 'BR' })
  })

  it('United States (+1)', () => {
    expect(pn('+12025550123')).toMatchObject({ country: 'US' })
  })

  it('Canada shares +1 with US in the calling-code map', () => {
    expect(pn('+14165550123')).toMatchObject({ country: 'US' })
  })

  it('Portugal', () => {
    expect(pn('+351918875750')).toMatchObject({ country: 'PT' })
  })

  it('United Kingdom', () => {
    expect(pn('+447911123456')).toMatchObject({ country: 'GB' })
  })
})

describe('Invalid inputs', () => {
  it('unknown country code returns reason', () => {
    expect(pn('+999123456789')).toMatchObject({ reason: expect.any(String) })
  })
})

describe('formatting', () => {
  it('toString() matches default toLocaleString()', () => {
    const p = pn('+5511987654321') as ParsedPhone
    expect(p.toString()).toBe(p.toLocaleString())
    expect(p.toString()).toBe('+55 (11) 98765-4321')
  })

  it('toLocaleString() uses internal mask for Brazil', () => {
    const p = pn('+5511987654321') as ParsedPhone
    expect(p.toLocaleString()).toBe('+55 (11) 98765-4321')
  })

  it('toLocaleString() uses internal mask for US', () => {
    const p = pn('+12025550123') as ParsedPhone
    expect(p.toLocaleString()).toBe('+1 (202) 555-0123')
  })

  it('toLocaleString() uses same NANP mask for Canada (+1)', () => {
    const p = pn('+14165550123') as ParsedPhone
    expect(p.toLocaleString()).toBe('+1 (416) 555-0123')
  })

  it('toLocaleString() uses internal mask for France', () => {
    const p = pn('+33612345678') as ParsedPhone
    expect(p.toLocaleString()).toBe('+33 6 12 34 56 78')
  })

  it('toLocaleString() uses internal mask for Germany', () => {
    const p = pn('+4915112345678') as ParsedPhone
    expect(p.toLocaleString()).toBe('+49 151 12345678')
  })

  it('toLocaleString() uses internal mask for Spain', () => {
    const p = pn('+34612345678') as ParsedPhone
    expect(p.toLocaleString()).toBe('+34 612 34 56 78')
  })

  it('toLocaleString() uses internal mask for Italy', () => {
    const p = pn('+393471234567') as ParsedPhone
    expect(p.toLocaleString()).toBe('+39 347 123 4567')
  })

  it('toLocaleString() falls back to code and national when no internal mask', () => {
    const p = pn('+376312345') as ParsedPhone
    expect(p.toLocaleString()).toBe('+376 312345')
  })

  it('toLocaleString(mask) fills x from country digits then national', () => {
    const p = pn('+5511987654321') as ParsedPhone
    expect(p.toLocaleString('+x (xx) x xxxx-xxxxx')).toBe(
      '+5 (51) 1 9876-54321',
    )
  })

  it('toLocaleString(mask) drops trailing digits when mask has fewer x than digits', () => {
    const p = pn('+5511987654321') as ParsedPhone
    expect(p.toLocaleString('+x (xx) x xxxx-xxxx')).toBe('+5 (51) 1 9876-5432')
  })

  it('applyMask on default export for direct use', () => {
    expect(pn.applyMask('+xx (xx) xxxxx-xxxx', '+55', '11987654321')).toBe(
      '+55 (11) 98765-4321',
    )
  })
})
