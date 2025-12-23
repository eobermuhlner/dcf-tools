import { describe, it, expect } from 'vitest';
import { validateCrossFileReferences } from './cross-file';

describe('cross-file validation', () => {
  describe('validateCrossFileReferences', () => {
    it('should validate token references across files', async () => {
      const filesWithDocs = [
        {
          file: 'tokens.json',
          document: {
            tokens: {
              colors: {
                primary: { value: '#007acc' }
              }
            }
          }
        },
        {
          file: 'components.json',
          document: {
            components: {
              Button: {
                tokens: {
                  primary: {
                    backgroundColor: '{tokens.colors.primary}'
                  }
                }
              }
            }
          }
        }
      ];

      const result = await validateCrossFileReferences(filesWithDocs);

      expect(result.ok).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing token references across files', async () => {
      const filesWithDocs = [
        {
          file: 'components.json',
          document: {
            components: {
              Button: {
                tokens: {
                  primary: {
                    backgroundColor: '{tokens.colors.nonexistent}'
                  }
                }
              }
            }
          }
        },
        {
          file: 'tokens.json',
          document: {
            tokens: {
              colors: {
                primary: { value: '#007acc' }
              }
            }
          }
        }
      ];

      const result = await validateCrossFileReferences(filesWithDocs);

      expect(result.ok).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('not found in any file');
    });

    it('should validate component references across files', async () => {
      const filesWithDocs = [
        {
          file: 'components.json',
          document: {
            components: {
              Button: {}
            }
          }
        },
        {
          file: 'layouts.json',
          document: {
            layouts: {
              MainLayout: {
                content: [
                  {
                    component: 'Button'
                  }
                ]
              }
            }
          }
        }
      ];

      const result = await validateCrossFileReferences(filesWithDocs);

      expect(result.ok).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing component references across files', async () => {
      const filesWithDocs = [
        {
          file: 'layouts.json',
          document: {
            layouts: {
              MainLayout: {
                content: [
                  {
                    component: 'NonExistentButton'
                  }
                ]
              }
            }
          }
        },
        {
          file: 'components.json',
          document: {
            components: {
              Button: {}
            }
          }
        }
      ];

      const result = await validateCrossFileReferences(filesWithDocs);

      expect(result.ok).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('not found in any file');
    });

    it('should work with empty capabilities list', async () => {
      const filesWithDocs = [
        {
          file: 'tokens.json',
          document: {
            tokens: {
              colors: {
                primary: { value: '#007acc' }
              }
            }
          }
        }
      ];

      const result = await validateCrossFileReferences(filesWithDocs, []);

      expect(result.ok).toBe(true);
    });
  });
});