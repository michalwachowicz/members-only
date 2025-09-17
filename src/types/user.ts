interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  isMember: boolean;
  isAdmin: boolean;
  createdAt: Date;
}

export default User;
