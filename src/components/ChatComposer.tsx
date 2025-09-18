import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, spacing } from '@/theme';

interface ChatComposerProps {
  onSend: (message: string) => void;
  onFocus?: () => void;
}

export function ChatComposer({ onSend, onFocus }: ChatComposerProps) {
  const [value, setValue] = useState('');

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }

    onSend(trimmed);
    setValue('');
  }, [onSend, value]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      keyboardVerticalOffset={Platform.select({ ios: 100, android: 0 })}
    >
      <View style={styles.composerWrapper}>
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder="ถาม Tanqory AI เกี่ยวกับ Shopify..."
          placeholderTextColor="#6C6F75"
          multiline
          onFocus={onFocus}
          style={styles.input}
        />
        <Pressable style={({ pressed }) => [styles.sendButton, pressed && styles.pressed]} onPress={handleSend}>
          <Text style={styles.sendLabel}>ส่ง</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  composerWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#1F2125',
    borderRadius: 24,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#2A2D32',
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    maxHeight: 120,
    paddingHorizontal: spacing.sm,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginLeft: spacing.md,
  },
  sendLabel: {
    fontWeight: '700',
    color: colors.secondary,
  },
  pressed: {
    opacity: 0.85,
  },
});
