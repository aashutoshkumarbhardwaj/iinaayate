"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasUnicodeDiacritics = hasUnicodeDiacritics;
exports.simplifyText = simplifyText;
exports.searchableText = searchableText;
exports.textMatchesSearch = textMatchesSearch;
const COMBINING_MARKS = /[\u0300-\u036f]/g;
const LATIN_DIACRITIC_PATTERN = /[\u00C0-\u024F\u1E00-\u1EFF\u0300-\u036F]/;
const NON_LATIN_SCRIPT_PATTERN = /[\p{Script=Arabic}\p{Script=Devanagari}]/u;
function hasUnicodeDiacritics(text) {
    return LATIN_DIACRITIC_PATTERN.test(text);
}
function simplifyText(text) {
    if (!text || NON_LATIN_SCRIPT_PATTERN.test(text) === true) {
        return text;
    }
    if (!hasUnicodeDiacritics(text)) {
        return text;
    }
    return text.normalize('NFKD').replace(COMBINING_MARKS, '');
}
function searchableText(value) {
    return simplifyText((value || '').toLowerCase().trim());
}
function textMatchesSearch(value, query) {
    const source = searchableText(value);
    const needle = searchableText(query);
    if (!needle)
        return true;
    return source.includes(needle);
}
//# sourceMappingURL=textNormalization.js.map