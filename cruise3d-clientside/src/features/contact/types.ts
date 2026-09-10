export interface ContactMessagePayload {
  fullName: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactMessage {
  id: string;
  fullName: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}
