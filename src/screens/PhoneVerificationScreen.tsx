import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTheme } from '../theme';
import { authService } from '../services/auth';
import { useAuth } from '../hooks/useAuth';
import { GlassCard } from '../components/GlassCard';
import { OTPInput } from '../components/OTPInput';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

const PhoneVerificationScreen = () => {
  const { colors, spacing, radius, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const { setPhoneVerified } = useAuth();
  
  const [phone, setPhone] = useState('');
  const [confirmation, setConfirmation] = useState<FirebaseAuthTypes.ConfirmationResult | null>(null);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOTP = async () => {
    if (!phone.startsWith('+')) {
      setError('Phone must start with country code (e.g., +1)');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await auth().signInWithPhoneNumber(phone);
      setConfirmation(result);
      setTimer(60);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length < 6 || !confirmation) return;
    setLoading(true);
    setError('');
    try {
      await confirmation.confirm(otp);
      // If user is already logged in via Email, Firebase might link or we can manually link.
      // For this app flow, we assume successful confirm means phone is verified.
      setPhoneVerified(true);
    } catch (err: any) {
      setError('Invalid code. Please try again.');
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
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={[typography.h1, { color: colors.text.primary }]}>Phone Verification</Text>
            <Text style={[typography.body, { color: colors.text.secondary, textAlign: 'center' }]}>
              {confirmation ? `Enter the 6-digit code sent to ${phone}` : "Verify your phone number to continue"}
            </Text>
          </View>

          <GlassCard style={styles.card}>
            {!confirmation ? (
              <View>
                <Text style={[typography.label, { color: colors.text.secondary, marginBottom: spacing.xs }]}>Phone Number</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, color: colors.text.primary, borderRadius: radius.md }]}
                  placeholder="+1 123 456 7890"
                  placeholderTextColor={colors.text.secondary}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
                {error ? <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text> : null}
                <TouchableOpacity 
                  style={[styles.button, { backgroundColor: colors.primary, borderRadius: radius.lg, marginTop: 16 }]}
                  onPress={handleSendOTP}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color="white" /> : <Text style={[typography.h3, { color: 'white' }]}>Send Code</Text>}
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <OTPInput value={otp} onChange={setOtp} />
                {error ? <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text> : null}
                
                <TouchableOpacity 
                  style={[styles.button, { backgroundColor: colors.primary, borderRadius: radius.lg, marginTop: 16 }]}
                  onPress={handleVerifyOTP}
                  disabled={loading || otp.length < 6}
                >
                  {loading ? <ActivityIndicator color="white" /> : <Text style={[typography.h3, { color: 'white' }]}>Verify</Text>}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.resendButton}
                  onPress={handleSendOTP}
                  disabled={timer > 0 || loading}
                >
                  <Text style={[typography.body, { color: timer > 0 ? colors.text.secondary : colors.primary }]}>
                    {timer > 0 ? `Resend in ${timer}s` : "Resend Code"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </GlassCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24, flexGrow: 1, justifyContent: 'center' },
  header: { marginBottom: 40, alignItems: 'center' },
  card: { padding: 24 },
  input: { borderWidth: 1, padding: 12, fontSize: 16 },
  errorText: { marginTop: 8, textAlign: 'center' },
  button: { height: 56, justifyContent: 'center', alignItems: 'center' },
  resendButton: { marginTop: 24, alignItems: 'center' }
});

export default PhoneVerificationScreen;
