# @thadeu/phonenumber

Parse international phone strings into an **ITU country calling code** and **national number**. Digits-only normalization, **longest-prefix** match on 1–3 digit country codes, optional **display formatting** via **`toString()`** / **`toLocaleString()`** (built-in regional masks or a custom `x` pattern).

**Requirements:** Node.js 18.19+

## Install

```bash
npm install @thadeu/phonenumber

# or

pnpm add @thadeu/phonenumber
```

```ts
import phonenumber from '@thadeu/phonenumber'
```

The package also exposes **`@thadeu/phonenumber/br`** — same parser plus Brazilian national validation, message keys, and optional i18n (see [§7](#7-brazil-module-br)).

Builds: **ESM** and **CommonJS** (`import` / `require`), plus **IIFE** `dist/index.global.js` (global `Phonenumber`) for script tags.

---

## Features

### 1. Parse: calling code, ISO region, national number

Non-digits are stripped. The calling code is the longest matching prefix in the embedded ITU map (try 3 digits, then 2, then 1). **`country`** is the **ISO 3166-1 alpha-2** code for that prefix (from the same map). Shared calling codes (e.g. **+1** for NANP) resolve to a single region in the map (**`US`** today).

```ts
const phone = phonenumber('+5511987654321')
// ParsedPhone
phone.code // '+55'
phone.country // 'BR'
phone.number // '11987654321'

phonenumber('351918875750') // without leading +
// { code: '+351', country: 'PT', number: '918875750' }

phonenumber('+1 (202) 555-0123')
// { code: '+1', country: 'US', number: '2025550123' }
```

### 2. Unknown prefix: `reason`

```ts
const bad = phonenumber('+999123456789')
if ('reason' in bad) {
  bad.reason // e.g. 'unknown country code in: +999123456789'
}
```

### 3. Display: `toString()` and `toLocaleString(mask?)`

On a successful parse:

- **`toString()`** — Default formatted display (same as `toLocaleString()` without arguments). Matches the usual Node convention where `String(phone)` and coercions use the human-readable number.

- **`toLocaleString()`** — Same as **`toString()`**: internal mask when the numeric calling code has one (e.g. **+1** NANP, **+55** Brazil, many European codes, **+234**, **+966**). Otherwise: `` `+${code} ${national}` `` (digits only in the national part).

- **`toLocaleString(mask)`** — Uses your **`mask`** string: each **`x`** consumes the next digit from **(calling code without `+`) + national**; any other character is copied literally. Fewer `x` than digits drops trailing digits; more `x` than digits leaves gaps empty.

```ts
const phone = phonenumber('+5511987654321')
String(phone) === phone.toString() // true
phone.toString()
// '+55 (11) 98765-4321'

phone.toLocaleString()
// same as toString()

phonenumber('+12025550123').toString()
// '+1 (202) 555-0123'   // USA and Canada share +1

phonenumber('+33612345678').toString()
// '+33 6 12 34 56 78'

phonenumber('+376312345').toString()
// '+376 312345'   // Andorra: no dedicated mask → fallback

phone.toLocaleString('+x (xx) x xxxx-xxxxx')
// '+5 (51) 1 9876-54321'

phone.toLocaleString('+x (xx) x xxxx-xxxx')
// '+5 (51) 1 9876-5432'   // 12 × 'x' → last digit dropped
```

### 4. Standalone formatter: `phonenumber.applyMask`

Same `x` rules as `toLocaleString(mask)`, without parsing an input string — useful when you already have `+country` and national parts (no `ParsedPhone` instance).

```ts
phonenumber.applyMask('+xx (xx) xxxxx-xxxx', '+55', '11987654321')
// '+55 (11) 98765-4321'
```

### 5. TypeScript

```ts
import phonenumber, { type ParsedPhone, type Result } from '@thadeu/phonenumber'

function handle(r: Result) {
  if ('reason' in r) return
  const phone: ParsedPhone = r
  phone.code
  phone.country
  phone.number
  phone.toString()
  phone.toLocaleString()
  phone.toLocaleString('(xx) xxxxx-xxxx')
}
```

### 6. Live input (browser)

```ts
import phonenumber, {
  bindInput,
  bindInputMask,
  unbindInputMask,
} from '@thadeu/phonenumber'
```

- **`bindInput(element, { code, mask? })`** — one `input` / `textarea`, framework-agnostic (`addEventListener`). National digits only; `code` is the fixed calling prefix (e.g. `"+34"`).

- **`bindInputMask(mode?, root?)`** — declarative: scans for `data-phonenumber-country` plus **`data-phonenumber-mask`**. The mask attribute value selects wiring:
  - Empty / omitted value / `agnostic` / `default` → scanned when **`mode` is `'vanilla'`** (default)
  - **`react`** → scanned when **`mode` is `'react'`** — return cleanup from `useEffect`
  - **`jquery`** → scanned when **`mode` is `'jquery'`** — no cleanup returned (fire-and-forget)

- **`unbindInputMask(cleanup)`** — runs a cleanup function from `bindInput` or `bindInputMask('vanilla' | 'react')`.

Optional on all declarative inputs: **`data-phonenumber-mask-pattern`** (custom `x` mask; distinct from the mode attribute name).

```ts
const input = document.querySelector('#phone') as HTMLInputElement
const stop = bindInput(input, { code: '+34' })
unbindInputMask(stop)

const cleanup = bindInputMask()
cleanup()

useEffect(() => {
  return bindInputMask('react')
}, [])

$(() => {
  bindInputMask('jquery')
})
```

```html
<input type="tel" data-phonenumber-mask data-phonenumber-country="+34" />
<input
  type="tel"
  data-phonenumber-mask="react"
  data-phonenumber-country="+34"
/>
<input
  type="tel"
  data-phonenumber-mask="jquery"
  data-phonenumber-country="+34"
/>
```

Other helpers (same import): **`digits`**, **`partial`**, **`fallback`**, **`getInternalDisplayMask`**, **`INTERNAL_MASKS`**.

**IIFE** (`index.global.js`): `Phonenumber.default` (parser), `Phonenumber.bindInput`, `Phonenumber.bindInputMask`, `Phonenumber.unbindInputMask`, etc.

### 7. Brazil module (`/br`)

Import the **`br`** entry (not the root package) when you need **Brazil-only** rules on top of the core parser: valid DDD ranges, mobile vs landline length, and a shared regex for national numbers. Implementation lives under `src/locales/br/` (locale strings and `Locale` keys); `br.ts` wires parsing, validation, and re-exports.

```ts
import phonenumber, { Locale, defaultMessagesEn } from '@thadeu/phonenumber/br'
```

- **`phonenumber(input)`** — Runs the default parser, then if the resolved country is **`+55`**, runs Brazilian national validation (same rules everywhere — no separate validation API). Returns a **`BrazilPhone`**: `code`, `country`, `number`, **`valid()`**, **`isMobile()`**, **`isLinephone()`**, **`type()`** (returns **`'mobile'`**, **`'linephone'`**, or **`'unknown'`**), **`messages()`**, **`toString()`** / **`toLocaleString(mask?)`** (same masking behavior as the core `ParsedPhone`).

- If parsing fails, or the number is not **`+55`**, **`valid()`** is `false` and **`messages()`** explains why (parse error, “not Brazilian”, or validation issues).

- **`formatMessageRefs`** / **`translateMessage`** — Re-exported from the locale module if you build **`MessageRef`** lists yourself; most apps only need **`BrazilPhone#messages()`**.

**Locales and translation**

- **`Locale`** — Stable string keys for every message (e.g. `Locale.NOT_BRAZILIAN_NUMBER`, `Locale.NATIONAL_TOO_SHORT`). Use them as object keys when calling **`setLocale`**.

- **`phonenumber.setLocale(localeId, partialMessages)`** — Sets the active locale id and merges translated strings. Unknown keys fall back to English defaults (`defaultMessagesEn`).

- **`phonenumber.getLocale()`** — Returns the active locale id.

- **`translateMessage(ref)`** — Resolves a single **`MessageRef`** with the current locale.

Templates may use **`{{param}}`** placeholders (e.g. `Locale.PARSE_ERROR` uses `{{detail}}`, `Locale.SUBSCRIBER_BAD_START` uses `{{digit}}`).

```ts
phonenumber.setLocale('br', {
  [Locale.NOT_BRAZILIAN_NUMBER]: 'Não é um número brasileiro',
})

const phone = phonenumber('+5511987654321')
phone.valid()
phone.isMobile()
phone.messages()

// reset catalog for the default locale in tests or after overrides:
phonenumber.setLocale('en', { ...defaultMessagesEn })
```

**Note:** The **`br`** build is **ESM + CJS** only (no separate IIFE entry). Use a bundler or the root package’s IIFE if you need a single script tag without `br`.

---

## Runtime usage

**Node / AWS Lambda (ESM)** — same `import` as above.

**CommonJS**

```js
const phonenumber = require('@thadeu/phonenumber')
phonenumber('5511987654321')
```

**Browser (no bundler)**

```html
<script src="./node_modules/@thadeu/phonenumber/dist/index.global.js"></script>
<script>
  console.log(String(Phonenumber('+351918875750')))
</script>
```

---

## Behavior notes

- **Ambiguity:** Several country codes share digit patterns with local numbering elsewhere; this library picks the **longest** matching ITU prefix (3 before 2 before 1).
- **Masks:** One internal pattern per country code is a **best-effort** fit; real subscriber lengths vary.
- **`JSON.stringify`** on `ParsedPhone` includes enumerable fields; methods are not serialized.

---

## Development

```bash
pnpm install
pnpm run lint
pnpm run format:check
pnpm test
pnpm run build
```

`prepack` runs `build` before `npm publish`. For a full gate: `make release-check`.

### Release (tag → npm)

1. Update **`CHANGELOG.md`** and bump **`version`** in `package.json` (or `npm version patch|minor|major`).
2. Commit and push tag: `git tag v1.x.x && git push origin v1.x.x`.
3. CI runs **`pnpm publish`** on tag push (needs **`NPM_TOKEN`** in repo secrets). `prepack` builds `dist/` first.

Optional: use **`pnpm dlx @changesets/cli`** to draft notes, then copy into `CHANGELOG.md` before tagging.

## License

MIT — see [LICENSE](./LICENSE).
