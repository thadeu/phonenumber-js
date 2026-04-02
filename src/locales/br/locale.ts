/** Stable keys for Brazilian validation and parse messages; use with {@link setLocale}. */
export const Locale = {
  PARSE_ERROR: 'PARSE_ERROR',
  NOT_BRAZILIAN_NUMBER: 'NOT_BRAZILIAN_NUMBER',
  NATIONAL_TOO_SHORT: 'NATIONAL_TOO_SHORT',
  INVALID_DDD_UNUSED: 'INVALID_DDD_UNUSED',
  MOBILE_LENGTH: 'MOBILE_LENGTH',
  LANDLINE_LENGTH: 'LANDLINE_LENGTH',
  SUBSCRIBER_BAD_START: 'SUBSCRIBER_BAD_START',
  INVALID_BRAZILIAN_NUMBER: 'INVALID_BRAZILIAN_NUMBER',
} as const

export type LocaleKey = (typeof Locale)[keyof typeof Locale]

export type MessageRef =
  | { key: LocaleKey }
  | { key: LocaleKey; params: Record<string, string> }

const DEFAULT_EN: Record<LocaleKey, string> = {
  [Locale.PARSE_ERROR]: 'Parse error: {{detail}}',
  [Locale.NOT_BRAZILIAN_NUMBER]: 'Not a Brazilian number',
  [Locale.NATIONAL_TOO_SHORT]:
    'Invalid number: expected DDD + subscriber (at least 10 digits)',
  [Locale.INVALID_DDD_UNUSED]:
    'Invalid DDD: 23, 25, 26, 29, 36, 39, 52, 56-59, 72, 76, 78 are not used',
  [Locale.MOBILE_LENGTH]:
    'Mobile numbers must be DDD + 9 digits (including leading 9 after DDD)',
  [Locale.LANDLINE_LENGTH]: 'Landline numbers must be DDD + 8 digits',
  [Locale.SUBSCRIBER_BAD_START]: 'Number cannot start with {{digit}} after DDD',
  [Locale.INVALID_BRAZILIAN_NUMBER]: 'Invalid Brazilian phone number',
}

/** English defaults; pass to {@link setLocale} to reset after overrides. */
export const defaultMessagesEn: Readonly<Record<LocaleKey, string>> =
  Object.freeze({ ...DEFAULT_EN })

let activeLocale = 'en'

const catalog: Record<string, Partial<Record<LocaleKey, string>>> = {
  en: { ...DEFAULT_EN },
}

function interpolate(
  template: string,
  params?: Record<string, string>,
): string {
  if (!params) {
    return template
  }
  return template.replace(/\{\{(\w+)\}\}/g, (_, name: string) => {
    return params[name] ?? ''
  })
}

function templateFor(locale: string, key: LocaleKey): string | undefined {
  return catalog[locale]?.[key] ?? catalog.en?.[key] ?? DEFAULT_EN[key]
}

export function translateMessage(ref: MessageRef): string {
  const params = 'params' in ref ? ref.params : undefined
  const raw = templateFor(activeLocale, ref.key)
  const template = raw ?? ref.key
  return interpolate(template, params)
}

export function formatMessageRefs(refs: MessageRef[]): string[] {
  return refs.map(translateMessage)
}

/**
 * Active locale for {@link translateMessage} and `BrazilPhone#messages()`.
 * Missing keys fall back to English.
 */
export function setLocale(
  locale: string,
  messages: Partial<Record<LocaleKey, string>>,
): void {
  activeLocale = locale
  catalog[locale] = { ...catalog[locale], ...messages }
}

export function getLocale(): string {
  return activeLocale
}
