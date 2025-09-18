import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, spacing } from '@/theme';

interface ChatComposerProps {
  onSend: (message: string) => void;
  onFocus?: () => void;
  isSending?: boolean;
}

export function ChatComposer({ onSend, onFocus, isSending = false }: ChatComposerProps) {
  const [value, setValue] = useState('');

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || isSending) {
      return;
    }

    onSend(trimmed);
    setValue('');
  }, [isSending, onSend, value]);

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
          editable={!isSending}
          style={styles.input}
        />
        <Pressable
          disabled={isSending || value.trim().length === 0}
          style={({ pressed }) => [
            styles.sendButton,
            (isSending || value.trim().length === 0) && styles.sendButtonDisabled,
            pressed && !isSending && value.trim().length > 0 && styles.pressed,
          ]}
          onPress={handleSend}
        >
          {isSending ? (
            <ActivityIndicator size="small" color={colors.secondary} />
          ) : (
            <Text style={styles.sendLabel}>ส่ง</Text>
          )}
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
    minWidth: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#3A3D44',
  },
  sendLabel: {
    fontWeight: '700',
    color: colors.secondary,
  },
  pressed: {
    opacity: 0.85,
  },
});
