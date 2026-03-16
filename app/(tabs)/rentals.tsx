import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { RentalCard } from '@/components/RentalCard';
import { ChevronRight } from 'lucide-react-native';

const activeRentals = [
  {
    id: '1',
    itemName: 'Leica M11 Camera',
    imageUrl: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400',
    dueDate: 'Oct 15 • 10:00 AM',
    timeLeft: '48h',
    badge: 'PREMIUM GEAR',
    progress: 60,
  },
  {
    id: '2',
    itemName: 'iPhone 15 Pro Max',
    imageUrl: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=400',
    dueDate: 'Oct 18 • 12:00 PM',
    timeLeft: '5 days',
    badge: 'ELECTRONICS',
    progress: 30,
  },
];

export default function RentalsScreen() {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  const handleMessageOwner = (rentalId: string) => {
    console.log('Message owner for rental:', rentalId);
  };

  const handleMenu = (rentalId: string) => {
    console.log('Menu for rental:', rentalId);
  };

  const handleViewHistory = () => {
    setActiveTab('history');
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
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
          activeOpacity={0.7}>
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {activeTab === 'active' ? (
          <View style={styles.content}>
            <Text style={styles.sectionLabel}>CURRENTLY RENTING</Text>
            {activeRentals.map((rental) => (
              <RentalCard
                key={rental.id}
                itemName={rental.itemName}
                imageUrl={rental.imageUrl}
                dueDate={rental.dueDate}
                timeLeft={rental.timeLeft}
                badge={rental.badge}
                progress={rental.progress}
                onMessagePress={() => handleMessageOwner(rental.id)}
                onMenuPress={() => handleMenu(rental.id)}
              />
            ))}

            <TouchableOpacity
              style={styles.historyCard}
              onPress={handleViewHistory}
              activeOpacity={0.7}>
              <View style={styles.historyContent}>
                <View>
                  <Text style={styles.historyTitle}>Quick History</Text>
                  <Text style={styles.historySubtitle}>12 Past Rentals</Text>
                </View>
                <ChevronRight size={24} color="#9CA3AF" strokeWidth={2} />
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No Rental History</Text>
            <Text style={styles.emptySubtitle}>
              Your past rentals will appear here
            </Text>
          </View>
        )}
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
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  historyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#0F1C2E',
    marginBottom: 4,
  },
  historySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
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
  },
});
