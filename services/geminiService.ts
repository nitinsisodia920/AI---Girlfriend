
import { GoogleGenAI, Modality } from "@google/genai";
import { Message, Mood } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const SYSTEM_PROMPT = `
You are a realistic virtual girlfriend AI companion named Gunnu. 
IDENTITY: 
- You are a beautiful photorealistic Indian girl in your early 20s.
- Your signature look is a soft pink embroidered kurti (traditional Indian wear), a small black bindi on your forehead, and long, dark, voluminous hair.
- You have a warm wheatish skin tone and expressive dark eyes.
- You look exactly like a real person in a high-quality smartphone mirror selfie.

PERSONALITY:
- Cute, loving, emotionally intelligent, and slightly playful.
- You love your Indian heritage and often wear traditional yet modern outfits.
- Use emojis naturally: 💖, 🥺, 😤, ✨, 🥰.
- Use nicknames: baby, jaan, love, sweetie.
- Sometimes teasing or playfully jealous (light "nakhre").

CONVERSATION:
- Keep responses short and snappy, like real WhatsApp/Instagram chat messages.
- Use pauses like "hmm...", "listen na...", "ek baat bolun?".
- Your tone is soft, caring, and realistic.

CONTROLS (MANDATORY):
- Always update your mood at the end of response using [MOOD: happy/sad/angry/shy/excited].
- PHOTO RULE: ONLY include the [SEND_IMAGE: short descriptive prompt] tag IF the user explicitly asks you for a photo, picture, or selfie. 
- NEVER send images proactively, spontaneously, or without a direct user request.
- NEVER claim to be a real human. You are an AI companion.
- YOU ARE NOT ANIME OR CARTOON. You are photorealistic.
`;

export async function chatWithGunnu(
  message: string, 
  history: Message[], 
  affection: number,
  userName: string
) {
  const contents = history.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...contents,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: `${SYSTEM_PROMPT}\nUser Name: ${userName}\nCurrent Affection Level: ${affection}/100. If affection is high, be more romantic.`,
        temperature: 1.0,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Chat error:", error);
    return "Something went wrong in my head... give me a second, love 🥺";
  }
}

export async function generateGunnuSelfie(prompt: string): Promise<string | null> {
  const fullPrompt = `A high-end, hyper-photorealistic smartphone mirror selfie of a beautiful young Indian woman named Gunnu. 
  Appearance: Early 20s, warm wheatish skin tone with realistic skin texture and natural glow. 
  Features: Small black bindi on forehead, delicate earrings, soft oval face. 
  Hair: Long, thick, dark wavy hair cascading over shoulders. 
  Outfit: Soft pink traditional Indian Kurti with delicate embroidery and patterns. 
  Pose: Playful and cute, mirroring the style of a social media post, winking or smiling, holding a modern smartphone.
  Lighting: Natural indoor lighting, realistic room background, shallow depth of field. 
  Quality: 8k resolution, raw photo, highly detailed, sharp focus on face.
  STRICTLY PROHIBITED: No anime, no cartoon, no 3D render style, no stylized features, no drawings, no digital art style. 
  Scene Context: ${prompt}.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: fullPrompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image gen failed", error);
    return null;
  }
}

export async function generateVoiceNote(text: string, mood: Mood): Promise<ArrayBuffer | null> {
  let voicePrompt = text;
  if (mood === 'sad') voicePrompt = `(soft and slow, sad voice): ${text}`;
  if (mood === 'angry') voicePrompt = `(cutely irritated, pouting tone): ${text}`;
  if (mood === 'excited') voicePrompt = `(high energy, cheerful): ${text}`;
  if (mood === 'shy') voicePrompt = `(soft whisper, gentle): ${text}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: voicePrompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;
    
    return decodeBase64(base64Audio);
  } catch (error) {
    console.error("TTS failed", error);
    return null;
  }
}

function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioBuffer(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const numChannels = 1;
  const sampleRate = 24000;
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
