import { tailwindPreset } from '@tsi/tokens';
import type { Config } from 'tailwindcss';

const config: Config = {
  presets: [tailwindPreset as Config],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
};

export default config;
