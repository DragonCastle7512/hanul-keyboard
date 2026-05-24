import * as Hangul from 'hangul-js';

export const consonantCycles: { [key: string]: string[] } = {
  'ㄱㅋ': ['ㄱ', 'ㅋ', 'ㄲ'],
  'ㄴㄹ': ['ㄴ', 'ㄹ'],
  'ㄷㅌ': ['ㄷ', 'ㅌ', 'ㄸ'],
  'ㅂㅍ': ['ㅂ', 'ㅍ', 'ㅃ'],
  'ㅅㅎ': ['ㅅ', 'ㅎ', 'ㅆ'],
  'ㅈㅊ': ['ㅈ', 'ㅊ', 'ㅉ'],
  'ㅇㅁ': ['ㅇ', 'ㅁ'],
  '.,': ['.', ','],
  ':;': [':', ';'],
  '?!': ['?', '!'],
  '^~': ['^', '~'],
  '@/': ['@', '/'],
};

// Vowel mapping for Cheonjiin
// This maps sequences of ㅣ(1), ·(2), ㅡ(3) to standard Hangeul vowels
const vowelSequences: { [key: string]: string } = {
  '1': 'ㅣ',
  '2': '·',
  '3': 'ㅡ',
  '12': 'ㅏ',
  '122': 'ㅑ',
  '21': 'ㅓ',
  '221': 'ㅕ',
  '23': 'ㅗ',
  '223': 'ㅛ',
  '32': 'ㅜ',
  '322': 'ㅠ',
  '31': 'ㅢ',
  '121': 'ㅐ',
  '1221': 'ㅒ',
  '211': 'ㅔ',
  '2211': 'ㅖ',
  '231': 'ㅚ',
  '2312': 'ㅘ',
  '23121': 'ㅙ',
  '321': 'ㅟ',
  '3221': 'ㅝ',
  '32211': 'ㅞ',
};

// Note: Cheonjiin logic can be tricky. A better way is to handle combinations of standard vowels.
// But for now, let's stick to a simpler approach for the prototype.

export function assembleHangeul(jamos: string[]): string {
  // We need to preprocess Cheonjiin dots
  const processedJamos = processVowels(jamos);
  return Hangul.assemble(processedJamos);
}

function processVowels(jamos: string[]): string[] {
  const result: string[] = [];
  const isCheonjiinVowel = (char: string) => char === 'ㅣ' || char === '·' || char === 'ㅡ';
  const toCode = (char: string) => (char === 'ㅣ' ? '1' : char === '·' ? '2' : '3');
  let i = 0;

  while (i < jamos.length) {
    const char = jamos[i];
    if (isCheonjiinVowel(char)) {
      let j = i;
      let runCode = '';
      while (j < jamos.length && isCheonjiinVowel(jamos[j])) {
        runCode += toCode(jamos[j]);
        j++;
      }

      let cursor = 0;
      while (cursor < runCode.length) {
        let matched = false;
        for (let len = runCode.length - cursor; len > 0; len--) {
          const candidate = runCode.slice(cursor, cursor + len);
          const mapped = vowelSequences[candidate];
          if (mapped) {
            result.push(mapped);
            cursor += len;
            matched = true;
            break;
          }
        }
        if (!matched) {
          const fallbackChar = runCode[cursor] === '1' ? 'ㅣ' : runCode[cursor] === '2' ? '·' : 'ㅡ';
          result.push(fallbackChar);
          cursor += 1;
        }
      }

      i = j;
    } else {
      result.push(char);
      i++;
    }
  }
  return result;
}
