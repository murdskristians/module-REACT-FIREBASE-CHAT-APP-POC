/**
 * Local replies for the AI panel in offline demo mode.
 *
 * Not a language model - a small keyword responder. It exists so the AI tab
 * demonstrates the streaming-ish UI without a network call or an API key in the
 * bundle, and it says as much rather than pretending to be one.
 */

type ChatMessage = { role: 'user' | 'assistant'; content: string };

const RULES: Array<{ match: RegExp; reply: string }> = [
  {
    match: /\b(hi|hello|hey|sveiks|labdien)\b/i,
    reply: "Hi! I'm the offline demo assistant. Ask me about this app and I'll tell you how it's built.",
  },
  {
    match: /\b(who|what) (are|is) (you|this)\b|about you/i,
    reply:
      "I'm a scripted stand-in, not a real language model. In the full build this panel talks to Llama 3.3 70B through Groq - the demo runs with no backend, so I answer from a small set of canned rules instead.",
  },
  {
    match: /\b(stack|built|tech|technolog|framework)\b/i,
    reply:
      'React 19 + TypeScript, packaged as a reusable module. The real build runs on Firebase - Firestore for messages, Firebase Auth, and Cloud Storage for attachments.',
  },
  {
    match: /\b(feature|can you do|what can|capabilit)\b/i,
    reply:
      'Real-time messaging, group chats, replies, reactions, pinned messages, emoji, file and image attachments, voice notes, and WebRTC calls. Try the message actions - most of them work right here in the demo.',
  },
  {
    match: /\b(firebase|firestore|database|backend)\b/i,
    reply:
      "In production this runs on Firestore. For the portfolio demo the whole Firebase layer is swapped for an in-memory store, so there's no project to configure and nothing to sign into.",
  },
  {
    match: /\b(login|sign ?in|account|auth)\b/i,
    reply:
      "No login needed here - you're signed in as an anonymous guest automatically. The full version supports Google and email/password sign-in.",
  },
  {
    match: /\b(call|video|voice|webrtc)\b/i,
    reply:
      'Calls use WebRTC with Firestore for signalling. They need a second real participant, so the call UI opens in the demo but will not connect to anyone.',
  },
  {
    match: /\b(save|persist|refresh|reload)\b/i,
    reply:
      'Everything you do lives in the tab only. Refresh the page and the demo resets to a clean state.',
  },
];

const FALLBACKS = [
  "That's beyond my scripted answers - I'm a canned responder for the offline demo, not a real model. Try asking about the tech stack, the features, or how the demo works.",
  'I only know a handful of topics in this demo build. Ask me what this app can do, or what it is built with.',
];

/** Rough imitation of model latency so the typing state is visible. */
const think = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function demoAssistantReply(messages: ChatMessage[]): Promise<string> {
  const lastUser = [...messages].reverse().find((message) => message.role === 'user');
  const text = lastUser?.content ?? '';

  await think(400 + Math.random() * 500);

  const rule = RULES.find(({ match }) => match.test(text));
  if (rule) return rule.reply;

  const userTurns = messages.filter((message) => message.role === 'user').length;
  return FALLBACKS[userTurns % FALLBACKS.length];
}
