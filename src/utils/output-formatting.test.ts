import { describe, it, expect } from 'vitest';
import { formatJsonOutput, formatTextOutput, getExitCode } from './output-formatting';

describe('output-formatting', () => {
  describe('formatJsonOutput', () => {
    it('should format results as JSON', () => {
      const multiFileResult = {
        ok: true,
        results: [
          { 
            file: 'file1.json', 
            result: { 
              ok: true, 
              errors: [], 
              warnings: [],
              dcf_version: '1.0.0',
              profile: 'standard'
            } 
          }
        ],
        errors: [],
        warnings: []
      };

      const output = formatJsonOutput(multiFileResult);
      const parsed = JSON.parse(output);

      expect(parsed).toHaveProperty('ok');
      expect(parsed).toHaveProperty('filesValidated');
      expect(parsed).toHaveProperty('totalErrors');
      expect(parsed).toHaveProperty('totalWarnings');
    });

    it('should include cross-file validation results if provided', () => {
      const multiFileResult = {
        ok: true,
        results: [],
        errors: [],
        warnings: []
      };

      const crossFileResult = {
        ok: false,
        errors: [{ code: 'E_REFERENCE', message: 'Missing reference', path: 'file:ref' }],
        warnings: []
      };

      const output = formatJsonOutput(multiFileResult, crossFileResult);
      const parsed = JSON.parse(output);

      expect(parsed.crossFileValidation).toBeDefined();
      expect(parsed.ok).toBe(false); // Should be false because cross-file validation failed
    });
  });

  describe('formatTextOutput', () => {
    it('should format results as human-readable text', () => {
      const multiFileResult = {
        ok: true,
        results: [
          { 
            file: 'file1.json', 
            result: { 
              ok: true, 
              errors: [], 
              warnings: [],
              dcf_version: '1.0.0',
              profile: 'standard'
            } 
          }
        ],
        errors: [],
        warnings: []
      };

      const output = formatTextOutput(multiFileResult);

      expect(output).toContain('DCF Validation Results');
      expect(output).toContain('Files validated: 1');
      expect(output).toContain('Status: VALID');
    });

    it('should include errors grouped by file', () => {
      const multiFileResult = {
        ok: false,
        results: [
          { 
            file: 'file1.json', 
            result: { 
              ok: false, 
              errors: [{ code: 'E_SCHEMA', message: 'Schema error', path: 'field' }], 
              warnings: [],
              dcf_version: '1.0.0',
              profile: 'standard'
            } 
          }
        ],
        errors: [{ code: 'E_SCHEMA', message: 'Schema error', path: 'file1.json:field' }],
        warnings: []
      };

      const output = formatTextOutput(multiFileResult);

      expect(output).toContain('Errors:');
      expect(output).toContain('file1.json (1):');
      expect(output).toContain('[E_SCHEMA] Schema error');
    });

    it('should respect quiet mode', () => {
      const multiFileResult = {
        ok: true,
        results: [
          { 
            file: 'file1.json', 
            result: { 
              ok: true, 
              errors: [], 
              warnings: [{ code: 'W_INFO', message: 'Info warning', path: 'field' }],
              dcf_version: '1.0.0',
              profile: 'standard'
            } 
          }
        ],
        errors: [],
        warnings: [{ code: 'W_INFO', message: 'Info warning', path: 'file1.json:field' }]
      };

      const output = formatTextOutput(multiFileResult, undefined, true); // quiet mode

      // In quiet mode, warnings should not appear
      expect(output).not.toContain('Warnings:');
      expect(output).not.toContain('Info warning');
    });
  });

  describe('getExitCode', () => {
    it('should return 0 for successful validation', () => {
      const multiFileResult = {
        ok: true,
        results: [],
        errors: [],
        warnings: []
      };

      const exitCode = getExitCode(multiFileResult);

      expect(exitCode).toBe(0);
    });

    it('should return 1 for validation errors', () => {
      const multiFileResult = {
        ok: false,
        results: [],
        errors: [{ code: 'E_SCHEMA', message: 'Error', path: 'path' }],
        warnings: []
      };

      const exitCode = getExitCode(multiFileResult);

      expect(exitCode).toBe(1);
    });

    it('should return 1 for warnings when failOn is warn', () => {
      const multiFileResult = {
        ok: true,
        results: [],
        errors: [],
        warnings: [{ code: 'W_INFO', message: 'Warning', path: 'path' }]
      };

      const exitCode = getExitCode(multiFileResult, undefined, 'warn');

      expect(exitCode).toBe(1);
    });

    it('should return 0 for warnings when failOn is error', () => {
      const multiFileResult = {
        ok: true,
        results: [],
        errors: [],
        warnings: [{ code: 'W_INFO', message: 'Warning', path: 'path' }]
      };

      const exitCode = getExitCode(multiFileResult, undefined, 'error');

      expect(exitCode).toBe(0);
    });
  });
});