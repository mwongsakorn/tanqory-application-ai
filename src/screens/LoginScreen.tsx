import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation';
import { colors, spacing } from '@/theme';

const personaOptions = ['Founder', 'Marketer', 'Developer'];

export function LoginScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Login'>) {
  const [userName, setUserName] = useState('Tanqory Team');
  const [email, setEmail] = useState('team@tanqory.app');
  const [persona, setPersona] = useState('Founder');
  const [error, setError] = useState<string | null>(null);

  const isFormValid = useMemo(() => {
    const trimmedName = userName.trim();
    const emailPattern = /.+@.+\..+/;
    return Boolean(trimmedName) && emailPattern.test(email.trim()) && Boolean(persona);
  }, [email, persona, userName]);

  const handleContinue = () => {
    const trimmedName = userName.trim();
    const trimmedEmail = email.trim();
    const emailPattern = /.+@.+\..+/;

    if (!trimmedName) {
      setError('กรุณาระบุชื่อที่ใช้ในการสนทนา');
      return;
    }

    if (!emailPattern.test(trimmedEmail)) {
      setError('อีเมลไม่ถูกต้อง ลองตรวจสอบอีกครั้ง');
      return;
    }

    setError(null);
    const displayName = trimmedName || 'Guest';
    navigation.replace('Chat', { userName: displayName, persona, email: trimmedEmail });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoMark}>
            <Text style={styles.logoText}>TQ</Text>
          </View>
          <Text style={styles.brandTitle}>Tanqory AI</Text>
          <Text style={styles.brandSubtitle}>ChatGPT-style Assistant สำหรับ Shopify Builders</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.heading}>เข้าสู่ระบบ</Text>
          <Text style={styles.subheading}>เริ่มสนทนากับ Tanqory AI เพื่อจำลองการช่วยเหลือร้านค้า</Text>

          <Text style={styles.label}>ชื่อที่ใช้ในการสนทนา</Text>
          <TextInput
            value={userName}
            onChangeText={(text) => {
              setUserName(text);
              if (error) {
                setError(null);
              }
            }}
            placeholder="Your name"
            placeholderTextColor="#A0A3A7"
            style={styles.input}
          />

          <Text style={styles.label}>อีเมล</Text>
          <TextInput
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (error) {
                setError(null);
              }
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="you@example.com"
            placeholderTextColor="#A0A3A7"
            style={styles.input}
          />

          <Text style={styles.label}>บทบาท</Text>
          <View style={styles.personaRow}>
            {personaOptions.map((option) => {
              const isActive = persona === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => {
                    setPersona(option);
                    if (error) {
                      setError(null);
                    }
                  }}
                  style={({ pressed }) => [
                    styles.personaChip,
                    isActive && styles.personaChipActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.personaText, isActive && styles.personaTextActive]}>{option}</Text>
                </Pressable>
              );
            })}
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              !isFormValid && styles.submitButtonDisabled,
              pressed && isFormValid && styles.pressed,
            ]}
            onPress={handleContinue}
            disabled={!isFormValid}
          >
            <Text style={[styles.submitLabel, !isFormValid && styles.submitLabelDisabled]}>เริ่มแชทกับ AI</Text>
          </Pressable>

          <Text style={styles.termsText}>
            ระบบนี้เป็นเดโม ไม่ได้เก็บข้อมูลจริง การกด "เริ่มแชท" ถือว่ายอมรับการใช้งานทดลอง
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoMark: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.secondary,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  brandSubtitle: {
    color: '#B0B3B8',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: '#1F2125',
    borderRadius: 28,
    padding: spacing.xxl,
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 20 },
    elevation: 12,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subheading: {
    color: '#A0A3A7',
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#B0B3B8',
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: '#2A2D32',
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: '#FFFFFF',
    fontSize: 15,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#2F3238',
  },
  personaRow: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
  },
  personaChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: '#2A2D32',
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: '#2F3238',
  },
  personaChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  personaText: {
    color: '#B0B3B8',
    fontWeight: '600',
  },
  personaTextActive: {
    color: colors.secondary,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#3A3D44',
  },
  submitLabel: {
    color: colors.secondary,
    fontWeight: '700',
    fontSize: 16,
  },
  submitLabelDisabled: {
    color: '#8A8D91',
  },
  termsText: {
    color: '#6C6F75',
    marginTop: spacing.lg,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
  errorText: {
    color: '#F87171',
    fontSize: 12,
    marginBottom: spacing.md,
  },
  pressed: {
    opacity: 0.85,
  },
});
