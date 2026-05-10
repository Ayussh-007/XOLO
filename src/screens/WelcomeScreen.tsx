import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Pressable,
  Animated,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/types';
import { useThemeColors } from '../hooks/useThemeColors';
import { useThemeStore } from '../store/useThemeStore';
import { fonts, spacing, radius } from '../theme/theme';

const { width, height } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const SLIDES = [
  {
    id: '1',
    title: 'Capture the Moment',
    description: 'Snap a photo of your surroundings or choose one from your gallery to get started.',
    icon: 'camera-outline',
  },
  {
    id: '2',
    title: 'AI Sound Engine',
    description: 'Our advanced AI analyzes the visual elements and mood of your image.',
    icon: 'brain',
  },
  {
    id: '3',
    title: 'Hear the World',
    description: 'Listen to a unique soundtrack generated dynamically for your photo.',
    icon: 'waveform',
  },
];

export default function WelcomeScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const { theme, toggleTheme } = useThemeStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleGoogleLogin = () => {
    // Note: To implement real Google Login, you must configure 
    // expo-auth-session and Google Cloud credentials as detailed in the setup plan.
    alert('Google Login logic to be integrated with expo-auth-session.');
  };

  const renderItem = ({ item }: { item: typeof SLIDES[0] }) => {
    return (
      <View style={[styles.slide, { width }]}>
        <View style={[styles.iconContainer, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
          {item.icon === 'camera-outline' ? (
            <Ionicons name="camera-outline" size={60} color={colors.accentTeal} />
          ) : (
            <MaterialCommunityIcons name={item.icon as any} size={60} color={colors.accentTeal} />
          )}
        </View>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{item.title}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>{item.description}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Header: Theme Toggle */}
      <View style={styles.header}>
        <Text style={[styles.appName, { color: colors.textPrimary }]}>XOLO</Text>
        <Pressable
          onPress={toggleTheme}
          style={[styles.themeToggle, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}
        >
          <Ionicons
            name={theme === 'dark' ? 'moon' : 'sunny'}
            size={20}
            color={colors.textPrimary}
          />
        </Pressable>
      </View>

      {/* Carousel */}
      <View style={styles.carouselContainer}>
        <FlatList
          data={SLIDES}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
        />
      </View>

      {/* Pagination */}
      <View style={styles.pagination}>
        {SLIDES.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={i.toString()}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity,
                  backgroundColor: colors.accentTeal,
                },
              ]}
            />
          );
        })}
      </View>

      {/* Auth Buttons */}
      <View style={styles.bottomSection}>
        <Pressable
          style={[styles.primaryButton, { backgroundColor: colors.accentTeal }]}
          onPress={() => navigation.navigate('Signup')}
        >
          <Text style={styles.primaryButtonText}>Sign Up</Text>
        </Pressable>

        <Pressable
          style={[styles.secondaryButton, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={[styles.secondaryButtonText, { color: colors.textPrimary }]}>Log In</Text>
        </Pressable>

        {/* Google Login */}
        <Pressable
          style={[styles.googleButton, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}
          onPress={handleGoogleLogin}
        >
          <Ionicons name="logo-google" size={20} color={colors.textPrimary} style={{ marginRight: spacing.sm }} />
          <Text style={[styles.googleButtonText, { color: colors.textPrimary }]}>Continue with Google</Text>
        </Pressable>
        
        {/* Skip to Splash (Temporary dev option or if they want to use app without auth) */}
        <Pressable style={styles.skipButton} onPress={() => navigation.replace('Splash')}>
          <Text style={[styles.skipText, { color: colors.textMuted }]}>Continue as Guest</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
  },
  appName: {
    fontFamily: fonts.displayBold,
    fontSize: 24,
  },
  themeToggle: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 28,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    fontFamily: fonts.bodyRegular,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  bottomSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  primaryButton: {
    width: '100%',
    height: 56,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    color: '#080C14', // Always dark for teal background
  },
  secondaryButton: {
    width: '100%',
    height: 56,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
  },
  googleButton: {
    width: '100%',
    height: 56,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
  },
  googleButtonText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
  },
  skipButton: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  skipText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
  },
});
