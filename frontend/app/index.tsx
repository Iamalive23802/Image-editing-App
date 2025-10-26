import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('9167767684');

  const handleContinue = () => {
    if (phoneNumber.length === 10) {
      router.push({
        pathname: '/otp',
        params: { phone: phoneNumber }
      });
    }
  };

  return (
    <LinearGradient
      colors={['#E75C6F', '#C73F5B']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>India's local image editor app</Text>
        <Text style={styles.subtitle}>Log In or Sign Up</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.countryCode}>+91</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter mobile number"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            maxLength={10}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, phoneNumber.length !== 10 && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={phoneNumber.length !== 10}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>

        <Text style={styles.terms}>
          by continuing, you agree to our{' '}
          <Text style={styles.termsLink}>Terms of services</Text> &{' '}
          <Text style={styles.termsLink}>Privacy policy</Text>
        </Text>
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
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 60,
  },
  inputContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    height: 60,
  },
  countryCode: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: '#000',
  },
  button: {
    backgroundColor: '#FDD835',
    borderRadius: 12,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  terms: {
    fontSize: 13,
    color: '#FFF',
    textAlign: 'center',
  },
  termsLink: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
