import { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '@/types/navigation';
import { colors, spacing } from '@/theme';
import { ChatComposer } from '@/components/ChatComposer';
import { ChatMessage, ChatMessageBubble } from '@/components/ChatMessageBubble';
import { TypingIndicator } from '@/components/TypingIndicator';
import { fetchAssistantReply } from '@/services/openai';
import * as Haptics from 'expo-haptics';

const quickPrompts = [
  'ช่วยคิด workflow จัดการสินค้าใหม่',
  'เสนอไอเดียเพิ่ม conversion ใน Checkout',
  'อธิบายส่วนประกอบของ Shopify API',
  'ช่วยสร้างแผน loyalty program',
];

export function ChatScreen({ route }: NativeStackScreenProps<RootStackParamList, 'Chat'>) {
  const { userName, persona, email } = route.params;
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'assistant',
      content: `สวัสดี ${userName}! ฉันคือ Tanqory AI พร้อมช่วยคุณ (${persona}) ออกแบบและพัฒนา Shopify App Demo ครบทุกฟีเจอร์. ต้องการโฟกัสเรื่องไหนก่อนดีครับ?`,
      timestamp: Date.now(),
      animate: false,
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const userInitials = useMemo(() => {
    const parts = userName.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) {
      return 'YOU';
    }
    const initials = parts
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
    return initials || 'YOU';
  }, [userName]);

  const scrollToLatest = useCallback(() => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }, []);

  const handleSend = useCallback(
    (content: string) => {
      if (isSending) {
        return;
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content,
        timestamp: Date.now(),
        animate: false,
      };

      setMessages((current) => [...current, userMessage]);
      setIsTyping(true);
      setIsSending(true);
      scrollToLatest();

      (async () => {
        try {
          const replyText = await fetchAssistantReply(content, { userName, persona, email });
          const reply: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: replyText,
            timestamp: Date.now(),
            animate: true,
          };
          setMessages((current) => [...current, reply]);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
        } catch (error) {
          console.error('AI reply failed', error);
          const errorMessage: ChatMessage = {
            id: `assistant-error-${Date.now()}`,
            role: 'assistant',
            content: 'ขออภัย ระบบไม่สามารถเชื่อมต่อ OpenAI ได้ในตอนนี้ ลองอีกครั้งภายหลังครับ.',
            timestamp: Date.now(),
            animate: false,
          };
          setMessages((current) => [...current, errorMessage]);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined);
        } finally {
          setIsTyping(false);
          setIsSending(false);
          scrollToLatest();
        }
      })();
    },
    [email, isSending, persona, scrollToLatest, userName],
  );

  const handleQuickPrompt = useCallback(
    (prompt: string) => {
      if (isSending) {
        return;
      }
      Haptics.selectionAsync().catch(() => undefined);
      handleSend(prompt);
    },
    [handleSend, isSending],
  );

  const handleReset = useCallback(() => {
    Haptics.selectionAsync().catch(() => undefined);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `เริ่มแชทใหม่แล้วครับ ${userName}! แจ้งได้เลยว่าต้องการให้ Tanqory AI ช่วยเรื่องใดเกี่ยวกับ Shopify.`,
        timestamp: Date.now(),
        animate: false,
      },
    ]);
  }, [userName]);

  const chatBackground = useMemo(() => ['#0C0D10', '#1A1C21'], []);
  const assistantInitials = 'AI';
  const keyboardOffset = useMemo(
    () => (Platform.OS === 'ios' ? Math.max(insets.top, 16) : 0),
    [insets.top],
  );

  const composerPaddingBottom = useMemo(
    () => {
      if (Platform.OS === 'ios') {
        const adjusted = insets.bottom ? Math.max(insets.bottom - 14, spacing.xs) : spacing.xs;
        return adjusted;
      }
      return spacing.xs;
    },
    [insets.bottom],
  );

  const suggestionHeader = useMemo(
    () => (
      <View style={styles.suggestionHeader}>
        <Text style={styles.suggestionTitle}>ลองเริ่มต้นด้วยไอเดียเหล่านี้</Text>
        <View style={styles.quickPromptWrap}>
          {quickPrompts.map((prompt) => (
            <Pressable
              key={prompt}
              onPress={() => handleQuickPrompt(prompt)}
              style={({ pressed }) => [styles.promptChip, pressed && styles.promptChipPressed]}
            >
              <Text style={styles.promptText}>{prompt}</Text>
            </Pressable>
          ))}
          <Pressable
            onPress={handleReset}
            style={({ pressed }) => [styles.resetChip, pressed && styles.promptChipPressed]}
          >
            <Text style={styles.resetText}>เริ่มบทสนทนาใหม่</Text>
          </Pressable>
        </View>
      </View>
    ),
    [handleQuickPrompt, handleReset],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoider}
        behavior={Platform.select({ ios: 'padding', android: 'height' })}
        keyboardVerticalOffset={keyboardOffset}
      >
        <View style={styles.container}>
          <View style={styles.banner}>
            <Text style={styles.bannerTitle}>Tanqory AI Assistant</Text>
            <Text style={styles.bannerSubtitle}>
              บัญชี: {email} · บทบาท: {persona}
            </Text>
          </View>

          <View style={[styles.chatArea, { backgroundColor: chatBackground[1] }]}
          >
            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => {
                const previous = index > 0 ? messages[index - 1] : undefined;
                const isFirstOfGroup = previous?.role !== item.role;
                return (
                  <ChatMessageBubble
                    message={item}
                    showAvatar={isFirstOfGroup}
                    assistantInitials={assistantInitials}
                    userInitials={userInitials}
                  />
                );
              }}
              contentContainerStyle={styles.messageList}
              ListHeaderComponent={suggestionHeader}
              ListFooterComponent={isTyping ? <TypingIndicator /> : <View style={styles.footerSpacer} />}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              onContentSizeChange={scrollToLatest}
            />
          </View>

          <View
            style={[
              styles.composerContainer,
              { paddingBottom: composerPaddingBottom },
            ]}
          >
            <ChatComposer onSend={handleSend} onFocus={scrollToLatest} isSending={isSending} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoider: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#0C0D10',
  },
  container: {
    flex: 1,
    backgroundColor: '#0C0D10',
  },
  banner: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  bannerSubtitle: {
    color: '#B0B3B8',
    marginTop: spacing.xs,
  },
  suggestionHeader: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  suggestionTitle: {
    color: '#9CA0A6',
    fontWeight: '600',
    marginBottom: spacing.md,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  quickPromptWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  promptChip: {
    backgroundColor: '#1F2125',
    borderRadius: 999,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#2A2D32',
  },
  promptChipPressed: {
    opacity: 0.8,
  },
  promptText: {
    color: '#B0B3B8',
    fontWeight: '600',
    fontSize: 13,
  },
  resetChip: {
    backgroundColor: '#282B30',
    borderRadius: 999,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#3A3D44',
  },
  resetText: {
    color: '#F7FF9C',
    fontWeight: '600',
    fontSize: 13,
  },
  chatArea: {
    flex: 1,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
  },
  messageList: {
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
  },
  composerContainer: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    backgroundColor: '#0C0D10',
  },
  footerSpacer: {
    height: spacing.lg,
  },
});
