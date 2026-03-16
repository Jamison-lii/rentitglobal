import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Search, SlidersHorizontal } from 'lucide-react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onFilterPress: () => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChangeText,
  onFilterPress,
  placeholder = 'Search for premium gear...',
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Search size={20} color="#9CA3AF" strokeWidth={2} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <TouchableOpacity style={styles.filterButton} onPress={onFilterPress} activeOpacity={0.7}>
        <SlidersHorizontal size={20} color="#0F1C2E" strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#0F1C2E',
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
});
