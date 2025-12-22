import { describe, it, expect } from 'vitest';
import { validateReferences } from '../validation/references';

describe('Reference Validation', () => {
  it('should detect undefined token references', async () => {
    const documentWithInvalidTokenRef = {
      dcf_version: '1.0.0',
      profile: 'standard',
      tokens: {
        colors: {
          primary: '#007acc'
        }
      },
      components: {
        Button: {
          type: 'button',
          background: '{colors.secondary}' // Reference to undefined token
        }
      }
    };

    const result = await validateReferences(documentWithInvalidTokenRef);
    expect(result.ok).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        code: 'E_REFERENCE',
        message: expect.stringContaining('not found')
      })
    );
  });

  it('should pass validation for valid token references', async () => {
    const documentWithValidTokenRef = {
      dcf_version: '1.0.0',
      profile: 'standard',
      tokens: {
        colors: {
          primary: '#007acc'
        }
      },
      components: {
        Button: {
          type: 'button',
          background: '{colors.primary}' // Valid reference
        }
      }
    };

    const result = await validateReferences(documentWithValidTokenRef);
    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should detect undefined component references', async () => {
    const documentWithInvalidComponentRef = {
      dcf_version: '1.0.0',
      profile: 'standard',
      components: {
        Button: {
          type: 'button'
        }
      },
      layouts: {
        MainLayout: {
          regions: [
            {
              component: 'NonExistentComponent' // Reference to undefined component
            }
          ]
        }
      }
    };

    const result = await validateReferences(documentWithInvalidComponentRef);
    expect(result.ok).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        code: 'E_REFERENCE',
        message: expect.stringContaining('not found')
      })
    );
  });

  it('should pass validation for valid component references', async () => {
    const documentWithValidComponentRef = {
      dcf_version: '1.0.0',
      profile: 'standard',
      components: {
        Button: {
          type: 'button'
        }
      },
      layouts: {
        MainLayout: {
          regions: [
            {
              component: 'Button' // Valid reference
            }
          ]
        }
      }
    };

    const result = await validateReferences(documentWithValidComponentRef);
    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});