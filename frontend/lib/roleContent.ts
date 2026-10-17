// Role-specific text for the Chat and Voice pages.
// Suggestions only ask for data the role is allowed to see (SRS Sections 5 and 14).

export type RoleContent = {
  title: string;
  subtitle: string;
  welcome: string;
  placeholder: string;
  suggestions: string[];
};

const CONTENT: Record<string, RoleContent> = {
  ceo: {
    title: "Executive Chat",
    subtitle: "Ask questions about your business in plain language",
    welcome: "Hi, I'm your executive assistant. Ask me about KPIs, revenue, risks, or team productivity.",
    placeholder: "Ask about KPIs, revenue, risks, or productivity...",
    suggestions: [
      "What are our current risks?",
      "How is revenue trending?",
      "How productive is the team this sprint?",
    ],
  },
  admin: {
    title: "Executive Chat",
    subtitle: "Ask questions about the business in plain language",
    welcome: "Hi, I'm your assistant. Ask me about KPIs, revenue, risks, or team productivity across the organisation.",
    placeholder: "Ask about KPIs, revenue, risks, or productivity...",
    suggestions: [
      "What are our key KPIs?",
      "How is revenue trending?",
      "What are our current risks?",
      "How productive is the team this sprint?",
    ],
  },
  manager: {
    title: "Team Assistant",
    subtitle: "Ask about your team, project risks and KPIs",
    welcome: "Hi, I'm your team assistant. Ask me about KPIs, project risks, or your team's productivity.",
    placeholder: "Ask about KPIs, project risks, or team productivity...",
    suggestions: [
      "What are the current project risks?",
      "How productive is the team this sprint?",
      "What are our key KPIs?",
    ],
  },
  employee: {
    title: "My Assistant",
    subtitle: "Ask about your tasks and deadlines",
    welcome: "Hi, I'm your personal assistant. Ask me about your assigned tasks and deadlines.",
    placeholder: "Ask about your tasks and deadlines...",
    suggestions: [
      "What are my tasks?",
      "Which of my tasks are due soon?",
      "What is the status of my work?",
    ],
  },
};

// Shown for a moment before the real role is read (and if the role is unknown).
const GENERIC: RoleContent = {
  title: "Assistant",
  subtitle: "Ask questions in plain language",
  welcome: "Hi, I'm your assistant. Ask me a question.",
  placeholder: "Type your question...",
  suggestions: [],
};

export function getRoleContent(role: string | null): RoleContent {
  return (role && CONTENT[role]) || GENERIC;
}