import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ItemCard } from '@/components/ItemCard';
import { CategoryChip } from '@/components/CategoryChip';
import { SearchBar } from '@/components/SearchBar';

const categories = [
  { id: '1', name: 'Photography', icon: '📷' },
  { id: '2', name: 'Drones', icon: '🚁' },
  { id: '3', name: 'Electronics', icon: '📱' },
  { id: '4', name: 'Audio', icon: '🎧' },
  { id: '5', name: 'Outdoor', icon: '⛰️' },
];

const items = [
  {
    id: '1',
    name: 'Sony Alpha A7 IV',
    subtitle: 'Includes 24-70mm GM Lens',
    price: 85,
    rating: 5.0,
    imageUrl: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: '2',
    name: 'DJI Mavic 3 Pro',
    subtitle: 'Fly More Combo Pack',
    price: 120,
    rating: 5.0,
    imageUrl: 'https://images.pexels.com/photos/2876511/pexels-photo-2876511.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: '3',
    name: 'VanMoof S5 Electric Bike',
    subtitle: 'Gray Matter • Range 150km',
    price: 45,
    rating: 5.0,
    imageUrl: 'https://images.pexels.com/photos/276517/pexels-photo-276517.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

export default function ExploreScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const handleFilterPress = () => {
    console.log('Filter pressed');
  };

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const handleFavoritePress = (itemId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(itemId)) {
        newFavorites.delete(itemId);
      } else {
        newFavorites.add(itemId);
      }
      return newFavorites;
    });
  };

  const handleItemPress = (itemId: string) => {
    router.push(`/item/${itemId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, Alex</Text>
          <View style={styles.searchWrapper}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFilterPress={handleFilterPress}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Premium Categories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}>
            {categories.map((category) => (
              <CategoryChip
                key={category.id}
                label={category.name}
                icon={category.icon}
                isSelected={selectedCategory === category.id}
                onPress={() => handleCategoryPress(category.id)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Handpicked for You</Text>
          {items.map((item) => (
            <ItemCard
              key={item.id}
              {...item}
              onPress={() => handleItemPress(item.id)}
              isFavorite={favorites.has(item.id)}
              onFavoritePress={() => handleFavoritePress(item.id)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#0F1C2E',
    marginBottom: 20,
  },
  searchWrapper: {
    marginBottom: 8,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#0F1C2E',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
});
