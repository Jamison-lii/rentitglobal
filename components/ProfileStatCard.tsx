import { View, Text, StyleSheet } from 'react-native';

interface ProfileStatCardProps {
  value: string | number;
  label: string;
}

export function ProfileStatCard({ value, label }: ProfileStatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  value: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#0F1C2E',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
});
