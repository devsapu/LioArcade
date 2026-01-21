# LioArcade Mobile App

A simple WebView wrapper that loads the LioArcade website (`https://lioarcade.com`) in a native mobile app.

## Why WebView?

This approach allows you to:
- ✅ Use your existing web app without rebuilding
- ✅ Easily add AdMob and Google Ads
- ✅ Maintain one codebase (web)
- ✅ Quick deployment to app stores
- ✅ Native app experience with web content

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the app:**
   ```bash
   npm start
   ```

3. **Run on iOS:**
   ```bash
   npm run ios
   ```

4. **Run on Android:**
   ```bash
   npm run android
   ```

## Configuration

The website URL is configured in `App.tsx`:
```typescript
const websiteUrl = 'https://lioarcade.com';
```

Change this to point to your production website or local development server.

## Adding AdMob

### 1. Install Expo AdMob

```bash
npx expo install expo-ads-admob
```

### 2. Update app.json

Add AdMob configuration:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-ads-admob",
        {
          "androidAppId": "ca-app-pub-xxxxxxxxxxxxxxxx~xxxxxxxxxx",
          "iosAppId": "ca-app-pub-xxxxxxxxxxxxxxxx~xxxxxxxxxx"
        }
      ]
    ]
  }
}
```

### 3. Add Banner Ad Component

Create `src/components/AdBanner.tsx`:
```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AdMobBanner } from 'expo-ads-admob';

export function AdBanner() {
  return (
    <View style={styles.container}>
      <AdMobBanner
        bannerSize="banner"
        adUnitID="ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx"
        servePersonalizedAds={true}
        onDidFailToReceiveAdWithError={(error) => console.log(error)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

### 4. Add to App.tsx

```typescript
import { AdBanner } from './src/components/AdBanner';

// Add before </SafeAreaView>
<AdBanner />
```

## Building for Production

### iOS

1. **Build:**
   ```bash
   eas build --platform ios
   ```

2. **Submit to App Store:**
   ```bash
   eas submit --platform ios
   ```

### Android

1. **Build:**
   ```bash
   eas build --platform android
   ```

2. **Submit to Google Play:**
   ```bash
   eas submit --platform android
   ```

## Features

- ✅ WebView wrapper for your website
- ✅ Loading indicator
- ✅ Error handling with retry
- ✅ Safe area support
- ✅ Back/forward navigation gestures
- ✅ JavaScript enabled
- ✅ DOM storage enabled

## Next Steps

1. **Add AdMob** (see instructions above)
2. **Configure app icons** in `assets/`
3. **Update app.json** with your app details:
   - App name
   - Bundle identifier
   - Version
4. **Test on devices**
5. **Build and submit to app stores**

## Resources

- [Expo WebView Docs](https://docs.expo.dev/versions/latest/sdk/webview/)
- [Expo AdMob Docs](https://docs.expo.dev/versions/latest/sdk/admob/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
