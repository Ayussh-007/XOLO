import React, { useRef, useState } from 'react';
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
import { RootStackParamList } from '../../navigation/types';
import theme, { darkColors, lightColors } from '../../theme/theme';
import { useThemeStore } from '../../store/useThemeStore';

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const SLIDES = [
  { id: '1', title: 'Capture the Moment', description: 'Snap a photo or choose from gallery.', icon: 'camera-outline' },
  { id: '2', title: 'AI Sound Engine', description: 'CLIP analyzes the mood of your image.', icon: 'pulse' },
  { id: '3', title: 'Hear the World', description: 'Perform unique tracks on a smart instrument.', icon: 'waveform' },
];

export default function WelcomeScreen({ navigation }: Props) {
  const { theme: themeMode, toggleTheme } = useThemeStore();
  const activeColors = themeMode === 'dark' ? darkColors : lightColors;
  const scrollX = useRef(new Animated.Value(0)).current;

  const renderItem = ({ item }: { item: typeof SLIDES[0] }) => (
    <View style={[styles.slide, { width }]}>
      <View style={[styles.iconContainer, { backgroundColor: activeColors.surfaceElevated, borderColor: activeColors.borderSubtle }]}>
        {item.icon === 'camera-outline' ? (
          <Ionicons name="camera-outline" size={60} color={activeColors.accentTeal} />
        ) : (
          <MaterialCommunityIcons name={item.icon as any} size={60} color={activeColors.accentTeal} />
        )}
      </View>
      <Text style={[styles.title, { color: activeColors.textPrimary }]}>{item.title}</Text>
      <Text style={[styles.description, { color: activeColors.textSecondary }]}>{item.description}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: activeColors.background }]}>
      <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <Text style={[styles.appName, { color: activeColors.textPrimary }]}>XOLO</Text>
        <Pressable onPress={toggleTheme} style={[styles.themeToggle, { backgroundColor: activeColors.surfaceElevated, borderColor: activeColors.borderSubtle }]}>
          <Ionicons name={themeMode === 'dark' ? 'moon' : 'sunny'} size={20} color={activeColors.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.carouselContainer}>
        <FlatList
          data={SLIDES}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
          keyExtractor={(item) => item.id}
          removeClippedSubviews={true} // Performance optimization
          initialNumToRender={1}
          maxToRenderPerBatch={1}
        />
      </View>

      <View style={styles.pagination}>
        {SLIDES.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const dotWidth = scrollX.interpolate({ inputRange, outputRange: [8, 24, 8], extrapolate: 'clamp' });
          const opacity = scrollX.interpolate({ inputRange, outputRange: [0.3, 1, 0.3], extrapolate: 'clamp' });
          return <Animated.View key={i.toString()} style={[styles.dot, { width: dotWidth, opacity, backgroundColor: activeColors.accentTeal }]} />;
        })}
      </View>

      <View style={styles.bottomSection}>
        <Pressable style={[styles.primaryButton, { backgroundColor: activeColors.accentTeal }]} onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.primaryButtonText}>Sign Up</Text>
        </Pressable>
        <Pressable style={[styles.secondaryButton, { backgroundColor: activeColors.surfaceElevated, borderColor: activeColors.borderSubtle }]} onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.secondaryButtonText, { color: activeColors.textPrimary }]}>Log In</Text>
        </Pressable>
        <Pressable style={styles.skipButton} onPress={() => navigation.replace('Home')}>
          <Text style={[styles.skipText, { color: activeColors.textMuted }]}>Continue as Guest</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 60 },
  appName: { fontFamily: theme.fonts?.displayBold || 'System', fontSize: 24 },
  themeToggle: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  carouselContainer: { flex: 1, justifyContent: 'center' },
  slide: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  iconContainer: { width: 140, height: 140, borderRadius: 70, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  title: { fontFamily: theme.fonts?.displayBold || 'System', fontSize: 28, textAlign: 'center', marginBottom: 8 },
  description: { fontFamily: theme.fonts?.bodyRegular || 'System', fontSize: 16, textAlign: 'center', lineHeight: 24 },
  pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 48 },
  dot: { height: 8, borderRadius: 4, marginHorizontal: 4 },
  bottomSection: { paddingHorizontal: 24, paddingBottom: 48, gap: 16 },
  primaryButton: { width: '100%', height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { fontFamily: theme.fonts?.bodyMedium || 'System', fontSize: 16, color: '#080C14' },
  secondaryButton: { width: '100%', height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  secondaryButtonText: { fontFamily: theme.fonts?.bodyMedium || 'System', fontSize: 16 },
  skipButton: { alignItems: 'center', marginTop: 8 },
  skipText: { fontFamily: theme.fonts?.bodyRegular || 'System', fontSize: 14 },
});
