import { StyleSheet, View } from 'react-native';
import { spacing } from '@/theme';

export function TypingIndicator() {
  return (
    <View style={styles.container}>
      <View style={styles.dot} />
      <View style={[styles.dot, styles.dotDelay]} />
      <View style={[styles.dot, styles.dotDelayLong]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginLeft: 40,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: '#B0B3B8',
    marginHorizontal: 4,
    opacity: 0.6,
  },
  dotDelay: {
    opacity: 0.4,
  },
  dotDelayLong: {
    opacity: 0.2,
  },
});
