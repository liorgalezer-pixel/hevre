import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hevre.app',
  appName: 'Hevre',
  webDir: 'out',
  server: {
    url: 'https://hevre.vercel.app',
    cleartext: false,
  },
};

export default config;
