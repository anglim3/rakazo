import { tokensForAppearance } from "@rakazo/ui-tokens";
import { ActionSheetIOS, Alert, Platform } from "react-native";

type MessageAction = { text: string; onPress: () => void };

export function presentMessageActionSheet({
  actions,
  title,
  cancel,
  more,
  colorScheme,
}: {
  actions: MessageAction[];
  title?: string;
  cancel: string;
  more: string;
  colorScheme: "light" | "dark";
}): void {
  if (Platform.OS === "ios") {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: [...actions.map((action) => action.text), cancel],
        cancelButtonIndex: actions.length,
        title,
        userInterfaceStyle: colorScheme,
      },
      (index) => actions[index]?.onPress(),
    );
    return;
  }
  if (Platform.OS === "web") {
    presentWebActionSheet({ actions, cancel, colorScheme });
    return;
  }

  function showPage(remaining: MessageAction[]) {
    // Android alerts support three buttons. Back/outside tap dismisses every page.
    const buttons =
      remaining.length > 3
        ? [...remaining.slice(0, 2), { text: more, onPress: () => showPage(remaining.slice(2)) }]
        : [
            ...remaining,
            ...(remaining.length < 3 ? [{ text: cancel, style: "cancel" as const }] : []),
          ];
    Alert.alert(title ?? "", undefined, buttons, { cancelable: true });
  }
  showPage(actions);
}

function presentWebActionSheet({
  actions,
  cancel,
  colorScheme,
}: {
  actions: MessageAction[];
  cancel: string;
  colorScheme: "light" | "dark";
}): void {
  if (typeof document === "undefined") return;
  const tokens = tokensForAppearance(colorScheme);
  const overlay = document.createElement("div");
  overlay.setAttribute("data-testid", "agent-run-web-action-sheet");
  overlay.setAttribute("role", "presentation");
  overlay.style.cssText = [
    "position:fixed",
    "inset:0",
    "z-index:1000",
    "display:flex",
    "flex-direction:column",
    "justify-content:flex-end",
    `background:${tokens.overlay}`,
    "padding:12px 12px 24px",
    "font-family:ui-sans-serif,system-ui,sans-serif",
  ].join(";");
  const menu = document.createElement("div");
  menu.setAttribute("role", "menu");
  menu.style.cssText = "display:flex;flex-direction:column;gap:8px;";
  const group = document.createElement("div");
  group.style.cssText = `overflow:hidden;border-radius:14px;background:${tokens.secondary}`;
  for (const action of actions) {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("role", "menuitem");
    button.textContent = action.text;
    button.style.cssText = [
      "display:block",
      "width:100%",
      "border:0",
      "padding:14px 16px",
      "background:transparent",
      `color:${tokens.foreground}`,
      "font:inherit",
      "font-size:16px",
      "text-align:center",
      "cursor:pointer",
    ].join(";");
    if (group.childElementCount > 0) {
      button.style.borderTop = `1px solid ${tokens.border}`;
    }
    button.addEventListener("click", () => {
      overlay.remove();
      action.onPress();
    });
    group.append(button);
  }
  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.textContent = cancel;
  cancelButton.style.cssText = [
    "display:block",
    "width:100%",
    "border:0",
    "border-radius:14px",
    "padding:14px 16px",
    `background:${tokens.secondary}`,
    `color:${tokens.foreground}`,
    "font:inherit",
    "font-size:16px",
    "font-weight:600",
    "cursor:pointer",
  ].join(";");
  cancelButton.addEventListener("click", () => overlay.remove());
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) overlay.remove();
  });
  menu.append(group, cancelButton);
  overlay.append(menu);
  document.body.append(overlay);
}
