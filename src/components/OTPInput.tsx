import React, { useRef, useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, NativeSyntheticEvent, TextInputKeyPressEventData, Clipboard } from 'react-native';
import { useTheme } from '../theme';

interface OTPInputProps {
  value: string;
  onChange: (otp: string) => void;
  length?: number;
}

export const OTPInput: React.FC<OTPInputProps> = ({ value, onChange, length = 6 }) => {
  const { colors, radius, typography } = useTheme();
  const inputs = useRef<TextInput[]>([]);
  const [otpArray, setOtpArray] = useState<string[]>(new Array(length).fill(''));

  useEffect(() => {
    // Sync external value with internal array if needed
    if (value.length === length) {
      setOtpArray(value.split(''));
    }
  }, [value, length]);

  const handleTextChange = (text: string, index: number) => {
    // Handle paste
    if (text.length > 1) {
      const pastedData = text.slice(0, length).split('');
      const newOtp = [...otpArray];
      pastedData.forEach((char, i) => {
        if (i < length) newOtp[i] = char;
      });
      setOtpArray(newOtp);
      onChange(newOtp.join(''));
      inputs.current[Math.min(pastedData.length, length - 1)]?.focus();
      return;
    }

    const newOtp = [...otpArray];
    newOtp[index] = text;
    setOtpArray(newOtp);
    onChange(newOtp.join(''));

    if (text !== '' && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && otpArray[index] === '' && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {otpArray.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => { if (ref) inputs.current[index] = ref; }}
          style={[
            styles.input,
            {
              borderColor: colors.border,
              color: colors.text.primary,
              borderRadius: radius.md,
              fontSize: 24,
              fontWeight: '700',
              textAlign: 'center'
            }
          ]}
          maxLength={index === 0 ? length : 1} // Primary input handles paste
          keyboardType="number-pad"
          value={digit}
          onChangeText={(text) => handleTextChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 20,
  },
  input: {
    width: 45,
    height: 55,
    borderWidth: 1,
  }
});
