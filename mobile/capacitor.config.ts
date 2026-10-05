import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'kg.moymarket.app',
  appName: 'Мой Маркет',
  webDir: 'www',
  bundledWebRuntime: false,
  android: {
    backgroundColor: '#05090d',
    allowMixedContent: false
  },
  ios: {
    backgroundColor: '#05090d',
    contentInset: 'automatic'
  }
};

export default config;
