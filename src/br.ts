import phonenumber from './'
import type { ParsedPhone, Result } from './'

import {
  Locale,
  formatMessageRefs,
  getLocale,
  setLocale,
  translateMessage,
  type MessageRef,
} from './locales/br/locale'

/** Full national number (no +55), digits only. */
const REGEX_PHONE_NUMBER =
  /^(55)?(([14689][1-9]|2[12478]|3[1-578]|5[13-5]|7[134579])([2-57]|9[1-9])|(90(9[0-9]|[2-57])))\d{7}$/

export type BrazilPhoneType = 'mobile' | 'linephone' | 'unknown'

function classifyBrazilNational(ok: boolean, national: string): BrazilPhoneType {
  if (!ok) {
    return 'unknown'
  }
  if (national.length === 11 && national[2] === '9') {
    return 'mobile'
  }
  if (national.length === 10) {
    return 'linephone'
  }
  return 'unknown'
}

const INVALID_DDD = new Set([
  '23',
  '25',
  '26',
  '29',
  '36',
  '39',
  '52',
  '56',
  '57',
  '58',
  '59',
  '72',
  '76',
  '78',
])

export type BrazilPhone = {
  code: string
  country: string
  number: string
  valid(): boolean
  isMobile(): boolean
  isLinephone(): boolean
  /** `mobile` / `linephone` when {@link valid}; otherwise `unknown`. */
  type(): BrazilPhoneType
  messages(): string[]
  toLocaleString(mask?: string): string
  toString(): string
}

function validateBrazilNational(nationalDigits: string): MessageRef[] {
  const refs: MessageRef[] = []
  const number = nationalDigits.replace(/\D/g, '')

  if (number.length < 10) {
    refs.push({ key: Locale.NATIONAL_TOO_SHORT })
    return refs
  }

  const ddd = number.slice(0, 2)
  if (INVALID_DDD.has(ddd)) {
    refs.push({ key: Locale.INVALID_DDD_UNUSED })
  }

  const numberWithoutDDD = number.slice(2)

  if (numberWithoutDDD.match(/^9/) && numberWithoutDDD.length !== 9) {
    refs.push({ key: Locale.MOBILE_LENGTH })
  }

  if (numberWithoutDDD.match(/^(2|3|4|5|7)/) && numberWithoutDDD.length !== 8) {
    refs.push({ key: Locale.LANDLINE_LENGTH })
  }

  if (numberWithoutDDD.length < 10) {
    const badStart = numberWithoutDDD.match(/^(0|1|6|8)/)
    if (badStart) {
      refs.push({
        key: Locale.SUBSCRIBER_BAD_START,
        params: { digit: badStart[0]! },
      })
    }
  }

  if (!REGEX_PHONE_NUMBER.test(number)) {
    refs.push({ key: Locale.INVALID_BRAZILIAN_NUMBER })
  }

  return refs
}

function brFromParsed(parsed: ParsedPhone, brRefs: MessageRef[]): BrazilPhone {
  const ok = brRefs.length === 0
  const national = parsed.number
  const kind = classifyBrazilNational(ok, national)

  return {
    code: parsed.code,
    country: parsed.country,
    number: parsed.number,
    valid: () => ok,
    isMobile: () => kind === 'mobile',
    isLinephone: () => kind === 'linephone',
    type: () => kind,
    messages: () => formatMessageRefs(brRefs),
    toLocaleString: parsed.toLocaleString.bind(parsed),
    toString: parsed.toString.bind(parsed),
  }
}

function brParseError(reason: string): BrazilPhone {
  const ref: MessageRef = {
    key: Locale.PARSE_ERROR,
    params: { detail: reason },
  }

  return {
    code: '',
    country: '',
    number: '',
    valid: () => false,
    isMobile: () => false,
    isLinephone: () => false,
    type: () => 'unknown',
    messages: () => [translateMessage(ref)],
    toLocaleString: () => '',
    toString: () => '',
  }
}

function brNonBrazil(parsed: ParsedPhone): BrazilPhone {
  const ref: MessageRef = { key: Locale.NOT_BRAZILIAN_NUMBER }

  return {
    code: parsed.code,
    country: parsed.country,
    number: parsed.number,
    valid: () => false,
    isMobile: () => false,
    isLinephone: () => false,
    type: () => 'unknown',
    messages: () => [translateMessage(ref)],
    toLocaleString: parsed.toLocaleString.bind(parsed),
    toString: parsed.toString.bind(parsed),
  }
}

function phonenumberBr(input: string): BrazilPhone {
  const result: Result = phonenumber(input)

  if ('reason' in result) {
    return brParseError(result.reason)
  }

  if (result.code !== '+55') {
    return brNonBrazil(result)
  }

  const brRefs = validateBrazilNational(result.number)
  return brFromParsed(result, brRefs)
}

/**
 * Parser + Brazilian national validation. Use {@link Locale} with {@link setLocale} for translations.
 *
 * @example
 * ```ts
 * import phonenumber, { Locale } from '@thadeu/phonenumber/br'
 * phonenumber.setLocale('br', {
 *   [Locale.NOT_BRAZILIAN_NUMBER]: 'Não é um número brasileiro',
 * })
 * ```
 */
export default Object.assign(phonenumberBr, {
  setLocale,
  getLocale,
})

export * from './locales/br/locale'
