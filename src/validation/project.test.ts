import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadProjectManifest, getProjectConfig } from '../validation/project';

// Mock fs module
vi.mock('fs', async () => {
  const actual = await vi.importActual('fs');
  return {
    ...actual,
    promises: {
      ...actual.promises,
      readFile: vi.fn(),
      stat: vi.fn(),
      readdir: vi.fn()
    }
  };
});

import { promises as fs } from 'fs';

describe('Project Loading', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load a valid project manifest', async () => {
    const mockManifest = {
      dcf_project: 1,
      name: 'test-project',
      projects: {
        web: {
          root: './web',
          layers: ['base.json', 'theme.json']
        }
      }
    };

    vi.spyOn(fs, 'readFile').mockResolvedValue(JSON.stringify(mockManifest));

    const result = await loadProjectManifest('test/manifest.yaml');
    expect(result.name).toBe('test-project');
    expect(result.projects).toHaveProperty('web');
  });

  it('should get project config by name', () => {
    const mockManifest = {
      dcf_project: 1,
      name: 'test-project',
      projects: {
        web: {
          root: './web',
          layers: ['base.json', 'theme.json']
        },
        mobile: {
          root: './mobile', 
          layers: ['base.json', 'mobile-theme.json']
        }
      }
    };

    const config = getProjectConfig(mockManifest, 'web');
    expect(config.root).toBe('./web');
    expect(config.layers).toContain('base.json');
  });

  it('should return first project if no name specified', () => {
    const mockManifest = {
      dcf_project: 1,
      name: 'test-project',
      projects: {
        web: {
          root: './web',
          layers: ['base.json']
        }
      }
    };

    const config = getProjectConfig(mockManifest);
    expect(config.root).toBe('./web');
  });
});