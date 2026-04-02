import { afterEach, describe, expect, it } from 'vitest'

import phonenumber, { Locale, defaultMessagesEn } from './br'

afterEach(() => {
  phonenumber.setLocale('en', { ...defaultMessagesEn })
})

describe('phonenumber /br', () => {
  it('parses SP mobile and validates', () => {
    const p = phonenumber('+5511987654321')
    expect(p.valid()).toBe(true)
    expect(p.type()).toBe('mobile')
    expect(p.isMobile()).toBe(true)
    expect(p.isLinephone()).toBe(false)
    expect(p.messages()).toEqual([])
    expect(p.code).toBe('+55')
    expect(p.number).toBe('11987654321')
  })

  it('parses landline and validates', () => {
    const p = phonenumber('+551133334444')
    expect(p.valid()).toBe(true)
    expect(p.type()).toBe('linephone')
    expect(p.isMobile()).toBe(false)
    expect(p.isLinephone()).toBe(true)
  })

  it('rejects invalid DDD', () => {
    const p = phonenumber('+5523987654321')
    expect(p.valid()).toBe(false)
    expect(p.type()).toBe('unknown')
    expect(p.messages().length).toBeGreaterThan(0)
  })

  it('non-Brazil parse returns valid false', () => {
    const p = phonenumber('+34612345678')
    expect(p.valid()).toBe(false)
    expect(p.type()).toBe('unknown')
    expect(p.messages()).toEqual(['Not a Brazilian number'])
  })

  it('parse failure returns empty code and messages', () => {
    const p = phonenumber('abc')
    expect(p.valid()).toBe(false)
    expect(p.type()).toBe('unknown')
    expect(p.code).toBe('')
    expect(p.messages()[0]).toMatch(/unknown country code/i)
  })

  it('setLocale overrides strings for the active locale', () => {
    phonenumber.setLocale('br', {
      [Locale.NOT_BRAZILIAN_NUMBER]: 'Não é um número brasileiro',
    })
    const p = phonenumber('+34612345678')
    expect(p.messages()).toEqual(['Não é um número brasileiro'])
    expect(phonenumber.getLocale()).toBe('br')
  })

  it('messages() re-resolves when locale was switched after parse', () => {
    const p = phonenumber('+34612345678')
    expect(p.messages()[0]).toBe('Not a Brazilian number')
    phonenumber.setLocale('br', {
      [Locale.NOT_BRAZILIAN_NUMBER]: 'Custom',
    })
    expect(p.messages()).toEqual(['Custom'])
  })

  it('rejects too-short national with NATIONAL_TOO_SHORT', () => {
    const p = phonenumber('+551198765')
    expect(p.valid()).toBe(false)
    expect(p.messages()[0]).toMatch(/DDD|subscriber|10 digits/i)
  })
})
