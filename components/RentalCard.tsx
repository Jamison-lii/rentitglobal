import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MessageCircle, MoveVertical as MoreVertical } from 'lucide-react-native';
import React from 'react';

interface RentalCardProps {
  itemName: string;
  imageUrl: string;
  dueDate: string;
  timeLeft: string;
  badge?: string;
  progress: number;
  onMessagePress: () => void;
  onMenuPress: () => void;
}

export function RentalCard({
  itemName,
  imageUrl,
  dueDate,
  timeLeft,
  badge = 'PREMIUM GEAR',
  progress,
  onMessagePress,
  onMenuPress,
}: RentalCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <Image source={{ uri: imageUrl }} style={styles.thumbnail} />

        <View style={styles.info}>
          <Text style={styles.itemName}>{itemName}</Text>
          <Text style={styles.dueDate}>Due {dueDate}</Text>

          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
            <Text style={styles.timeLeft}>{timeLeft} left</Text>
          </View>

          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.messageButton} onPress={onMessagePress} activeOpacity={0.7}>
          <MessageCircle size={16} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.messageText}>Message</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton} onPress={onMenuPress} activeOpacity={0.7}>
          <MoreVertical size={20} color="#6B7280" strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#0F1C2E',
    marginBottom: 4,
  },
  dueDate: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#92400E',
  },
  timeLeft: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#2F80ED',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2F80ED',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F1C2E',
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 8,
    gap: 6,
  },
  messageText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F6F8',
    borderRadius: 12,
  },
});
