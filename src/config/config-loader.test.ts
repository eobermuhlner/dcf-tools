import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadConfig, mergeConfig, DCFConfig } from './config-loader';
import { promises as fs } from 'fs';

// Mock the file system
vi.mock('fs', () => ({
  promises: {
    readFile: vi.fn()
  }
}));

describe('config-loader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loadConfig', () => {
    it('should load JSON configuration', async () => {
      const mockConfig = {
        dcf_version: '1.0.0',
        profile: 'standard',
        capabilities: ['tokens', 'components']
      };
      
      (fs.readFile as vi.MockedFunction<typeof fs.readFile>)
        .mockResolvedValue(JSON.stringify(mockConfig));
      
      const result = await loadConfig('config.json');
      
      expect(result).toEqual(mockConfig);
    });

    it('should load YAML configuration', async () => {
      const yamlContent = `
dcf_version: "1.0.0"
profile: "strict"
capabilities:
  - "tokens"
  - "components"
`;
      
      (fs.readFile as vi.MockedFunction<typeof fs.readFile>)
        .mockResolvedValue(yamlContent);
      
      const result = await loadConfig('config.yaml');
      
      expect(result).toEqual({
        dcf_version: '1.0.0',
        profile: 'strict',
        capabilities: ['tokens', 'components']
      });
    });

    it('should validate profile values', async () => {
      const invalidConfig = {
        profile: 'invalid-profile'
      };
      
      (fs.readFile as vi.MockedFunction<typeof fs.readFile>)
        .mockResolvedValue(JSON.stringify(invalidConfig));
      
      await expect(loadConfig('config.json')).rejects.toThrow('Invalid profile');
    });

    it('should validate capabilities array', async () => {
      const invalidConfig = {
        capabilities: 'not-an-array'
      };

      (fs.readFile as vi.MockedFunction<typeof fs.readFile>)
        .mockResolvedValue(JSON.stringify(invalidConfig));

      await expect(loadConfig('config.json')).rejects.toThrow('Capabilities in config file config.json must be an array');
    });
  });

  describe('mergeConfig', () => {
    it('should merge config file with CLI options respecting precedence', async () => {
      const mockConfig = {
        profile: 'standard',
        capabilities: ['tokens']
      };
      
      (fs.readFile as vi.MockedFunction<typeof fs.readFile>)
        .mockResolvedValue(JSON.stringify(mockConfig));
      
      const result = await mergeConfig(
        'config.json',
        'strict', // CLI profile override
        'tokens,components,screens' // CLI capabilities override
      );
      
      expect(result.profile).toBe('strict'); // CLI should override config
      expect(result.capabilities).toEqual(['tokens', 'components', 'screens']); // CLI should override config
    });

    it('should use config file values when CLI options are not provided', async () => {
      const mockConfig = {
        profile: 'strict',
        capabilities: ['tokens', 'components']
      };
      
      (fs.readFile as vi.MockedFunction<typeof fs.readFile>)
        .mockResolvedValue(JSON.stringify(mockConfig));
      
      const result = await mergeConfig('config.json', undefined, undefined);
      
      expect(result.profile).toBe('strict');
      expect(result.capabilities).toEqual(['tokens', 'components']);
    });

    it('should use default profile when no config file or CLI profile provided', async () => {
      const result = await mergeConfig(undefined, undefined, undefined, 'lite');
      
      expect(result.profile).toBe('lite');
    });
  });
});