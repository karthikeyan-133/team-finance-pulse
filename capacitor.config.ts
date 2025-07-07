import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lovable.admin.slickerconnect',
  appName: 'Admin Panel',
  webDir: 'dist',
  server: {
    url: 'https://7acb16e4-faa9-40c5-a598-ca38e8d6a9cd.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false
    }
  }
};

export default config;