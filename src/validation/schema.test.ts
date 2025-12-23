import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateSchema } from './schema';

// Mock the fetch function globally
global.fetch = vi.fn();

describe('schema validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateSchema', () => {
    it('should validate a valid DCF document', async () => {
      // Mock fetch to return a valid schema
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          type: 'object',
          properties: {
            dcf_version: { type: 'string' },
            profile: { type: 'string' }
          },
          required: ['dcf_version']
        })
      });

      const validDocument = {
        dcf_version: '1.0.0',
        profile: 'standard',
        tokens: {
          colors: {
            primary: { value: '#007acc' }
          }
        }
      };

      const result = await validateSchema(validDocument);

      expect(result.ok).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for document without dcf_version', async () => {
      // Mock fetch to return a valid schema
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          type: 'object',
          properties: {
            dcf_version: { type: 'string' },
            profile: { type: 'string' }
          },
          required: ['dcf_version']
        })
      });

      const invalidDocument = {
        tokens: {
          colors: {
            primary: { value: '#007acc' }
          }
        }
      };

      const result = await validateSchema(invalidDocument);

      expect(result.ok).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('E_SCHEMA');
      expect(result.errors[0].message).toContain('Missing required field: dcf_version');
    });

    it('should use default profile when not specified', async () => {
      // Mock fetch to return a valid schema
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          type: 'object',
          properties: {
            dcf_version: { type: 'string' },
            profile: { type: 'string' }
          },
          required: ['dcf_version']
        })
      });

      const document = {
        dcf_version: '1.0.0',
        tokens: {
          colors: {
            primary: { value: '#007acc' }
          }
        }
      };

      const result = await validateSchema(document);

      expect(result.profile).toBe('standard');
    });
  });
});