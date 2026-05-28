import { assembleHangeul } from '../logic/hangeul';

describe('한글 조합 로직 (assembleHangeul)', () => {
  test('기본적인 자음과 모음을 조합해야 한다', () => {
    expect(assembleHangeul(['ㄱ', 'ㅏ'])).toBe('가');
  });

  test("합성이 올바르게 이루어져야 한다", () => {
    expect(assembleHangeul(['ㅃ', 'ㅡ', '·', '·', 'ㅣ', 'ㅣ', 'ㄹ', 'ㅂ'])).toBe('쀏');
    expect(assembleHangeul(['ㅇ', 'ㅣ', '·', 'ㄴ', 'ㅎ'])).toBe('않');
    expect(assembleHangeul(['ㅇ', 'ㅣ', '·', 'ㄴ', 'ㅈ'])).toBe('앉');
    expect(assembleHangeul(['ㅇ', 'ㅣ', '·', 'ㄴ', 'ㅅ'])).toBe('안ㅅ');
  });

  test('연속 입력 시 천지인 결합 법칙을 따라야 한다 (하눌)', () => {
    expect(assembleHangeul(['ㅎ', 'ㅣ', '·', 'ㄴ', 'ㅡ', '·', 'ㄹ'])).toBe('하눌');
  });

  test('천지인 모음 시퀀스 상세 검증', () => {
    expect(assembleHangeul(['ㅣ', '·'])).toBe('ㅏ');
    expect(assembleHangeul(['ㅣ', '·', '·'])).toBe('ㅑ');
    expect(assembleHangeul(['·', 'ㅣ'])).toBe('ㅓ');
    expect(assembleHangeul(['·', '·', 'ㅣ'])).toBe('ㅕ');
    expect(assembleHangeul(['·', 'ㅡ'])).toBe('ㅗ');
    expect(assembleHangeul(['·', '·', 'ㅡ'])).toBe('ㅛ');
    expect(assembleHangeul(['ㅡ', '·'])).toBe('ㅜ');
    expect(assembleHangeul(['ㅡ', '·', '·'])).toBe('ㅠ');
    expect(assembleHangeul(['ㅡ', 'ㅣ'])).toBe('ㅢ');
    expect(assembleHangeul(['ㅣ', '·', '·', 'ㅣ'])).toBe('ㅒ');
  });

  test('ㅔㅔ 연속 입력 시 올바르게 조합되어야 한다', () => {
    expect(assembleHangeul(['·', 'ㅣ', 'ㅣ', '·', 'ㅣ', 'ㅣ'])).toBe('ㅔㅔ');
  });
});
