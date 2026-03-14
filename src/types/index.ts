export type UserRole = 'ADMIN' | 'PASTOR' | 'MEMBER' | 'VISITOR';

export type EventStatus = 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED';

export type EventType = 'SERVICE' | 'BIBLE_STUDY' | 'PRAYER_MEETING' | 'YOUTH_NIGHT' | 'FELLOWSHIP' | 'CONFERENCE' | 'WORKSHOP' | 'COMMUNITY_OUTREACH' | 'SPECIAL';

export type PrayerStatus = 'PENDING' | 'IN_PROGRESS' | 'ANSWERED' | 'ARCHIVED';

export type DonationStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export type RegistrationStatus = 'REGISTERED' | 'CONFIRMED' | 'CANCELLED' | 'ATTENDED';

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  image: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  dateOfBirth?: Date | null;
  memberSince: Date;
  isVerified: boolean;
  isActive: boolean;
  emailOptIn: boolean;
  smsOptIn: boolean;
  bio?: string | null;
  username?: string | null;
  country?: string | null;
  timezone?: string | null;
  denomination?: string | null;
  faithStatus?: string | null;
  localChurch?: string | null;
  interests?: string | null;
  acceptedTerms?: boolean;
  acceptedPrivacy?: boolean;
  acceptedStatementOfFaith?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  title: string;
  description?: string | null;
  type: EventType;
  status: EventStatus;
  startDate: Date;
  endDate?: Date | null;
  timezone: string;
  location?: string | null;
  address?: string | null;
  isOnline: boolean;
  isInPerson: boolean;
  capacity?: number | null;
  registrationRequired: boolean;
  registrationDeadline?: Date | null;
  imageUrl?: string | null;
  zoomMeetingId?: string | null;
  zoomJoinUrl?: string | null;
  zoomStartUrl?: string | null;
  zoomPassword?: string | null;
  isRecurring: boolean;
  recurrenceRule?: string | null;
  viewCount: number;
  registrationCount: number;
  createdAt: Date;
  updatedAt: Date;
  createdById?: string | null;
  speakers?: EventSpeaker[];
}

export interface EventSpeaker {
  id: string;
  eventId: string;
  name: string;
  title?: string | null;
  bio?: string | null;
  imageUrl?: string | null;
  order: number;
}

export interface Registration {
  id: string;
  eventId: string;
  userId: string;
  status: RegistrationStatus;
  registeredAt: Date;
  confirmedAt?: Date | null;
  cancelledAt?: Date | null;
  attendedAt?: Date | null;
  notes?: string | null;
  customFields?: string | null;
  zoomJoinUrl?: string | null;
  reminderSent: boolean;
  lastReminderSent?: Date | null;
  event?: Event;
}

export interface Program {
  id: string;
  name: string;
  description?: string | null;
  dayOfWeek: number;
  startTime: string;
  endTime?: string | null;
  timezone: string;
  location?: string | null;
  isOnline: boolean;
  zoomLink?: string | null;
  isActive: boolean;
}

export interface Sermon {
  id: string;
  title: string;
  description?: string | null;
  scripture?: string | null;
  speakerName: string;
  seriesId?: string | null;
  videoUrl?: string | null;
  audioUrl?: string | null;
  documentUrl?: string | null;
  thumbnailUrl?: string | null;
  duration?: number | null;
  publishedAt?: Date | null;
  isFeatured: boolean;
  viewCount: number;
  downloadCount: number;
  tags?: string | null;
  createdAt: Date;
  updatedAt: Date;
  series?: SermonSeries;
}

export interface SermonSeries {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  sermons?: Sermon[];
}

export interface PrayerRequest {
  id: string;
  userId: string;
  title: string;
  request: string;
  isPublic: boolean;
  isUrgent: boolean;
  status: PrayerStatus;
  answeredAt?: Date | null;
  testimony?: string | null;
  prayerCount: number;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  responses?: PrayerResponse[];
}

export interface PrayerResponse {
  id: string;
  prayerRequestId: string;
  responderName?: string | null;
  message: string;
  isPublic: boolean;
  createdAt: Date;
}

export interface Donation {
  id: string;
  userId?: string | null;
  amount: number;
  currency: string;
  status: DonationStatus;
  paymentMethod?: string | null;
  transactionId?: string | null;
  isRecurring: boolean;
  recurringInterval?: string | null;
  campaignId?: string | null;
  isAnonymous: boolean;
  donorName?: string | null;
  donorEmail?: string | null;
  notes?: string | null;
  receiptSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SmallGroup {
  id: string;
  name: string;
  description?: string | null;
  type?: string | null;
  leaderId?: string | null;
  location?: string | null;
  meetingDay?: string | null;
  meetingTime?: string | null;
  maxMembers?: number | null;
  imageUrl?: string | null;
  isActive: boolean;
  members?: SmallGroupMember[];
}

export interface SmallGroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: string;
  joinedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type?: string | null;
  isRead: boolean;
  readAt?: Date | null;
  actionUrl?: string | null;
  createdAt: Date;
}

export interface DashboardStats {
  totalMembers: number;
  totalEvents: number;
  totalSermons: number;
  totalDonations: number;
  upcomingEvents: number;
  pendingPrayers: number;
  recentRegistrations: number;
  monthlyGiving: number;
}
