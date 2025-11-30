import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ScrollView, View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useResponsive } from '@/hooks/useResponsive';

const getInitials = (value: string) => {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return 'VP';
  }
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('');
  return initials || 'VP';
};

const formatName = (first?: string | null, middle?: string | null, last?: string | null) => {
  return [first, middle, last].filter((piece) => piece && piece.trim()).join(' ');
};

const formatDate = (date?: string | null) => {
  if (!date) return '—';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString();
};

export default function ProfileViewPage() {
  const { profile, user } = useAuth();
  const { t } = useTranslation();
  const { insets, scaleSpacing } = useResponsive();
  const fullName =
    formatName(profile?.firstName, profile?.middleName, profile?.lastName) || user?.phone_number || 'User';
  const avatarInitials = getInitials(fullName);
  const avatarUri = profile?.avatarUrl || null;
  const roleLabel = profile?.role ? t(`whoYouAre.categories.${profile.role}.label`) : '—';

  console.log('Profile avatar URL:', avatarUri);
  console.log('Profile data:', profile);
  console.log('Has avatarUrl:', !!profile?.avatarUrl);

  // Get political party display value with translation
  const getPoliticalPartyDisplay = (partyKey?: string | null) => {
    if (!partyKey) return '—';
    const translated = t(`profileSetup.politicalParties.${partyKey}`);
    // i18n returns the key if translation not found, so check for that
    return translated !== `profileSetup.politicalParties.${partyKey}` ? translated : partyKey;
  };

  const details = [
    { label: 'Role', value: roleLabel },
    ...(profile?.role === 'politicalFigure' && profile?.politicalParty
      ? [{ label: 'Political Party', value: getPoliticalPartyDisplay(profile.politicalParty) }]
      : []),
    { label: 'Phone Number', value: user?.phone_number || '—' },
    { label: 'Email', value: profile?.email || '—' },
    { label: 'Date of Birth', value: formatDate(profile?.dateOfBirth) },
    { label: 'State', value: profile?.state || '—' },
    { label: 'District', value: profile?.district || '—' },
    { label: 'Taluka', value: profile?.taluka || '—' },
    { label: 'Instagram', value: profile?.instagramUrl || '—' },
    { label: 'Facebook', value: profile?.facebookUrl || '—' },
    { label: 'Twitter', value: profile?.twitterUrl || '—' },
  ];

  return (
    <LinearGradient colors={['#E75C6F', '#C73F5B']} style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(insets.top, scaleSpacing(60)),
            paddingBottom: Math.max(insets.bottom, scaleSpacing(40)),
          },
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.85}>
            <Text style={styles.backLabel}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.avatarWrapper}>
            {avatarUri ? (
              <Image 
                source={{ uri: avatarUri }} 
                style={styles.avatarImage}
                resizeMode="cover"
                onError={(error) => {
                  console.error('Error loading avatar image:', error);
                  console.error('Failed URI:', avatarUri);
                }}
                onLoad={() => {
                  console.log('Avatar image loaded successfully:', avatarUri);
                }}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{avatarInitials}</Text>
              </View>
            )}
          </View>
          <Text style={styles.name}>{fullName}</Text>
          {profile?.role ? <Text style={styles.role}>{roleLabel}</Text> : null}
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={() => router.push({ pathname: '/profile-setup', params: { fromProfile: 'true' } })} 
            activeOpacity={0.85}
          >
            <Text style={styles.editButtonLabel}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.detailsCard}>
          {details.map((item, index) => (
            <View
              key={`${item.label}-${index}`}
              style={[styles.detailRow, index === details.length - 1 && styles.detailRowLast]}
            >
              <Text style={styles.detailLabel}>{item.label}</Text>
              <Text style={styles.detailValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    gap: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backLabel: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 22,
    paddingVertical: 24,
    paddingHorizontal: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  avatarWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  role: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  editButton: {
    marginTop: 16,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#FDD835',
  },
  editButtonLabel: {
    color: '#3C2900',
    fontWeight: '700',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  detailRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E3E3E3',
    paddingBottom: 12,
    marginBottom: 12,
  },
  detailRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
    marginBottom: 0,
  },
  detailLabel: {
    fontSize: 13,
    color: '#8A8D91',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E3034',
    marginTop: 4,
  },
});

