import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BellRing, User2 } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useRef, useEffect, useState, useMemo } from 'react';
import { useResponsive } from '@/hooks/useResponsive';

// Constants (will be calculated dynamically)
const CARD_HORIZONTAL_PADDING = 22;
const SECTION_GAP = 32;
const PRODUCT_GAP = 16;

export default function HomePage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { width: SCREEN_WIDTH, insets, scaleSpacing } = useResponsive();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Calculate responsive values with scaled padding
  const responsivePadding = scaleSpacing(CARD_HORIZONTAL_PADDING);
  const PRODUCT_CARD_WIDTH = (SCREEN_WIDTH - responsivePadding * 2 - PRODUCT_GAP) / 2;
  const filters = useMemo(
    () => [
      { id: 'todaysBest', label: t('home.todaysBest') },
      { id: 'upcoming', label: t('home.upcoming') },
      { id: 'mostLiked', label: t('home.mostLiked') },
    ],
    [t],
  );
  const [activeFilter, setActiveFilter] = useState(filters[0]?.id ?? '');

  // Construct full name from profile (without prefix)
  const getFullName = () => {
    if (!profile) return t('home.userName'); // Fallback to translation if no profile
    
    const nameParts = [];
    if (profile.firstName) nameParts.push(profile.firstName);
    if (profile.middleName) nameParts.push(profile.middleName);
    if (profile.lastName) nameParts.push(profile.lastName);
    
    return nameParts.length > 0 ? nameParts.join(' ') : t('home.userName');
  };

  // Get user role/category
  const getUserCategory = () => {
    if (!profile || !profile.role) return t('home.userCategory'); // Fallback to translation if no role
    
    return t(`whoYouAre.categories.${profile.role}.label`);
  };

  // Banner carousel data
  const banners = useMemo(
    () => [
      { id: 1, title: t('home.celebrateDiwali'), subtitle: t('home.heroSubtitle') },
      { id: 2, title: t('home.banner2Title'), subtitle: t('home.banner2Subtitle') },
      { id: 3, title: t('home.banner3Title'), subtitle: t('home.banner3Subtitle') },
    ],
    [t],
  );

  // Auto-scroll carousel every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % banners.length;
        scrollViewRef.current?.scrollTo({
          x: nextIndex * SCREEN_WIDTH,
          animated: true,
        });
        return nextIndex;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [banners.length]);

  useEffect(() => {
    if (!activeFilter && filters.length > 0) {
      setActiveFilter(filters[0].id);
    }
  }, [filters, activeFilter]);
  
  const contentTypes = [
    { id: 'whatsapp', label: t('home.whatsappStatus'), icon: '💬' },
    { id: 'instagram', label: t('home.instagramReels'), icon: '📷' },
    { id: 'youtube', label: t('home.youtubeShorts'), icon: '▶️' },
    { id: 'facebook', label: t('home.facebookPost'), icon: '👍' },
  ];

  const products = [
    {
      id: 1,
      title: t('home.products.goldCoin'),
      subtitle: '1 g • Augmont 24K 999',
      price: '₹14,449',
      originalPrice: '₹16,999',
      weight: '1 pc (1 g)',
      badge: t('home.products.limited'),
    },
    {
      id: 2,
      title: t('home.products.goldCoin'),
      subtitle: '1 g • Muthoot Exim 24K 999',
      price: '₹14,449',
      originalPrice: '₹16,999',
      weight: '1 pc (1 g)',
      badge: t('home.products.trending'),
    },
    {
      id: 3,
      title: t('home.products.goldCoin'),
      subtitle: '0.5 g • Augmont 24K 999',
      price: '₹7,299',
      originalPrice: '₹8,999',
      weight: '1 pc (0.5 g)',
      badge: t('home.products.popular'),
    },
  ];

  // Calculate responsive bottom padding: tab bar height + safe area bottom + extra spacing
  const TAB_BAR_HEIGHT = 70;
  const bottomPadding = TAB_BAR_HEIGHT + insets.bottom + scaleSpacing(20);

  return (
    <LinearGradient colors={['#6F0F3B', '#120614']} style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, scaleSpacing(52)),
            paddingBottom: bottomPadding,
            paddingHorizontal: scaleSpacing(CARD_HORIZONTAL_PADDING),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={styles.profileMeta}>
            <Text style={styles.userName}>{getFullName()}</Text>
            <Text style={styles.userCategory}>{getUserCategory()}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={[styles.actionIcon, styles.alertIcon]}>
              <BellRing size={22} color="#8B2E5A" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionIcon} activeOpacity={0.85} onPress={() => router.push('/profile')}>
              <User2 size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            setCurrentIndex(index);
          }}
          scrollEventThrottle={16}
        >
          {banners.map((banner) => (
            <View
              key={banner.id}
              style={[
                styles.heroCardWrapper,
                {
                  width: SCREEN_WIDTH,
                  paddingHorizontal: scaleSpacing(CARD_HORIZONTAL_PADDING),
                },
              ]}
            >
              <LinearGradient colors={['#F8B646', '#F06F58']} style={styles.heroCard}>
                <View style={styles.heroBackground}>
                  <View style={styles.heroOverlay}>
                    <Text style={styles.heroTag}>Diwali 2025</Text>
                    <Text style={styles.heroTitle}>{banner.title}</Text>
                    <Text style={styles.heroSubtitle}>{banner.subtitle}</Text>
                    <TouchableOpacity style={styles.heroCta}>
                      <Text style={styles.heroCtaLabel}>{t('home.heroCta')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </LinearGradient>
            </View>
          ))}
        </ScrollView>
        <View style={[styles.heroDots, { paddingHorizontal: scaleSpacing(CARD_HORIZONTAL_PADDING) }]}>
          {banners.map((banner, index) => (
            <View
              key={banner.id}
              style={[styles.heroDot, index === currentIndex && styles.heroDotActive]}
            />
          ))}
        </View>

        <View style={[styles.filtersRow, { paddingHorizontal: scaleSpacing(CARD_HORIZONTAL_PADDING) }]}>
          {filters.map((filter) => {
            const isActive = filter.id === activeFilter;
            return (
              <TouchableOpacity
                key={filter.id}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                activeOpacity={0.85}
                onPress={() => setActiveFilter(filter.id)}
              >
                <Text style={[styles.filterChipLabel, isActive && styles.filterChipLabelActive]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.productsContainer,
            { paddingHorizontal: scaleSpacing(CARD_HORIZONTAL_PADDING) },
          ]}
        >
          {products.map((product, index) => (
            <LinearGradient
              key={product.id}
              colors={['#2E0316', '#16000A']}
              style={[
                styles.productCard,
                { width: PRODUCT_CARD_WIDTH },
                index === products.length - 1 && styles.productCardLast,
              ]}
            >
              <View style={styles.productHeader}>
                <Text style={styles.productSubtitle}>{product.subtitle}</Text>
                <View style={styles.productBadge}>
                  <Text style={styles.productBadgeLabel}>{product.badge}</Text>
                </View>
              </View>
              <Text style={styles.productTitle}>{product.title}</Text>

              <View style={styles.coinContainer}>
                <LinearGradient colors={['#FEEBB0', '#F7C254']} style={styles.coin}>
                  <View style={styles.coinInner}>
                    <Text style={styles.coinLabel}>24K</Text>
                    <Text style={styles.coinSubLabel}>999.9</Text>
                  </View>
                </LinearGradient>
              </View>

              <View style={styles.productFooter}>
                <View style={styles.productMeta}>
                  <Text style={styles.productQuantity}>{product.weight}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.price} numberOfLines={1}>
                    {product.price}
                  </Text>
                  <Text style={styles.originalPrice} numberOfLines={1} ellipsizeMode="tail">
                    {product.originalPrice}
                  </Text>
                </View>
                </View>
                <TouchableOpacity style={styles.addButton}>
                  <Text style={styles.addButtonText}>{t('home.add')}</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          ))}
        </ScrollView>

        <Text style={[styles.sectionTitle, { paddingHorizontal: scaleSpacing(20) }]}>
          {t('home.contentType')}
        </Text>
        <View style={[styles.contentTypesGrid, { paddingHorizontal: scaleSpacing(20) }]}>
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    gap: SECTION_GAP,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileMeta: {
    gap: 6,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userCategory: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.92)',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  alertIcon: {
    backgroundColor: '#FFE27B',
    borderColor: '#FFE27B',
    shadowColor: '#F2B950',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  heroCard: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#E96A5E',
    shadowOpacity: 0.45,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
    elevation: 5,
  },
  heroBackground: {
    width: '100%',
    height: 210,
  },
  heroOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 26,
    paddingVertical: 26,
    gap: 10,
  },
  heroTag: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: 1.1,
    lineHeight: 42,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 15,
    lineHeight: 22,
  },
  heroCardWrapper: {
    paddingHorizontal: CARD_HORIZONTAL_PADDING,
  },
  heroDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: -2,
    marginBottom: -6,
  },
  heroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  heroDotActive: {
    width: 20,
    backgroundColor: '#FDE8B5',
  },
  heroCta: {
    marginTop: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  heroCtaLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 14,
  },
  productsContainer: {
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  productCard: {
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginRight: PRODUCT_GAP,
    backgroundColor: 'rgba(46,3,22,0.85)',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
    minWidth: 0,
    overflow: 'hidden', // Prevent content overflow
  },
  productCardLast: {
    marginRight: 0,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  productTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FDE8B5',
  },
  productSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  productBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(253, 216, 181, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(253, 216, 181, 0.5)',
    alignSelf: 'flex-start',
  },
  productBadgeLabel: {
    color: '#FDC68A',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  coinContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 84,
    marginBottom: 16,
  },
  coin: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D8A02F',
    shadowOpacity: 0.55,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 5 },
  },
  coinInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#663B00',
  },
  coinSubLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#805000',
  },
  productFooter: {
    gap: 12,
  },
  productMeta: {
    gap: 6,
    flex: 1,
    minWidth: 0, // Allow text to shrink properly
  },
  productQuantity: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FDE8B5',
    flexShrink: 0,
  },
  originalPrice: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
    textDecorationLine: 'line-through',
    flexShrink: 1,
  },
  addButton: {
    backgroundColor: '#FDE8B5',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    color: '#5B1035',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 30,
    marginBottom: 18,
  },
  contentTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingBottom: 20,
    marginBottom: 20,
  },
  contentTypeCard: {
    width: '47%',
    aspectRatio: 1.05,
    backgroundColor: 'rgba(27, 4, 17, 0.65)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  contentTypeIcon: {
    fontSize: 30,
    marginBottom: 10,
  },
  contentTypeLabel: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  filterChip: {
    paddingHorizontal: 24,
    paddingVertical: 11,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  filterChipActive: {
    backgroundColor: '#FFE27B',
    borderColor: 'rgba(253,216,53,0.65)',
    shadowColor: '#FDD835',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  filterChipLabel: {
    color: 'rgba(255,255,255,0.74)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  filterChipLabelActive: {
    color: '#3D0220',
  },
});
