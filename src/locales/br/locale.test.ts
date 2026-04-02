import { afterEach, describe, expect, it } from 'vitest'

import {
  Locale,
  defaultMessagesEn,
  formatMessageRefs,
  getLocale,
  setLocale,
  translateMessage,
} from './locale'

afterEach(() => {
  setLocale('en', { ...defaultMessagesEn })
})

describe('locales/br/locale', () => {
  it('Locale exposes stable string keys', () => {
    expect(Locale.NOT_BRAZILIAN_NUMBER).toBe('NOT_BRAZILIAN_NUMBER')
  })

  it('translateMessage uses English by default', () => {
    expect(translateMessage({ key: Locale.NOT_BRAZILIAN_NUMBER })).toBe(
      'Not a Brazilian number',
    )
  })

  it('setLocale merges and switches active locale', () => {
    setLocale('br', {
      [Locale.NOT_BRAZILIAN_NUMBER]: 'Não é BR',
    })
    expect(getLocale()).toBe('br')
    expect(translateMessage({ key: Locale.NOT_BRAZILIAN_NUMBER })).toBe(
      'Não é BR',
    )
  })

  it('interpolates params', () => {
    expect(
      translateMessage({
        key: Locale.PARSE_ERROR,
        params: { detail: 'x' },
      }),
    ).toBe('Parse error: x')
  })

  it('formatMessageRefs maps refs to strings', () => {
    const out = formatMessageRefs([
      { key: Locale.NATIONAL_TOO_SHORT },
      { key: Locale.SUBSCRIBER_BAD_START, params: { digit: '0' } },
    ])
    expect(out).toHaveLength(2)
    expect(out[1]).toContain('0')
  })
})
