import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTheme } from '../theme';
import { authService } from '../services/auth';
import { useAuth } from '../hooks/useAuth';
import { GlassCard } from '../components/GlassCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LoginScreen = () => {
  const { colors, spacing, radius, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email) {
      setError('Please enter your email');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email format');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    Keyboard.dismiss();
    setError('');
    
    if (!validate()) return;

    setLoading(true);
    try {
      await authService.signInWithEmail(email, password);
    } catch (err: any) {
      switch (err.code) {
        case 'auth/user-not-found':
          setError('No account found with this email');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password');
          break;
        case 'auth/too-many-requests':
          setError('Too many attempts. Try later');
          break;
        default:
          setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={[typography.h1, { color: colors.text.primary }]}>Welcome Driver 🚚</Text>
            <Text style={[typography.body, { color: colors.text.secondary }]}>Sign in to start your deliveries</Text>
          </View>

          <GlassCard style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={[typography.label, { color: colors.text.secondary, marginBottom: spacing.xs }]}>Email Address</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text.primary, borderRadius: radius.md }]}
                placeholder="email@example.com"
                placeholderTextColor={colors.text.secondary}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[typography.label, { color: colors.text.secondary, marginBottom: spacing.xs }]}>Password</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text.primary, borderRadius: radius.md }]}
                placeholder="••••••••"
                placeholderTextColor={colors.text.secondary}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {error ? <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text> : null}

            <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.primary, borderRadius: radius.lg }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={[typography.h3, { color: 'white' }]}>Sign In</Text>
              )}
            </TouchableOpacity>
          </GlassCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  card: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    padding: 12,
    fontSize: 16,
  },
  errorText: {
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  }
});

export default LoginScreen;
