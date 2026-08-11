import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert,
  ActivityIndicator, RefreshControl, Image, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronDown, ChevronUp, Check, X, Lock } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

type OwnerRental = {
  id: string;
  status: 'REQUESTED' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  start_date: string;
  end_date: string;
  total_price: number;
  pickup_method: 'PICKUP' | 'DELIVERY';
  created_at: string;
  listing: { id: string; title: string };
  rental_items: Array<{
    id: string;
    quantity: number;
    price_applied: number;
    listing_item: { id: string; name: string };
  }>;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    phone_number: string | null;
    email: string;
    profile_image: string | null;
    is_verified: boolean;
  };
};

export default function OwnerRentalsScreen() {
  const router = useRouter();
  const { token, authFetch } = useAuth();

  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [rentals, setRentals] = useState<OwnerRental[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const fetchOwnerRentals = async () => {
    try {
      const res = await authFetch(`${BASE_URL}/rentals/owner`);
      const data = await res.json();

      if (!res.ok) {
        setError('Failed to load rental requests.');
        return;
      }

      setRentals(data.data.rentals ?? []);
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchOwnerRentals();
  }, [token]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOwnerRentals();
  }, [token]);

  const pendingRentals = rentals.filter((r) => r.status === 'REQUESTED');
  const historyRentals = rentals.filter((r) =>
    ['ACCEPTED', 'REJECTED', 'CANCELLED'].includes(r.status)
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

  const getRentalDays = (rental: OwnerRental) => {
    const start = new Date(rental.start_date);
    const end = new Date(rental.end_date);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const updateRentalStatus = async (rentalId: string, status: 'ACCEPTED' | 'REJECTED') => {
    setActingId(rentalId);
    try {
      const res = await authFetch(`${BASE_URL}/rentals/${rentalId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert('Error', data.message || `Failed to ${status.toLowerCase()} rental.`);
        return;
      }

      setRentals((prev) =>
        prev.map((r) => (r.id === rentalId ? { ...r, status } : r))
      );
      setExpandedId(null);
    } catch (err) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setActingId(null);
    }
  };

  const handleAccept = (rental: OwnerRental) => {
    Alert.alert(
      'Accept Rental Request',
      `Accept ${rental.user.first_name}'s request for "${rental.listing.title}"? You'll be able to see their contact details and message them on WhatsApp once accepted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Accept', onPress: () => updateRentalStatus(rental.id, 'ACCEPTED') },
      ]
    );
  };

  const handleReject = (rental: OwnerRental) => {
    Alert.alert(
      'Reject Rental Request',
      `Reject ${rental.user.first_name}'s request for "${rental.listing.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reject', style: 'destructive', onPress: () => updateRentalStatus(rental.id, 'REJECTED') },
      ]
    );
  };

  // Normalizes a stored phone number into WhatsApp's expected format:
  // digits only, no "+", no leading zero, with the 237 country code present.
  // Adjust the default country code if you ever support renters outside Cameroon.
  const formatWhatsAppNumber = (raw: string): string => {
    let digits = raw.replace(/\D/g, ''); // strip +, spaces, dashes, everything non-numeric

    if (digits.startsWith('237')) {
      return digits;
    }

    if (digits.startsWith('0')) {
      digits = digits.slice(1); // drop a leading local trunk 0, if present
    }

    return `237${digits}`;
  };

  const handleWhatsApp = (rental: OwnerRental) => {
    if (!rental.user.phone_number) {
      Alert.alert('No Phone Number', 'This renter hasn\u2019t added a phone number to their profile.');
      return;
    }

    const formattedPhone = formatWhatsAppNumber(rental.user.phone_number);

    const message = encodeURIComponent(
      `Hi ${rental.user.first_name}, this is regarding your rental request for "${rental.listing.title}" on RentIt.`
    );

    Linking.openURL(`whatsapp://send?phone=${formattedPhone}&text=${message}`).catch(() => {
      Alert.alert('Error', 'WhatsApp is not installed on this device.');
    });
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

  const renderRentalCard = (rental: OwnerRental) => {
    const isExpanded = expandedId === rental.id;
    const isActing = actingId === rental.id;
    // Contact details (WhatsApp, phone, email) only unlock once the owner has
    // committed to the rental by accepting it — protects renter privacy from
    // requests the owner hasn't agreed to yet.
    const isContactUnlocked = rental.status !== 'REQUESTED';

    return (
      <View key={rental.id} style={styles.rentalCard}>
        <TouchableOpacity
          onPress={() => toggleExpand(rental.id)}
          activeOpacity={0.8}
          style={styles.rentalHeader}>
          <Image
            source={{
              uri: isContactUnlocked
                ? (rental.user.profile_image ??
                    'https://ui-avatars.com/api/?name=' +
                    encodeURIComponent(`${rental.user.first_name} ${rental.user.last_name}`) +
                    '&background=0F1C2E&color=fff&size=100')
                : 'https://ui-avatars.com/api/?name=' +
                    encodeURIComponent(rental.user.first_name) +
                    '&background=0F1C2E&color=fff&size=100',
            }}
            style={styles.avatar}
          />
          <View style={styles.rentalInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.renterName} numberOfLines={1}>
                {/* First name only until accepted — full name + everything else unlocks after */}
                {isContactUnlocked ? `${rental.user.first_name} ${rental.user.last_name}` : rental.user.first_name}
              </Text>
              {rental.user.is_verified && (
                <Ionicons name="checkmark-circle" size={14} color="#2F80ED" />
              )}
            </View>
            <Text style={styles.rentalSubtitle} numberOfLines={1}>
              {rental.listing.title} • {getRentalDays(rental)} day(s)
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

        {isExpanded && (
          <>
            <View style={styles.divider} />

            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Rental Period</Text>
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Start Date</Text>
                  <Text style={styles.detailValue}>{formatDate(rental.start_date)}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>End Date</Text>
                  <Text style={styles.detailValue}>{formatDate(rental.end_date)}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Duration</Text>
                  <Text style={styles.detailValue}>{getRentalDays(rental)} day(s)</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Method</Text>
                  <Text style={styles.detailValue}>
                    {rental.pickup_method === 'PICKUP' ? 'Self Pickup' : 'Delivery'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Items Requested</Text>
              {rental.rental_items.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <View style={styles.itemRowLeft}>
                    <Ionicons name="cube-outline" size={18} color="#6B7280" />
                    <Text style={styles.itemRowName}>{item.listing_item?.name ?? 'Item'}</Text>
                  </View>
                  <View style={styles.itemRowRight}>
                    <Text style={styles.itemRowQty}>x{item.quantity}</Text>
                    <Text style={styles.itemRowPrice}>{item.price_applied} CFA</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Price</Text>
              <Text style={styles.totalValue}>{rental.total_price} CFA</Text>
            </View>

            <View style={styles.divider} />

            {isContactUnlocked ? (
              <View style={styles.contactRow}>
                <Text style={styles.contactLabel}>Email: {rental.user.email}</Text>
                {rental.user.phone_number && (
                  <Text style={styles.contactLabel}>Phone: {rental.user.phone_number}</Text>
                )}
              </View>
            ) : (
              <View style={styles.lockedBox}>
                <Lock size={14} color="#9CA3AF" />
                <Text style={styles.lockedText}>
                  Contact details are hidden until you accept this request.
                </Text>
              </View>
            )}

            <View style={styles.actionsRow}>
              {isContactUnlocked && (
                <TouchableOpacity
                  style={styles.whatsappButton}
                  onPress={() => handleWhatsApp(rental)}>
                  <Ionicons name="logo-whatsapp" size={16} color="#FFFFFF" />
                  <Text style={styles.whatsappButtonText}>WhatsApp</Text>
                </TouchableOpacity>
              )}

              {rental.status === 'REQUESTED' && (
                <>
                  <TouchableOpacity
                    style={styles.rejectButton}
                    disabled={isActing}
                    onPress={() => handleReject(rental)}>
                    {isActing ? (
                      <ActivityIndicator size="small" color="#EF4444" />
                    ) : (
                      <>
                        <X size={16} color="#EF4444" />
                        <Text style={styles.rejectButtonText}>Reject</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.acceptButton}
                    disabled={isActing}
                    onPress={() => handleAccept(rental)}>
                    {isActing ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Check size={16} color="#FFFFFF" />
                        <Text style={styles.acceptButtonText}>Accept</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={22} color="#0F1C2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rental Requests</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.tabActive]}
          onPress={() => setActiveTab('pending')}
          activeOpacity={0.7}>
          <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
            Pending {pendingRentals.length > 0 && `(${pendingRentals.length})`}
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
        ) : activeTab === 'pending' ? (
          <View style={styles.content}>
            {pendingRentals.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📥</Text>
                <Text style={styles.emptyTitle}>No Pending Requests</Text>
                <Text style={styles.emptySubtitle}>New rental requests will appear here</Text>
              </View>
            ) : (
              pendingRentals.map(renderRentalCard)
            )}
          </View>
        ) : (
          <View style={styles.content}>
            {historyRentals.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🗂️</Text>
                <Text style={styles.emptyTitle}>No History Yet</Text>
                <Text style={styles.emptySubtitle}>Accepted and rejected requests will appear here</Text>
              </View>
            ) : (
              historyRentals.map(renderRentalCard)
            )}
          </View>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
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
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
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
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  rentalInfo: {
    flex: 1,
    marginRight: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  renterName: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    color: '#0F1C2E',
  },
  rentalSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  rentalHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
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
  divider: {
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
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    width: '45%',
  },
  detailLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginBottom: 2,
  },
  detailValue: {
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
  contactRow: {
    gap: 4,
  },
  contactLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  lockedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 10,
  },
  lockedText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  whatsappButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#25D366',
    paddingVertical: 11,
    borderRadius: 10,
  },
  whatsappButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    paddingVertical: 11,
    borderRadius: 10,
  },
  rejectButtonText: {
    color: '#EF4444',
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#10B981',
    paddingVertical: 11,
    borderRadius: 10,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
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
    paddingHorizontal: 20,
  },
});