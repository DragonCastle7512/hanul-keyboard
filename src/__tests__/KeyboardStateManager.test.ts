import { KeyboardStateManager } from '../logic/KeyboardStateManager';
import { NativeModules } from 'react-native';

const { IMEModule } = NativeModules;

// NativeModules 모킹
jest.mock('react-native', () => ({
  NativeModules: {
    IMEModule: {
      setComposingText: jest.fn(),
      commitText: jest.fn(),
      finishComposingText: jest.fn(),
      deleteBackward: jest.fn(),
      sendSpace: jest.fn(),
      sendEnter: jest.fn(),
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
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('앱 내 텍스트 관리 모드 (isIME: false)', () => {
    beforeEach(() => {
      manager = new KeyboardStateManager(updateCallback, false);
    });

    test('기본적인 한글 입력을 처리해야 한다 (하눌)', () => {
      manager.handlePress('ㅅㅎ');
      manager.handlePress('ㅅㅎ'); // ㅎ
      manager.handlePress('ㅣ');
      manager.handlePress('·');   // 하
      manager.handlePress('ㄴㄹ'); // 한 (ㄴ)
      manager.handlePress('ㅡ');
      manager.handlePress('·');   // 하누
      manager.handlePress('ㄴㄹ');
      manager.handlePress('ㄴㄹ'); // 하눌 (ㄹ)
      expect(manager.getText()).toBe('하눌');
    });

    test('같은 자음 입력을 연속적으로 하는 경우 순환해야 한다', () => {
      manager.handlePress('ㄱㅋ');
      expect(manager.getText()).toBe('ㄱ');
      manager.handlePress('ㄱㅋ');
      expect(manager.getText()).toBe('ㅋ');
      manager.handlePress('ㄱㅋ');
      expect(manager.getText()).toBe('ㄲ');
      manager.handlePress('ㄱㅋ');
      expect(manager.getText()).toBe('ㄱ');
    });

    test('자음 입력 후 일정 시간이 지나면 동일 버튼이라도 순환하지 않아야 한다', () => {
      manager.handlePress('ㄱㅋ'); // ㄱ
      jest.advanceTimersByTime(1100);
      manager.handlePress('ㄱㅋ'); // ㄱ (ㄱㄱ)
      expect(manager.getText()).toBe('ㄱㄱ');
    });
  });

  describe('공통 및 예외 케이스', () => {
    test('엔터(Enter) 입력 시 글자 확정 및 엔터 신호 전송', () => {
      manager = new KeyboardStateManager(updateCallback, true);
      manager.handlePress('ㄱㅋ');
      manager.handlePress('Enter');
      expect(IMEModule.finishComposingText).toHaveBeenCalled();
      expect(IMEModule.sendEnter).toHaveBeenCalled();
    });

    test('커서 이동 시 글자 확정', () => {
      manager = new KeyboardStateManager(updateCallback, true);
      manager.handlePress('ㄱㅋ');
      manager.handlePress('Left');
      expect(IMEModule.finishComposingText).toHaveBeenCalled();
      expect(IMEModule.moveCursorLeft).toHaveBeenCalled();
    });
  });

  describe('영어 및 대소문자 전환 (English & Shift Cycle)', () => {
    beforeEach(() => {
      manager = new KeyboardStateManager(updateCallback, false);
      manager.setMode('en');
    });

    test('Shift 버튼 클릭 시 3단계로 순환해야 한다 (0 -> 1 -> 2 -> 0)', () => {
      // 초기 상태: 0 (소문자)
      manager.handlePress('a');
      expect(manager.getText()).toBe('a');

      manager.handlePress('Shift');
      manager.handlePress('b');
      expect(manager.getText()).toBe('aB')

      manager.handlePress('Shift');
      manager.handlePress('Shift');
      manager.handlePress('c');
      manager.handlePress('d');
      expect(manager.getText()).toBe('aBCD');

      manager.handlePress('Shift');
      manager.handlePress('e');
      expect(manager.getText()).toBe('aBCDe');
    });
  });
});
