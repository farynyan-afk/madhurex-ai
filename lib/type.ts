export type Role = "user" | "assistant" | "system";

export type ChatMessage = {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
};

export type Chat = {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
};