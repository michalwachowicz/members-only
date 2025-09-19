export interface Message {
  id: number;
  userId: number;
  title: string;
  content: string;
  createdAt: Date;
  relativeTime: string;
}

export type MessageCreate = Omit<Message, "id" | "createdAt" | "relativeTime">;
