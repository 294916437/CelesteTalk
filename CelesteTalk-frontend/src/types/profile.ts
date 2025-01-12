export interface Profile {
  name: string;
  handle: string;
  avatar: string;
  headerImage?: string;
  bio?: string;
  isVerified?: boolean;
  createdAt: string;
  stats: {
    following: number;
    followers: number;
  };
}

export interface Suggestion {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  isVerified?: boolean;
}
