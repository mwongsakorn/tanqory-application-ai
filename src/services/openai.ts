import Constants from 'expo-constants';
import { loadCompanyMemory } from './memory';

const OPENAI_ENDPOINT = 'https://api.openai.com/v1/responses';

interface ChatOptions {
  userName: string;
  persona: string;
  email: string;
}

function getApiKey(): string | undefined {
  const extra = Constants.expoConfig?.extra as { openAiApiKey?: string } | undefined;
  const keyFromExtra = extra?.openAiApiKey;
  const keyFromEnv = typeof process !== 'undefined' ? process.env?.EXPO_PUBLIC_OPENAI_API_KEY : undefined;
  return keyFromEnv || keyFromExtra || undefined;
}

function getModel(): string {
  const extra = Constants.expoConfig?.extra as { openAiModel?: string } | undefined;
  const modelFromExtra = extra?.openAiModel;
  const modelFromEnv = typeof process !== 'undefined' ? process.env?.EXPO_PUBLIC_OPENAI_MODEL : undefined;
  return modelFromEnv || modelFromExtra || 'gpt-4.1-mini';
}

interface OpenAiResponse {
  output_text?: string;
  output?: Array<{
    content: Array<{
      type: string;
      text?: string;
    }>;
  }>;
}

function extractText(response: OpenAiResponse): string {
  if (response.output_text) {
    return response.output_text.trim();
  }

  const parts = response.output
    ?.flatMap((item) => item.content)
    .filter((piece) => piece.type === 'output_text' || piece.type === 'text')
    .map((piece) => piece.text?.trim())
    .filter((text): text is string => Boolean(text));

  if (parts?.length) {
    return parts.join('\n').trim();
  }

  return 'ฉันไม่สามารถสร้างคำตอบได้ในตอนนี้ ลองอีกครั้งภายหลังนะครับ.';
}

export async function fetchAssistantReply(message: string, options: ChatOptions): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('ยังไม่ได้ตั้งค่า API Key สำหรับ OpenAI (EXPO_PUBLIC_OPENAI_API_KEY)');
  }

  const memory = await loadCompanyMemory();
  const model = getModel();
  const personaPrompt = `คุณคือ Tanqory AI ที่ช่วยเหลือทีมในบทบาท ${options.persona}. ผู้ใช้ชื่อ ${options.userName} (${options.email}). ตอบไทยและอ้างอิงข้อมูลใน Company Memory.`;

  const payload = {
    model,
    input: [
      {
        role: 'system',
        content: [
          { type: 'input_text', text: personaPrompt },
          {
            type: 'input_text',
            text: `Company Memory (สรุปรวม):\n${memory}`,
          },
        ],
      },
      {
        role: 'user',
        content: [{ type: 'input_text', text: message }],
      },
    ],
  };

  const response = await fetch(OPENAI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI error', errorText);
    throw new Error('ไม่สามารถเรียก OpenAI API ได้');
  }

  const data = (await response.json()) as OpenAiResponse;
  return extractText(data);
}
