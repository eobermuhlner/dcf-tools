import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateMultipleFiles, aggregateValidationResults } from './validate-project';
import { findDCFFiles } from '../utils/file-discovery';
import { loadDCFDocument } from '../validation/project';
import { validateDCF } from '../lib/validation';

// Mock the dependencies
vi.mock('../utils/file-discovery', () => ({
  findDCFFiles: vi.fn()
}));

vi.mock('../validation/project', () => ({
  loadDCFDocument: vi.fn()
}));

vi.mock('../lib/validation', () => ({
  validateDCF: vi.fn()
}));

describe('validate-project', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateMultipleFiles', () => {
    it('should validate multiple files and aggregate results', async () => {
      // Mock file discovery
      (findDCFFiles as vi.MockedFunction<typeof findDCFFiles>)
        .mockResolvedValue(['file1.json', 'file2.yaml']);

      // Mock document loading
      (loadDCFDocument as vi.MockedFunction<typeof loadDCFDocument>)
        .mockImplementation(async (file: string) => {
          if (file === 'file1.json') {
            return { dcf_version: '1.0.0', profile: 'standard' };
          }
          return { dcf_version: '1.0.0', profile: 'standard' };
        });

      // Mock validation results
      (validateDCF as vi.MockedFunction<typeof validateDCF>)
        .mockResolvedValueOnce({
          ok: true,
          errors: [],
          warnings: [],
          dcf_version: '1.0.0',
          profile: 'standard'
        })
        .mockResolvedValueOnce({
          ok: false,
          errors: [{ code: 'E_SCHEMA', message: 'Schema error', path: 'field' }],
          warnings: [],
          dcf_version: '1.0.0',
          profile: 'standard'
        });

      const context = {
        profile: 'standard',
        capabilities: [],
        disableCrossValidation: false,
        files: [],
        schemaOverride: undefined
      };

      const result = await validateMultipleFiles(['path'], context);

      expect(result.results).toHaveLength(2);
      expect(result.errors).toHaveLength(1);
      expect(result.ok).toBe(false);
    });

    it('should handle file loading errors', async () => {
      (findDCFFiles as vi.MockedFunction<typeof findDCFFiles>)
        .mockResolvedValue(['invalid-file.json']);

      (loadDCFDocument as vi.MockedFunction<typeof loadDCFDocument>)
        .mockRejectedValue(new Error('File not found'));

      const context = {
        profile: 'standard',
        capabilities: [],
        disableCrossValidation: false,
        files: [],
        schemaOverride: undefined
      };

      const result = await validateMultipleFiles(['path'], context);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('E_TOOL');
      expect(result.ok).toBe(false);
    });
  });

  describe('aggregateValidationResults', () => {
    it('should aggregate results with strict profile', async () => {
      const multiResult = {
        ok: true,
        results: [],
        errors: [],
        warnings: [{ code: 'W_STRICT', message: 'Warning', path: 'test' }]
      };

      const context = {
        profile: 'strict',
        capabilities: [],
        disableCrossValidation: false,
        files: [],
        schemaOverride: undefined
      };

      const result = await aggregateValidationResults(multiResult, context);

      expect(result.errors).toHaveLength(1);
      expect(result.warnings).toHaveLength(0);
      expect(result.ok).toBe(false);
    });
  });
});