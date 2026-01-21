import React from 'react';
import { StyleSheet, View, ActivityIndicator, Alert, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function App() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const insets = useSafeAreaInsets();

  // Your website URL
  const websiteUrl = 'https://lioarcade.com';

  const handleLoadStart = () => {
    setLoading(true);
    setError(false);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('WebView error: ', nativeEvent);
    setError(true);
    setLoading(false);
    
    Alert.alert(
      'Connection Error',
      'Unable to load the website. Please check your internet connection.',
      [
        {
          text: 'Retry',
          onPress: () => {
            setError(false);
            setLoading(true);
          },
        },
        {
          text: 'OK',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <SafeAreaView 
      style={styles.container} 
      edges={['top', 'bottom', 'left', 'right']}
    >
      <StatusBar style="auto" />
      <WebView
        source={{ uri: websiteUrl }}
        style={[
          styles.webview,
          {
            // Ensure WebView respects safe areas
            paddingTop: Platform.OS === 'ios' ? 0 : insets.top,
            paddingBottom: Platform.OS === 'ios' ? 0 : insets.bottom,
          }
        ]}
        contentInsetAdjustmentBehavior="automatic"
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        allowsBackForwardNavigationGestures={true}
        // Enable safe area insets for WebView content
        automaticallyAdjustContentInsets={true}
        contentInset={{ top: 0, bottom: 0, left: 0, right: 0 }}
        // Enable debugging (remove in production)
        // webviewDebuggingEnabled={true}
      />
      {loading && !error && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
});
