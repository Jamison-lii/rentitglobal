import { useState } from 'react';
import { KeyboardAvoidingView, Platform,  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validateCameroonPhone = (phone) => {
  // Cameroon numbers: +237 followed by 9 digits starting with 6
  // Supports: +2376XXXXXXXX or 6XXXXXXXX or 06XXXXXXXX
  const regex = /^(\+237|237)?(6[5-9]\d{7}|6[0-2]\d{7})$/;
  return regex.test(phone.replace(/\s/g, ''));
};

export default function SignupScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login } = useAuth();

  const handleSignup = async () => {
    const nameParts = fullName.trim().split(' ');
    const first_name = nameParts[0];
    const last_name = nameParts.slice(1).join(' ');

    console.log()

    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (nameParts.length < 2 || !last_name) {
      setError('Please enter your full name (first and last name).');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (phoneNumber && !validateCameroonPhone(phoneNumber)) {
      setError('Please enter a valid Cameroon phone number (e.g. +237 6XX XXX XXX).');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name,
          last_name,
          email: email.trim(),
          phone_number: phoneNumber.trim() || undefined,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Something went wrong.');
        return;
      }

    {/*  await AsyncStorage.setItem('token', data.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.data.user));*/}
      await login(data.data.user, data.data.token);

      router.replace('/(tabs)');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Create Your Account</Text>
          <Text style={styles.subtitle}>Start renting premium gear in minutes.</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full name</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Alex Johnson"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="words"
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Phone number <Text style={styles.optional}>(optional)</Text>
            </Text>
            <TextInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="+237 6XX XXX XXX"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
  <Text style={styles.label}>Password</Text>

  <View style={styles.passwordContainer}>
    <TextInput
      value={password}
      onChangeText={setPassword}
      placeholder="Create a password"
      placeholderTextColor="#9CA3AF"
      secureTextEntry={!showPassword}
      style={[styles.input, { flex: 1, borderWidth: 0 }]}
    />

    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
      <Ionicons
        name={showPassword ? 'eye-off' : 'eye'}
        size={22}
        color="#6B7280"
      />
    </TouchableOpacity>
  </View>
</View>

<View style={styles.inputGroup}>
  <Text style={styles.label}>Confirm password</Text>

  <View style={styles.passwordContainer}>
    <TextInput
      value={confirmPassword}
      onChangeText={setConfirmPassword}
      placeholder="Repeat your password"
      placeholderTextColor="#9CA3AF"
      secureTextEntry={!showConfirmPassword}
      style={[styles.input, { flex: 1, borderWidth: 0 }]}
    />

    <TouchableOpacity
      onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
      <Ionicons
        name={showConfirmPassword ? 'eye-off' : 'eye'}
        size={22}
        color="#6B7280"
      />
    </TouchableOpacity>
  </View>
</View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            activeOpacity={0.8}
            disabled={loading}>
            <Text style={styles.primaryButtonText}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </Text>
          </TouchableOpacity>

          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>Already have an account?</Text>
            <Link href="/login" style={styles.linkText}>
              <Text style={styles.linkText}>Sign in</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
      paddingTop: 5,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#0F1C2E',
    marginBottom: 8,
    marginTop: 40,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 28,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  optional: {
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  input: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    backgroundColor: '#F8FAFC',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    marginBottom: 14,
  },
  primaryButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: '#0F1C2E',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    backgroundColor: '#6B7280',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  bottomRow: {
    marginTop: 24,
    marginBottom: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  bottomText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  linkText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#0F1C2E',
  },
  passwordContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  borderRadius: 16,
  borderWidth: 1,
  borderColor: '#E5E7EB',
  backgroundColor: '#F8FAFC',
  paddingRight: 16,
},
});