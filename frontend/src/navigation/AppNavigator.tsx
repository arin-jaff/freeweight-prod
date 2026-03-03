import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import AthleteHomeScreen from '../screens/athlete/HomeScreen';
import CoachDashboardScreen from '../screens/coach/DashboardScreen';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  AthleteHome: undefined;
  CoachDashboard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#14181C' },
        }}
      >
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        ) : user.user_type === 'athlete' ? (
          <Stack.Screen name="AthleteHome" component={AthleteHomeScreen} />
        ) : (
          <Stack.Screen name="CoachDashboard" component={CoachDashboardScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
