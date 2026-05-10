import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { useThemeColors } from '../../hooks/useThemeColors';
import { fonts, spacing, radius } from '../../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    navigation.replace('Splash');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Welcome back</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Log in to continue your journey.</Text>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Email</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.borderSubtle, color: colors.textPrimary }]}
            placeholder="Enter your email"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Password</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.borderSubtle, color: colors.textPrimary }]}
            placeholder="Enter your password"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <Pressable style={[styles.loginButton, { backgroundColor: colors.accentTeal }]} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Log In</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.base },
  backButton: { width: 48, height: 48, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  content: { flex: 1, paddingHorizontal: spacing.lg, justifyContent: 'center' },
  title: { fontFamily: fonts.displayBold, fontSize: 32, marginBottom: spacing.xs },
  subtitle: { fontFamily: fonts.bodyRegular, fontSize: 16, marginBottom: spacing.xl },
  inputContainer: { marginBottom: spacing.lg },
  label: { fontFamily: fonts.bodyMedium, fontSize: 14, marginBottom: spacing.sm, marginLeft: spacing.sm },
  input: { fontFamily: fonts.bodyRegular, fontSize: 16, height: 56, borderRadius: radius.md, borderWidth: 1, paddingHorizontal: spacing.base },
  loginButton: { height: 56, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', marginTop: spacing.lg },
  loginButtonText: { fontFamily: fonts.bodyMedium, fontSize: 16, color: '#080C14' },
});
