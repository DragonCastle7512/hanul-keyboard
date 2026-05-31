import * as Hangul from 'hangul-js';
import { consonantCycles, assembleHangeul } from './hangeul';
import { NativeModules, Platform } from 'react-native';

const { IMEModule } = NativeModules;

export type KeyboardMode = 'ko' | 'en' | 'num' | 'sym1' | 'sym2';

export class KeyboardStateManager {
  private fullText: string = '';
  private composingJamos: string[] = [];
  private lastButton: string | null = null;
  private lastTimestamp: number = 0;
  private mode: KeyboardMode = 'ko';
  private shiftState: number = 0; // 0: lower, 1: upper, 2: capslock
  private CYCLE_TIMEOUT = 1000;
  private isIME: boolean = false;
  private cursorIndex: number = 0;

  constructor(onUpdate: (text: string, shiftState: number, cursorIndex: number) => void, isIME: boolean = false) {
    this.onUpdate = onUpdate;
    this.isIME = isIME;
  }

  private onUpdate: (text: string, shiftState: number, cursorIndex: number) => void;

  public handlePress(button: string) {
    const now = Date.now();
    const isSameButton = this.lastButton === button && (now - this.lastTimestamp < this.CYCLE_TIMEOUT);

    if (button === 'Shift') {
      this.shiftState = (this.shiftState + 1) % 3;
    } else if (this.mode === 'ko') {
      this.handleKorean(button, isSameButton);
    } else {
      this.handleOther(button);
    }

    this.lastButton = button;
    this.lastTimestamp = now;
    this.onUpdate(this.getText(), this.shiftState, this.cursorIndex + assembleHangeul(this.composingJamos).length);
  }

  private handleKorean(button: string, isSameButton: boolean) {
    const isConsonant = consonantCycles[button] && !['.,', ':;', '?!', '^~', '@/'].includes(button);
    const isSymbol = ['.,', ':;', '?!', '^~', '@/'].includes(button);

    if (isConsonant) {
      const cycle = consonantCycles[button];
      if (isSameButton) {
        const lastJamo = this.composingJamos[this.composingJamos.length - 1];
        const index = cycle.indexOf(lastJamo);
        if (index !== -1) {
          const oldComposing = assembleHangeul(this.composingJamos);
          this.composingJamos[this.composingJamos.length - 1] = cycle[(index + 1) % cycle.length];
          if (this.isIME) this.syncToIME(oldComposing);
        } else {
          this.composingJamos.push(cycle[0]);
          if (this.isIME) this.syncToIME("");
        }
      } else {
        this.composingJamos.push(cycle[0]);
        if (this.isIME) this.syncToIME("");
      }
    } else if (isSymbol) {
      const cycle = consonantCycles[button];
      if (isSameButton) {
        const lastChar = this.composingJamos[this.composingJamos.length - 1];
        const index = cycle.indexOf(lastChar);
        if (index !== -1) {
          const oldComposing = assembleHangeul(this.composingJamos);
          this.composingJamos[this.composingJamos.length - 1] = cycle[(index + 1) % cycle.length];
          if (this.isIME) this.syncToIME(oldComposing);
        } else {
          this.finalize();
          this.composingJamos.push(cycle[0]);
          if (this.isIME) this.syncToIME("");
        }
      } else {
        this.finalize();
        this.composingJamos.push(cycle[0]);
        if (this.isIME) this.syncToIME("");
      }
    } else if (button === 'ㅣ' || button === '·' || button === 'ㅡ') {
      const oldComposing = assembleHangeul(this.composingJamos);
      this.composingJamos.push(button);
      if (this.isIME) this.syncToIME(oldComposing);
    } else if (button === 'Space') {
      this.finalize();
      if (this.isIME && IMEModule) IMEModule.sendSpace();
      else {
        const leftText = this.fullText.slice(0, this.cursorIndex);
        const rightText = this.fullText.slice(this.cursorIndex);
        this.fullText = leftText + ' ' + rightText;
        this.cursorIndex += 1;
      }
    } else if (button === 'Backspace') {
      if (this.composingJamos.length > 0) {
        const oldComposing = assembleHangeul(this.composingJamos);
        this.composingJamos.pop();
        if (this.isIME) this.syncToIME(oldComposing);
      } else {
        if (this.isIME && IMEModule) IMEModule.deleteBackward();
        else {
          if (this.cursorIndex > 0) {
            const leftText = this.fullText.substring(0, this.cursorIndex);
            const rightText = this.fullText.substring(this.cursorIndex);
            const leftChars = Array.from(leftText);
            leftChars.pop();
            const newLeftText = leftChars.join('');
            this.fullText = newLeftText + rightText;
            this.cursorIndex = newLeftText.length;
          }
        }
      }
    } else if (button === 'Enter') {
      this.finalize();
      if (this.isIME && IMEModule) IMEModule.sendEnter();
      else {
        const leftText = this.fullText.slice(0, this.cursorIndex);
        const rightText = this.fullText.slice(this.cursorIndex);
        this.fullText = leftText + '\n' + rightText;
        this.cursorIndex += 1;
      }
    } else if (button === 'Left') {
      this.finalize();
      if (this.isIME && IMEModule) {
        IMEModule.moveCursorLeft();
      } else if (!this.isIME) {
        if (this.cursorIndex > 0) {
          const leftText = this.fullText.substring(0, this.cursorIndex);
          const leftChars = Array.from(leftText);
          if (leftChars.length > 0) {
            leftChars.pop();
            this.cursorIndex = leftChars.join('').length;
          }
        }
      }
    } else if (button === 'Right') {
      this.finalize();
      if (this.isIME && IMEModule) {
        IMEModule.moveCursorRight();
      } else if (!this.isIME) {
        if (this.cursorIndex < this.fullText.length) {
          const rightText = this.fullText.substring(this.cursorIndex);
          const rightChars = Array.from(rightText);
          if (rightChars.length > 0) {
            const firstChar = rightChars[0];
            this.cursorIndex += firstChar.length;
          }
        }
      }
    } else {
      this.finalize();
      if (this.isIME && IMEModule) IMEModule.commitText(button);
      else {
        const leftText = this.fullText.slice(0, this.cursorIndex);
        const rightText = this.fullText.slice(this.cursorIndex);
        this.fullText = leftText + button + rightText;
        this.cursorIndex += button.length;
      }
    }
  }

  private syncToIME(oldComposing: string) {
    if (!IMEModule) return;
    const newComposing = assembleHangeul(this.composingJamos);
    
    const isKorean = (char: string) => /^[ㄱ-ㅎㅏ-ㅣ·]$/.test(char);
    
    if (newComposing.length > 1) {
        const remaining = newComposing.slice(-1);
        if (isKorean(remaining)) {
            IMEModule.setComposingText(newComposing);
        } else {
            const committed = newComposing.slice(0, -1);
            IMEModule.commitText(committed);
            IMEModule.setComposingText(remaining);
            const remainingJamos = Hangul.disassemble(remaining);
            this.composingJamos = remainingJamos;
        }
    } else if (newComposing.length === 1) {
        IMEModule.setComposingText(newComposing);
    } else {
        if (typeof IMEModule.setComposingText === 'function') {
            IMEModule.setComposingText("");
        }
        if (typeof IMEModule.finishComposingText === 'function') {
            IMEModule.finishComposingText();
        }
    }
  }

  private handleOther(button: string) {
      if (button === 'Backspace') {
          if (this.isIME && IMEModule) IMEModule.deleteBackward();
          else {
              if (this.cursorIndex > 0) {
                  const leftText = this.fullText.substring(0, this.cursorIndex);
                  const rightText = this.fullText.substring(this.cursorIndex);
                  const leftChars = Array.from(leftText);
                  leftChars.pop();
                  const newLeftText = leftChars.join('');
                  this.fullText = newLeftText + rightText;
                  this.cursorIndex = newLeftText.length;
              }
          }
      } else if (button === 'Space') {
          if (this.isIME && IMEModule) IMEModule.sendSpace();
          else {
              const leftText = this.fullText.slice(0, this.cursorIndex);
              const rightText = this.fullText.slice(this.cursorIndex);
              this.fullText = leftText + ' ' + rightText;
              this.cursorIndex += 1;
          }
      } else if (button === 'Enter') {
          if (this.isIME && IMEModule) IMEModule.sendEnter();
          else {
              const leftText = this.fullText.slice(0, this.cursorIndex);
              const rightText = this.fullText.slice(this.cursorIndex);
              this.fullText = leftText + '\n' + rightText;
              this.cursorIndex += 1;
          }
      } else if (button === 'Left') {
          if (this.isIME && IMEModule) {
              IMEModule.moveCursorLeft();
          } else if (!this.isIME) {
              if (this.cursorIndex > 0) {
                  const leftText = this.fullText.substring(0, this.cursorIndex);
                  const leftChars = Array.from(leftText);
                  if (leftChars.length > 0) {
                      leftChars.pop();
                      this.cursorIndex = leftChars.join('').length;
                  }
              }
          }
      } else if (button === 'Right') {
          if (this.isIME && IMEModule) {
              IMEModule.moveCursorRight();
          } else if (!this.isIME) {
              if (this.cursorIndex < this.fullText.length) {
                  const rightText = this.fullText.substring(this.cursorIndex);
                  const rightChars = Array.from(rightText);
                  if (rightChars.length > 0) {
                      const firstChar = rightChars[0];
                      this.cursorIndex += firstChar.length;
                  }
              }
          }
      } else {
          let textToCommit = button;
          const isLetter = /^[a-z]$/i.test(button);
          
          if (isLetter && this.shiftState > 0) {
              textToCommit = button.toUpperCase();
              if (this.shiftState === 1) {
                  this.shiftState = 0;
              }
          }

          if (this.isIME && IMEModule) IMEModule.commitText(textToCommit);
          else {
              const leftText = this.fullText.slice(0, this.cursorIndex);
              const rightText = this.fullText.slice(this.cursorIndex);
              this.fullText = leftText + textToCommit + rightText;
              this.cursorIndex += textToCommit.length;
          }
      }
  }

  private finalize() {
    if (this.composingJamos.length > 0) {
      const composed = assembleHangeul(this.composingJamos);
      if (this.isIME && IMEModule && typeof IMEModule.finishComposingText === 'function') {
          IMEModule.finishComposingText();
      } else if (!this.isIME) {
          const leftText = this.fullText.slice(0, this.cursorIndex);
          const rightText = this.fullText.slice(this.cursorIndex);
          this.fullText = leftText + composed + rightText;
          this.cursorIndex += composed.length;
      }
      this.composingJamos = [];
    }
  }

  public getText(): string {
    const composingText = assembleHangeul(this.composingJamos);
    const leftText = this.fullText.slice(0, this.cursorIndex);
    const rightText = this.fullText.slice(this.cursorIndex);
    return leftText + composingText + rightText;
  }

  public setMode(mode: KeyboardMode) {
      this.finalize();
      this.mode = mode;
  }

  public onSelectionChange() {
    this.finalize();
  }

  public onFinishComposing() {
    this.finalize();
  }

  public reset() {
    this.fullText = '';
    this.composingJamos = [];
    this.lastButton = null;
    this.lastTimestamp = 0;
    this.cursorIndex = 0;
    this.onUpdate('', this.shiftState, 0);
  }
}
