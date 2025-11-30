import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '@/constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  style?: object;
  textStyle?: object;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const buttonStyle = [
    styles.button,
    styles[`button${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    disabled && styles.buttonDisabled,
    style,
  ];

  const buttonTextStyle = [
    styles.buttonText,
    styles[`buttonText${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? COLORS.text : COLORS.primary} />
      ) : (
        <Text style={buttonTextStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 120,
  },
  buttonPrimary: {
    backgroundColor: COLORS.secondary,
  },
  buttonSecondary: {
    backgroundColor: COLORS.primary,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  buttonTextPrimary: {
    color: COLORS.text,
  },
  buttonTextSecondary: {
    color: COLORS.background,
  },
  buttonTextOutline: {
    color: COLORS.secondary,
  },
});

