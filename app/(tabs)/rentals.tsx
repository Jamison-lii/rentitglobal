import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Alert, TextInput
} from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';


const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export default function RentalsScreen() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [, setTick] = useState(0);
  const [paying, setPaying] = useState(false);
  // per-rental editable MoMo number, keyed by rental id — lets the renter pay
  // from a different number than the one saved on their profile
  const [payPhones, setPayPhones] = useState<Record<string, string>>({});


 const router = useRouter();



  const fetchRentals = async () => {
    try {
      const res = await fetch(`${BASE_URL}/rentals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError('Failed to load rentals.');
        return;
      }
      setRentals(data.data.rentals);
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchRentals();
  }, [token]);



  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRentals();
  }, []);


   useEffect(() => {
  const interval = setInterval(() => {
    setTick((t) => t + 1);
  }, 60000); // re-render every 60 second

  return () => clearInterval(interval);
}, []);


  const activeRentals = rentals.filter((r) =>
    ['REQUESTED', 'ACCEPTED'].includes(r.status)
  );

  const historyRentals = rentals.filter((r) =>
    ['REJECTED', 'CANCELLED'].includes(r.status)
  );

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'REQUESTED': return 'Pending';
      case 'ACCEPTED': return 'Accepted';
      case 'REJECTED': return 'Rejected';
      case 'CANCELLED': return 'Cancelled';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REQUESTED': return '#F59E0B';
      case 'ACCEPTED': return '#10B981';
      case 'REJECTED': return '#EF4444';
      case 'CANCELLED': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toDateString();

  const getRentalDays = (rental: any) => {
    const start = new Date(rental.start_date);
    const end = new Date(rental.end_date);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const isWithin20Minutes = (createdAt: string) => {
    const created = new Date(createdAt).getTime();
    const now = new Date().getTime();
    const diffMinutes = (now - created) / (1000 * 60);
    return diffMinutes <= 20;
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // returns the phone this rental will pay from — whatever the renter has typed
  // for this specific rental, falling back to their profile number
  const getPayPhone = (rentalId: string) => payPhones[rentalId] ?? user?.phone_number ?? '';

  const setPayPhone = (rentalId: string, value: string) => {
    setPayPhones((prev) => ({ ...prev, [rentalId]: value }));
  };

  // Polls the confirm endpoint a few times, since a MoMo approval prompt
  // can take anywhere from a few seconds to over a minute. Stops as soon
  // as we get a definitive SUCCESS or FAILED — never assumes success from
  // a 200 response alone.
  const pollPaymentStatus = async (paymentId: string, attemptsLeft = 8) => {
    try {
      const res = await fetch(
        `${BASE_URL}/payments/rental/confirm/${paymentId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        if (attemptsLeft <= 0) {
          Alert.alert('Error', data.message || 'Could not verify payment.');
          return;
        }
        setTimeout(() => pollPaymentStatus(paymentId, attemptsLeft - 1), 5000);
        return;
      }

      const status = data?.data?.payment?.status;

      if (status === 'SUCCESS') {
        Alert.alert('Success', 'Rental payment completed successfully.');
        await fetchRentals();
        return;
      }

      if (status === 'FAILED') {
        Alert.alert('Payment Failed', 'The Mobile Money payment was not completed or was declined.');
        await fetchRentals();
        return;
      }

      // Still pending — keep polling until we run out of attempts
      if (attemptsLeft > 0) {
        setTimeout(() => pollPaymentStatus(paymentId, attemptsLeft - 1), 5000);
      } else {
        Alert.alert(
          'Still Pending',
          'We haven\'t received confirmation yet. Pull to refresh in a moment to check again.'
        );
      }
    } catch (error) {
      if (attemptsLeft > 0) {
        setTimeout(() => pollPaymentStatus(paymentId, attemptsLeft - 1), 5000);
      } else {
        Alert.alert('Error', 'Could not verify payment.');
      }
    }
  };

  const handlePayRental = async (rentalId: string) => {
  const phone = getPayPhone(rentalId).trim();

  if (!phone) {
    Alert.alert('Phone Number Required', 'Please enter the Mobile Money number to pay from.');
    return;
  }

  Alert.alert(
    'Pay Rental',
    `Do you want to proceed with this payment using ${phone}?`,
    [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Pay',
        onPress: async () => {
          try {
            setPaying(true);

            const res = await fetch(
              `${BASE_URL}/payments/rental`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  rental_id: rentalId,
                  phone,
                }),
              }
            );

            const data = await res.json();

            if (!res.ok) {
              Alert.alert(
                'Payment Failed',
                data.message || 'Failed to initiate payment.'
              );
              return;
            }

            const paymentId = data.data.payment.id;

            Alert.alert(
              'Payment Initiated',
              'Check your phone and approve the Mobile Money payment request.'
            );

            // Give the user a few seconds to see/approve the prompt, then
            // start polling for the real outcome instead of assuming success.
            setTimeout(() => {
              pollPaymentStatus(paymentId);
            }, 5000);

            console.log(data);

          } catch (err) {
            Alert.alert(
              'Error',
              'Network error. Please try again.'
            );
          } finally {
            setPaying(false);
          }
        },
      },
    ]
  );
};


  const handleCancelRental = async (rentalId: string) => {
    Alert.alert(
      'Cancel Rental',
      'Are you sure you want to cancel this rental request?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(`${BASE_URL}/rentals/${rentalId}/status`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: 'CANCELLED' }),
              });

              const data = await res.json();

              if (!res.ok) {
                Alert.alert('Error', data.message || 'Failed to cancel rental.');
                return;
              }

              setRentals((prev) =>
                prev.map((r) =>
                  r.id === rentalId ? { ...r, status: 'CANCELLED' } : r
                )
              );

              setExpandedId(null);
              Alert.alert('Cancelled', 'Your rental request has been cancelled.');
            } catch (err) {
              Alert.alert('Error', 'Network error. Please try again.');
            }
          },
        },
      ]
    );
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

  const renderRentalItem = (rental: any) => {
    const isExpanded = expandedId === rental.id;
    const canCancel = rental.status === 'REQUESTED' && isWithin20Minutes(rental.created_at);
    const showSupportMessage = rental.status === 'REQUESTED' && !isWithin20Minutes(rental.created_at);

    return (
      <View key={rental.id} style={styles.rentalCard}>
        {/* Header — tap to expand */}
        <TouchableOpacity
          onPress={() => toggleExpand(rental.id)}
          activeOpacity={0.8}
          style={styles.rentalHeader}>
          <View style={styles.rentalInfo}>
            <Text style={styles.rentalTitle} numberOfLines={1}>
              {rental.listing?.title ?? 'Rental'}
            </Text>
            <Text style={styles.rentalItems}>
              {rental.rental_items?.length} item(s) • {getRentalDays(rental)} day(s)
            </Text>
          </View>
          <View style={styles.rentalHeaderRight}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(rental.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(rental.status) }]}>
                {getStatusLabel(rental.status)}
              </Text>
            </View>
            {isExpanded
              ? <ChevronUp size={18} color="#9CA3AF" style={{ marginLeft: 8 }} />
              : <ChevronDown size={18} color="#9CA3AF" style={{ marginLeft: 8 }} />
            }
          </View>
        </TouchableOpacity>

        {/* Expanded details */}
        {isExpanded && (
          <>
            <View style={styles.rentalDivider} />

            {/* Rental Period */}
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Rental Period</Text>
              <View style={styles.rentalDetails}>
                <View style={styles.rentalDetailItem}>
                  <Text style={styles.rentalDetailLabel}>Start Date</Text>
                  <Text style={styles.rentalDetailValue}>{formatDate(rental.start_date)}</Text>
                </View>
                <View style={styles.rentalDetailItem}>
                  <Text style={styles.rentalDetailLabel}>End Date</Text>
                  <Text style={styles.rentalDetailValue}>{formatDate(rental.end_date)}</Text>
                </View>
                <View style={styles.rentalDetailItem}>
                  <Text style={styles.rentalDetailLabel}>Duration</Text>
                  <Text style={styles.rentalDetailValue}>{getRentalDays(rental)} day(s)</Text>
                </View>
                <View style={styles.rentalDetailItem}>
                  <Text style={styles.rentalDetailLabel}>Pickup</Text>
                  <Text style={styles.rentalDetailValue}>
                    {rental.pickup_method === 'PICKUP' ? 'Self Pickup' : 'Delivery'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.rentalDivider} />

            {/* Items */}
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Items</Text>
              {rental.rental_items?.map((item: any) => (
                <View key={item.id} style={styles.itemRow}>
                  <View style={styles.itemRowLeft}>
                    <Ionicons name="cube-outline" size={18} color="#6B7280" />
                    <Text style={styles.itemRowName}>
                      {item.listing_item?.name ?? 'Item'}
                    </Text>
                  </View>
                  <View style={styles.itemRowRight}>
                    <Text style={styles.itemRowQty}>x{item.quantity}</Text>
                    <Text style={styles.itemRowPrice}>{item.price_applied} CFA</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.rentalDivider} />

            {/* Total */}
            <View style={styles.detailSection}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Price</Text>
                <Text style={styles.totalValue}>{rental.total_price} CFA</Text>
              </View>
            </View>

            {/* WhatsApp payment notice — only for ACCEPTED rentals */}
{rental.status === 'ACCEPTED' && (
  <>
    <View style={styles.rentalDivider} />
    <View style={styles.whatsappBox}>
      <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
      <Text style={styles.whatsappText}>
        Your rental has been accepted! You will be contacted shortly via WhatsApp to complete your payment of{' '}
        <Text style={styles.whatsappAmount}>{rental.total_price} CFA</Text>.
        Please keep your phone nearby.
      </Text>
    </View>
  </>
)}

{rental.status === 'REQUESTED' && (
  <>
    <View style={styles.rentalDivider} />
    <View style={styles.whatsappBox}>
      <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
      <Text style={styles.whatsappText}>
        Your rental is being reviewed You will be contacted shortly via WhatsApp for details regarding your rental request.If it takes more than 5 minutes contact support via the profile page.
        Please keep your phone nearby.
      </Text>
    </View>
  </>
)}

            {/* Cancel or support message */}
            {(canCancel || showSupportMessage) && (
              <View style={styles.rentalDivider} />
            )}

            {canCancel && (
              <TouchableOpacity
                style={styles.cancelButton}
                activeOpacity={0.8}
                onPress={() => handleCancelRental(rental.id)}>
                <Text style={styles.cancelButtonText}>Cancel Request</Text>
              </TouchableOpacity>
            )}

            {showSupportMessage && (
              <View style={styles.supportBox}>
                <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
                <Text style={styles.supportText}>
                  Cancellation window has passed. Please{' '}
                  <Text
                    style={styles.supportLink}
                    onPress={() => router.push('/(tabs)/profile')}>
                    contact support
                  </Text>{' '}
                  to request a cancellation.
                </Text>
              </View>
            )}

  {rental.payments?.some((p: any) => p.status === "SUCCESS") ? (
  <Text style={{ color: "green", fontWeight: "bold" }}>
    Paid ✓
  </Text>
) : (
  rental.status === 'ACCEPTED' && (
    <View style={styles.payBox}>
      <Text style={styles.payPhoneLabel}>Pay from this Mobile Money number</Text>
      <TextInput
        style={styles.payPhoneInput}
        placeholder="e.g. 6XXXXXXXX"
        placeholderTextColor="#9CA3AF"
        keyboardType="phone-pad"
        value={getPayPhone(rental.id)}
        onChangeText={(text) => setPayPhone(rental.id, text)}
      />
      <TouchableOpacity
        style={styles.payButton}
        onPress={() => handlePayRental(rental.id)}
        disabled={paying}
      >
        <Text style={styles.payButtonText}>
          {paying ? "Processing..." : `Pay ${rental.total_price} FCFA`}
        </Text>
      </TouchableOpacity>
    </View>
  )
)}
          </>

        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Rentals</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
          activeOpacity={0.7}>
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            Active {activeRentals.length > 0 && `(${activeRentals.length})`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
          activeOpacity={0.7}>
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            History {historyRentals.length > 0 && `(${historyRentals.length})`}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0F1C2E" />
        }>
        {error ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>⚠️</Text>
            <Text style={styles.emptyTitle}>Something went wrong</Text>
            <Text style={styles.emptySubtitle}>{error}</Text>
          </View>
        ) : activeTab === 'active' ? (
          <View style={styles.content}>
            {activeRentals.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📦</Text>
                <Text style={styles.emptyTitle}>No Active Rentals</Text>
                <Text style={styles.emptySubtitle}>Your active rentals will appear here</Text>
              </View>
            ) : (
              <>
                <Text style={styles.sectionLabel}>
                  CURRENTLY RENTING — {activeRentals.length} RENTAL(S)
                </Text>
                {activeRentals.map(renderRentalItem)}
              </>
            )}
          </View>
        ) : (
          <View style={styles.content}>
            {historyRentals.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🗂️</Text>
                <Text style={styles.emptyTitle}>No Rental History</Text>
                <Text style={styles.emptySubtitle}>Your past rentals will appear here</Text>
              </View>
            ) : (
              <>
                <Text style={styles.sectionLabel}>
                  PAST RENTALS — {historyRentals.length} RENTAL(S)
                </Text>
                {historyRentals.map(renderRentalItem)}
              </>
            )}
          </View>
        )}


      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  payBox: {
    marginTop: 10,
  },
  payPhoneLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginBottom: 6,
  },
  payPhoneInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#0F1C2E',
    marginBottom: 10,
  },
  payButton: {
  backgroundColor: "#007A5E",
  paddingVertical: 12,
  borderRadius: 8,
  alignItems: "center",
},

payButtonText: {
  color: "#FFFFFF",
  fontSize: 16,
  fontWeight: "600",
},
  container: {
    paddingTop: 10,
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#0F1C2E',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: '#0F1C2E',
  },
  tabText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  rentalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  rentalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rentalHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rentalInfo: {
    flex: 1,
    marginRight: 12,
  },
  rentalTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#0F1C2E',
    marginBottom: 4,
  },
  rentalItems: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  rentalDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  detailSection: {
    marginBottom: 4,
  },
  detailSectionTitle: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#9CA3AF',
    marginBottom: 10,
  },
  rentalDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  rentalDetailItem: {
    width: '45%',
  },
  rentalDetailLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginBottom: 2,
  },
  rentalDetailValue: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#0F1C2E',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  itemRowName: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#0F1C2E',
  },
  itemRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemRowQty: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  itemRowPrice: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#0F1C2E',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#0F1C2E',
  },
  totalValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#0F1C2E',
  },
  cancelButton: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#EF4444',
  },
  supportBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  supportText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    flex: 1,
    lineHeight: 20,
  },
  supportLink: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#2F80ED',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#0F1C2E',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  whatsappBox: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  backgroundColor: '#F0FDF4',
  padding: 12,
  borderRadius: 12,
  gap: 10,
  borderWidth: 1,
  borderColor: '#BBF7D0',
},
whatsappText: {
  fontSize: 13,
  fontFamily: 'Inter-Regular',
  color: '#166534',
  flex: 1,
  lineHeight: 20,
},
whatsappAmount: {
  fontFamily: 'Inter-Bold',
  color: '#166534',
},
});