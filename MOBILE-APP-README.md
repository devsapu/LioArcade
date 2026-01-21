# 📱 LioArcade Mobile App

React Native mobile application for LioArcade built with Expo.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Expo CLI (or use npx)
- iOS Simulator (Mac) or Android Emulator

### Run the App

```bash
cd mobile

# Install dependencies (if not already installed)
npm install

# Start Expo development server
npm start

# Then press:
# - 'i' for iOS simulator
# - 'a' for Android emulator
# - 'w' for web browser
```

---

## 📁 Project Structure

```
mobile/
├── src/
│   ├── screens/          # Screen components
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   └── DashboardScreen.tsx
│   ├── components/       # Reusable components
│   ├── navigation/       # Navigation setup
│   │   └── AppNavigator.tsx
│   ├── store/            # State management (Zustand)
│   │   └── authStore.ts
│   ├── lib/              # API client
│   │   └── api.ts
│   └── types/            # TypeScript types
│       └── index.ts
├── App.tsx               # Root component
└── package.json
```

---

## 🔌 API Configuration

The mobile app connects to the same backend API as the web app:

- **Production:** `https://lioarcade-production.up.railway.app`
- **Development:** Can be configured in `src/lib/api.ts`

---

## ✨ Features Implemented

- ✅ Authentication (Login/Register)
- ✅ Token management with AsyncStorage
- ✅ Auto token refresh
- ✅ Navigation with React Navigation
- ✅ Auth-based routing
- ✅ TypeScript types matching web app

---

## 🎯 Next Steps

### 1. Add More Screens

- [ ] Dashboard with stats
- [ ] Profile screen
- [ ] Leaderboard screen
- [ ] Progress screen
- [ ] Quizzes list
- [ ] Quiz play screen
- [ ] Flashcards list
- [ ] Flashcard play screen
- [ ] Math game screen

### 2. Add Navigation

- [ ] Tab navigator for main sections
- [ ] Stack navigators for each feature
- [ ] Deep linking support

### 3. Add Components

- [ ] Button component
- [ ] Input component
- [ ] Avatar component
- [ ] Card components
- [ ] Loading states
- [ ] Error handling

### 4. Enhance Features

- [ ] Dark mode support
- [ ] Push notifications
- [ ] Offline support
- [ ] Image uploads
- [ ] Sound effects
- [ ] Animations

---

## 🧪 Testing

### Run on iOS Simulator

```bash
npm run ios
```

### Run on Android Emulator

```bash
npm run android
```

### Run on Web

```bash
npm run web
```

---

## 📱 Building for Production

### iOS

```bash
eas build --platform ios
```

### Android

```bash
eas build --platform android
```

---

## 🔗 Related Documentation

- [Mobile App Setup Guide](./MOBILE-APP-SETUP.md)
- [Backend API Documentation](../backend/README.md)
- [Web App Documentation](../frontend/README.md)

---

## 📝 Notes

- The mobile app shares the same backend API as the web app
- Authentication tokens are stored securely using AsyncStorage
- All API calls go through the shared backend at Railway
- Types are shared between web and mobile for consistency

---

**Happy coding! 🚀**
