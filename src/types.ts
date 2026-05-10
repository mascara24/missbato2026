import { Timestamp } from 'firebase/firestore';

export interface Candidate {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  voteCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Vote {
  userId: string;
  candidateId: string;
  voterEmail: string;
  createdAt: Timestamp;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAdmin: boolean;
}
