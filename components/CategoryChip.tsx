import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CategoryChipProps {
  label: string;
  icon: string;
  isSelected?: boolean;
  onPress?: () => void;
}

export function CategoryChip({
  label,
  icon,
  isSelected = false,
  onPress,
}: CategoryChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.container, isSelected && styles.containerSelected]}
    >
      <View style={styles.content}>
        <Ionicons
          name={icon as any}
          size={18}
          color={isSelected ? '#FFFFFF' : '#0F1C2E'}
        />
        <Text style={[styles.label, isSelected && styles.labelSelected]}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E8ECF1',
  },
  containerSelected: {
    backgroundColor: '#0F1C2E',
    borderColor: '#0F1C2E',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#0F1C2E',
  },
  labelSelected: {
    color: '#FFFFFF',
  },
});