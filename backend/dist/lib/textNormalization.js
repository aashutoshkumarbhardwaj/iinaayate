"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasUnicodeDiacritics = hasUnicodeDiacritics;
exports.simplifyText = simplifyText;
exports.romanizeForSearch = romanizeForSearch;
exports.searchableText = searchableText;
exports.searchForms = searchForms;
exports.textMatchesSearch = textMatchesSearch;
exports.scoreSearchMatch = scoreSearchMatch;
const COMBINING_MARKS = /[\u0300-\u036f]/g;
const LATIN_DIACRITIC_PATTERN = /[\u00C0-\u024F\u1E00-\u1EFF\u0300-\u036F]/;
const ARABIC_SCRIPT_PATTERN = /\p{Script=Arabic}/u;
const DEVANAGARI_SCRIPT_PATTERN = /\p{Script=Devanagari}/u;
const SEARCH_SEPARATORS = /[^\p{L}\p{N}]+/gu;
const WHITESPACE = /\s+/g;
const ARABIC_TO_LATIN = {
    'ا': 'a',
    'آ': 'aa',
    'أ': 'a',
    'إ': 'i',
    'ؤ': 'u',
    'ئ': 'i',
    'ب': 'b',
    'پ': 'p',
    'ت': 't',
    'ث': 's',
    'ج': 'j',
    'چ': 'ch',
    'ح': 'h',
    'خ': 'kh',
    'د': 'd',
    'ذ': 'z',
    'ر': 'r',
    'ز': 'z',
    'ژ': 'zh',
    'س': 's',
    'ش': 'sh',
    'ص': 's',
    'ض': 'z',
    'ط': 't',
    'ظ': 'z',
    'ع': '',
    'غ': 'gh',
    'ف': 'f',
    'ق': 'q',
    'ک': 'k',
    'گ': 'g',
    'ل': 'l',
    'م': 'm',
    'ن': 'n',
    'ں': 'n',
    'و': 'o',
    'ہ': 'h',
    'ھ': 'h',
    'ی': 'y',
    'ے': 'e',
    'ء': '',
    'ٹ': 't',
    'ڈ': 'd',
    'ڑ': 'r',
    'ۓ': 'e',
    'ة': 'h',
    '؍': '',
    'ـ': '',
    '؜': '',
};
const DEVANAGARI_INDEPENDENT_VOWELS = {
    'अ': 'a',
    'आ': 'aa',
    'इ': 'i',
    'ई': 'ii',
    'उ': 'u',
    'ऊ': 'uu',
    'ऋ': 'ri',
    'ॠ': 'rri',
    'ए': 'e',
    'ऐ': 'ai',
    'ओ': 'o',
    'औ': 'au',
};
const DEVANAGARI_CONSONANTS = {
    'क': 'k',
    'ख': 'kh',
    'ग': 'g',
    'घ': 'gh',
    'ङ': 'ng',
    'च': 'ch',
    'छ': 'chh',
    'ज': 'j',
    'झ': 'jh',
    'ञ': 'ny',
    'ट': 't',
    'ठ': 'th',
    'ड': 'd',
    'ढ': 'dh',
    'ण': 'n',
    'त': 't',
    'थ': 'th',
    'द': 'd',
    'ध': 'dh',
    'न': 'n',
    'प': 'p',
    'फ': 'ph',
    'ब': 'b',
    'भ': 'bh',
    'म': 'm',
    'य': 'y',
    'र': 'r',
    'ल': 'l',
    'व': 'v',
    'श': 'sh',
    'ष': 'sh',
    'स': 's',
    'ह': 'h',
    'क्ष': 'ksh',
    'त्र': 'tr',
    'ज्ञ': 'gy',
};
const DEVANAGARI_MATRAS = {
    'ा': 'aa',
    'ि': 'i',
    'ी': 'ii',
    'ु': 'u',
    'ू': 'uu',
    'ृ': 'ri',
    'े': 'e',
    'ै': 'ai',
    'ो': 'o',
    'ौ': 'au',
};
const DEVANAGARI_SIGNS = {
    'ं': 'n',
    'ँ': 'n',
    'ः': 'h',
    'ऽ': '',
    '्': '',
    '॰': '',
    '।': ' ',
    '॥': ' ',
};
function isWordLike(value) {
    return /[\p{L}\p{N}]/u.test(value);
}
function normalizeSearchText(text) {
    return (text || '')
        .toLowerCase()
        .normalize('NFKC')
        .replace(SEARCH_SEPARATORS, ' ')
        .replace(WHITESPACE, ' ')
        .trim();
}
function normalizeLooseText(text) {
    return normalizeSearchText(text).replace(/\s+/g, '');
}
function hasUnicodeDiacritics(text) {
    return LATIN_DIACRITIC_PATTERN.test(text);
}
function simplifyText(text) {
    if (!text || ARABIC_SCRIPT_PATTERN.test(text) || DEVANAGARI_SCRIPT_PATTERN.test(text)) {
        return text;
    }
    if (!hasUnicodeDiacritics(text)) {
        return text;
    }
    return text.normalize('NFKD').replace(COMBINING_MARKS, '');
}
function transliterateArabicToLatin(text) {
    return Array.from(text.normalize('NFKC'))
        .map((char) => ARABIC_TO_LATIN[char] ?? char)
        .join('');
}
function transliterateDevanagariToLatin(text) {
    const chars = Array.from(text.normalize('NFKC'));
    let result = '';
    for (let i = 0; i < chars.length; i += 1) {
        const char = chars[i];
        if (!char)
            continue;
        const next = chars[i + 1];
        const next2 = chars[i + 2];
        if (DEVANAGARI_INDEPENDENT_VOWELS[char]) {
            result += DEVANAGARI_INDEPENDENT_VOWELS[char];
            continue;
        }
        if (char === 'क' && next === '्' && next2 === 'ष') {
            result += 'ksh';
            i += 2;
            continue;
        }
        if (char === 'त' && next === '्' && next2 === 'र') {
            result += 'tr';
            i += 2;
            continue;
        }
        if (char === 'ज' && next === '्' && next2 === 'ञ') {
            result += 'gy';
            i += 2;
            continue;
        }
        if (DEVANAGARI_CONSONANTS[char]) {
            const consonant = DEVANAGARI_CONSONANTS[char];
            if (next === '्') {
                result += consonant;
                i += 1;
                continue;
            }
            if (next && DEVANAGARI_MATRAS[next]) {
                result += `${consonant}${DEVANAGARI_MATRAS[next]}`;
                i += 1;
                continue;
            }
            result += `${consonant}a`;
            continue;
        }
        if (DEVANAGARI_SIGNS[char] !== undefined) {
            result += DEVANAGARI_SIGNS[char];
            continue;
        }
        result += char;
    }
    return result;
}
function romanizeForSearch(text) {
    if (!text)
        return '';
    const source = simplifyText(text);
    const transliterated = ARABIC_SCRIPT_PATTERN.test(source)
        ? transliterateArabicToLatin(source)
        : DEVANAGARI_SCRIPT_PATTERN.test(source)
            ? transliterateDevanagariToLatin(source)
            : source;
    return normalizeSearchText(transliterated);
}
function searchableText(value) {
    return normalizeSearchText(simplifyText((value || '').toLowerCase().trim()));
}
function searchForms(value) {
    const raw = searchableText(value);
    const romanized = romanizeForSearch(value);
    const forms = new Set([raw, romanized, normalizeLooseText(raw), normalizeLooseText(romanized)].filter(Boolean));
    return Array.from(forms);
}
function textMatchesSearch(value, query) {
    const sourceForms = searchForms(value);
    const queryForms = searchForms(query);
    if (queryForms.length === 0)
        return true;
    return sourceForms.some((source) => queryForms.some((needle) => source.includes(needle)));
}
function scoreSearchMatch(value, query) {
    if (!value || !query)
        return 0;
    const sourceForms = searchForms(value);
    const queryForms = searchForms(query);
    let score = 0;
    for (const source of sourceForms) {
        for (const needle of queryForms) {
            if (!needle)
                continue;
            if (source === needle)
                score = Math.max(score, 100);
            else if (source.startsWith(needle))
                score = Math.max(score, 70);
            else if (source.includes(needle))
                score = Math.max(score, 40);
            else if (isWordLike(needle) && source.split(' ').some((token) => token.startsWith(needle))) {
                score = Math.max(score, 30);
            }
        }
    }
    return score;
}
//# sourceMappingURL=textNormalization.js.map