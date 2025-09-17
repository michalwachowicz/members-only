export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  isMember: boolean;
  isAdmin: boolean;
  createdAt: Date;
}

export type UserRegister = Omit<
  User,
  "id" | "createdAt" | "isMember" | "isAdmin"
>;
export type SafeUser = Omit<User, "password">;
