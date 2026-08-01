import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert,
  ActivityIndicator, TextInput, RefreshControl, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft, Send, Pencil, Trash2, ChevronDown, ChevronUp, Plus,
} from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { CTAButton } from '@/components/CTAButton';
import { SafeAreaView } from 'react-native-safe-area-context';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
// TODO: replace with your real support WhatsApp number, digits only, country code first
const SUPPORT_WHATSAPP_NUMBER = '237695425977';

type Listing = {
  id: string;
  title: string;
  description: string;
  category: string;
  location_city: string;
  location_address: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  effective_status: 'ACTIVE' | 'INACTIVE';
};

type EditForm = {
  title: string;
  description: string;
  category: string;
  location_city: string;
  location_address: string;
  status: 'ACTIVE' | 'INACTIVE';
};

export default function MyListingsScreen() {
  const router = useRouter();
  const { token } = useAuth();

  // listings state
  const [listings, setListings] = useState<Listing[]>([]);
  const [subscriptionActive, setSubscriptionActive] = useState(true);
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // request-to-list form state
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [reqDescription, setReqDescription] = useState('');
  const [reqWhatsapp, setReqWhatsapp] = useState('');
  const [reqCity, setReqCity] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchListings = async () => {
    try {
      const res = await fetch(`${BASE_URL}/listings/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        setError('Failed to load your listings.');
        return;
      }

      setListings(data.data.listings ?? []);
      setSubscriptionActive(data.data.subscription_active ?? true);
      setSubscriptionExpiresAt(data.data.subscription_expires_at ?? null);
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchListings();
  }, [token]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchListings();
  }, [token]);

  const handleContactSupport = () => {
    const message = encodeURIComponent(
      'Hi, my RentIt subscription has expired and I\u2019d like to renew it.'
    );
    Linking.openURL(`whatsapp://send?phone=${SUPPORT_WHATSAPP_NUMBER}&text=${message}`);
  };

  const handleSubmitRequest = async () => {
    if (!reqDescription.trim() || !reqWhatsapp.trim() || !reqCity.trim()) {
      Alert.alert('Missing info', 'Please fill in description, WhatsApp number, and city.');
      return;
    }

    setSubmittingRequest(true);
    try {
      const res = await fetch(`${BASE_URL}/listing-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          description: reqDescription.trim(),
          whatsapp: reqWhatsapp.trim(),
          city: reqCity.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert('Error', data.message || 'Failed to submit request.');
        return;
      }

      Alert.alert('Request Sent', 'We\u2019ll review your request and reach out on WhatsApp shortly.');
      setReqDescription('');
      setReqWhatsapp('');
      setReqCity('');
      setShowRequestForm(false);
    } catch (err) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const startEdit = (listing: Listing) => {
    setEditingId(listing.id);
    setEditForm({
      title: listing.title,
      description: listing.description,
      category: listing.category,
      location_city: listing.location_city,
      location_address: listing.location_address ?? '',
      status: listing.status,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEdit = async (listingId: string) => {
    if (!editForm) return;

    if (!editForm.title.trim() || !editForm.description.trim()) {
      Alert.alert('Missing info', 'Title and description can\u2019t be empty.');
      return;
    }

    setSavingEdit(true);
    try {
      const res = await fetch(`${BASE_URL}/listings/${listingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editForm.title.trim(),
          description: editForm.description.trim(),
          category: editForm.category.trim(),
          location_city: editForm.location_city.trim(),
          location_address: editForm.location_address.trim(),
          status: editForm.status,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert('Error', data.message || 'Failed to update listing.');
        return;
      }

      setListings((prev) =>
        prev.map((l) => (l.id === listingId ? { ...l, ...data.data.listing } : l))
      );
      cancelEdit();
    } catch (err) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = (listingId: string, title: string) => {
    Alert.alert(
      'Delete Listing',
      `Are you sure you want to delete "${title}"? This can\u2019t be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(listingId);
            try {
              const res = await fetch(`${BASE_URL}/listings/${listingId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
              });

              const data = await res.json();

              if (!res.ok) {
                Alert.alert('Error', data.message || 'Failed to delete listing.');
                return;
              }

              setListings((prev) => prev.filter((l) => l.id !== listingId));
            } catch (err) {
              Alert.alert('Error', 'Network error. Please try again.');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toDateString();
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={22} color="#0F1C2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Listings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0F1C2E" />
        }>

        {/* Request to List — collapsible card */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.cardHeader}
            activeOpacity={0.8}
            onPress={() => setShowRequestForm((v) => !v)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Plus size={18} color="#0F1C2E" />
              <Text style={styles.cardLabel}>Request to List an Item</Text>
            </View>
            {showRequestForm ? (
              <ChevronUp size={18} color="#9CA3AF" />
            ) : (
              <ChevronDown size={18} color="#9CA3AF" />
            )}
          </TouchableOpacity>

          {!showRequestForm && (
            <Text style={styles.cardSubLabel}>
              Have something to rent out? Tell us about it and we\u2019ll set up your listing.
            </Text>
          )}

          {showRequestForm && (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.inputLabel}>What do you want to list?</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="e.g. 2 canopy tents, a sound system, 30 plastic chairs..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                value={reqDescription}
                onChangeText={setReqDescription}
              />

              <Text style={styles.inputLabel}>WhatsApp Number</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 2376XXXXXXXX"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                value={reqWhatsapp}
                onChangeText={setReqWhatsapp}
              />

              <Text style={styles.inputLabel}>City</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Douala"
                placeholderTextColor="#9CA3AF"
                value={reqCity}
                onChangeText={setReqCity}
              />

              <CTAButton
                title={submittingRequest ? 'Sending...' : 'Send Request'}
                onPress={submittingRequest ? undefined : handleSubmitRequest}
              />
            </View>
          )}
        </View>

        {/* Subscription expired banner */}
        {!subscriptionActive && listings.length > 0 && (
          <View style={styles.rejectedBanner}>
            <Ionicons name="warning-outline" size={20} color="#EF4444" />
            <View style={{ flex: 1 }}>
              <Text style={styles.rejectedBannerText}>
                Your subscription expired {subscriptionExpiresAt ? `on ${formatDate(subscriptionExpiresAt)}` : ''}.
                Your listings are hidden from renters until you renew.
              </Text>
              <TouchableOpacity style={styles.whatsappLink} onPress={handleContactSupport}>
                <Ionicons name="logo-whatsapp" size={16} color="#10B981" />
                <Text style={styles.whatsappLinkText}>Renew via WhatsApp</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* My Listings */}
        <Text style={styles.sectionTitle}>MY LISTINGS</Text>

        {error ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>⚠️</Text>
            <Text style={styles.statusMessage}>{error}</Text>
          </View>
        ) : listings.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏷️</Text>
            <Text style={styles.statusMessage}>
              No listings yet. Send a request above to get started.
            </Text>
          </View>
        ) : (
          listings.map((listing) => {
            const isEditing = editingId === listing.id;
            const isDeleting = deletingId === listing.id;

            return (
              <View key={listing.id} style={styles.card}>
                {!isEditing ? (
                  <>
                    <View style={styles.listingHeaderRow}>
                      <Text style={styles.cardLabel} numberOfLines={1}>{listing.title}</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              listing.effective_status === 'ACTIVE' ? '#10B98120' : '#EF444420',
                          },
                        ]}>
                        <Text
                          style={[
                            styles.statusText,
                            { color: listing.effective_status === 'ACTIVE' ? '#10B981' : '#EF4444' },
                          ]}>
                          {listing.effective_status === 'ACTIVE' ? 'Live' : 'Hidden'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.metaRow}>
                      <Ionicons name="pricetag-outline" size={14} color="#6B7280" />
                      <Text style={styles.metaText}>{listing.category}</Text>
                      <Ionicons name="location-outline" size={14} color="#6B7280" style={{ marginLeft: 10 }} />
                      <Text style={styles.metaText}>{listing.location_city}</Text>
                    </View>

                    <Text style={styles.cardSubLabel} numberOfLines={2}>
                      {listing.description}
                    </Text>

                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => startEdit(listing)}>
                        <Pencil size={15} color="#2F80ED" />
                        <Text style={styles.actionButtonText}>Edit</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionButton}
                        disabled={isDeleting}
                        onPress={() => handleDelete(listing.id, listing.title)}>
                        {isDeleting ? (
                          <ActivityIndicator size="small" color="#EF4444" />
                        ) : (
                          <>
                            <Trash2 size={15} color="#EF4444" />
                            <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>Delete</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <View>
                    <Text style={styles.inputLabel}>Title</Text>
                    <TextInput
                      style={styles.input}
                      value={editForm?.title}
                      onChangeText={(t) => setEditForm((f) => (f ? { ...f, title: t } : f))}
                    />

                    <Text style={styles.inputLabel}>Description</Text>
                    <TextInput
                      style={[styles.input, styles.inputMultiline]}
                      multiline
                      numberOfLines={3}
                      value={editForm?.description}
                      onChangeText={(t) => setEditForm((f) => (f ? { ...f, description: t } : f))}
                    />

                    <Text style={styles.inputLabel}>Category</Text>
                    <TextInput
                      style={styles.input}
                      value={editForm?.category}
                      onChangeText={(t) => setEditForm((f) => (f ? { ...f, category: t } : f))}
                    />

                    <Text style={styles.inputLabel}>City</Text>
                    <TextInput
                      style={styles.input}
                      value={editForm?.location_city}
                      onChangeText={(t) => setEditForm((f) => (f ? { ...f, location_city: t } : f))}
                    />

                    <Text style={styles.inputLabel}>Address (optional)</Text>
                    <TextInput
                      style={styles.input}
                      value={editForm?.location_address}
                      onChangeText={(t) => setEditForm((f) => (f ? { ...f, location_address: t } : f))}
                    />

                    <Text style={styles.inputLabel}>Status</Text>
                    <View style={styles.toggleRow}>
                      <TouchableOpacity
                        style={[styles.toggleBtn, editForm?.status === 'ACTIVE' && styles.toggleActive]}
                        onPress={() => setEditForm((f) => (f ? { ...f, status: 'ACTIVE' } : f))}>
                        <Text style={editForm?.status === 'ACTIVE' ? styles.toggleTextActive : styles.toggleText}>
                          Active
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.toggleBtn, editForm?.status === 'INACTIVE' && styles.toggleActive]}
                        onPress={() => setEditForm((f) => (f ? { ...f, status: 'INACTIVE' } : f))}>
                        <Text style={editForm?.status === 'INACTIVE' ? styles.toggleTextActive : styles.toggleText}>
                          Inactive
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.editActionsRow}>
                      <TouchableOpacity
                        style={styles.cancelEditButton}
                        onPress={cancelEdit}
                        disabled={savingEdit}>
                        <Text style={styles.cancelEditButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <View style={{ flex: 1 }}>
                        <CTAButton
                          title={savingEdit ? 'Saving...' : 'Save Changes'}
                          onPress={savingEdit ? undefined : () => saveEdit(listing.id)}
                        />
                      </View>
                    </View>
                  </View>
                )}
              </View>
            );
          })
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
    paddingTop: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F5F6F8',
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#0F1C2E',
    flex: 1,
    marginRight: 8,
  },
  cardSubLabel: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#0F1C2E',
  },
  inputMultiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  rejectedBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    padding: 14,
    borderRadius: 12,
    gap: 10,
    marginBottom: 16,
  },
  rejectedBannerText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#EF4444',
    lineHeight: 20,
  },
  whatsappLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  whatsappLinkText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  listingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  metaText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginLeft: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  actionButtonText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#2F80ED',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  toggleBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: '#0F1C2E',
  },
  toggleText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  toggleTextActive: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  editActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  cancelEditButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  cancelEditButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 12,
  },
  statusMessage: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
});