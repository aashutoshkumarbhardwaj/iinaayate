const COMBINING_MARKS = /[\u0300-\u036f]/g;
const LATIN_DIACRITIC_PATTERN = /[\u00C0-\u024F\u1E00-\u1EFF\u0300-\u036F]/;
const NON_LATIN_SCRIPT_PATTERN = /[\p{Script=Arabic}\p{Script=Devanagari}]/u;

export function hasUnicodeDiacritics(text: string) {
  return LATIN_DIACRITIC_PATTERN.test(text);
}

export function simplifyText(text: string) {
  if (!text || NON_LATIN_SCRIPT_PATTERN.test(text) === true) {
    return text;
  }

  if (!hasUnicodeDiacritics(text)) {
    return text;
  }

  return text.normalize('NFKD').replace(COMBINING_MARKS, '');
}

export function hasSimplifiableText(text: string) {
  return hasUnicodeDiacritics(text) && !NON_LATIN_SCRIPT_PATTERN.test(text);
}
