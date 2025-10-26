import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

export default function AddScreen() {
  const { t } = useTranslation();
  
  return (
    <LinearGradient
      colors={['#8B2E5A', '#A84369']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{t('add.createContent')}</Text>
        <Text style={styles.subtitle}>{t('add.addYourOwn')}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.8,
    textAlign: 'center',
  },
});
