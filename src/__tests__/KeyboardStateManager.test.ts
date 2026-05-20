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

  describe('시스템 키보드 모드 (isIME: true)', () => {
    beforeEach(() => {
      manager = new KeyboardStateManager(updateCallback, true);
    });

    test('글자 입력 시 setComposingText가 호출되어야 한다', () => {
      manager.handlePress('ㄱㅋ'); // ㄱ
      expect(IMEModule.setComposingText).toHaveBeenCalledWith('ㄱ');
      
      manager.handlePress('ㅣ'); // 기
      expect(IMEModule.setComposingText).toHaveBeenCalledWith('기');
    });

    test('Space 입력 시 조합 중인 글자를 확정하고 Space를 전송해야 한다', () => {
      manager.handlePress('ㄱㅋ');
      manager.handlePress('ㅣ');
      manager.handlePress('·'); // 가
      
      manager.handlePress('Space');
      expect(IMEModule.finishComposingText).toHaveBeenCalled();
      expect(IMEModule.sendSpace).toHaveBeenCalled();
    });

    test('Backspace 입력 시 조합 중이면 composingText를 업데이트하고, 비어있으면 deleteBackward를 호출해야 한다', () => {
      manager.handlePress('ㄱㅋ'); // ㄱ
      manager.handlePress('ㅣ');   // 기
      manager.handlePress('Backspace');
      expect(IMEModule.setComposingText).toHaveBeenCalledWith('ㄱ');

      manager.handlePress('Backspace');
      expect(IMEModule.finishComposingText).toHaveBeenCalled();

      manager.handlePress('Backspace');
      expect(IMEModule.deleteBackward).toHaveBeenCalled();
    });

    test('동일 버튼 연타로 자음 순환 시 setComposingText가 지속적으로 호출되어야 한다', () => {
      manager.handlePress('ㄱㅋ'); // ㄱ
      expect(IMEModule.setComposingText).toHaveBeenCalledWith('ㄱ');
      
      manager.handlePress('ㄱㅋ'); // ㅋ
      expect(IMEModule.setComposingText).toHaveBeenCalledWith('ㅋ');
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
});
