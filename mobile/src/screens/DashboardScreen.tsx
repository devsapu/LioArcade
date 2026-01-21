import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useAuthStore } from '../store/authStore';

export default function DashboardScreen({ navigation }: any) {
  const { user, logout, fetchUserProfile } = useAuthStore();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome, {user?.username || 'User'}!</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Dashboard</Text>
        <Text style={styles.info}>
          Mobile app is ready! Start building your screens here.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#6366f1',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  logoutButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  info: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
});
