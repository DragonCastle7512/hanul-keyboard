declare module 'hangul-js' {
  export function assemble(jamos: string[]): string;
  export function disassemble(str: string): string[];
  export function isHangul(char: string): boolean;
  export function isConsonant(char: string): boolean;
  export function isVowel(char: string): boolean;
  export function isCho(char: string): boolean;
  export function isJung(char: string): boolean;
  export function isJong(char: string): boolean;
}
