export type UserRole = "organizer" | "attendee";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isEmailVerified: boolean;
  verificationToken?: string;
  emailOtp?: string;
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}
export interface Category {
    id:string;
    name:string;
    description:string;
    createdAt:Date;
}
export type EventStatus =
  | "draft"
  | "published"
  | "cancelled"
  | "completed";

export interface Event {
  id: string;
  organizerId: string;
  categoryId: string;
  title: string;
  description: string;
  location: string;
  eventDate: Date;
  capacity: number;
  registeredCount: number;
  imageUrl?: string | null;
  status: EventStatus;
  createdAt: Date;
  updatedAt: Date;
}
export type RegistrationStatus =
  | "registered"
  | "cancelled"
  | "attended";

export interface Registration {
  id: string;
  eventId: string;
  userId: string;
  status: RegistrationStatus;
  registeredAt: Date;
  cancelledAt?: Date | null;
}
// export const users: User[] = [];
// export const categories:Category[]=[
//   { id: "1", name: "Technology",description:"", createdAt: new Date() },
//   { id: "2", name: "Music",description:"", createdAt: new Date() },
//   { id: "3", name: "Sports",description:"", createdAt: new Date() },
// ]
// export const events: Event[] = [];
// export const registrations: Registration[] = [];
