import { useEffect, useMemo, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@/theme';

export interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: number;
  animate?: boolean;
}

interface ChatMessageBubbleProps {
  message: ChatMessage;
  showAvatar?: boolean;
  assistantInitials?: string;
  userInitials?: string;
}

export function ChatMessageBubble({
  message,
  showAvatar = true,
  assistantInitials = 'AI',
  userInitials = 'YOU',
}: ChatMessageBubbleProps) {
  const isAssistant = message.role === 'assistant';
  const shouldAnimate = isAssistant && Boolean(message.animate);
  const [displayedText, setDisplayedText] = useState(() =>
    shouldAnimate ? '' : message.content,
  );
  const [isAnimating, setIsAnimating] = useState(shouldAnimate);
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  useEffect(() => {
    if (!shouldAnimate) {
      setDisplayedText(message.content);
      setIsAnimating(false);
      return;
    }

    const text = message.content;
    if (!text) {
      setDisplayedText('');
      setIsAnimating(false);
      return;
    }

    setDisplayedText('');
    setIsAnimating(true);
    let index = 0;
    const interval = setInterval(() => {
      index += 1;
      setDisplayedText(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(interval);
        setIsAnimating(false);
      }
    }, 18);

    return () => {
      clearInterval(interval);
    };
  }, [message.content, message.id, shouldAnimate]);

  if (isAssistant) {
    const caret = useMemo(() => (isAnimating ? '\u258C' : ''), [isAnimating]);
    return (
      <View style={styles.assistantRow}>
        {showAvatar ? (
          <View style={styles.avatar}>
            <Text style={styles.avatarLabel}>{assistantInitials}</Text>
          </View>
        ) : (
          <View style={styles.avatarPlaceholder} />
        )}
        <View style={styles.assistantContent}>
          <LinearGradient
            colors={['#1F2125', '#14161A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.assistantBubble}
          >
            <Text style={styles.assistantLabel}>Tanqory AI</Text>
            <Text style={styles.assistantText}>
              {displayedText}
              {caret}
            </Text>
            <Text style={styles.timestamp}>{formattedTime}</Text>
          </LinearGradient>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.userRow}>
      <View style={styles.userContent}>
        <LinearGradient
          colors={[colors.primary, '#F2FF66']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.userBubble}
        >
          <Text style={styles.userLabel}>คุณ</Text>
          <Text style={styles.userText}>{message.content}</Text>
          <Text style={[styles.timestamp, styles.userTimestamp]}>{formattedTime}</Text>
        </LinearGradient>
      </View>
      {showAvatar ? (
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarLabel}>{userInitials}</Text>
        </View>
      ) : (
        <View style={styles.avatarPlaceholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  assistantRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarPlaceholder: {
    width: 36,
    marginRight: spacing.sm,
  },
  avatarLabel: {
    fontWeight: '700',
    color: colors.secondary,
  },
  assistantContent: {
    flex: 1,
  },
  assistantBubble: {
    borderRadius: 18,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#2A2D32',
  },
  assistantLabel: {
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  assistantText: {
    color: '#FFFFFF',
    lineHeight: 21,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: spacing.lg,
  },
  userContent: {
    maxWidth: '85%',
  },
  userBubble: {
    borderRadius: 18,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#F7FF9C',
  },
  userLabel: {
    fontWeight: '700',
    color: colors.secondary,
    marginBottom: spacing.xs,
  },
  userText: {
    color: colors.secondary,
    lineHeight: 21,
  },
  timestamp: {
    marginTop: spacing.sm,
    fontSize: 11,
    color: '#6C6F75',
  },
  userTimestamp: {
    color: '#2F3238',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: '#282B30',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  userAvatarLabel: {
    color: '#F7FF9C',
    fontWeight: '700',
    fontSize: 12,
  },
});
