export interface Project {
  name: string;
  blurb: string;
  stack: string[];
  href?: string;
  note?: string;
}

export const projects: Project[] = [
  {
    name: "stock-signal",
    blurb:
      "A rule-based intraday trading signal engine. Six indicator votes drive a consensus call, a backtest replays real market bars through the identical engine and exit logic as the live path, and every signal and outcome is logged so the strategy can be judged on evidence rather than memory. Backtesting found a real but thin edge, showed that tightening conviction made it worse, and identified an orthogonal filter that clears the cost line.",
    stack: ["Python", "Alpaca", "pandas-ta", "Flask", "SQLite", "pytest"],
    href: "https://github.com/skunkpirates42/stock-signal",
  },
  {
    name: "airbnb-research",
    blurb:
      "A listing research tool: a Chrome extension collects listing and review data, a Next.js app runs it through Claude for criteria-based analysis, and the UI polls until the analysis completes. The interesting problem was that the underlying persisted-query hash rotates, so the extension captures the live request at runtime instead of hardcoding anything that would break within a month.",
    stack: ["Next.js", "TypeScript", "Prisma", "MV3 extension", "Vite", "Claude API"],
    note: "Personal project, source kept private",
  },
  {
    name: "wc-predictions",
    blurb: "A World Cup match prediction app.",
    stack: ["JavaScript"],
    href: "https://github.com/skunkpirates42/wc-predictions",
  },
];
