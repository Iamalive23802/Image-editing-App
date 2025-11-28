import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';

export default function OTPScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState(['2', '3', '0', '8']); // Pre-fill with hardcoded OTP
  const [timer, setTimer] = useState(27);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const { verifyOTP } = useAuth();

  const routeAfterVerification = (result: { success: boolean; hasLanguage?: boolean; hasRole?: boolean; profileComplete?: boolean }) => {
    if (!result.success) {
      return;
    }

    if (!result.hasLanguage) {
      router.replace('/language');
      return;
    }

    if (!result.hasRole) {
      router.replace('/who-you-are');
      return;
    }

    if (!result.profileComplete) {
      router.replace('/profile-setup');
      return;
    }

    if (result.profileComplete) {
      router.replace('/(tabs)/index');
      return;
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = async (value: string, index: number) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 4) {
      // Verify OTP with authentication context
      const otpString = newOtp.join('');
      console.log('Auto-verifying OTP:', { phone, otp: otpString });
      const result = await verifyOTP(phone || '', otpString);
      if (result.success) {
        routeAfterVerification(result);
      } else {
        console.error('OTP verification failed');
        // Show error or reset OTP
        setOtp(['', '', '', '']);
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <LinearGradient
      colors={['#E75C6F', '#C73F5B']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>We've sent a verification code via WhatsApp to</Text>
        <Text style={styles.phone}>+91 {phone}</Text>
        <Text style={styles.whatsappNote}>📱 Check your WhatsApp messages</Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={styles.otpInput}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              autoFocus={index === 0}
            />
          ))}
        </View>

        <Text style={styles.resend}>
          Resend OTP in {timer}
        </Text>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={async () => {
            const otpString = otp.join('');
            console.log('Manual OTP verification:', { phone, otp: otpString });
            const result = await verifyOTP(phone || '', otpString);
            if (result.success) {
              routeAfterVerification(result);
            } else {
              console.error('OTP verification failed');
              // Show error or reset OTP
              setOtp(['', '', '', '']);
            }
          }}
        >
          <Text style={styles.loginButtonText}>Verify OTP</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 18,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  phone: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  whatsappNote: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.9,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  otpInput: {
    width: 70,
    height: 70,
    backgroundColor: '#FFF',
    borderRadius: 16,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: '#000',
  },
  resend: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#FDD835',
    borderRadius: 12,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  loginButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
});
