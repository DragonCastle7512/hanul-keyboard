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
  '::;': [':', ';'],
  '?!': ['?', '!'],
  '^~': ['^', '~'],
  '@/': ['@', '/'],
};

// Vowel mapping for Cheonjiin
// This maps sequences of ㅣ(1), ·(2), ㅡ(3) to standard Hangeul vowels
const vowelSequences: { [key: string]: string } = {
  '1': 'ㅣ',
  '2': '·', // Temporary state
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
  '3221': 'ㅝ', // This might need adjustment
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
  let i = 0;
  while (i < jamos.length) {
    const char = jamos[i];
    if (char === 'ㅣ' || char === '·' || char === 'ㅡ') {
      let sequence = '';
      let j = i;
      while (j < jamos.length && (jamos[j] === 'ㅣ' || jamos[j] === '·' || jamos[j] === 'ㅡ')) {
        const val = jamos[j] === 'ㅣ' ? '1' : jamos[j] === '·' ? '2' : '3';
        sequence += val;
        
        // Try to find the longest matching sequence
        if (vowelSequences[sequence]) {
           // We'll peek ahead to see if there's a longer match
           let nextSeq = sequence;
           let k = j + 1;
           let foundLonger = false;
           while (k < jamos.length && (jamos[k] === 'ㅣ' || jamos[k] === '·' || jamos[k] === 'ㅡ')) {
             nextSeq += jamos[k] === 'ㅣ' ? '1' : jamos[k] === '·' ? '2' : '3';
             if (vowelSequences[nextSeq]) {
               sequence = nextSeq;
               j = k;
               foundLonger = true;
             } else {
               break;
             }
             k++;
           }
           result.push(vowelSequences[sequence]);
           i = j + 1;
           break;
        }
        j++;
      }
      if (i <= j && !vowelSequences[sequence]) {
          // If no sequence found, just push what we have
          result.push(char);
          i++;
      }
    } else {
      result.push(char);
      i++;
    }
  }
  return result;
}
