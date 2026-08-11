import { useState, useEffect } from 'react';
import {
  Linking, View, Text, ScrollView, Image, TouchableOpacity, StyleSheet,
   TextInput, Alert, ActivityIndicator, Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, CreditCard, Shield, Settings, Headphones, Camera, X, Check, PackagePlus, Inbox, Receipt } from 'lucide-react-native';
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router';


const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ProfileScreen() {
   const { authFetch } = useAuth();
  const router = useRouter();
  const navigation = useNavigation();
  const { user, token, logout, updateUser } = useAuth();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // edit form state
  const [firstName, setFirstName] = useState(user?.first_name ?? '');
  const [lastName, setLastName] = useState(user?.last_name ?? '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number ?? '');
  const [city, setCity] = useState(user?.city ?? '');

  const [verification, setVerification] = useState<any>(null);
const [verificationLoading, setVerificationLoading] = useState(true);

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '';

  const handleSignOut = async () => {
    await logout();
    router.replace('/login');
  };

 

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('profile_image', {
        uri: result.assets[0].uri,
        name: 'profile.jpg',
        type: 'image/jpeg',
      } as any);

      const res = await authFetch(`${BASE_URL}/auth/update`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert('Error', data.message || 'Failed to update profile image.');
        return;
      }

      updateUser(data.data.user);
      Alert.alert('Success', 'Profile image updated!');
    } catch (err) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Error', 'First name and last name are required.');
      return;
    }

    setUpdating(true);

    try {
      const res = await authFetch(`${BASE_URL}/auth/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone_number: phoneNumber.trim() || undefined,
          city: city.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert('Error', data.message || 'Failed to update profile.');
        return;
      }

      updateUser(data.data.user);
      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
  fetchVerificationStatus();
}, []);

const fetchVerificationStatus = async () => {
  try {
    const res = await authFetch(`${BASE_URL}/verification/status`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (res.ok) {
      setVerification(data.data.verification);
    }
  } catch (err) {
    console.error('Failed to fetch verification status:', err);
  } finally {
    setVerificationLoading(false);
  }
};

 const menuItems: Array<{ id: string; icon: typeof Headphones; label: string; onPress: () => void; badge?: string; badgeColor?: string; }> = [
  {
    id: '1',
    icon: Headphones,
    label: 'Elite Concierge Support',
    onPress: () => {
      const phoneNumber = '+237695425977'; // replace with your whatsapp number
      const url = `whatsapp://send?phone=${phoneNumber}`;
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'WhatsApp is not installed on this device.');
      });
    },
  },
  /* {
    id: '2',
     icon: Settings,
    label: 'Create a Listing',
     onPress: () => console.log('Settings & Privacy'),
   },*/
];
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile & Trust</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              {uploadingImage ? (
                <View style={[styles.avatar, styles.avatarLoading]}>
                  <ActivityIndicator color="#FFFFFF" />
                </View>
              ) : (
                <Image
                  source={{
                    uri: user?.profile_image ??
                      'https://ui-avatars.com/api/?name=' +
                      encodeURIComponent(`${user?.first_name} ${user?.last_name}`) +
                      '&background=0F1C2E&color=fff&size=200',
                  }}
                  style={styles.avatar}
                />
              )}

              {user?.is_verified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓</Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.cameraButton}
                onPress={handlePickImage}
                activeOpacity={0.8}>
                <Camera size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.name}>
              {user?.first_name} {user?.last_name}
            </Text>
            <Text style={styles.memberSince}>MEMBER • {memberSince}</Text>

            {user?.city && (
              <Text style={styles.city}>📍 {user.city}</Text>
            )}

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                setFirstName(user?.first_name ?? '');
                setLastName(user?.last_name ?? '');
                setPhoneNumber(user?.phone_number ?? '');
                setCity(user?.city ?? '');
                setEditModalVisible(true);
              }}
              activeOpacity={0.8}>
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {/* User Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>Account Info</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>
            {user?.phone_number && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{user.phone_number}</Text>
              </View>
            )}
            {user?.city && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>City</Text>
                <Text style={styles.infoValue}>{user.city}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Deposit</Text>
              <Text style={[styles.infoValue, { color: user?.deposit_paid ? '#10B981' : '#EF4444' }]}>
                {user?.deposit_paid ? 'Paid ✓' : 'Not Paid'}
              </Text>
            </View>
          </View>

          {/* Verification Card */}
        <View style={styles.verificationCard}>
  <View style={styles.verificationHeader}>
    <View style={styles.verificationLeft}>
      <Shield size={24} color="#2F80ED" strokeWidth={2} />
      <View style={styles.verificationInfo}>
        <Text style={styles.verificationTitle}>Verification Status</Text>
        {verificationLoading ? (
          <ActivityIndicator size="small" color="#2F80ED" />
        ) : (
          <Text style={[
            styles.verificationStatus,
            {
              color: !verification
                ? '#EF4444'
                : verification.status === 'APPROVED'
                ? '#10B981'
                : verification.status === 'PENDING'
                ? '#F59E0B'
                : '#EF4444'
            }
          ]}>
            {!verification
              ? 'Not Submitted'
              : verification.status === 'APPROVED'
              ? 'Identity Verified ✓'
              : verification.status === 'PENDING'
              ? 'Verification Pending ⏳'
              : 'Verification Rejected ✗'}
          </Text>
        )}
      </View>
    </View>
  </View>

  <View style={styles.kycSection}>
    <Text style={styles.kycLabel}>KYC PROGRESSION</Text>
    <View style={styles.kycProgressBar}>
      <View style={[
        styles.kycProgressFill,
        {
          width: !verification
            ? '10%'
            : verification.status === 'APPROVED'
            ? '100%'
            : verification.status === 'PENDING'
            ? '60%'
            : '30%',
          backgroundColor: !verification
            ? '#EF4444'
            : verification.status === 'APPROVED'
            ? '#10B981'
            : verification.status === 'PENDING'
            ? '#F59E0B'
            : '#EF4444',
        }
      ]} />
    </View>
    <Text style={[
      styles.kycLevel,
      {
        color: !verification
          ? '#EF4444'
          : verification.status === 'APPROVED'
          ? '#10B981'
          : verification.status === 'PENDING'
          ? '#F59E0B'
          : '#EF4444',
      }
    ]}>
      {!verification
        ? 'Not Submitted'
        : verification.status === 'APPROVED'
        ? 'Level 2 (Verified)'
        : verification.status === 'PENDING'
        ? 'Level 1 (Under Review)'
        : 'Rejected — Please Resubmit'}
    </Text>
  </View>

  {/* Show submit button if not submitted or rejected */}
  {(!verification || verification.status === 'REJECTED') && (
    <TouchableOpacity
      style={styles.verifyButton}
      onPress={() => router.push('/verification')}
      activeOpacity={0.8}>
      <Text style={styles.verifyButtonText}>
        {!verification ? 'Submit Verification' : 'Resubmit Verification'}
      </Text>
    </TouchableOpacity>
  )}
</View>

          {/* Menu Items */}
          <View style={styles.menuSection}>
            <Text style={styles.menuTitle}>ACCOUNT MANAGEMENT</Text>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={item.onPress}
                activeOpacity={0.7}>
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuItemIcon}>
                    <item.icon size={20} color="#6B7280" strokeWidth={2} />
                  </View>
                  <Text style={styles.menuItemLabel}>{item.label}</Text>
                </View>
                <View style={styles.menuItemRight}>
                  {item.badge && (
                    <View style={[styles.updateBadge, { backgroundColor: item.badgeColor + '20' }]}>
                      <Text style={[styles.updateBadgeText, { color: item.badgeColor }]}>
                        {item.badge}
                      </Text>
                    </View>
                  )}
                  <ChevronRight size={20} color="#9CA3AF" strokeWidth={2} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
            <Text style={styles.menuTitle}>RENTAL MANAGEMENT</Text>
          <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push('/listing-request')}
                activeOpacity={0.7}>
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuItemIcon}>
                     <PackagePlus size={20} color="#6B7280" strokeWidth={2} />
                  </View>
                  <Text style={styles.menuItemLabel}>Create a Listing</Text>
                </View>
                <View style={styles.menuItemRight}>
                  <ChevronRight size={20} color="#9CA3AF" strokeWidth={2} />
                </View>
              </TouchableOpacity>

               <TouchableOpacity
                style={styles.menuItem}
               onPress={() => router.push('/owner-section' as any)}
                activeOpacity={0.7}>
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuItemIcon}>
                    <Inbox size={20} color="#6B7280" strokeWidth={2} />
                  </View>
                  <Text style={styles.menuItemLabel}>View Requests on your items</Text>
                </View>
                <View style={styles.menuItemRight}>
                  <ChevronRight size={20} color="#9CA3AF" strokeWidth={2} />
                </View>
              </TouchableOpacity>


               <TouchableOpacity
                style={styles.menuItem}
               onPress={() => router.push('/transactions' as any)} 
                activeOpacity={0.7}>
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuItemIcon}>
                   <Receipt size={20} color="#6B7280" strokeWidth={2} />
                  </View>
                  <Text style={styles.menuItemLabel}>Transactions</Text>
                </View>
                <View style={styles.menuItemRight}>
                  <ChevronRight size={20} color="#9CA3AF" strokeWidth={2} />
                </View>
              </TouchableOpacity>

          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut} activeOpacity={0.7}>
            <Text style={styles.signOutText}>Sign Out of RentIt</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <X size={24} color="#0F1C2E" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={handleUpdateProfile} disabled={updating}>
              {updating
                ? <ActivityIndicator size="small" color="#0F1C2E" />
                : <Check size={24} color="#0F1C2E" />
              }
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>First Name</Text>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                style={styles.input}
                placeholder="First name"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                style={styles.input}
                placeholder="Last name"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                style={styles.input}
                placeholder="+237 6XX XXX XXX"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>City</Text>
              <TextInput
                value={city}
                onChangeText={setCity}
                style={styles.input}
                placeholder="Your city"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 5,
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#0F1C2E',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarLoading: {
    backgroundColor: '#0F1C2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2F80ED',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0F1C2E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#0F1C2E',
    marginBottom: 6,
  },
  memberSince: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  city: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 16,
  },
  editButton: {
    backgroundColor: '#F5F6F8',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  editButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#0F1C2E',
  },
  infoCard: {
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
  infoCardTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#0F1C2E',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  infoValue: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#0F1C2E',
    maxWidth: '60%',
    textAlign: 'right',
  },
  verificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  verificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  verificationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  verificationInfo: {
    flex: 1,
  },
  verificationTitle: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#0F1C2E',
    marginBottom: 4,
  },
  verificationStatus: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
  },
  kycSection: {
    marginTop: 8,
  },
  kycLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Bold',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  kycProgressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  kycProgressFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
  },
  kycLevel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
  },
  menuSection: {
    marginBottom: 24,
  },
  menuTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F5F6F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemLabel: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#0F1C2E',
    flex: 1,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  updateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  updateBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  signOutButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#EF4444',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#0F1C2E',
  },
  modalContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },

  verifyButton: {
  backgroundColor: '#EAF3FF',
  padding: 12,
  borderRadius: 12,
  alignItems: 'center',
  marginTop: 16,
},
verifyButtonText: {
  fontSize: 14,
  fontFamily: 'Inter-SemiBold',
  color: '#2F80ED',
},
});