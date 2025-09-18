import { useEffect, useMemo, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
  assistantInitials?: string;
  userInitials?: string;
  feedback?: 'up' | 'down' | null;
  onFeedback?: (value: 'up' | 'down') => void;
}

export function ChatMessageBubble({
  message,
  assistantInitials = 'AI',
  userInitials = 'YOU',
  feedback = null,
  onFeedback,
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
    const totalLength = text.length;
    const step = totalLength > 240 ? 3 : totalLength > 120 ? 2 : 1;
    const intervalMs = totalLength > 240 ? 12 : totalLength > 120 ? 14 : 18;
    const interval = setInterval(() => {
      index += step;
      const nextValue = text.slice(0, Math.min(index, totalLength));
      setDisplayedText(nextValue);
      if (index >= totalLength) {
        clearInterval(interval);
        setIsAnimating(false);
      }
    }, intervalMs);

    return () => {
      clearInterval(interval);
    };
  }, [message.content, message.id, shouldAnimate]);

  if (isAssistant) {
    const caret = useMemo(() => (isAnimating ? '\u258C' : ''), [isAnimating]);
    return (
      <View style={styles.assistantRow}>
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
            <Text style={styles.memoryTag}>ข้อมูลจาก Company Memory</Text>
            {onFeedback ? (
              <View style={styles.feedbackRow}>
                <FeedbackButton
                  icon="thumb-up-outline"
                  activeIcon="thumb-up"
                  isActive={feedback === 'up'}
                  onPress={() => onFeedback('up')}
                />
                <FeedbackButton
                  icon="thumb-down-outline"
                  activeIcon="thumb-down"
                  isActive={feedback === 'down'}
                  onPress={() => onFeedback('down')}
                />
              </View>
            ) : null}
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
    </View>
  );
}

const styles = StyleSheet.create({
  assistantRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
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
  memoryTag: {
    marginTop: spacing.xs,
    fontSize: 11,
    color: '#8A8D91',
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
  feedbackRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  feedbackButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2D32',
    backgroundColor: '#1A1C21',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  feedbackPressed: {
    opacity: 0.8,
  },
  feedbackActive: {
    backgroundColor: 'rgba(225,255,0,0.12)',
    borderColor: colors.primary,
  },
});

interface FeedbackButtonProps {
  icon: string;
  activeIcon: string;
  isActive: boolean;
  onPress: () => void;
}

function FeedbackButton({ icon, activeIcon, isActive, onPress }: FeedbackButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.feedbackButton, pressed && styles.feedbackPressed, isActive && styles.feedbackActive]}
    >
      <MaterialCommunityIcons
        name={(isActive ? activeIcon : icon) as never}
        size={18}
        color={isActive ? colors.primary : '#8A8D91'}
      />
    </Pressable>
  );
}
