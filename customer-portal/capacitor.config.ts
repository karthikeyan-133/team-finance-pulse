import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lovable.customer.slickerconnect',
  appName: 'Customer Portal',
  webDir: 'dist',
  server: {
    url: 'https://7acb16e4-faa9-40c5-a598-ca38e8d6a9cd.lovableproject.com/customer-portal?forceHideBadge=true',
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