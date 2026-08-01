import { useState } from 'react';
import { KeyboardAvoidingView, Platform,  StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
 

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    setLoading(true);

   try {
            const res = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Something went wrong.');
                return;
            }

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
        <View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue to RentIt</Text>

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
  <Text style={styles.label}>Password</Text>

  <View style={styles.passwordContainer}>
    <TextInput
      value={password}
      onChangeText={setPassword}
      placeholder="Enter your password"
      placeholderTextColor="#9CA3AF"
      secureTextEntry={!showPassword}
      style={[styles.input, { flex: 1, borderWidth: 0 }]}
    />

    <TouchableOpacity
      onPress={() => setShowPassword(!showPassword)}>
      <Ionicons
        name={showPassword ? 'eye-off' : 'eye'}
        size={22}
        color="#6B7280"
      />
    </TouchableOpacity>
  </View>
</View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            activeOpacity={0.8}
            disabled={loading}>
            <Text style={styles.primaryButtonText}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>New to RentIt?</Text>
            <Link href="/signup" style={styles.linkText}>
              <Text style={styles.linkText}>Create account</Text>
            </Link>
          </View>
        </View>
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