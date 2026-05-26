import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator, RefreshControl, Alert
} from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useAuth } from '@/context/AuthContext';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export default function RentalsScreen() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [, setTick] = useState(0);

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
    fetchRentals();
  }, []);

 

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
                    onPress={() => console.log('contact support')}>
                    contact support
                  </Text>{' '}
                  to request a cancellation.
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
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
  container: {
    paddingTop: 40,
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
});