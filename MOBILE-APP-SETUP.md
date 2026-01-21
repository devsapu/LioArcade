# 📱 React Native Mobile App Setup Guide

## Overview

This guide will help you set up a React Native mobile app for LioArcade that shares the same backend API.

---

## 🎯 Project Structure

```
LioArcade/
├── backend/          # Shared backend API (already exists)
├── frontend/         # Next.js web app (already exists)
└── mobile/          # React Native mobile app (to be created)
```

---

## 🚀 Option 1: Expo (Recommended - Easier Setup)

### Step 1: Install Expo CLI

```bash
npm install -g expo-cli
# Or use npx
npx create-expo-app@latest mobile
```

### Step 2: Create Expo App

```bash
cd /Users/sapumalthepulangoda/Documents/LioArcade
npx create-expo-app@latest mobile --template blank-typescript
```

### Step 3: Install Dependencies

```bash
cd mobile
npm install axios zustand react-navigation @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
npm install @react-native-async-storage/async-storage
```

---

## 🚀 Option 2: React Native CLI (More Native Features)

### Prerequisites

- Node.js 18+
- React Native CLI: `npm install -g react-native-cli`
- Xcode (for iOS) - macOS only
- Android Studio (for Android)

### Step 1: Create React Native App

```bash
cd /Users/sapumalthepulangoda/Documents/LioArcade
npx react-native@latest init LioArcadeMobile --version 0.72.0
mv LioArcadeMobile mobile
```

### Step 2: Install Dependencies

```bash
cd mobile
npm install axios zustand @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
npm install @react-native-async-storage/async-storage
```

---

## 📦 Shared API Configuration

### Create API Client (mobile/src/lib/api.ts)

```typescript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = __DEV__ 
  ? 'http://localhost:3001'  // Local development
  : 'https://lioarcade-production.up.railway.app';  // Production

const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if ((status === 401 || status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post(`${API_URL}/api/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        if (accessToken) {
          await AsyncStorage.setItem('accessToken', accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
        // Redirect to login
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## 🗂️ Mobile App Structure

```
mobile/
├── src/
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── LeaderboardScreen.tsx
│   │   ├── ProgressScreen.tsx
│   │   ├── QuizzesScreen.tsx
│   │   ├── QuizScreen.tsx
│   │   ├── FlashcardsScreen.tsx
│   │   └── FlashcardScreen.tsx
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Avatar.tsx
│   │   └── ...
│   ├── navigation/
│   │   └── AppNavigator.tsx
│   ├── store/
│   │   └── authStore.ts
│   ├── lib/
│   │   └── api.ts
│   └── types/
│       └── index.ts
├── App.tsx
└── package.json
```

---

## 🔧 Environment Configuration

### Create mobile/.env

```env
API_URL=https://lioarcade-production.up.railway.app
```

### Install react-native-config (for env vars)

```bash
npm install react-native-config
```

---

## 📱 Key Features to Implement

### 1. Authentication
- Login screen
- Registration screen
- Token management with AsyncStorage
- Auto-refresh tokens

### 2. Navigation
- Stack navigator
- Tab navigator (for main sections)
- Protected routes

### 3. Core Screens
- Dashboard
- Profile
- Leaderboard
- Progress
- Quizzes
- Flashcards
- Math Game

### 4. Shared Components
- Reuse design patterns from web app
- Adapt for mobile (touch interactions, gestures)

---

## 🎨 Design Considerations

- **Responsive**: Adapt to different screen sizes
- **Touch-friendly**: Larger buttons, swipe gestures
- **Native feel**: Use React Native components
- **Dark mode**: Support system theme
- **Offline**: Consider offline capabilities

---

## 🚀 Getting Started

1. **Choose your approach**: Expo (easier) or React Native CLI (more control)
2. **Create the project**: Follow Option 1 or Option 2 above
3. **Set up API client**: Copy and adapt from web app
4. **Create screens**: Start with Login/Register
5. **Add navigation**: Set up React Navigation
6. **Test**: Run on iOS simulator or Android emulator

---

## 📝 Next Steps

1. Create the mobile app structure
2. Set up API client
3. Implement authentication screens
4. Add navigation
5. Build core features

---

**Ready to start?** Let me know which option you prefer (Expo or React Native CLI) and I'll help you set it up!
