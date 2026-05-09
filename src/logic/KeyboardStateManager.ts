import * as Hangul from 'hangul-js';
import { consonantCycles, assembleHangeul } from './hangeul';
import { NativeModules, Platform } from 'react-native';

const { IMEModule } = NativeModules;

export type KeyboardMode = 'ko' | 'en' | 'num';

export class KeyboardStateManager {
  private fullText: string = '';
  private composingJamos: string[] = [];
  private lastButton: string | null = null;
  private lastTimestamp: number = 0;
  private mode: KeyboardMode = 'ko';
  private CYCLE_TIMEOUT = 1000;
  private isIME: boolean = false;

  constructor(onUpdate: (text: string) => void, isIME: boolean = false) {
    this.onUpdate = onUpdate;
    this.isIME = isIME;
  }

  private onUpdate: (text: string) => void;

  public handlePress(button: string) {
    const now = Date.now();
    const isSameButton = this.lastButton === button && (now - this.lastTimestamp < this.CYCLE_TIMEOUT);

    if (this.mode === 'ko') {
      this.handleKorean(button, isSameButton);
    } else {
      this.handleOther(button);
    }

    this.lastButton = button;
    this.lastTimestamp = now;
    this.onUpdate(this.getText());
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
      else this.fullText += ' ';
    } else if (button === 'Backspace') {
      if (this.composingJamos.length > 0) {
        const oldComposing = assembleHangeul(this.composingJamos);
        this.composingJamos.pop();
        if (this.isIME) this.syncToIME(oldComposing);
      } else {
        if (this.isIME && IMEModule) IMEModule.deleteBackward();
        else this.fullText = this.fullText.slice(0, -1);
      }
    } else if (button === 'Enter') {
      this.finalize();
      if (this.isIME && IMEModule) IMEModule.sendEnter();
      else this.fullText += '\n';
    } else {
      this.finalize();
      if (this.isIME && IMEModule) IMEModule.commitText(button);
      else this.fullText += button;
    }
  }

  private syncToIME(oldComposing: string) {
    if (!IMEModule) return;
    const newComposing = assembleHangeul(this.composingJamos);
    if (newComposing.length > 0 && typeof IMEModule.setComposingText === 'function') {
        IMEModule.setComposingText(newComposing);
    } else if (newComposing.length > 0) {
        if (oldComposing.length > 0) {
            for (let i = 0; i < oldComposing.length; i++) {
                IMEModule.deleteBackward();
            }
        }
        IMEModule.commitText(newComposing);
    } else if (typeof IMEModule.finishComposingText === 'function') {
        IMEModule.finishComposingText();
    }
  }

  private handleOther(button: string) {
      if (button === 'Backspace') {
          if (this.isIME && IMEModule) IMEModule.deleteBackward();
          else this.fullText = this.fullText.slice(0, -1);
      } else if (button === 'Space') {
          if (this.isIME && IMEModule) IMEModule.sendSpace();
          else this.fullText += ' ';
      } else if (button === 'Enter') {
          if (this.isIME && IMEModule) IMEModule.sendEnter();
          else this.fullText += '\n';
      } else {
          if (this.isIME && IMEModule) IMEModule.commitText(button);
          else this.fullText += button;
      }
  }

  private finalize() {
    if (this.composingJamos.length > 0) {
      const composed = assembleHangeul(this.composingJamos);
      if (this.isIME && IMEModule && typeof IMEModule.finishComposingText === 'function') {
          IMEModule.finishComposingText();
      } else if (!this.isIME) {
          this.fullText += composed;
      }
      this.composingJamos = [];
    }
  }

  public getText(): string {
    const composingText = assembleHangeul(this.composingJamos);
    return this.fullText + composingText;
  }

  public setMode(mode: KeyboardMode) {
      this.finalize();
      this.mode = mode;
  }
}
