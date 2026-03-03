import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

export default function SignupScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [userType, setUserType] = useState<'athlete' | 'coach'>('athlete');
  const { signup } = useAuth();

  const handleSignup = async () => {
    try {
      await signup({ email, password, name, user_type: userType });
    } catch (error) {
      Alert.alert('Signup failed', 'Please try again');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor="#5A6572"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#5A6572"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#5A6572"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <View style={styles.typeContainer}>
        <TouchableOpacity
          style={[styles.typeButton, userType === 'athlete' && styles.typeButtonActive]}
          onPress={() => setUserType('athlete')}
        >
          <Text style={[styles.typeText, userType === 'athlete' && styles.typeTextActive]}>
            Athlete
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeButton, userType === 'coach' && styles.typeButtonActive]}
          onPress={() => setUserType('coach')}
        >
          <Text style={[styles.typeText, userType === 'coach' && styles.typeTextActive]}>
            Coach
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#14181C',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E6EDF3',
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#1F2937',
    color: '#E6EDF3',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#5A6572',
    alignItems: 'center',
  },
  typeButtonActive: {
    borderColor: '#B4F000',
    backgroundColor: 'rgba(180, 240, 0, 0.1)',
  },
  typeText: {
    color: '#5A6572',
    fontSize: 16,
    fontWeight: 'bold',
  },
  typeTextActive: {
    color: '#B4F000',
  },
  button: {
    backgroundColor: '#B4F000',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#14181C',
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    color: '#B4F000',
    textAlign: 'center',
    marginTop: 16,
  },
});
