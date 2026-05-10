import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { useThemeColors } from '../../hooks/useThemeColors';
import { fonts, spacing, radius } from '../../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

export default function SignupScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = () => {
    navigation.replace('Splash');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={[styles.backButton, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Start your visual music journey.</Text>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Full Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.borderSubtle, color: colors.textPrimary }]}
              placeholder="Enter your name"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
            />
          </View>

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
              placeholder="Create a password"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <Pressable style={[styles.signupButton, { backgroundColor: colors.accentTeal }]} onPress={handleSignup}>
            <Text style={styles.signupButtonText}>Create Account</Text>
          </Pressable>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>Already have an account? </Text>
            <Pressable onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.footerLink, { color: colors.accentTeal }]}>Log In</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  header: { paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.base },
  backButton: { width: 48, height: 48, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  title: { fontFamily: fonts.displayBold, fontSize: 32, marginBottom: spacing.xs },
  subtitle: { fontFamily: fonts.bodyRegular, fontSize: 16, marginBottom: spacing.xl },
  inputContainer: { marginBottom: spacing.lg },
  label: { fontFamily: fonts.bodyMedium, fontSize: 14, marginBottom: spacing.sm, marginLeft: spacing.sm },
  input: { fontFamily: fonts.bodyRegular, fontSize: 16, height: 56, borderRadius: radius.md, borderWidth: 1, paddingHorizontal: spacing.base },
  signupButton: { height: 56, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', marginTop: spacing.lg },
  signupButtonText: { fontFamily: fonts.bodyMedium, fontSize: 16, color: '#080C14' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  footerText: { fontFamily: fonts.bodyRegular, fontSize: 14 },
  footerLink: { fontFamily: fonts.bodyMedium, fontSize: 14 },
});
