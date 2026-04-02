/**
 * Default display masks keyed by numeric country calling code (no +).
 * `x` consumes digits left-to-right from (calling code digits + national number).
 */
export const INTERNAL_MASKS: Record<string, string> = {
  '1': '+x (xxx) xxx-xxxx',

  '30': '+xx xxx xxx xxxx',
  '31': '+xx x xxxxxxxx',
  '32': '+xx xxx xx xx xx',
  '33': '+xx x xx xx xx xx',
  '34': '+xx xxx xx xx xx',
  '351': '+xxx xxx xxx xxx',
  '352': '+xxx xxx xxx xxx',
  '353': '+xxx xx xxx xxxx',
  '354': '+xxx xxx xxxx',
  '356': '+xxx xx xx xx xx',
  '357': '+xxx xx xxxxxx',
  '358': '+xxx xx xxx xxxx',
  '36': '+xx xx xxx xxxx',
  '39': '+xx xxx xxx xxxx',
  '40': '+xx xxx xxx xxx',
  '41': '+xx xx xxx xx xx',
  '43': '+xx xxx xxx xxxx',
  '44': '+xx xxxx xxxxxx',
  '45': '+xx xx xx xx xx',
  '46': '+xx xx xxx xx xx',
  '47': '+xx xxx xx xxx',
  '48': '+xx xxx xxx xxx',
  '49': '+xx xxx xxxxxxxx',
  '370': '+xxx xx xxx xxx',
  '371': '+xxx xx xxx xxx',
  '372': '+xxx x xxx xxxx',

  '420': '+xxx xxx xxx xxx',
  '421': '+xxx xxx xxx xxx',

  '55': '+xx (xx) xxxxx-xxxx',
  '234': '+xxx xxx xxx xxxx',
  '966': '+xxx xx xxx xxxx',
}

export function getInternalDisplayMask(
  callingCodeDigits: string,
): string | undefined {
  return INTERNAL_MASKS[callingCodeDigits]
}
