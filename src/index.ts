import codes from './country.json' with { type: 'json' }

import { INTERNAL_MASKS } from './masks.js'

const COUNTRY_BY_CALLING_CODE = codes as Record<string, string>

export { getInternalDisplayMask, INTERNAL_MASKS } from './masks.js'

export {
  bindInput,
  bindInputMask,
  unbindInputMask,
  maskModeFromElement,
  digits,
  partial,
  fallback,
  type BindInputMaskMode,
  type MaskOptions,
} from './functions.js'

export type ParsedPhone = {
  /** ITU country calling code, e.g. "+55". */
  code: string
  /** ISO 3166-1 alpha-2 region for the resolved calling code (from embedded map). Shared codes (e.g. +1) map to one territory. */
  country: string
  number: string
  /**
   * Default formatted display (same as `toLocaleString()`): built-in regional pattern when available, else `+{code} {national}`.
   * Typical Node pattern: `String(phone)` / template coercions use this value.
   */
  toString(): string
  /**
   * Without `mask`, same as `toString()`. With `mask`: `x` placeholders filled from calling-code digits + national digits; other characters copied literally.
   */
  toLocaleString(mask?: string): string
}

export type Result = ParsedPhone | { reason: string }

function applyMask(mask: string, code: string, nationalNumber: string): string {
  const ccDigits = code.replace(/^\+/, '')
  const queue = [...(ccDigits + nationalNumber)]

  let out = ''

  for (const ch of mask) {
    if (ch === 'x') {
      out += queue.shift() ?? ''
    } else {
      out += ch
    }
  }

  return out
}

function phonenumber(input: string): Result {
  function lookup(digits: string): string | null {
    for (const len of [3, 2, 1]) {
      const candidate = digits.slice(0, len)

      if (candidate in COUNTRY_BY_CALLING_CODE) return candidate
    }

    return null
  }

  const digits = input.replace(/\D+/g, '')
  const code = lookup(digits)

  if (!code) {
    return { reason: `unknown country code in: ${input.trim()}` }
  }

  const national = digits.slice(code.length)
  const codeStr = `+${code}`
  const country = COUNTRY_BY_CALLING_CODE[code]!

  return {
    code: codeStr,
    country,
    number: national,
    toLocaleString(mask?: string) {
      if (mask != null && mask !== '') {
        return applyMask(mask, codeStr, national)
      }

      const internal = INTERNAL_MASKS[code]

      if (internal) {
        return applyMask(internal, codeStr, national)
      }

      return `${codeStr} ${national}`
    },
    toString() {
      return this.toLocaleString()
    },
  }
}

export type PhoneNumberType = typeof phonenumber & {
  applyMask: (mask: string, code: string, nationalNumber: string) => string
}

const phonenumberWithApplyMask = Object.assign(phonenumber, { applyMask })

export default phonenumberWithApplyMask as PhoneNumberType
