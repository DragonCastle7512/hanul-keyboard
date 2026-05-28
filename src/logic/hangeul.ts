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

const reverseVowelSequences: { [key: string]: string } = {};
for (const key in vowelSequences) {
  if (vowelSequences[key] !== '·') { 
    reverseVowelSequences[vowelSequences[key]] = key;
  }
}

export function assembleHangeul(jamos: string[]): string {
  const processedJamos = processVowels(jamos);
  return Hangul.assemble(processedJamos);
}

function processVowels(jamos: string[]): string[] {
  const result: string[] = [];
  const isCheonjiinVowel = (char: string) => char === 'ㅣ' || char === '·' || char === 'ㅡ';
  const isVowel = (char: string) => isCheonjiinVowel(char) || !!reverseVowelSequences[char];
  
  const getCode = (char: string) => {
    if (char === 'ㅣ') return '1';
    if (char === '·') return '2';
    if (char === 'ㅡ') return '3';
    return reverseVowelSequences[char] || '';
  };

  let i = 0;
  while (i < jamos.length) {
    const char = jamos[i];
    if (isVowel(char)) {
      let j = i;
      let runCode = '';
      while (j < jamos.length && isVowel(jamos[j])) {
        runCode += getCode(jamos[j]);
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
          const fallbackCode = runCode[cursor];
          const fallbackChar = fallbackCode === '1' ? 'ㅣ' : fallbackCode === '2' ? '·' : fallbackCode === '3' ? 'ㅡ' : '';
          if (fallbackChar) result.push(fallbackChar);
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
