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

### Release

1. Update `CHANGELOG.md`.
2. `make release-check`.
3. `npm version patch|minor|major` (with git, creates a tag).
4. `npm publish` (`publishConfig.access: public` for `@thadeu`).

## License

MIT — see [LICENSE](./LICENSE).
