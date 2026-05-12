export type ClubRole = 'OWNER' | 'ADMIN' | 'CORE_MEMBER' | 'MEMBER';
export type MeetingStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type NotificationType = 'TASK_ASSIGNED' | 'TASK_COMMENT' | 'MEETING_REMINDER' | 'MENTION' | 'GENERAL';
export type JoinRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
}

export interface Club {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
  role?: ClubRole;
  members?: ClubMember[];
  _count?: { members: number; meetings: number; tasks: number };
}

export interface ClubMember {
  id: string;
  userId: string;
  clubId: string;
  role: ClubRole;
  joinedAt: string;
  user: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl'>;
}

export interface JoinRequest {
  id: string;
  clubId: string;
  name: string;
  email: string;
  status: JoinRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Meeting {
  id: string;
  clubId: string;
  title: string;
  agenda?: string;
  scheduledAt: string;
  location?: string;
  status: MeetingStatus;
  createdAt: string;
  updatedAt: string;
  notes?: MeetingNote[];
  tasks?: Task[];
  _count?: { notes: number; tasks: number };
}

export interface MeetingNote {
  id: string;
  meetingId: string;
  authorId: string;
  discussionPoints: string;
  decisions: string;
  actionItems?: string;
  createdAt: string;
  updatedAt: string;
  author?: Pick<User, 'id' | 'name' | 'avatarUrl'>;
}

export interface Task {
  id: string;
  clubId: string;
  meetingId?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
  assigneeId?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  assignee?: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  createdBy?: Pick<User, 'id' | 'name'>;
  comments?: TaskComment[];
  history?: TaskHistory[];
  _count?: { comments: number };
}

export interface TaskComment {
  id: string;
  taskId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author?: Pick<User, 'id' | 'name' | 'avatarUrl'>;
}

export interface TaskHistory {
  id: string;
  taskId: string;
  userId: string;
  field: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
  user?: Pick<User, 'id' | 'name'>;
}

export interface DailyUpdate {
  id: string;
  clubId: string;
  authorId: string;
  content: string;
  completedTasks: string[];
  date: string;
  createdAt: string;
  updatedAt: string;
  author?: Pick<User, 'id' | 'name' | 'avatarUrl'>;
}

export interface Note {
  id: string;
  clubId: string;
  authorId: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  author?: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  tags?: NoteTag[];
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface NoteTag {
  noteId: string;
  tagId: string;
  tag: Tag;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  clubId: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  meta?: Record<string, unknown>;
  createdAt: string;
  user?: Pick<User, 'id' | 'name' | 'avatarUrl'>;
}

export interface DashboardData {
  memberCount: number;
  upcomingMeetings: Meeting[];
  myTasks: Task[];
  recentUpdates: DailyUpdate[];
  recentActivity: ActivityLog[];
  taskStats: { status: TaskStatus; count: number }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ApiError {
  error: string;
  statusCode?: number;
}
