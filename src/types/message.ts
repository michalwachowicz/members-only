export interface Message {
  id: number;
  userId: number;
  title: string;
  content: string;
  createdAt: Date;
}

export type MessageCreate = Omit<Message, "id" | "createdAt">;
