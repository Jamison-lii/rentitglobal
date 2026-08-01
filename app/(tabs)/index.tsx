import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ItemCard } from '@/components/ItemCard';
import { CategoryChip } from '@/components/CategoryChip';
import { SearchBar } from '@/components/SearchBar';
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const categories = [
  { id: '1', name: 'Electronics', icon: 'phone-portrait-outline' },
  { id: '2', name: 'Events', icon: 'calendar-outline' },
  { id: '3', name: 'Vehicles', icon: 'car-outline' },
  { id: '4', name: 'Tools', icon: 'construct-outline' },
  { id: '5', name: 'Outdoor', icon: 'bicycle-outline' },
  { id: '6', name: 'Audio', icon: 'headset-outline' },
  { id: '7', name: 'Gaming', icon: 'game-controller-outline' },
  { id: '8', name: 'Furniture', icon: 'bed-outline' },
  { id: '9', name: 'Clothing', icon: 'shirt-outline' },
  { id: '10', name: 'Sports', icon: 'football-outline' },
  { id: '11', name: 'Photography', icon: 'camera-outline' },
];


export default function ExploreScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchListings = async () => {
    try {
      const res = await fetch(`${BASE_URL}/listings`);
      const data = await res.json();

      if (!res.ok) {
        setError('Failed to load listings.');
        return;
      }

      setListings(data.data.listings);
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchListings();
  }, []);

  const handleFilterPress = () => {
    console.log('Filter pressed');
  };

 const handleCategoryPress = (categoryId: string) => {
  setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
}

 

  const handleItemPress = (itemId: string) => {
    router.push(`/item/${itemId}`);
  };

  // filter listings by search query and category
  const filteredListings = listings.filter((listing: any) => {
    const matchesSearch =
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.location_city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory
      ? listing.category.toLowerCase() ===
        categories.find((c) => c.id === selectedCategory)?.name.toLowerCase()
      : true;

    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']} >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0F1C2E" />
        }>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {user?.first_name} </Text>
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
          <Text style={styles.sectionTitle}>
            {selectedCategory
              ? categories.find((c) => c.id === selectedCategory)?.name
              : 'Handpicked for You'}
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color="#0F1C2E" style={{ marginTop: 40 }} />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : filteredListings.length === 0 ? (
            <Text style={styles.emptyText}>No listings found.</Text>
          ) : (
           filteredListings.map((listing: any) => {
  const itemWithImage = listing.listing_items?.find((item: any) => item.image) ?? listing.listing_items?.[0];
  
  return (
    <ItemCard
      key={listing.id}
      id={listing.id}
      name={listing.title}
      subtitle={listing.location_city}
      price={itemWithImage?.price_per_day ?? 0}
      rating={5.0}
      imageUrl={itemWithImage?.image ?? 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'}
      onPress={() => handleItemPress(listing.id)}
    />
  );
})
          )}
        </View>
      </ScrollView>
    </SafeAreaView >
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
    paddingTop: 10,
    paddingBottom: 5,
  },
  greeting: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#0F1C2E',
    marginBottom: 20,
  },
  searchWrapper: {
    marginBottom: 0,
  },
  section: {
    marginTop: 10,
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
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    paddingHorizontal: 20,
    marginTop: 20,
  },
});