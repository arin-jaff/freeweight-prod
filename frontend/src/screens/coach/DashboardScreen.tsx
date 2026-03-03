import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../../hooks/useAuth';

export default function CoachDashboardScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Coach Dashboard</Text>
      <Text style={styles.subtitle}>Welcome, {user?.name}</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Roster Overview</Text>
        <Text style={styles.cardText}>0 athletes</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today's Activity</Text>
        <Text style={styles.cardText}>No activity to show</Text>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#14181C',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E6EDF3',
    marginTop: 48,
  },
  subtitle: {
    fontSize: 18,
    color: '#5A6572',
    marginTop: 8,
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#1F2937',
    padding: 24,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E6EDF3',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
    color: '#5A6572',
  },
  logoutButton: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#B4F000',
    alignItems: 'center',
    marginTop: 8,
  },
  logoutText: {
    color: '#B4F000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
