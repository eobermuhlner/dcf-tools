import { describe, it, expect } from 'vitest';
import { formatOutput } from './format';

describe('formatOutput', () => {
  const testDocument = {
    dcf_version: '1.0.0',
    profile: 'standard',
    tokens: {
      colors: {
        primary: '#007acc'
      }
    }
  };

  it('should format as JSON by default', () => {
    const result = formatOutput(testDocument, { format: 'json', pretty: false });
    expect(result).toBe(JSON.stringify(testDocument));
  });

  it('should format as pretty JSON when specified', () => {
    const result = formatOutput(testDocument, { format: 'json', pretty: true });
    expect(result).toBe(JSON.stringify(testDocument, null, 2));
  });

  it('should format as YAML when specified', () => {
    const result = formatOutput(testDocument, { format: 'yaml', pretty: false });
    // Should contain YAML representation
    expect(result).toContain('dcf_version: 1.0.0');
    expect(result).toContain('profile: standard');
  });

  it('should format as pretty YAML when specified', () => {
    const result = formatOutput(testDocument, { format: 'yaml', pretty: true });
    // Should contain YAML representation with proper indentation
    expect(result).toContain('dcf_version: 1.0.0');
    expect(result).toContain('profile: standard');
  });
});