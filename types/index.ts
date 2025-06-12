// types/index.ts
export interface User {
  _id: string;
  name: string;
  email: string;
  accounts: Array<{
    provider: string;
    providerAccountId: string;
    access_token?: string;
    type: 'credentials' | 'oauth';
  }>;
}

// types/index.ts
export interface ApiResponse<T> {
  data: any;
  success: any;
  message: string;
  user: T | null; // Change from `user?: T` to `user: T | null`
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends AuthCredentials {
  name: string;
}