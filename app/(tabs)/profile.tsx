import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { ProfileStatCard } from '@/components/ProfileStatCard';
import { ChevronRight, CreditCard, Shield, Settings, Headphones } from 'lucide-react-native';
import React from 'react';

const menuItems = [
  {
    id: '1',
    icon: CreditCard,
    label: 'Payment Methods',
    onPress: () => console.log('Payment Methods'),
  },
  {
    id: '2',
    icon: Shield,
    label: 'Identity Verification',
    badge: 'UPDATED',
    onPress: () => console.log('Identity Verification'),
  },
  {
    id: '3',
    icon: Settings,
    label: 'Settings & Privacy',
    onPress: () => console.log('Settings & Privacy'),
  },
  {
    id: '4',
    icon: Headphones,
    label: 'Elite Concierge Support',
    onPress: () => console.log('Elite Concierge Support'),
  },
];

export default function ProfileScreen() {
  const profile = {
    name: 'Alexander Vance',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
    memberSince: 'Oct 2021',
    rating: 4.9,
    reviews: 128,
    trustScore: 94,
    verificationLevel: 'Level 2 (Gold)',
    isVerified: true,
  };

  const handleSignOut = () => {
    console.log('Sign out');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile & Trust</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />
              {profile.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓</Text>
                </View>
              )}
            </View>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.memberSince}>ELITE MEMBER • {profile.memberSince}</Text>
          </View>

        {/*  <View style={styles.statsRow}>
            <ProfileStatCard value={profile.rating} label="Rating" />
            <ProfileStatCard value={profile.reviews} label="Reviews" />
            <ProfileStatCard value={`${profile.trustScore}%`} label="Trust Score" />
          </View>*/}

          <View style={styles.verificationCard}>
            <View style={styles.verificationHeader}>
              <View style={styles.verificationLeft}>
                <Shield size={24} color="#2F80ED" strokeWidth={2} />
                <View style={styles.verificationInfo}>
                  <Text style={styles.verificationTitle}>Verification Status</Text>
                  <Text style={styles.verificationStatus}>Identity Verified ✓</Text>
                </View>
              </View>
            </View>

            <View style={styles.kycSection}>
              <Text style={styles.kycLabel}>KYC PROGRESSION</Text>
              <View style={styles.kycProgressBar}>
                <View style={[styles.kycProgressFill, { width: '66%' }]} />
              </View>
              <Text style={styles.kycLevel}>{profile.verificationLevel}</Text>
            </View>
          </View>

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
                    <View style={styles.updateBadge}>
                      <Text style={styles.updateBadgeText}>{item.badge}</Text>
                    </View>
                  )}
                  <ChevronRight size={20} color="#9CA3AF" strokeWidth={2} />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut} activeOpacity={0.7}>
            <Text style={styles.signOutText}>Sign Out of RentIt</Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: 20,
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
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
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
    color: '#10B981',
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
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  updateBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#2F80ED',
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
});
