export type FeelingOption = {
  label: string;
  score: number;
  color: string;
  emoji: string;
};

export const FEELINGS: FeelingOption[] = [
  { label: "Joyful", score: 5, color: "#d07b4a", emoji: "😄" },
  { label: "Proud", score: 4, color: "#e4a166", emoji: "🤗" },
  { label: "Calm", score: 4, color: "#4f7c6b", emoji: "😌" },
  { label: "Hopeful", score: 3, color: "#7d98c1", emoji: "🌤️" },
  { label: "Curious", score: 3, color: "#6f8f72", emoji: "🧐" },
  { label: "Tired", score: 2, color: "#6b6f7a", emoji: "😴" },
  { label: "Worried", score: 2, color: "#947c5a", emoji: "😟" },
  { label: "Sad", score: 1, color: "#5a6c85", emoji: "😢" },
  { label: "Angry", score: 1, color: "#a0543f", emoji: "😠" }
];

const feelingMap = new Map(FEELINGS.map((feeling) => [feeling.label, feeling]));

export function getFeeling(label: string) {
  return feelingMap.get(label);
}
