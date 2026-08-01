import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

type FilterTab = 'ALL' | 'RENTAL' | 'DEPOSIT';

export default function TransactionsScreen() {
  const { token } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<FilterTab>('ALL');

  const fetchPayments = async () => {
    try {
      const res = await fetch(`${BASE_URL}/payments/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Failed to load transactions.');
        return;
      }

      setPayments(data.data.payments || []);
      setError('');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchPayments();
  }, [token]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter((p) => {
    if (filter === 'ALL') return true;
    return p.type === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return '#10B981';
      case 'PENDING': return '#F59E0B';
      case 'FAILED': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'Successful';
      case 'PENDING': return 'Pending';
      case 'FAILED': return 'Failed';
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'RENTAL': return 'Rental Payment';
      case 'DEPOSIT': return 'Security Deposit';
      default: return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'RENTAL': return 'cube-outline';
      case 'DEPOSIT': return 'shield-checkmark-outline';
      default: return 'card-outline';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }) + ' • ' + date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderPaymentItem = (payment: any) => {
    return (
      <View key={payment.id} style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.typeRow}>
            <View style={styles.iconCircle}>
              <Ionicons name={getTypeIcon(payment.type) as any} size={18} color="#0F1C2E" />
            </View>
            <View>
              <Text style={styles.typeLabel}>{getTypeLabel(payment.type)}</Text>
              <Text style={styles.rentalTitle} numberOfLines={1}>
                {payment.rental?.listing?.title ?? 'Rental'}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(payment.status) + '20' },
            ]}
          >
            <Text style={[styles.statusText, { color: getStatusColor(payment.status) }]}>
              {getStatusLabel(payment.status)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardBottom}>
          <Text style={styles.date}>{formatDate(payment.created_at)}</Text>
          <Text style={styles.amount}>{payment.amount} CFA</Text>
        </View>
      </View>
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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
      </View>

      <View style={styles.tabs}>
        {(['ALL', 'RENTAL', 'DEPOSIT'] as FilterTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, filter === tab && styles.tabActive]}
            onPress={() => setFilter(tab)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, filter === tab && styles.tabTextActive]}>
              {tab === 'ALL' ? 'All' : tab === 'RENTAL' ? 'Payments' : 'Deposits'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0F1C2E" />
        }
      >
        {error ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>⚠️</Text>
            <Text style={styles.emptyTitle}>Something went wrong</Text>
            <Text style={styles.emptySubtitle}>{error}</Text>
          </View>
        ) : filteredPayments.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🧾</Text>
            <Text style={styles.emptyTitle}>No Transactions Yet</Text>
            <Text style={styles.emptySubtitle}>Your payments and deposits will appear here</Text>
          </View>
        ) : (
          <View style={styles.content}>
            <Text style={styles.sectionLabel}>
              {filteredPayments.length} TRANSACTION(S)
            </Text>
            {filteredPayments.map(renderPaymentItem)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    fontSize: 14,
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
  card: {
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
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#0F1C2E',
    marginBottom: 2,
  },
  rentalTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    maxWidth: 180,
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
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  amount: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#0F1C2E',
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