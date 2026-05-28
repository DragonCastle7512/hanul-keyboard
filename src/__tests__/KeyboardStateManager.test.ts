import { KeyboardStateManager } from '../logic/KeyboardStateManager';
import { NativeModules } from 'react-native';

const { IMEModule } = NativeModules;

let committedText = '';
let currentComposingText = '';

// NativeModules 모킹
jest.mock('react-native', () => ({
  NativeModules: {
    IMEModule: {
      setComposingText: jest.fn((text: string) => {
        currentComposingText = text;
      }),
      commitText: jest.fn((text: string) => {
        committedText += text;
      }),
      finishComposingText: jest.fn(() => {
        if (currentComposingText) {
          committedText += currentComposingText;
          currentComposingText = '';
        }
      }),
      deleteBackward: jest.fn(() => {
        committedText = committedText.slice(0, -1);
      }),
      sendSpace: jest.fn(() => {
        committedText += ' ';
      }),
      sendEnter: jest.fn(() => {
        committedText += '\n';
      }),
      moveCursorLeft: jest.fn(),
      moveCursorRight: jest.fn(),
    },
  },
  Platform: {
    OS: 'android',
  },
}));

describe('KeyboardStateManager (키보드 상태 관리자)', () => {
  let manager: KeyboardStateManager;
  let updateCallback: jest.Mock;

  beforeEach(() => {
    updateCallback = jest.fn();
    committedText = '';
    currentComposingText = '';
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('IME 환경 (isIME: true) 텍스트 관리 및 시뮬레이션', () => {
    beforeEach(() => {
      manager = new KeyboardStateManager(updateCallback, true);
    });

    const getIMEText = () => {
      return committedText + currentComposingText;
    };

    test('기본적인 한글 입력을 처리해야 한다 (겨울)', () => {
      manager.handlePress('ㄱㅋ'); // ㄱ
      manager.handlePress('·');
      manager.handlePress('·');
      manager.handlePress('ㅣ'); // 겨
      jest.advanceTimersByTime(1100);
      manager.handlePress('ㅇㅁ'); // 겨ㅇ
      manager.handlePress('ㅡ');
      manager.handlePress('·');
      manager.handlePress('ㄴㄹ');
      manager.handlePress('ㄴㄹ'); // 겨울
      expect(getIMEText()).toBe('겨울');
    });

    test('같은 자음 입력을 연속적으로 하는 경우 순환해야 한다', () => {
      manager.handlePress('ㄱㅋ');
      expect(getIMEText()).toBe('ㄱ');
      manager.handlePress('ㄱㅋ');
      expect(getIMEText()).toBe('ㅋ');
      manager.handlePress('ㄱㅋ');
      expect(getIMEText()).toBe('ㄲ');
      manager.handlePress('ㄱㅋ');
      expect(getIMEText()).toBe('ㄱ');
    });

    test('자음 입력 후 일정 시간이 지나면 동일 버튼이라도 순환하지 않아야 한다', () => {
      manager.handlePress('ㄱㅋ'); // ㄱ
      jest.advanceTimersByTime(1100);
      manager.handlePress('ㄱㅋ'); // ㄱ (ㄱㄱ)
      expect(getIMEText()).toBe('ㄱㄱ');
    });

    test('글자 입력 후 외부(시스템/사용자)의 SelectionChange 이벤트가 발생하면 조합이 확정되어야 한다', () => {
      manager.handlePress('ㄱㅋ');
      
      manager.onSelectionChange();
      
      manager.handlePress('ㅣ');
      manager.handlePress('·');
      
      // '가' 가 아니라 'ㄱㅏ' 가 되어야 함 (이전 조합 'ㄱ' 이 확정되었으므로)
      expect(getIMEText()).toBe('ㄱㅏ'); // ㄱㅏ
    });

    test('내부 업데이트 중에는 네이티브에서 이벤트를 보내지 않으므로 조합이 유지된다 (통합 테스트 관점)', () => {
      manager.handlePress('ㄱㅋ');
      manager.handlePress('ㅣ');
      manager.handlePress('·');
      expect(getIMEText()).toBe('가');
    });

    test('타이핑 직후(100ms 이내) 전송 버튼을 눌러도 상태가 초기화되어야 한다 (버그 재현)', () => {
      // 1. '안' 입력
      manager.handlePress('ㅇㅁ'); 
      manager.handlePress('ㅣ');
      manager.handlePress('·');
      manager.handlePress('ㄴㄹ');
      expect(getIMEText()).toBe('안');
      
      // 2. SelectionChange 발생 (전송 버튼 클릭 시뮬레이션)
      manager.onSelectionChange();
      
      // 앱이 입력창을 비웠으므로 mock 상태도 비움
      committedText = '';
      currentComposingText = '';
      
      // 3. 새로운 글자 입력
      manager.handlePress('ㄱㅋ');
      
      // 정상: 'ㄱ' 만 남아야 함
      expect(getIMEText()).toBe('ㄱ');
    });

    test('엔터(Enter) 입력 시 글자 확정 및 엔터 신호 전송', () => {
      manager.handlePress('ㄱㅋ');
      manager.handlePress('Enter');
      expect(IMEModule.finishComposingText).toHaveBeenCalled();
      expect(IMEModule.sendEnter).toHaveBeenCalled();
    });

    test('커서 이동 시 글자 확정', () => {
      manager.handlePress('ㄱㅋ');
      manager.handlePress('Left');
      expect(IMEModule.finishComposingText).toHaveBeenCalled();
      expect(IMEModule.moveCursorLeft).toHaveBeenCalled();
    });

    test('연속적인 모음 조합의 경우에도 정상적으로 이루어져야한다.', () => {
      manager.handlePress('ㅇㅁ');
      manager.handlePress('·');
      manager.handlePress('ㅣ');
      manager.handlePress('ㅣ');
      manager.handlePress('ㄱㅋ');
      manager.handlePress('·');
      manager.handlePress('ㅣ');
      manager.handlePress('ㅣ');
      expect(getIMEText()).toBe('에게');
    });

    test("복잡한 받침을 정확하게 처리해야 한다", () => {
      manager.handlePress('ㅇㅁ'); 
      manager.handlePress('ㅣ');
      manager.handlePress('·'); 
      manager.handlePress('ㄴㄹ');
      manager.handlePress('ㅅㅎ'); 
      manager.handlePress('ㅅㅎ'); // 않
      expect(getIMEText()).toBe('않');
      
      manager.handlePress('ㅂㅍ'); 
      manager.handlePress('ㅂㅍ');
      manager.handlePress('ㅂㅍ');
      manager.handlePress('ㅡ');
      manager.handlePress('·');
      manager.handlePress('·'); 
      manager.handlePress('ㅣ');
      manager.handlePress('ㅣ');  
      manager.handlePress('ㄴㄹ');
      manager.handlePress('ㄴㄹ');
      manager.handlePress('ㅂㅍ'); // 쀏
      expect(getIMEText()).toBe('않쀏');

      manager.handlePress('ㅅㅎ');
      manager.handlePress('ㅅㅎ');
      manager.handlePress('ㅅㅎ');
      manager.handlePress('ㅣ');
      manager.handlePress('·'); 
      manager.handlePress('·'); 
      manager.handlePress('ㅣ');
      manager.handlePress('ㄴㄹ');
      manager.handlePress('ㅈㅊ'); // 썑
      expect(getIMEText()).toBe('않쀏썑');
    });
  });

  describe('영어 및 대소문자 전환 (English & Shift Cycle - IME 환경)', () => {
    beforeEach(() => {
      manager = new KeyboardStateManager(updateCallback, true);
      manager.setMode('en');
    });

    const getIMEText = () => {
      return committedText + currentComposingText;
    };

    test('Shift 버튼 클릭 시 3단계로 순환해야 한다 (0 -> 1 -> 2 -> 0)', () => {
      // 초기 상태: 0 (소문자)
      manager.handlePress('a');
      expect(getIMEText()).toBe('a');

      manager.handlePress('Shift');
      manager.handlePress('b');
      expect(getIMEText()).toBe('aB')

      manager.handlePress('Shift');
      manager.handlePress('Shift');
      manager.handlePress('c');
      manager.handlePress('d');
      expect(getIMEText()).toBe('aBCD');

      manager.handlePress('Shift');
      manager.handlePress('e');
      expect(getIMEText()).toBe('aBCDe');
    });
  });
});
