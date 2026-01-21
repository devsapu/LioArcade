import React, { useMemo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  // Get tokens from store
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  
  // Compute boolean using useMemo to ensure proper type
  const isAuthenticated = useMemo(() => {
    // Explicitly return primitive boolean
    return !!(accessToken && refreshToken);
  }, [accessToken, refreshToken]);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated === false ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
