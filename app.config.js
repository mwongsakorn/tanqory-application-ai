/* eslint-disable @typescript-eslint/no-var-requires */
const { load } = require('@expo/env');
load(process.cwd());

const baseConfig = require('./app.json');

module.exports = () => {
  const expoConfig = baseConfig.expo ?? {};

  return {
    expo: {
      ...expoConfig,
      plugins: [...(expoConfig.plugins ?? []), 'expo-asset'],
      extra: {
        ...(expoConfig.extra ?? {}),
        openAiApiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '',
        openAiModel: process.env.EXPO_PUBLIC_OPENAI_MODEL ?? 'gpt-4.1-mini',
      },
    },
  };
};
