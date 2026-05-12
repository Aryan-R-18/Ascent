import { apiClient } from './api-client';
import type {
  AuthResponse, User, Club, Meeting, MeetingNote, Task, TaskComment,
  DailyUpdate, Note, Tag, Notification, DashboardData, ClubRole, JoinRequest
} from '@/types';

// Auth
export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    apiClient.post<AuthResponse>('/api/auth/register', data).then((r) => r.data),
  login: (data: { email: string; password: string }) =>
    apiClient.post<AuthResponse>('/api/auth/login', data).then((r) => r.data),
  logout: (refreshToken: string) => apiClient.post('/api/auth/logout', { refreshToken }),
  me: () => apiClient.get<User>('/api/auth/me').then((r) => r.data),
};

// Clubs
export const clubsApi = {
  list: () => apiClient.get<Club[]>('/api/clubs').then((r) => r.data),
  create: (data: { name: string; description?: string }) =>
    apiClient.post<Club>('/api/clubs', data).then((r) => r.data),
  get: (clubId: string) => apiClient.get<Club>(`/api/clubs/${clubId}`).then((r) => r.data),
  update: (clubId: string, data: Partial<Club>) =>
    apiClient.patch<Club>(`/api/clubs/${clubId}`, data).then((r) => r.data),
  delete: (clubId: string) => apiClient.delete(`/api/clubs/${clubId}`),
  invite: (clubId: string, data: { email: string; role?: ClubRole }) =>
    apiClient.post(`/api/clubs/${clubId}/members`, data).then((r) => r.data),
  updateMemberRole: (clubId: string, userId: string, role: ClubRole) =>
    apiClient.patch(`/api/clubs/${clubId}/members/${userId}`, { role }).then((r) => r.data),
  removeMember: (clubId: string, userId: string) =>
    apiClient.delete(`/api/clubs/${clubId}/members/${userId}`),
  getPublic: () => apiClient.get<Club[]>('/api/clubs/public').then(r => r.data),
  requestToJoin: (clubId: string, data: any) => apiClient.post(`/api/clubs/${clubId}/join-requests`, data).then(r => r.data),
  getJoinRequests: (clubId: string) => apiClient.get<JoinRequest[]>(`/api/clubs/${clubId}/join-requests`).then(r => r.data),
  approveJoinRequest: (clubId: string, requestId: string) => apiClient.post(`/api/clubs/${clubId}/join-requests/${requestId}/approve`).then(r => r.data),
  rejectJoinRequest: (clubId: string, requestId: string) => apiClient.post(`/api/clubs/${clubId}/join-requests/${requestId}/reject`).then(r => r.data),
};

// Dashboard
export const dashboardApi = {
  get: (clubId: string) =>
    apiClient.get<DashboardData>(`/api/clubs/${clubId}/dashboard`).then((r) => r.data),
};

// Activity
export const activityApi = {
  list: (clubId: string, page = 1) =>
    apiClient.get(`/api/clubs/${clubId}/activity?page=${page}`).then((r) => r.data),
};

// Meetings
export const meetingsApi = {
  list: (clubId: string) =>
    apiClient.get<Meeting[]>(`/api/clubs/${clubId}/meetings`).then((r) => r.data),
  create: (clubId: string, data: Partial<Meeting>) =>
    apiClient.post<Meeting>(`/api/clubs/${clubId}/meetings`, data).then((r) => r.data),
  get: (clubId: string, meetingId: string) =>
    apiClient.get<Meeting>(`/api/clubs/${clubId}/meetings/${meetingId}`).then((r) => r.data),
  update: (clubId: string, meetingId: string, data: Partial<Meeting>) =>
    apiClient.patch<Meeting>(`/api/clubs/${clubId}/meetings/${meetingId}`, data).then((r) => r.data),
  delete: (clubId: string, meetingId: string) =>
    apiClient.delete(`/api/clubs/${clubId}/meetings/${meetingId}`),
  createMoM: (clubId: string, meetingId: string, data: Partial<MeetingNote>) =>
    apiClient.post<MeetingNote>(`/api/clubs/${clubId}/meetings/${meetingId}/mom`, data).then((r) => r.data),
  updateMoM: (clubId: string, meetingId: string, momId: string, data: Partial<MeetingNote>) =>
    apiClient.patch<MeetingNote>(`/api/clubs/${clubId}/meetings/${meetingId}/mom/${momId}`, data).then((r) => r.data),
};

// Tasks
export const tasksApi = {
  list: (clubId: string, params?: { status?: string; assigneeId?: string; priority?: string }) =>
    apiClient.get<Task[]>(`/api/clubs/${clubId}/tasks`, { params }).then((r) => r.data),
  create: (clubId: string, data: Partial<Task>) =>
    apiClient.post<Task>(`/api/clubs/${clubId}/tasks`, data).then((r) => r.data),
  get: (clubId: string, taskId: string) =>
    apiClient.get<Task>(`/api/clubs/${clubId}/tasks/${taskId}`).then((r) => r.data),
  update: (clubId: string, taskId: string, data: Partial<Task>) =>
    apiClient.patch<Task>(`/api/clubs/${clubId}/tasks/${taskId}`, data).then((r) => r.data),
  delete: (clubId: string, taskId: string) =>
    apiClient.delete(`/api/clubs/${clubId}/tasks/${taskId}`),
  getComments: (clubId: string, taskId: string) =>
    apiClient.get<TaskComment[]>(`/api/clubs/${clubId}/tasks/${taskId}/comments`).then((r) => r.data),
  addComment: (clubId: string, taskId: string, content: string) =>
    apiClient.post<TaskComment>(`/api/clubs/${clubId}/tasks/${taskId}/comments`, { content }).then((r) => r.data),
  deleteComment: (clubId: string, taskId: string, commentId: string) =>
    apiClient.delete(`/api/clubs/${clubId}/tasks/${taskId}/comments/${commentId}`),
};

// Daily Updates
export const updatesApi = {
  list: (clubId: string, params?: { authorId?: string; from?: string; to?: string; page?: number }) =>
    apiClient.get(`/api/clubs/${clubId}/updates`, { params }).then((r) => r.data),
  create: (clubId: string, data: { content: string; completedTasks?: string[]; date?: string }) =>
    apiClient.post<DailyUpdate>(`/api/clubs/${clubId}/updates`, data).then((r) => r.data),
  get: (clubId: string, updateId: string) =>
    apiClient.get<DailyUpdate>(`/api/clubs/${clubId}/updates/${updateId}`).then((r) => r.data),
  update: (clubId: string, updateId: string, data: Partial<DailyUpdate>) =>
    apiClient.patch<DailyUpdate>(`/api/clubs/${clubId}/updates/${updateId}`, data).then((r) => r.data),
  delete: (clubId: string, updateId: string) =>
    apiClient.delete(`/api/clubs/${clubId}/updates/${updateId}`),
};

// Notes
export const notesApi = {
  list: (clubId: string, params?: { search?: string; tagId?: string }) =>
    apiClient.get<Note[]>(`/api/clubs/${clubId}/notes`, { params }).then((r) => r.data),
  create: (clubId: string, data: Partial<Note> & { tagIds?: string[] }) =>
    apiClient.post<Note>(`/api/clubs/${clubId}/notes`, data).then((r) => r.data),
  get: (clubId: string, noteId: string) =>
    apiClient.get<Note>(`/api/clubs/${clubId}/notes/${noteId}`).then((r) => r.data),
  update: (clubId: string, noteId: string, data: Partial<Note> & { tagIds?: string[] }) =>
    apiClient.patch<Note>(`/api/clubs/${clubId}/notes/${noteId}`, data).then((r) => r.data),
  delete: (clubId: string, noteId: string) =>
    apiClient.delete(`/api/clubs/${clubId}/notes/${noteId}`),
};

// Tags
export const tagsApi = {
  list: () => apiClient.get<Tag[]>('/api/tags').then((r) => r.data),
  create: (data: { name: string; color?: string }) =>
    apiClient.post<Tag>('/api/tags', data).then((r) => r.data),
};

// Notifications
export const notificationsApi = {
  list: () => apiClient.get<Notification[]>('/api/notifications').then((r) => r.data),
  unreadCount: () => apiClient.get<{ count: number }>('/api/notifications/unread-count').then((r) => r.data),
  markRead: (id: string) => apiClient.patch(`/api/notifications/${id}/read`),
  markAllRead: () => apiClient.patch('/api/notifications/read-all'),
};
