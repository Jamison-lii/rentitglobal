import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CTAButton } from '@/components/CTAButton';
import { ArrowLeft } from 'lucide-react-native';

export default function RentRequestScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [quantity, setQuantity] = useState(1);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [pickupMethod, setPickupMethod] = useState('PICKUP');

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // MOCK ITEM
  const item = {
    price: 85,
    pricingType: 'PER_DAY',
    quantityAvailable: 5,
  };

  // Rental days calculation
  const rentalDays = Math.max(
    1,
    Math.ceil(
      (endDate.getTime() - startDate.getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  // Total price calculation
  const totalPrice =
    item.pricingType === 'PER_DAY'
      ? rentalDays * quantity * item.price
      : quantity * item.price;

  const handleSubmit = () => {
    console.log({
      itemId: id,
      quantity,
      startDate,
      endDate,
      totalPrice,
      pickupMethod,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={22} color="#0F1C2E" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Request Rental</Text>

        <View style={{ width: 40 }} />
      </View>

      {/* Quantity */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Quantity</Text>

        <View style={styles.counter}>
          <TouchableOpacity
            onPress={() => quantity > 1 && setQuantity(quantity - 1)}
            style={styles.counterBtn}
          >
            <Text style={styles.counterText}>-</Text>
          </TouchableOpacity>

          <Text style={styles.counterValue}>{quantity}</Text>

          <TouchableOpacity
            onPress={() =>
              quantity < item.quantityAvailable &&
              setQuantity(quantity + 1)
            }
            style={styles.counterBtn}
          >
            <Text style={styles.counterText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Dates */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Rental Period</Text>

        <View style={styles.dateRow}>
          <TouchableOpacity
            style={styles.dateBox}
            onPress={() => setShowStartPicker(true)}
          >
            <Text style={styles.dateLabel}>Start</Text>
            <Text style={styles.dateValue}>
              {startDate.toDateString()}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateBox}
            onPress={() => setShowEndPicker(true)}
          >
            <Text style={styles.dateLabel}>End</Text>
            <Text style={styles.dateValue}>
              {endDate.toDateString()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Pickup Method */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Pickup Method</Text>

        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              pickupMethod === 'PICKUP' && styles.toggleActive,
            ]}
            onPress={() => setPickupMethod('PICKUP')}
          >
            <Text
              style={
                pickupMethod === 'PICKUP'
                  ? styles.toggleTextActive
                  : styles.toggleText
              }
            >
              Pickup
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleBtn,
              pickupMethod === 'DELIVERY' && styles.toggleActive,
            ]}
            onPress={() => setPickupMethod('DELIVERY')}
          >
            <Text
              style={
                pickupMethod === 'DELIVERY'
                  ? styles.toggleTextActive
                  : styles.toggleText
              }
            >
              Delivery
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Price Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>
          {item.price} × {quantity} × {rentalDays} days
        </Text>

        <Text style={styles.total}>
          {totalPrice} CFA
        </Text>
      </View>

      <CTAButton title="Confirm Rental" onPress={handleSubmit} />

      {/* DATE PICKERS */}
      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowStartPicker(false);
            if (selectedDate) setStartDate(selectedDate);
          }}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
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
    color: '#6B7280',
    marginBottom: 12,
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
    backgroundColor: '#F3F4F6',
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
    marginTop: 10,
    marginBottom: 20,
  },

  summaryText: {
    fontSize: 14,
    color: '#6B7280',
  },

  total: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 6,
    color: '#0F1C2E',
  },
});