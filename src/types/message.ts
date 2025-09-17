interface Message {
  id: number;
  userId: number;
  title: string;
  content: string;
  createdAt: Date;
}

export default Message;
