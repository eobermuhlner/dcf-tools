import { describe, it, expect } from 'vitest';
import { normalizeDCF } from './core';

describe('normalizeDCF', () => {
  it('should normalize a simple DCF document', () => {
    const input = {
      profile: 'standard',
      dcf_version: '1.0.0',
      tokens: {
        colors: {
          primary: '#007acc'
        }
      },
      components: {
        Button: {
          type: 'button'
        }
      }
    };

    const result = normalizeDCF(input, 'test.json');

    // Should include the original content
    expect(result.dcf_version).toBe('1.0.0');
    expect(result.profile).toBe('standard');
    expect(result.tokens.colors.primary).toBe('#007acc');
    expect(result.components.Button.type).toBe('button');

    // Should include meta section
    expect(result.meta).toBeDefined();
    expect(result.meta.source).toBe('test.json');
    expect(result.meta.dcf_version).toBe('1.0.0');
    expect(result.meta.profile).toBe('standard');
    expect(result.meta.format).toBe('canonical-json');
  });

  it('should handle missing profile with default', () => {
    const input = {
      dcf_version: '1.0.0',
      tokens: {
        colors: {
          primary: '#007acc'
        }
      }
    };

    const result = normalizeDCF(input, 'test.json');

    expect(result.dcf_version).toBe('1.0.0');
    expect(result.profile).toBe('standard'); // Default value
    expect(result.tokens.colors.primary).toBe('#007acc');
  });

  it('should create deterministic key ordering', () => {
    // Test with an object that has keys in non-alphabetical order
    const input = {
      zebra: 'last',
      alpha: 'first',
      beta: 'second',
      dcf_version: '1.0.0',
      profile: 'standard'
    };

    const result = normalizeDCF(input, 'test.json');

    // Get the keys of the result object (excluding meta which is added separately)
    const keys = Object.keys(result);
    const keysWithoutMeta = keys.filter(key => key !== 'meta');
    
    // Should be in alphabetical order with dcf_version and profile first as they're preserved from source
    // Actually, the orderKeys function should sort all keys alphabetically
    const expectedOrder = ['alpha', 'beta', 'dcf_version', 'profile', 'zebra'];
    expect(keysWithoutMeta).toEqual(expectedOrder);
  });

  it('should handle nested objects with key ordering', () => {
    const input = {
      dcf_version: '1.0.0',
      profile: 'standard',
      z_tokens: {
        z_color: '#fff',
        a_color: '#000'
      },
      a_components: {
        z_widget: { type: 'widget' },
        a_button: { type: 'button' }
      }
    };

    const result = normalizeDCF(input, 'test.json');

    // Check that nested objects also have their keys ordered
    expect(Object.keys(result.z_tokens)).toEqual(['a_color', 'z_color']);
    expect(Object.keys(result.a_components)).toEqual(['a_button', 'z_widget']);
  });
});