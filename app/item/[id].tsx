import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Share2, Clock, Camera, Radio, ChevronUp, ChevronDown  } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { CTAButton } from '@/components/CTAButton';
import { useAuth } from '@/context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ItemDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { token } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [policyExpanded, setPolicyExpanded] = useState(false);

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const res = await fetch(`${BASE_URL}/listings/${id}`);
      const data = await res.json();

      if (!res.ok) {
        setError('Failed to load listing.');
        return;
      }

      setListing(data.data.listing);
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => router.back();
  const handleShare = () => console.log('Share item');
  const handleRequestRent = () => router.push(`/rent/${id}`);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0F1C2E" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !listing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: '#DC2626', fontSize: 14, fontFamily: 'Inter-Medium' }}>
            {error || 'Listing not found.'}
          </Text>
          <TouchableOpacity onPress={handleBack} style={{ marginTop: 16 }}>
            <Text style={{ color: '#2F80ED', fontSize: 14, fontFamily: 'Inter-SemiBold' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // get all images from listing items
  const images = listing.listing_items
    ?.map((item: any) => item.image)
    .filter(Boolean);

  const hasImages = images && images.length > 0;
  const displayImage = hasImages
    ? images[currentImageIndex]
    : 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg';

  // get first item for price info
  const firstItem = listing.listing_items?.[0];
  const price = firstItem?.price_per_day
    ? `${firstItem.price_per_day} CFA / day`
    : firstItem?.price_per_hour
    ? `${firstItem.price_per_hour} CFA / hour`
    : 'Price not set';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.headerButton} activeOpacity={0.7}>
          <ArrowLeft size={24} color="#0F1C2E" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Item Details</Text>
        <TouchableOpacity onPress={handleShare} style={styles.headerButton} activeOpacity={0.7}>
          <Share2 size={24} color="#0F1C2E" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: displayImage }} style={styles.heroImage} />
          {hasImages && images.length > 1 && (
            <View style={styles.imageIndicators}>
              {images.map((_: any, index: number) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setCurrentImageIndex(index)}
                  style={[
                    styles.indicator,
                    index === currentImageIndex && styles.indicatorActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.categoryBadge}>
            <Ionicons name="cube-outline" size={14} color="#2F80ED" />
            <Text style={styles.categoryBadgeText}>{listing.category}</Text>
          </View>

          <Text style={styles.itemName}>{listing.title}</Text>
          <Text style={styles.price}>{price}</Text>

          {/* Listing Items */}
          {listing.listing_items?.length > 0 && (
            <View style={styles.itemsSection}>
              <Text style={styles.sectionTitle}>Available Items</Text>
              {listing.listing_items.map((item: any) => (
                <View key={item.id} style={styles.itemRow}>
                  <View style={styles.itemRowLeft}>
                    {item.image ? (
                      <Image source={{ uri: item.image }} style={styles.itemThumb} />
                    ) : (
                      <View style={[styles.itemThumb, styles.itemThumbPlaceholder]}>
                        <Ionicons name="cube-outline" size={20} color="#9CA3AF" />
                      </View>
                    )}
                    <View>
                      <Text style={styles.itemRowName}>{item.name}</Text>
                      <Text style={styles.itemRowQty}>{item.quantity_available} available</Text>
                    </View>
                  </View>
                  <Text style={styles.itemRowPrice}>
                    {item.price_per_day
                      ? `${item.price_per_day} CFA/day`
                      : `${item.price_per_hour} CFA/hr`}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.metaGrid}>
            <View style={styles.metaCard}>
              <Ionicons name="layers-outline" size={18} color="#0F1C2E" />
              <Text style={styles.metaTitle}>Items</Text>
              <Text style={styles.metaValue}>{listing.listing_items?.length ?? 0}</Text>
            </View>

            <View style={styles.metaCard}>
              <Ionicons name="time-outline" size={18} color="#0F1C2E" />
              <Text style={styles.metaTitle}>Min Duration</Text>
              <Text style={styles.metaValue}>
                {firstItem?.minimum_rental_duration ?? '-'} day(s)
              </Text>
            </View>

            <View style={styles.metaCard}>
              <Ionicons name="calendar-outline" size={18} color="#0F1C2E" />
              <Text style={styles.metaTitle}>Max Duration</Text>
              <Text style={styles.metaValue}>
                {firstItem?.maximum_rental_duration ?? '-'} day(s)
              </Text>
            </View>

            <View style={styles.metaCard}>
              <Ionicons
                name={firstItem?.requires_verification ? 'shield-checkmark-outline' : 'shield-outline'}
                size={18}
                color="#0F1C2E"
              />
              <Text style={styles.metaTitle}>Verification</Text>
              <Text style={styles.metaValue}>
                {firstItem?.requires_verification ? 'Required' : 'Not Required'}
              </Text>
            </View>
          </View>

          <View style={styles.depositCard}>
  <TouchableOpacity
    style={styles.depositHeader}
    onPress={() => setPolicyExpanded(!policyExpanded)}
    activeOpacity={0.8}>
    <Text style={styles.depositTitle}>RentIt Policy</Text>
    {policyExpanded
      ? <ChevronUp size={18} color="#9CA3AF" />
      : <ChevronDown size={18} color="#9CA3AF" />
    }
  </TouchableOpacity>

  {policyExpanded && (
    <Text style={styles.depositSubtext}>
      Protected by RentIt Guarantee.{' '}
      <Text style={styles.note}>Note </Text>
      A rental request can only be canceled within 20 minutes of placing the request. After that, the owner has the right to accept or decline the cancellation based on their cancellation policy.
      {'\n\n'}
      If you need to cancel after 20 minutes, please contact the owner directly to discuss the cancellation and any potential fees that may apply.
      {'\n\n'}
      Also if there are any issues with the item during the rental period, please report it to RentIt support immediately for assistance.
    </Text>
  )}
</View>

          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text
              style={styles.description}
              numberOfLines={showFullDescription ? undefined : 3}>
              {listing.description}
            </Text>
            <TouchableOpacity
              onPress={() => setShowFullDescription(!showFullDescription)}
              activeOpacity={0.7}>
              <Text style={styles.readMore}>
                {showFullDescription ? 'Read less' : 'Read more'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.locationSection}>
            <Text style={styles.sectionTitle}>Pickup Location</Text>
            <View style={styles.mapCard}>
              <View style={styles.mapPlaceholder}>
                <Ionicons name="location" size={26} color="#2F80ED" />
              </View>
              <View style={styles.locationInfo}>
                <Text style={styles.locationName}>{listing.location_address}</Text>
                <Text style={styles.locationDistance}>{listing.location_city}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <CTAButton title="Request Rent" onPress={handleRequestRent} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  note: {
    color: '#EF4444',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F5F6F8',
    paddingTop: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F1C2E',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    height: 300,
    backgroundColor: '#1F2937',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  indicatorActive: {
    backgroundColor: '#FFFFFF',
    width: 20,
  },
  content: {
    padding: 20,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF3FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 12,
  },
  categoryBadgeText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#2F80ED',
  },
  itemName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F1C2E',
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2F80ED',
    marginBottom: 20,
  },
  itemsSection: {
    marginBottom: 24,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  itemRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itemThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  itemThumbPlaceholder: {
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemRowName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F1C2E',
  },
  itemRowQty: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  itemRowPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2F80ED',
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  metaCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  metaTitle: {
    marginTop: 8,
    fontSize: 12,
    color: '#6B7280',
  },
  metaValue: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F1C2E',
  },
  depositCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  depositHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  depositTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F1C2E',
  },
  depositAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F1C2E',
  },
  depositSubtext: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  learnMore: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2F80ED',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F1C2E',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 8,
  },
  readMore: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2F80ED',
  },
  locationSection: {
    marginBottom: 80,
  },
  mapCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
  },
  mapPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#F5F6F8',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F1C2E',
    marginBottom: 4,
  },
  locationDistance: {
    fontSize: 13,
    color: '#6B7280',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },

  
});