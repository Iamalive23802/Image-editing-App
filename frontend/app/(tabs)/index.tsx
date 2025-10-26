import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, User } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function HomeScreen() {
  const { t } = useTranslation();
  
  const contentTypes = [
    { id: 'whatsapp', label: t('home.whatsappStatus'), icon: '💬' },
    { id: 'instagram', label: t('home.instagramReels'), icon: '📷' },
    { id: 'youtube', label: t('home.youtubeShorts'), icon: '▶️' },
    { id: 'facebook', label: t('home.facebookPost'), icon: '👍' },
  ];

  const products = [
    {
      id: 1,
      title: 'Gold Coin',
      subtitle: '1 g - Augmont 24K 999',
      price: '₹14449',
      originalPrice: '₹16999',
    },
    {
      id: 2,
      title: 'Gold Coin',
      subtitle: '1 g - Muthoot Exim 24K 999',
      price: '₹14449',
      originalPrice: '₹16999',
    },
    {
      id: 3,
      title: 'Gold Coin',
      subtitle: '0.5 g - Augmont 24K 999',
      price: '₹7299',
      originalPrice: '₹8999',
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#8B2E5A', '#A84369']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.userName}>{t('home.userName')}</Text>
            <Text style={styles.userCategory}>{t('home.userCategory')}</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Bell size={24} color="#FDD835" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <User size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bannerContainer}>
          <LinearGradient
            colors={['#8B2E5A', '#6B1E3F']}
            style={styles.banner}
          >
            <Text style={styles.bannerTitle}>{t('home.celebrateDiwali')}</Text>
          </LinearGradient>
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity style={[styles.filterButton, styles.filterActive]}>
            <Text style={styles.filterTextActive}>{t('home.todaysBest')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>{t('home.upcoming')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>{t('home.mostLiked')}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.productsScroll}
          contentContainerStyle={styles.productsContainer}
        >
          {products.map((product) => (
            <LinearGradient
              key={product.id}
              colors={['#A84369', '#8B2E5A']}
              style={styles.productCard}
            >
              <Text style={styles.productTitle}>{product.title}</Text>
              <Text style={styles.productSubtitle}>{product.subtitle}</Text>

              <View style={styles.coinContainer}>
                <View style={styles.coin} />
              </View>

              <View style={styles.productFooter}>
                <View>
                  <Text style={styles.productQuantity}>1 pc (1 g)</Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.price}>{product.price}</Text>
                    <Text style={styles.originalPrice}>{product.originalPrice}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.addButton}>
                  <Text style={styles.addButtonText}>{t('home.add')}</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>{t('home.contentType')}</Text>
        <View style={styles.contentTypesGrid}>
          {contentTypes.map((type) => (
            <TouchableOpacity 
              key={type.id} 
              style={styles.contentTypeCard}
              onPress={() => router.push(`/content?type=${type.id}`)}
            >
              <Text style={styles.contentTypeIcon}>{type.icon}</Text>
              <Text style={styles.contentTypeLabel}>{type.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B2E5A',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
  },
  userCategory: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 15,
  },
  iconButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerContainer: {
    marginBottom: 20,
  },
  banner: {
    height: 150,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bannerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FDD835',
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  filterActive: {
    backgroundColor: '#FFF',
  },
  filterText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#8B2E5A',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  productsScroll: {
    marginTop: 20,
  },
  productsContainer: {
    paddingHorizontal: 20,
    gap: 15,
  },
  productCard: {
    width: 240,
    borderRadius: 20,
    padding: 20,
    marginRight: 15,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  productSubtitle: {
    fontSize: 12,
    color: '#FFF',
    opacity: 0.9,
    marginBottom: 15,
  },
  coinContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    marginBottom: 15,
  },
  coin: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FDD835',
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  productQuantity: {
    fontSize: 12,
    color: '#FFF',
    opacity: 0.9,
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  originalPrice: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.6,
    textDecorationLine: 'line-through',
  },
  addButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#8B2E5A',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 30,
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  contentTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 15,
    paddingBottom: 30,
  },
  contentTypeCard: {
    width: '47%',
    aspectRatio: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  contentTypeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  contentTypeLabel: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
