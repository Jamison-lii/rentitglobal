import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Heart } from 'lucide-react-native';

interface ItemCardProps {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  rating: number;
  imageUrl: string;
  onPress: () => void;
  isFavorite?: boolean;
  onFavoritePress?: () => void;
}

export function ItemCard({
  name,
  subtitle,
  price,
  rating,
  imageUrl,
  onPress,
  isFavorite = false,
  onFavoritePress,
}: ItemCardProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card} activeOpacity={0.7}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} />

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{rating} ⭐ Trusted Owner</Text>
        </View>

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={onFavoritePress}
          activeOpacity={0.7}>
          <Heart
            size={20}
            color={isFavorite ? '#EF4444' : '#FFFFFF'}
            fill={isFavorite ? '#EF4444' : 'transparent'}
            strokeWidth={2}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>${price}/day</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 240,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#0F1C2E',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#0F1C2E',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 12,
  },
  priceContainer: {
    backgroundColor: '#2F80ED',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  price: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
});
