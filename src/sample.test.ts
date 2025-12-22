import { describe, it, expect } from 'vitest';

describe('Sample test suite', () => {
  it('should pass a basic test', () => {
    expect(1).toBe(1);
  });

  it('should demonstrate string operations', () => {
    const str = 'hello world';
    expect(str.toUpperCase()).toBe('HELLO WORLD');
  });
});