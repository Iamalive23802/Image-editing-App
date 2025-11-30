import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Heart, Download, Share, Bell, User, Home } from 'lucide-react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

export default function ContentGalleryPage() {
  const { type } = useLocalSearchParams();
  const { t } = useTranslation();
  
  const contentTypeConfig = {
    whatsapp: {
      title: t('home.whatsappStatus'),
      subtitle: t('content.birthdayWishes'),
      icon: '💬',
      color: '#25D366',
      gradient: ['#25D366', '#128C7E']
    },
    instagram: {
      title: t('home.instagramReels'),
      subtitle: t('content.trendingVideos'),
      icon: '📷',
      color: '#E4405F',
      gradient: ['#E4405F', '#C13584']
    },
    youtube: {
      title: t('home.youtubeShorts'),
      subtitle: t('content.quickVideos'),
      icon: '▶️',
      color: '#FF0000',
      gradient: ['#FF0000', '#CC0000']
    },
    facebook: {
      title: t('home.facebookPost'),
      subtitle: t('content.socialUpdates'),
      icon: '👍',
      color: '#1877F2',
      gradient: ['#1877F2', '#0A5F9A']
    }
  };

  const config = contentTypeConfig[type as keyof typeof contentTypeConfig] || contentTypeConfig.whatsapp;

  const sampleContent = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
      title: t('content.birthdayCelebration'),
      likes: 245,
      isLiked: false
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop',
      title: t('content.festivalWishes'),
      likes: 189,
      isLiked: true
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop',
      title: t('content.anniversaryPost'),
      likes: 156,
      isLiked: false
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop',
      title: t('content.weddingInvitation'),
      likes: 312,
      isLiked: true
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop',
      title: t('content.graduationDay'),
      likes: 278,
      isLiked: false
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop',
      title: t('content.newYearWishes'),
      likes: 423,
      isLiked: true
    }
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={config.gradient}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={styles.headerMainTitle}>{config.title}</Text>
            <Text style={styles.headerSubtitle}>{config.subtitle}</Text>
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
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.contentGrid}>
          {sampleContent.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.contentCard}
              onPress={() => router.push(`/editor?templateId=${item.id}`)}
            >
              <Image 
                source={{ uri: item.image }} 
                style={styles.contentImage}
                resizeMode="cover"
              />
              <View style={styles.contentOverlay}>
                <TouchableOpacity 
                  style={styles.downloadButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    // Handle direct download
                  }}
                >
                  <Download size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
              <View style={styles.contentFooter}>
                <TouchableOpacity 
                  style={styles.likeButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    // Handle like
                  }}
                >
                  <Heart 
                    size={20} 
                    color={item.isLiked ? "#FF6B6B" : "#FFF"} 
                    fill={item.isLiked ? "#FF6B6B" : "transparent"}
                  />
                </TouchableOpacity>
                <Text style={styles.likeCount}>{item.likes}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Consistent Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.footerItem}
          onPress={() => router.push('/(tabs)')}
        >
          <Home size={24} color="#FFF" />
          <Text style={styles.footerLabel}>{t('content.home')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.footerItem}>
          <Heart size={24} color="#888" />
          <Text style={styles.footerLabel}>{t('content.liked')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.footerItem}>
          <Download size={24} color="#888" />
          <Text style={styles.footerLabel}>{t('home.add')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.footerItem}>
          <Download size={24} color="#888" />
          <Text style={styles.footerLabel}>{t('content.downloads')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.footerItem}>
          <Share size={24} color="#888" />
          <Text style={styles.footerLabel}>{t('content.share')}</Text>
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  headerMainTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
    textAlign: 'center',
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 90,
  },
  contentCard: {
    width: (width - 60) / 2,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  contentImage: {
    width: '100%',
    height: 200,
  },
  contentOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  downloadButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    gap: 8,
  },
  likeButton: {
    padding: 4,
  },
  likeCount: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(10px)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 70,
    paddingBottom: 10,
    paddingTop: 10,
  },
  footerItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  footerLabel: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
