export * from "react-native-web";

export const ActionSheetIOS = {
  showActionSheetWithOptions(
    _options: {
      options: string[];
      cancelButtonIndex?: number;
      title?: string;
      userInterfaceStyle?: "light" | "dark";
    },
    _callback: (buttonIndex: number) => void,
  ): void {},
};

export function PlatformColor(_name: string): string {
  return "transparent";
}
