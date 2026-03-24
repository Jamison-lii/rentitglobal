import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Share2,
  Clock,
  Camera,
  Radio,
  ChevronRight,
} from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { CTAButton } from '@/components/CTAButton';

export default function ItemDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [currentImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const item = {
    id,
    name: 'DJI Mavic 3 Pro – Cine Edition',
    category: 'Drones',
    price: 85,
    pricingLabel: 'per day',
    images: [
      'https://images.pexels.com/photos/2876511/pexels-photo-2876511.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    features: [
      { icon: Clock, label: 'Flight time', value: '46 min' },
      { icon: Camera, label: 'Camera', value: '4/3 CMOS' },
      { icon: Radio, label: 'Range', value: '15 km' },
    ],
    securityDeposit: 500,
    description:
      'The DJI Mavic 3 Pro offers flagship-level imaging quality, 4K recording, and an exceptional flight time. Perfect for professional cinematography projects requiring Apple ProRes recording capabilities.',
    owner: {
      name: 'Marcus Sterling',
      avatar:
        'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200',
      rating: 4.9,
      totalRentals: 128,
      isVerified: true,
    },
    location: {
      name: 'Checkpoint, CA',
      distanceMiles: 12,
      latitude: 34.0736,
      longitude: -118.4004,
    },
    minimumRentalDuration: '1 day',
    maximumRentalDuration: '7 days',
    requiresVerification: true,
    quantityAvailable: 2,
  };

  {/*
    - In a real app, you would fetch the item details from an API using the `id` param.
    -In real app, make sure the corresponding API endpoint returns all the necessary details for the item, including images, features, owner info, and location data.
    -Make sure if this item is the kind of item that needs to have a security deposit, the API should return that information as well.  
    -Make sure the description is long enough to test the "Read more" functionality.
    -Make sure pickup location is there for pickup
    
    */}

  const handleBack = () => {
    router.back();
  };

  const handleShare = () => {
    console.log('Share item');
  };

const handleRequestRent = () => {
  router.push(`/rent/${id}`);
};

  const handleMessageOwner = () => {
    console.log('Message owner');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#0F1C2E" strokeWidth={2} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Item Details</Text>

      <TouchableOpacity
          onPress={handleShare}
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <Share2 size={24} color="#0F1C2E" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.images[currentImageIndex] }} style={styles.heroImage} />

          <View style={styles.imageIndicators}>
            {item.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === currentImageIndex && styles.indicatorActive,
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.categoryBadge}>
            <Ionicons name="cube-outline" size={14} color="#2F80ED" />
            <Text style={styles.categoryBadgeText}>{item.category}</Text>
          </View>

          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.price}>
            {item.price}CFA {item.pricingLabel}
          </Text>

         {/* <View style={styles.features}>
            {item.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <feature.icon size={20} color="#6B7280" strokeWidth={2} />
                <Text style={styles.featureLabel}>{feature.label}</Text>
                <Text style={styles.featureValue}>{feature.value}</Text>
              </View>
            ))}
          </View>*/}

          <View style={styles.metaGrid}>
            <View style={styles.metaCard}>
              <Ionicons name="layers-outline" size={18} color="#0F1C2E" />
              <Text style={styles.metaTitle}>Available</Text>
              <Text style={styles.metaValue}>{item.quantityAvailable} units</Text>
            </View>

            <View style={styles.metaCard}>
              <Ionicons name="time-outline" size={18} color="#0F1C2E" />
              <Text style={styles.metaTitle}>Minimum</Text>
              <Text style={styles.metaValue}>{item.minimumRentalDuration}</Text>
            </View>

            <View style={styles.metaCard}>
              <Ionicons name="calendar-outline" size={18} color="#0F1C2E" />
              <Text style={styles.metaTitle}>Maximum</Text>
              <Text style={styles.metaValue}>{item.maximumRentalDuration}</Text>
            </View>

            <View style={styles.metaCard}>
              <Ionicons
                name={item.requiresVerification ? 'shield-checkmark-outline' : 'shield-outline'}
                size={18}
                color="#0F1C2E"
              />
              <Text style={styles.metaTitle}>Verification</Text>
              <Text style={styles.metaValue}>
                {item.requiresVerification ? 'Required' : 'Optional'}
              </Text>
            </View>
          </View>

          <View style={styles.depositCard}>
            <View style={styles.depositHeader}>
              <Text style={styles.depositTitle}>Refundable Security Deposit</Text>
              <Text style={styles.depositAmount}>{item.securityDeposit}CFA</Text>
            </View>

            <Text style={styles.depositSubtext}>
              Protected by RentIt Guarantee

               <Text style={styles.note}>Note</Text> A rental request can only be canceled within 20minutes of placing the request. After that, the owner has the right to accept or decline the cancellation based on their cancellation policy.
              
              </Text>
            

            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.learnMore}>Learn More</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>

            <Text
              style={styles.description}
              numberOfLines={showFullDescription ? undefined : 3}
            >
              {item.description}
           
             
            </Text>

            <TouchableOpacity
              onPress={() => setShowFullDescription(!showFullDescription)}
              activeOpacity={0.7}
            >
              <Text style={styles.readMore}>
                {showFullDescription ? 'Read less' : 'Read more'}
              </Text>
            </TouchableOpacity>
          </View>

          {/*<View style={styles.ownerSection}>
            <Text style={styles.sectionTitle}>Owner</Text>

            <View style={styles.ownerCard}>
              <Image source={{ uri: item.owner.avatar }} style={styles.ownerAvatar} />

              <View style={styles.ownerInfo}>
                <View style={styles.ownerNameRow}>
                  <Text style={styles.ownerName}>{item.owner.name}</Text>
                  {item.owner.isVerified && (
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#2F80ED"
                      style={styles.verifiedIcon}
                    />
                  )}
                </View>

                <View style={styles.ownerStats}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={styles.ownerRating}>{item.owner.rating}</Text>
                  <Text style={styles.ownerRentals}>• {item.owner.totalRentals} rentals</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.messageOwnerButton}
                onPress={handleMessageOwner}
                activeOpacity={0.7}
              >
                <Text style={styles.messageOwnerText}>Message</Text>
              </TouchableOpacity>
            </View>
          </View> */}

          <View style={styles.locationSection}>
            <Text style={styles.sectionTitle}>Pickup Location</Text>

            <View style={styles.mapCard}>
              <View style={styles.mapPlaceholder}>
                <Ionicons name="location" size={26} color="#2F80ED" />
              </View>

              <View style={styles.locationInfo}>
                <Text style={styles.locationName}>{item.location.name}</Text>
                <Text style={styles.locationDistance}>
                  {item.location.distanceMiles} miles away
                </Text>
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

  note:{
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
    paddingTop: 40,
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
  features: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  featureItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  featureLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 8,
  },
  featureValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F1C2E',
    marginTop: 2,
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
  ownerSection: {
    marginBottom: 24,
  },
  ownerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
  },
  ownerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  ownerInfo: {
    flex: 1,
  },
  ownerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F1C2E',
  },
  verifiedIcon: {
    marginLeft: 6,
  },
  ownerStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerRating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F1C2E',
    marginLeft: 4,
  },
  ownerRentals: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  messageOwnerButton: {
    backgroundColor: '#0F1C2E',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  messageOwnerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
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