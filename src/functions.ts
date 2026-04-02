import { getInternalDisplayMask } from './masks'

/** ITU calling code (e.g. `"+34"`) plus optional custom `x` mask. */
export type MaskOptions = {
  code: string
  mask?: string
}

/** Declarative wiring mode for {@link bindInputMask}. */
export type BindInputMaskMode = 'vanilla' | 'react' | 'jquery'

/** Calling code digits only (no `+`). */
export function digits(input: string): string {
  return input.replace(/^\+/, '').replace(/\D/g, '')
}

/** Progressive `x` fill; stops when digit stream ends. */
export function partial(mask: string, fullDigitStream: string): string {
  const q = [...fullDigitStream.replace(/\D/g, '')]
  let out = ''
  let i = 0

  while (i < mask.length && q.length > 0) {
    const c = mask[i]
    if (c === 'x') {
      out += q.shift()!
    } else {
      out += c
    }
    i++
  }

  return out
}

/** Generic mask when none is defined for the calling code. */
export function fallback(
  callingCodeDigits: string,
  nationalPlaceholderCount = 24,
): string {
  const cc = callingCodeDigits.replace(/\D/g, '')
  return `+${'x'.repeat(cc.length)} ${'x'.repeat(nationalPlaceholderCount)}`
}

function resolveMask(ccDigits: string, override?: string): string {
  if (override != null && override !== '') {
    return override
  }

  return getInternalDisplayMask(ccDigits) ?? fallback(ccDigits)
}

/**
 * Bind one `input` / `textarea` (framework-agnostic: plain `addEventListener`).
 * For declarative `data-*` wiring use {@link bindInputMask}.
 */
export function bindInput(
  element: HTMLInputElement | HTMLTextAreaElement,
  options: MaskOptions,
): () => void {
  const ccDigits = digits(options.code)
  const maskStr = resolveMask(ccDigits, options.mask)

  const onInput = (): void => {
    const nationalDigits = element.value.replace(/\D/g, '')
    const stream = ccDigits + nationalDigits
    const formatted = partial(maskStr, stream)

    if (element.value !== formatted) {
      element.value = formatted
      const len = formatted.length

      try {
        element.setSelectionRange(len, len)
      } catch {
        /* readonly or unsupported */
      }
    }
  }

  element.addEventListener('input', onInput)

  return () => {
    element.removeEventListener('input', onInput)
  }
}

const MASK_SCAN_SELECTOR =
  'input[data-phonenumber-mask],textarea[data-phonenumber-mask]'

/** Maps `data-phonenumber-mask` value to wiring mode (empty / `agnostic` / `default` → vanilla). */
export function maskModeFromElement(el: HTMLElement): BindInputMaskMode {
  const raw = el.getAttribute('data-phonenumber-mask')
  if (raw === null) {
    return 'vanilla'
  }
  const v = raw.trim().toLowerCase()
  if (v === '' || v === 'agnostic' || v === 'default') {
    return 'vanilla'
  }
  if (v === 'react') {
    return 'react'
  }
  if (v === 'jquery') {
    return 'jquery'
  }
  return 'vanilla'
}

function bindByDataAttribute(
  root: ParentNode,
  mode: BindInputMaskMode,
): Array<() => void> {
  const nodes = root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
    MASK_SCAN_SELECTOR,
  )
  const unsubs: Array<() => void> = []

  for (const el of Array.from(nodes)) {
    if (maskModeFromElement(el) !== mode) {
      continue
    }

    const country = el.dataset.phonenumberCountry
    if (!country) {
      continue
    }

    const customMask = el.dataset.phonenumberMaskPattern
    unsubs.push(
      bindInput(el, {
        code: country,
        mask: customMask,
      }),
    )
  }

  return unsubs
}

function runBindInputMask(
  mode: BindInputMaskMode,
  root: ParentNode,
): (() => void) | void {
  const unsubs = bindByDataAttribute(root, mode)
  if (mode === 'jquery') {
    return
  }
  return () => {
    for (const u of unsubs) {
      u()
    }
  }
}

/**
 * Declarative: finds inputs with `data-phonenumber-mask` + `data-phonenumber-country`.
 * Mode comes from the attribute value: empty / `agnostic` / `default` → vanilla;
 * `react` → React (return cleanup from `useEffect`); `jquery` → jQuery (no cleanup returned).
 */
export function bindInputMask(
  mode?: 'vanilla' | 'react',
  root?: ParentNode,
): () => void
export function bindInputMask(mode: 'jquery', root?: ParentNode): void
export function bindInputMask(
  mode?: BindInputMaskMode,
  root: ParentNode = document,
): (() => void) | void {
  const m = (mode ?? 'vanilla') as BindInputMaskMode
  return runBindInputMask(m, root)
}

/** Calls a cleanup returned by {@link bindInputMask} (vanilla / react) or {@link bindInput}. */
export function unbindInputMask(cleanup: () => void): void {
  cleanup()
}
