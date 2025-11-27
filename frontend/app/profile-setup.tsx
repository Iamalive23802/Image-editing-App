import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronDown } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import type { UpdateProfileInput } from '@/contexts/AuthContext';
import { transliterateText } from '@/lib/transliteration';

type RoleOption = 'publicFigure' | 'politicalFigure' | 'individual' | 'business' | 'brand';
type ModalType = 'state' | 'district' | 'taluka' | 'dobDay' | 'dobMonth' | 'dobYear' | null;

type LocationTaluka = 'haveli' | 'mulshi' | 'thane' | 'kalyan' | 'bengaluruUrban' | 'yelahanka';
type LocationDistrict = 'pune' | 'thaneDistrict' | 'bengaluruUrbanDistrict';
type LocationState = 'maharashtra' | 'karnataka';

interface LocationOption {
  id: LocationState;
  districts: {
    id: LocationDistrict;
    talukas: LocationTaluka[];
  }[];
}

interface ProfileFormState {
  fullName: string;
  phoneNumber: string;
  email: string;
  avatar: string | null;
  state: LocationState | '';
  district: LocationDistrict | '';
  taluka: LocationTaluka | '';
  role: RoleOption | '';
  dob: string;
}

const ROLE_OPTIONS: RoleOption[] = ['publicFigure', 'politicalFigure', 'individual', 'business', 'brand'];

const LOCATION_DATA: LocationOption[] = [
  {
    id: 'maharashtra',
    districts: [
      {
        id: 'pune',
        talukas: ['haveli', 'mulshi'],
      },
      {
        id: 'thaneDistrict',
        talukas: ['thane', 'kalyan'],
      },
    ],
  },
  {
    id: 'karnataka',
    districts: [
      {
        id: 'bengaluruUrbanDistrict',
        talukas: ['bengaluruUrban', 'yelahanka'],
      },
    ],
  },
];

const isRoleOption = (value: unknown): value is RoleOption =>
  typeof value === 'string' && ROLE_OPTIONS.includes(value as RoleOption);

const formatName = (first: string | null, middle: string | null, last: string | null) => {
  return [first, middle, last].filter((part): part is string => Boolean(part && part.trim()))
    .join(' ')
    .trim();
};

const getInitials = (value: string) => {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return 'VP';
  }
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('');
  return initials || 'VP';
};

const toNullable = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const composeDob = (parts: { day: string; month: string; year: string }) => {
  const { day, month, year } = parts;
  if (!day || !month || !year) {
    return '';
  }
  return `${year}-${month}-${day}`;
};

const extractDobParts = (value: string | null | undefined) => {
  if (!value) {
    return { day: '', month: '', year: '' };
  }

  // Convert to string if it's a Date object
  let dateString = value;
  if (value instanceof Date) {
    // If it's a Date object, format it as YYYY-MM-DD in local timezone
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return { day, month, year: String(year) };
  }

  // Handle ISO date strings (with or without time)
  // Examples: "2015-08-06", "2015-08-06T00:00:00.000Z", "2015-08-06T18:30:00.000Z"
  // IMPORTANT: Use only the date part, ignore time to avoid timezone shifts
  const datePart = String(dateString).split('T')[0].split(' ')[0].trim();
  const parts = datePart.split('-');
  
  if (parts.length !== 3) {
    console.warn('Invalid date format:', value, 'extracted as:', datePart);
    return { day: '', month: '', year: '' };
  }

  const [year = '', month = '', day = ''] = parts;

  // Validate and pad
  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);

  if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) {
    console.warn('Invalid date numbers:', { day, month, year });
    return { day: '', month: '', year: '' };
  }

  return {
    day: String(dayNum).padStart(2, '0'),
    month: String(monthNum).padStart(2, '0'),
    year: String(yearNum),
  };
};

const normalizeDobString = (value: string | null | undefined) => {
  const parts = extractDobParts(value);
  return composeDob(parts);
};

export default function ProfileSetupScreen() {
  const { t } = useTranslation();
  const { user, profile: savedProfile, updateProfile: saveProfile, language } = useAuth();
  const params = useLocalSearchParams<{ role?: string; fromProfile?: string }>();

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState<ProfileFormState>({
    fullName: '',
    phoneNumber: user?.phone_number ?? '',
    email: '',
    state: '' as LocationState | '',
    district: '' as LocationDistrict | '',
    taluka: '' as LocationTaluka | '',
    role: '' as RoleOption | '',
    avatar: null,
    dob: '',
  });
  const handleAvatarSelect = async () => {
    try {
      // Request permission to access media library
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          t('profileSetup.permissions.title') || 'Permission Required',
          t('profileSetup.permissions.message') || 'We need permission to access your photos to set a profile picture.',
        );
        return;
      }

      // Launch image picker with base64 option to persist the image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true, // Get base64 data to persist the image
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        let imageUri = asset.uri;
        
        // Convert to base64 data URI for persistence across sessions
        if (asset.base64) {
          const mimeType = asset.type || 'image/jpeg';
          imageUri = `data:${mimeType};base64,${asset.base64}`;
          console.log('Converted image to base64 data URI');
        } else {
          console.warn('Base64 data not available, using URI (may not persist)');
        }
        
        console.log('Selected avatar URI:', imageUri.substring(0, 50) + '...');
        updateProfileField('avatar', imageUri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(
        t('profileSetup.imageError.title') || 'Error',
        t('profileSetup.imageError.message') || 'Failed to select image. Please try again.',
      );
    }
  };
  const [dobParts, setDobParts] = useState<{ day: string; month: string; year: string }>({
    day: '',
    month: '',
    year: '',
  });
  const transliterationEnabled = language === 'marathi' || language === 'hindi';
  const activeTransliterationLanguage = transliterationEnabled
    ? (language as 'marathi' | 'hindi')
    : null;
  const [romanFullName, setRomanFullName] = useState('');
  const [fullNameSuggestion, setFullNameSuggestion] = useState<string | null>(null);
  const [fullNameTranslationApplied, setFullNameTranslationApplied] = useState(false);
  const pendingFullNameRequest = useRef<number | null>(null);

  useEffect(() => {
    if (!savedProfile) {
      return;
    }

    const fullName = formatName(savedProfile.firstName, savedProfile.middleName, savedProfile.lastName);

    // Extract and normalize DOB
    const dobParts = extractDobParts(savedProfile.dateOfBirth);
    const normalizedDob = savedProfile.dateOfBirth ? normalizeDobString(savedProfile.dateOfBirth) : '';
    
    console.log('Loading profile DOB:', {
      original: savedProfile.dateOfBirth,
      originalType: typeof savedProfile.dateOfBirth,
      normalized: normalizedDob,
      parts: dobParts,
      recomposed: composeDob(dobParts)
    });
    
    setProfile((prev) => ({
      ...prev,
      fullName,
      email: savedProfile.email ?? '',
      state: (savedProfile.state ?? '') as LocationState | '',
      district: (savedProfile.district ?? '') as LocationDistrict | '',
      taluka: (savedProfile.taluka ?? '') as LocationTaluka | '',
      role: isRoleOption(savedProfile.role) ? (savedProfile.role as RoleOption) : prev.role,
      dob: normalizedDob,
      avatar: savedProfile.avatarUrl ?? null,
    }));
    setDobParts(dobParts);
    setRomanFullName(fullName);
    setFullNameTranslationApplied(false);
    setFullNameSuggestion(null);
    pendingFullNameRequest.current = null;
  }, [savedProfile]);

  useEffect(() => {
    if (params.role && isRoleOption(params.role)) {
      setProfile((prev) => ({ ...prev, role: params.role as RoleOption }));
    }
  }, [params.role]);

  useEffect(() => {
    if (user?.phone_number) {
      setProfile((prev) => ({ ...prev, phoneNumber: user.phone_number }));
    }
  }, [user?.phone_number]);

  const stateOptions = useMemo(
    () =>
      LOCATION_DATA.map((state) => ({
        id: state.id,
        label: t(`profileSetup.states.${state.id}.name`),
      })),
    [t],
  );

  const districtOptions = useMemo(() => {
    const selectedState = LOCATION_DATA.find((item) => item.id === profile.state);
    if (!selectedState) {
      return [];
    }

    return selectedState.districts.map((district) => ({
      id: district.id,
      label: t(`profileSetup.states.${profile.state}.districts.${district.id}.name`),
    }));
  }, [profile.state, t]);

  const talukaOptions = useMemo(() => {
    const selectedState = LOCATION_DATA.find((item) => item.id === profile.state);
    const selectedDistrict = selectedState?.districts.find((district) => district.id === profile.district);

    if (!selectedDistrict) {
      return [];
    }

    return selectedDistrict.talukas.map((taluka) => ({
      id: taluka,
      label: t(
        `profileSetup.states.${profile.state}.districts.${profile.district}.talukas.${taluka}`,
      ),
    }));
  }, [profile.state, profile.district, t]);

  const placeholders = useMemo(
    () => ({
      fullName: t('profileSetup.fields.fullNamePlaceholder'),
      mobile: t('profileSetup.fields.mobilePlaceholder'),
      email: t('profileSetup.fields.emailPlaceholder'),
      state: t('profileSetup.fields.statePlaceholder'),
      district: t('profileSetup.fields.districtPlaceholder'),
      taluka: t('profileSetup.fields.talukaPlaceholder'),
      dob: t('profileSetup.fields.dobPlaceholder'),
      day: t('profileSetup.fields.dayPlaceholder'),
      month: t('profileSetup.fields.monthPlaceholder'),
      year: t('profileSetup.fields.yearPlaceholder'),
    }),
    [t],
  );

  const dayOptions = useMemo(
    () =>
      Array.from({ length: 31 }, (_, index) => {
        const value = String(index + 1).padStart(2, '0');
        return { id: value, label: value };
      }),
    []
  );

  const monthOptions = useMemo(() => {
    const months = [
      '01',
      '02',
      '03',
      '04',
      '05',
      '06',
      '07',
      '08',
      '09',
      '10',
      '11',
      '12',
    ];
    return months.map((month) => ({
      id: month,
      label: t(`profileSetup.months.${month}`),
    }));
  }, [t]);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const earliestYear = currentYear - 120;
    const years: { id: string; label: string }[] = [];
    for (let year = currentYear; year >= earliestYear; year -= 1) {
      const value = String(year);
      years.push({ id: value, label: value });
    }
    return years;
  }, []);

  const applyDobPart = (part: 'day' | 'month' | 'year', value: string) => {
    setDobParts((prev) => {
      const updated = { ...prev, [part]: value };
      const iso = composeDob(updated);
      setProfile((prevProfile) => ({
        ...prevProfile,
        dob: iso,
      }));
      return updated;
    });
  };

  const updateProfileField = useCallback(
    <Key extends keyof ProfileFormState>(field: Key, value: ProfileFormState[Key]) => {
      setProfile((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleFullNameChange = useCallback(
    (text: string) => {
      setRomanFullName(text);
      setFullNameTranslationApplied(false);
      updateProfileField('fullName', text);

      if (!transliterationEnabled || !activeTransliterationLanguage) {
        setFullNameSuggestion(null);
        return;
      }

      const trimmed = text.trim();
      if (!trimmed) {
        setFullNameSuggestion(null);
        return;
      }

      const requestId = Date.now();
      pendingFullNameRequest.current = requestId;

      transliterateText(trimmed, activeTransliterationLanguage)
        .then((result) => {
          if (pendingFullNameRequest.current !== requestId) {
            return;
          }
          if (result && result !== trimmed) {
            setFullNameSuggestion(result);
          } else {
            setFullNameSuggestion(null);
          }
        })
        .catch(() => {
          if (pendingFullNameRequest.current === requestId) {
            setFullNameSuggestion(null);
          }
        });
    },
    [transliterationEnabled, activeTransliterationLanguage, updateProfileField],
  );

  const handleApplyFullNameSuggestion = useCallback(() => {
    if (!fullNameSuggestion) {
        return;
      }
    updateProfileField('fullName', fullNameSuggestion);
    setRomanFullName(fullNameSuggestion);
    setFullNameTranslationApplied(true);
    setFullNameSuggestion(null);
  }, [fullNameSuggestion, updateProfileField]);

  useEffect(() => {
    setRomanFullName(profile.fullName);
  }, [profile.fullName]);

  useEffect(() => {
    if (!transliterationEnabled) {
      setFullNameSuggestion(null);
      setFullNameTranslationApplied(false);
      pendingFullNameRequest.current = null;
    }
  }, [transliterationEnabled]);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const baseFullName =
        fullNameTranslationApplied || romanFullName.trim().length === 0
          ? profile.fullName
          : romanFullName;
      const nameParts = baseFullName.trim().split(/\s+/).filter(Boolean);
      const firstName = nameParts[0] ?? '';
      // If only one name part, use it as both first and last name
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : (nameParts[0] ?? '');
      const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';

      // Reconstruct DOB from parts to ensure correct format (YYYY-MM-DD)
      const dobToSave = dobParts.day && dobParts.month && dobParts.year 
        ? composeDob(dobParts) 
        : profile.dob;

      const payload: UpdateProfileInput = {
        firstName: toNullable(firstName || profile.fullName),
        middleName: toNullable(middleName),
        lastName: toNullable(lastName || firstName || profile.fullName),
        dateOfBirth: toNullable(dobToSave),
        email: toNullable(profile.email),
        state: profile.state ? profile.state : null,
        district: profile.district ? profile.district : null,
        taluka: profile.taluka ? profile.taluka : null,
        role: profile.role ? profile.role : null,
        avatarUrl: profile.avatar ?? null,
      };

      console.log('Saving profile with payload:', payload);
      console.log('DOB details:', { 
        dobFromState: profile.dob, 
        dobParts, 
        dobToSave,
        composed: composeDob(dobParts)
      });
      const savedProfile = await saveProfile(payload);
      console.log('Profile saved successfully:', savedProfile);
      
      // Verify profile is complete before navigating
      if (savedProfile) {
        const missingFields: string[] = [];
        if (!savedProfile.firstName) missingFields.push('First Name');
        if (!savedProfile.lastName) missingFields.push('Last Name');
        if (!savedProfile.dateOfBirth) missingFields.push('Date of Birth');
        if (!savedProfile.email) missingFields.push('Email');
        if (!savedProfile.state) missingFields.push('State');
        if (!savedProfile.district) missingFields.push('District');
        if (!savedProfile.taluka) missingFields.push('Taluka');
        if (!savedProfile.role) missingFields.push('Role');
        
        const isComplete = missingFields.length === 0;
        
        console.log('Profile complete status:', isComplete);
        console.log('Saved profile data:', {
          firstName: savedProfile.firstName,
          lastName: savedProfile.lastName,
          dateOfBirth: savedProfile.dateOfBirth,
          email: savedProfile.email,
          state: savedProfile.state,
          district: savedProfile.district,
          taluka: savedProfile.taluka,
          role: savedProfile.role,
        });
        
        // If coming from profile page, always navigate to home after saving
        // Otherwise, only navigate if profile is complete (initial setup flow)
        const isEditingFromProfile = params.fromProfile === 'true';
        
        if (isComplete || isEditingFromProfile) {
          // Small delay to ensure state updates propagate
          await new Promise(resolve => setTimeout(resolve, 150));
          
          // Always navigate to home page after saving (whether from profile edit or initial setup)
          router.replace('/(tabs)');
        } else {
          console.warn('Profile is not complete, missing fields:', missingFields);
          const missingFieldsText = missingFields.join(', ');
          Alert.alert(
            t('profileSetup.incompleteTitle') || 'Incomplete Profile',
            t('profileSetup.incompleteMessage', { missingFields: missingFieldsText }) || 
            `Please fill in all required fields: ${missingFieldsText}`
          );
        }
      } else {
        throw new Error('Profile save returned null');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      Alert.alert(t('profileSetup.saveErrorTitle'), t('profileSetup.saveErrorMessage'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => setActiveModal(null);

  const renderSelectionModal = ({
    modalType,
    options,
  }: {
    modalType: Exclude<ModalType, null>;
    options: { id: string; label: string }[];
  }) => (
    <Modal
      visible={activeModal === modalType}
      animationType="slide"
      transparent
      onRequestClose={closeModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{t(`profileSetup.modals.${modalType}Title`)}</Text>
          <ScrollView keyboardShouldPersistTaps="handled">
            {options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.modalOption}
                onPress={() => {
                  if (modalType === 'state') {
                    updateProfileField('state', option.id as LocationState);
                    updateProfileField('district', '' as LocationDistrict | '');
                    updateProfileField('taluka', '' as LocationTaluka | '');
                  }
                  if (modalType === 'district') {
                    updateProfileField('district', option.id as LocationDistrict);
                    updateProfileField('taluka', '' as LocationTaluka | '');
                  }
                  if (modalType === 'taluka') {
                    updateProfileField('taluka', option.id as LocationTaluka);
                  }
                  if (modalType === 'dobDay') {
                    applyDobPart('day', option.id);
                  }
                  if (modalType === 'dobMonth') {
                    applyDobPart('month', option.id);
                  }
                  if (modalType === 'dobYear') {
                    applyDobPart('year', option.id);
                  }
                  closeModal();
                }}
              >
                <Text style={styles.modalOptionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.modalClose} onPress={closeModal}>
            <Text style={styles.modalCloseText}>{t('profileSetup.modals.close')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const displayName = profile.fullName || t('profileSetup.header.defaultName');
  const roleLabel = profile.role
    ? t(`whoYouAre.categories.${profile.role}.label`)
    : t('profileSetup.header.rolePlaceholder');
  const initials = getInitials(displayName);

  return (
    <LinearGradient colors={['#E75C6F', '#C73F5B']} style={styles.background}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={false}
          bounces={false}
        >
        <View style={styles.headerCard}>
          <TouchableOpacity style={styles.avatarButton} onPress={handleAvatarSelect} activeOpacity={0.85}>
            <View style={styles.avatar}>
              {profile.avatar ? (
                <Image 
                  source={{ uri: profile.avatar }} 
                  style={styles.avatarImage}
                  resizeMode="cover"
                  onError={(error) => {
                    console.error('Error loading avatar in profile-setup:', error);
                    console.error('Failed URI:', profile.avatar);
                  }}
                  onLoad={() => {
                    console.log('Avatar loaded successfully in profile-setup:', profile.avatar);
                  }}
                />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
            </View>
            <LinearGradient colors={['#FDD835', '#F6B845']} style={styles.avatarBadge}>
              <Text style={styles.avatarBadgeLabel}>{profile.avatar ? '✎' : '+'}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.headerName}>{displayName}</Text>
          <Text style={styles.headerRole}>{roleLabel}</Text>
          <View style={styles.headerDivider} />
            </View>

        <View style={styles.form}>
          <View style={styles.inputWrapper}>
              <TextInput
              style={styles.textInput}
              value={profile.fullName}
              onChangeText={handleFullNameChange}
              placeholder={placeholders.fullName}
              placeholderTextColor="#8C8F92"
            />
          </View>

          {transliterationEnabled && fullNameSuggestion && !fullNameTranslationApplied && (
            <TouchableOpacity
              style={styles.translationSuggestion}
              onPress={handleApplyFullNameSuggestion}
              activeOpacity={0.85}
            >
              <Text style={styles.translationSuggestionLabel}>
                {t('profileSetup.translationSuggestionLabel')}
              </Text>
              <Text style={styles.translationSuggestionValue}>{fullNameSuggestion}</Text>
            </TouchableOpacity>
          )}

          {transliterationEnabled && fullNameTranslationApplied && (
            <Text style={styles.translationApplied}>{t('profileSetup.translationApplied')}</Text>
          )}

          <View style={[styles.inputWrapper, styles.inputWrapperDisabled]}>
          <TextInput
              style={styles.textInput}
            value={profile.phoneNumber}
            editable={false}
              placeholder={placeholders.mobile}
              placeholderTextColor="#8C8F92"
          />
          </View>

          <View style={styles.inputWrapper}>
          <TextInput
              style={styles.textInput}
            value={profile.email}
            onChangeText={(text) => updateProfileField('email', text)}
              placeholder={placeholders.email}
              placeholderTextColor="#8C8F92"
            keyboardType="email-address"
            autoCapitalize="none"
            />
          </View>

            <TouchableOpacity
            style={styles.dropdownWrapper}
            onPress={() => setActiveModal('state')}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.dropdownText,
                !profile.state && styles.dropdownPlaceholder,
              ]}
            >
              {profile.state
                ? t(`profileSetup.states.${profile.state}.name`)
                : placeholders.state}
            </Text>
            <ChevronDown size={20} color="#5A4B4B" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.dropdownWrapper,
              !profile.state && styles.dropdownDisabled,
            ]}
            onPress={() => (profile.state ? setActiveModal('district') : undefined)}
            activeOpacity={profile.state ? 0.85 : 1}
            disabled={!profile.state}
          >
            <Text
              style={[
                styles.dropdownText,
                (!profile.state || !profile.district) && styles.dropdownPlaceholder,
              ]}
            >
              {profile.district
                ? t(
                    `profileSetup.states.${profile.state}.districts.${profile.district}.name`,
                  )
                : placeholders.district}
            </Text>
            <ChevronDown size={20} color="#5A4B4B" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.dropdownWrapper,
              !profile.district && styles.dropdownDisabled,
            ]}
            onPress={() => (profile.district ? setActiveModal('taluka') : undefined)}
            activeOpacity={profile.district ? 0.85 : 1}
            disabled={!profile.district}
          >
            <Text
              style={[
                styles.dropdownText,
                (!profile.district || !profile.taluka) && styles.dropdownPlaceholder,
              ]}
            >
              {profile.taluka
                ? t(
                    `profileSetup.states.${profile.state}.districts.${profile.district}.talukas.${profile.taluka}`,
                  )
                : placeholders.taluka}
            </Text>
            <ChevronDown size={20} color="#5A4B4B" />
          </TouchableOpacity>

          <Text style={styles.label}>{placeholders.dob}</Text>
          <View style={styles.dobRow}>
            <TouchableOpacity
              style={[styles.dropdownWrapper, styles.dobField]}
              onPress={() => setActiveModal('dobDay')}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !dobParts.day && styles.dropdownPlaceholder,
                ]}
              >
                {dobParts.day || placeholders.day}
          </Text>
              <ChevronDown size={20} color="#5A4B4B" />
            </TouchableOpacity>

          <TouchableOpacity
              style={[styles.dropdownWrapper, styles.dobField]}
              onPress={() => setActiveModal('dobMonth')}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !dobParts.month && styles.dropdownPlaceholder,
                ]}
              >
                {dobParts.month ? t(`profileSetup.months.${dobParts.month}`) : placeholders.month}
            </Text>
              <ChevronDown size={20} color="#5A4B4B" />
          </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dropdownWrapper, styles.dobField]}
              onPress={() => setActiveModal('dobYear')}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !dobParts.year && styles.dropdownPlaceholder,
                ]}
              >
                {dobParts.year || placeholders.year}
          </Text>
              <ChevronDown size={20} color="#5A4B4B" />
            </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
            activeOpacity={0.85}
          disabled={isSubmitting}
        >
            <Text style={styles.submitButtonText}>{t('profileSetup.buttons.continue')}</Text>
        </TouchableOpacity>
        </View>

        <Text style={styles.footerNote}>{t('profileSetup.footerNotice')}</Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {renderSelectionModal({
        modalType: 'state',
        options: stateOptions,
      })}

      {renderSelectionModal({
        modalType: 'district',
        options: districtOptions,
      })}

      {renderSelectionModal({
        modalType: 'taluka',
        options: talukaOptions,
      })}

      {renderSelectionModal({
        modalType: 'dobDay',
        options: dayOptions,
      })}

      {renderSelectionModal({
        modalType: 'dobMonth',
        options: monthOptions,
      })}

      {renderSelectionModal({
        modalType: 'dobYear',
        options: yearOptions,
      })}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  headerCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarButton: {
    position: 'relative',
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  avatarBadgeLabel: {
    color: '#3C2900',
    fontSize: 18,
    fontWeight: '700',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  headerName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerRole: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 6,
    textAlign: 'center',
  },
  headerDivider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    marginTop: 16,
  },
  form: {
    gap: 12,
  },
  inputWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#D74F6A',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  inputWrapperDisabled: {
    opacity: 0.8,
  },
  textInput: {
    color: '#2E3034',
    fontSize: 16,
  },
  translationSuggestion: {
    marginTop: -6,
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDD835',
    backgroundColor: 'rgba(253, 216, 53, 0.15)',
    alignSelf: 'flex-start',
  },
  translationSuggestionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FDD835',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  translationSuggestionValue: {
    fontSize: 16,
    color: '#2E3034',
    marginTop: 4,
  },
  translationApplied: {
    fontSize: 12,
    color: '#2E7D32',
    marginTop: -6,
    marginBottom: 12,
  },
  dropdownWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#D74F6A',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  dropdownDisabled: {
    opacity: 0.6,
  },
  dropdownText: {
    fontSize: 16,
    color: '#2E3034',
  },
  dropdownPlaceholder: {
    color: '#8C8F92',
  },
  dobRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    marginBottom: 4,
  },
  dobField: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#FDD835',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#D74F6A',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3C2900',
  },
  footerNote: {
    marginTop: 16,
    fontSize: 12,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.75)',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    maxHeight: '70%',
    padding: 22,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E3034',
    marginBottom: 18,
  },
  modalOption: {
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E2E2',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#2E3034',
  },
  modalClose: {
    marginTop: 16,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E75C6F',
  },
});
