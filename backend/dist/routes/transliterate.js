"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
function urduToLatin(input) {
    const m = {
        'ا': 'a', 'آ': 'aa', 'ب': 'b', 'پ': 'p', 'ت': 't', 'ث': 's', 'ج': 'j', 'چ': 'ch', 'ح': 'h', 'خ': 'kh',
        'د': 'd', 'ذ': 'z', 'ر': 'r', 'ز': 'z', 'ژ': 'zh', 'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'z', 'ط': 't', 'ظ': 'z',
        'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ک': 'k', 'گ': 'g', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ں': 'n',
        'و': 'o', 'ہ': 'h', 'ھ': 'h', 'ء': '', 'ی': 'y', 'ے': 'e', 'ئ': 'i', 'ٹ': 't', 'ڈ': 'd', 'ڑ': 'r', 'ۓ': 'e'
    };
    return Array.from(input).map(ch => m[ch] ?? ch).join('');
}
function urduToDevanagari(input) {
    const m = {
        'ا': 'अ', 'آ': 'आ', 'ب': 'ब', 'پ': 'प', 'त': 'त', 'ت': 'त', 'ث': 'स', 'ج': 'ज', 'چ': 'च', 'ح': 'ह', 'خ': 'ख',
        'د': 'द', 'ذ': 'ज़', 'ر': 'र', 'ز': 'ज़', 'ژ': 'झ', 'س': 'स', 'ش': 'श', 'ص': 'स', 'ض': 'ज़', 'ط': 'त', 'ظ': 'ज़',
        'ع': 'अ', 'غ': 'ग़', 'ف': 'फ़', 'ق': 'क', 'ک': 'क', 'گ': 'ग', 'ل': 'ल', 'م': 'म', 'ن': 'न', 'ں': 'ं',
        'و': 'ओ', 'ہ': 'ह', 'ھ': 'ह', 'ء': '', 'ی': 'य', 'ے': 'े', 'ئ': 'इ', 'ٹ': 'ट', 'ڈ': 'ड', 'ڑ': 'ड़', 'ۓ': 'े'
    };
    return Array.from(input).map(ch => m[ch] ?? ch).join('');
}
router.post('/', async (req, res) => {
    const { text, from, to } = req.body;
    if (!text || !from || !to)
        return res.status(400).json({ error: 'Missing fields' });
    if (from === 'Urdu' && to === 'Devanagari') {
        return res.json({ text: urduToDevanagari(text) });
    }
    if (from === 'Urdu' && (to === 'Latin' || to === 'Hinglish')) {
        return res.json({ text: urduToLatin(text) });
    }
    return res.status(422).json({ error: 'Unsupported transliteration' });
});
exports.default = router;
//# sourceMappingURL=transliterate.js.map