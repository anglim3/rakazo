import { Text } from "react-native";

const glyphs: Record<string, string> = {
  "open-outline": "↗",
  "globe-outline": "○",
  "chevron-down": "▾",
  close: "×",
};

export default function Ionicons({
  name,
  size = 16,
  color,
}: {
  name: string;
  size?: number;
  color?: string;
}) {
  return <Text style={{ color, fontSize: size, lineHeight: size }}>{glyphs[name] ?? "•"}</Text>;
}
