import type { FaqState, TechnicalContext } from "../state/faq.types";

export function technicalTool(state: FaqState): FaqState {
  const q = state.question.toLowerCase();
  let platform: TechnicalContext["platform"] = "unknown";
  if (q.includes("安卓") || q.includes("android")) platform = "android";
  else if (q.includes("ios") || q.includes("iphone")) platform = "ios";
  else if (q.includes("小程序")) platform = "mini_program";
  else if (q.includes("浏览器") || q.includes("网页")) platform = "web";

  const suggestionSteps: string[] = [
    "请先确认网络连接正常（可以尝试切换 4G/5G 与 Wi-Fi）",
    "尝试退出重新登录，或刷新页面后重试",
    "如果问题仍然存在，请提供报错截图和发生时间，方便我们进一步排查",
  ];

  const ctx: TechnicalContext = {
    platform,
    lastAction: "根据用户问题自动推断的通用排查步骤",
    suggestionSteps,
  };

  return { ...state, technicalContext: ctx };
}

