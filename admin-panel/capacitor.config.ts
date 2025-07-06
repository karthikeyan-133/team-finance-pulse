import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.adminpanel.7acb16e4faa940c5a598ca38e8d6a9cd',
  appName: 'Management Panel',
  webDir: 'dist',
  server: {
    url: 'https://7acb16e4-faa9-40c5-a598-ca38e8d6a9cd.lovableproject.com/admin-panel?forceHideBadge=true',
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