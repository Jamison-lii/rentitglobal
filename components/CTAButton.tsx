import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';

interface CTAButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
}

export function CTAButton({ title, onPress, variant = 'primary', style }: CTAButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'primary' ? styles.primaryButton : styles.secondaryButton,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}>
      <Text
        style={[
          styles.text,
          variant === 'primary' ? styles.primaryText : styles.secondaryText,
        ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#2F80ED',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  text: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#0F1C2E',
  },
});
