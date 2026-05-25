import React, { useState, useEffect } from 'react';
import {
  View, Text, SafeAreaView, StyleSheet, TouchableOpacity,
  ActivityIndicator, ScrollView, Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CTAButton } from '@/components/CTAButton';
import { ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export default function RentRequestScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { token } = useAuth();

  const [listing, setListing] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<{
    id: string;
    quantity: number;
    price_per_day: any;
    price_per_hour: any;
    quantity_available: number;
    name: string;
    minimum_rental_duration: number;
    maximum_rental_duration: number;
  }[]>([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000));
  const [pickupMethod, setPickupMethod] = useState('PICKUP');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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

  // get the lowest max_rental_duration across selected items
  const maxRentalDays = selectedItems.length > 0
  ? Math.min(...selectedItems.map((i) => i.maximum_rental_duration))
  : listing?.listing_items?.length > 0
  ? Math.min(...listing.listing_items.map((item: any) => item.maximum_rental_duration))
  : 30;

const minRentalDays = selectedItems.length > 0
  ? Math.max(...selectedItems.map((i) => i.minimum_rental_duration))
  : listing?.listing_items?.length > 0
  ? Math.max(...listing.listing_items.map((item: any) => item.minimum_rental_duration))
  : 1;

  const rentalDays = Math.max(
    1,
    Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  );

  const totalPrice = selectedItems.reduce((acc, item) => {
    const pricePerDay = item.price_per_day
      ? parseFloat(item.price_per_day)
      : parseFloat(item.price_per_hour) * 24;
    return acc + pricePerDay * item.quantity * rentalDays;
  }, 0);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const toggleItem = (item: any) => {
    setSelectedItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) {
        return prev.filter((i) => i.id !== item.id);
      }
      return [
        ...prev,
        {
          id: item.id,
          quantity: 1,
          price_per_day: item.price_per_day,
          price_per_hour: item.price_per_hour,
          quantity_available: item.quantity_available,
          name: item.name,
          minimum_rental_duration: item.minimum_rental_duration,
          maximum_rental_duration: item.maximum_rental_duration,
        },
      ];
    });
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    setSelectedItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
    );
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      Alert.alert('Error', 'Please select at least one item to rent.');
      return;
    }

    if (endDate <= startDate) {
      Alert.alert('Error', 'End date must be after start date.');
      return;
    }

    if (rentalDays < minRentalDays) {
      Alert.alert('Error', `Minimum rental duration is ${minRentalDays} day(s).`);
      return;
    }

    if (rentalDays > maxRentalDays) {
      Alert.alert('Error', `Maximum rental duration is ${maxRentalDays} day(s).`);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${BASE_URL}/rentals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          listing_id: id,
          start_date: formatDate(startDate),
          end_date: formatDate(endDate),
          pickup_method: pickupMethod,
          items: selectedItems.map((item) => ({
            listing_item_id: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert('Error', data.message || 'Failed to submit rental request.');
        return;
      }

      Alert.alert(
        'Request Submitted ',
        'Your rental request has been sent. you will be contacted shortly',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)/rentals') }]
      );
    } catch (err) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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
          <Text style={{ color: '#DC2626', fontSize: 14 }}>{error || 'Listing not found.'}</Text>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
            <Text style={{ color: '#2F80ED', fontSize: 14, fontWeight: '600' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={22} color="#0F1C2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Rental</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Select Items */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Select Items</Text>
          {listing.listing_items?.map((item: any) => {
            const selected = selectedItems.find((i) => i.id === item.id);
            return (
              <View key={item.id}>
                <TouchableOpacity
                  style={[styles.itemOption, selected && styles.itemOptionActive]}
                  onPress={() => toggleItem(item)}>
                  <View>
                    <Text style={[
                      styles.itemOptionName,
                      selected && styles.itemOptionNameActive,
                    ]}>
                      {item.name}
                    </Text>
                    <Text style={[
                      styles.itemOptionPrice,
                      selected && styles.itemOptionPriceActive,
                    ]}>
                      {item.price_per_day
                        ? `${item.price_per_day} CFA/day`
                        : `${item.price_per_hour} CFA/hr`}
                    </Text>
                  </View>
                  <Text style={[
                    styles.itemOptionQty,
                    selected && styles.itemOptionQtyActive,
                  ]}>
                    {item.quantity_available} available
                  </Text>
                </TouchableOpacity>

                {selected && (
                  <View style={styles.inlineCounter}>
                    <Text style={styles.inlineCounterLabel}>Quantity</Text>
                    <View style={styles.counter}>
                      <TouchableOpacity
                        onPress={() =>
                          selected.quantity > 1 &&
                          updateItemQuantity(item.id, selected.quantity - 1)
                        }
                        style={styles.counterBtn}>
                        <Text style={styles.counterText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.counterValue}>{selected.quantity}</Text>
                      <TouchableOpacity
                        onPress={() =>
                          selected.quantity < item.quantity_available &&
                          updateItemQuantity(item.id, selected.quantity + 1)
                        }
                        style={styles.counterBtn}>
                        <Text style={styles.counterText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Dates */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Rental Period</Text>
          <View style={styles.durationInfo}>
            <Text style={styles.durationText}>Min: {minRentalDays} day(s)</Text>
            <Text style={styles.durationText}>Max: {maxRentalDays} day(s)</Text>
          </View>
          <View style={styles.dateRow}>
            <TouchableOpacity
              style={styles.dateBox}
              onPress={() => setShowStartPicker(true)}>
              <Text style={styles.dateLabel}>Start</Text>
              <Text style={styles.dateValue}>{startDate.toDateString()}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateBox}
              onPress={() => setShowEndPicker(true)}>
              <Text style={styles.dateLabel}>End</Text>
              <Text style={styles.dateValue}>{endDate.toDateString()}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.rentalDaysText}>Duration: {rentalDays} day(s)</Text>
        </View>

        {/* Pickup Method */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Pickup Method</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, pickupMethod === 'PICKUP' && styles.toggleActive]}
              onPress={() => setPickupMethod('PICKUP')}>
              <Text style={pickupMethod === 'PICKUP' ? styles.toggleTextActive : styles.toggleText}>
                Pickup
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, pickupMethod === 'DELIVERY' && styles.toggleActive]}
              onPress={() => setPickupMethod('DELIVERY')}>
              <Text style={pickupMethod === 'DELIVERY' ? styles.toggleTextActive : styles.toggleText}>
                Delivery
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Price Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Price Summary</Text>
          {selectedItems.length === 0 ? (
            <Text style={styles.summaryEmpty}>No items selected yet.</Text>
          ) : (
            selectedItems.map((item) => {
              const pricePerDay = item.price_per_day
                ? parseFloat(item.price_per_day)
                : parseFloat(item.price_per_hour) * 24;
              return (
                <View key={item.id} style={styles.summaryRow}>
                  <Text style={styles.summaryText}>
                    {item.name} x{item.quantity} x{rentalDays} day(s)
                  </Text>
                  <Text style={styles.summaryValue}>
                    {pricePerDay * item.quantity * rentalDays} CFA
                  </Text>
                </View>
              );
            })
          )}
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.total}>{totalPrice} CFA</Text>
          </View>
        </View>

        <CTAButton
          title={submitting ? 'Submitting...' : 'Confirm Rental'}
          onPress={submitting ? undefined : handleSubmit}
        />

        <View style={{ height: 40 }} />
      </ScrollView>

      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          minimumDate={new Date()}
          display="default"
          onChange={(event, selectedDate) => {
            setShowStartPicker(false);
            if (selectedDate) {
              setStartDate(selectedDate);
              // reset end date if it's now invalid
              const newMin = new Date(selectedDate.getTime() + minRentalDays * 86400000);
              if (endDate < newMin) setEndDate(newMin);
            }
          }}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          minimumDate={new Date(startDate.getTime() + minRentalDays * 86400000)}
          maximumDate={new Date(startDate.getTime() + maxRentalDays * 86400000)}
          display="default"
          onChange={(event, selectedDate) => {
            setShowEndPicker(false);
            if (selectedDate) setEndDate(selectedDate);
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
    padding: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F1C2E',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  itemOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    marginBottom: 8,
  },
  itemOptionActive: {
    backgroundColor: '#0F1C2E',
  },
  itemOptionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F1C2E',
  },
  itemOptionNameActive: {
    color: '#FFFFFF',
  },
  itemOptionPrice: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  itemOptionPriceActive: {
    color: '#9CA3AF',
  },
  itemOptionQty: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  itemOptionQtyActive: {
    color: '#6B7280',
  },
  inlineCounter: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginTop: -4,
    marginBottom: 8,
  },
  inlineCounterLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  counterBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterText: {
    fontSize: 18,
    fontWeight: '700',
  },
  counterValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  durationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  durationText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateBox: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
  },
  dateLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  rentalDaysText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 10,
    textAlign: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
  },
  toggleBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  toggleActive: {
    backgroundColor: '#0F1C2E',
  },
  toggleText: {
    textAlign: 'center',
    color: '#6B7280',
  },
  toggleTextActive: {
    textAlign: 'center',
    color: '#FFFFFF',
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F1C2E',
    marginBottom: 12,
  },
  summaryEmpty: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    marginRight: 8,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F1C2E',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F1C2E',
  },
  total: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F1C2E',
  },
});