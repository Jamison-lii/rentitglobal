import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface CategoryChipProps {
  label: string;
  icon: string;
  isSelected?: boolean;
  onPress: () => void;
}

export function CategoryChip({ label, icon, isSelected = false, onPress }: CategoryChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, isSelected && styles.chipSelected]}
      activeOpacity={0.7}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.label, isSelected && styles.labelSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chipSelected: {
    backgroundColor: '#0F1C2E',
  },
  icon: {
    fontSize: 18,
    marginRight: 6,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#0F1C2E',
  },
  labelSelected: {
    color: '#FFFFFF',
  },
});
