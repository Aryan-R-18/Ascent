import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  clubsApi, meetingsApi, tasksApi, updatesApi, notesApi,
  dashboardApi, notificationsApi, tagsApi, activityApi, publicApi, joinRequestsApi
} from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

function useIsAuth() {
  return !!useAuthStore((s) => s.user);
}

// ── Public (no auth) ──────────────────────────────────────────────────────────
export const usePublicClubs = () =>
  useQuery({ queryKey: ['public-clubs'], queryFn: publicApi.getClubs });

export const useJoinClub = () =>
  useMutation({
    mutationFn: ({ clubId, data }: { clubId: string; data: Parameters<typeof publicApi.joinClub>[1] }) =>
      publicApi.joinClub(clubId, data),
  });

// ── Clubs ──────────────────────────────────────────────────────────────────────
export const useClubs = () => {
  const auth = useIsAuth();
  return useQuery({ queryKey: ['clubs'], queryFn: clubsApi.list, enabled: auth });
};

export const useClubDetail = (clubId: string) =>
  useQuery({ queryKey: ['club', clubId], queryFn: () => clubsApi.get(clubId), enabled: !!clubId });

export const useCreateClub = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: clubsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clubs'] }),
  });
};

export const useUpdateClub = (clubId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof clubsApi.update>[1]) => clubsApi.update(clubId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clubs'] });
      qc.invalidateQueries({ queryKey: ['club', clubId] });
    },
  });
};

export const useInviteMember = (clubId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof clubsApi.invite>[1]) => clubsApi.invite(clubId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['club', clubId] }),
  });
};

export const useUpdateMemberRole = (clubId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: any }) =>
      clubsApi.updateMemberRole(clubId, userId, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['club', clubId] }),
  });
};

export const useRemoveMember = (clubId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => clubsApi.removeMember(clubId, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['club', clubId] }),
  });
};

// ── Join Requests ──────────────────────────────────────────────────────────────
export const useJoinRequests = (clubId: string) => {
  const auth = useIsAuth();
  return useQuery({
    queryKey: ['join-requests', clubId],
    queryFn: () => joinRequestsApi.list(clubId),
    enabled: auth && !!clubId,
  });
};

export const useApproveRequest = (clubId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => joinRequestsApi.approve(clubId, requestId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['join-requests', clubId] }),
  });
};

export const useRejectRequest = (clubId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => joinRequestsApi.reject(clubId, requestId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['join-requests', clubId] }),
  });
};

// ── Dashboard ──────────────────────────────────────────────────────────────────
export const useDashboard = (clubId: string) =>
  useQuery({ queryKey: ['dashboard', clubId], queryFn: () => dashboardApi.get(clubId), enabled: !!clubId });

// ── Activity ───────────────────────────────────────────────────────────────────
export const useActivity = (clubId: string, page = 1) =>
  useQuery({ queryKey: ['activity', clubId, page], queryFn: () => activityApi.list(clubId, page), enabled: !!clubId });

// ── Meetings ───────────────────────────────────────────────────────────────────
export const useMeetings = (clubId: string) =>
  useQuery({ queryKey: ['meetings', clubId], queryFn: () => meetingsApi.list(clubId), enabled: !!clubId });

export const useMeeting = (clubId: string, meetingId: string) =>
  useQuery({ queryKey: ['meeting', clubId, meetingId], queryFn: () => meetingsApi.get(clubId, meetingId), enabled: !!meetingId });

export const useCreateMeeting = (clubId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof meetingsApi.create>[1]) => meetingsApi.create(clubId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meetings', clubId] }),
  });
};

export const useUpdateMeeting = (clubId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ meetingId, data }: { meetingId: string; data: Parameters<typeof meetingsApi.update>[2] }) =>
      meetingsApi.update(clubId, meetingId, data),
    onSuccess: (_, { meetingId }) => {
      qc.invalidateQueries({ queryKey: ['meetings', clubId] });
      qc.invalidateQueries({ queryKey: ['meeting', clubId, meetingId] });
    },
  });
};

export const useDeleteMeeting = (clubId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (meetingId: string) => meetingsApi.delete(clubId, meetingId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meetings', clubId] }),
  });
};

export const useCreateMoM = (clubId: string, meetingId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof meetingsApi.createMoM>[2]) => meetingsApi.createMoM(clubId, meetingId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meeting', clubId, meetingId] }),
  });
};

// ── Tasks ──────────────────────────────────────────────────────────────────────
export const useTasks = (clubId: string, filters?: { status?: string; assigneeId?: string; priority?: string }) =>
  useQuery({ queryKey: ['tasks', clubId, filters], queryFn: () => tasksApi.list(clubId, filters), enabled: !!clubId });

export const useTask = (clubId: string, taskId: string) =>
  useQuery({ queryKey: ['task', clubId, taskId], queryFn: () => tasksApi.get(clubId, taskId), enabled: !!taskId });

export const useCreateTask = (clubId: string, meetingId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof tasksApi.create>[1]) => tasksApi.create(clubId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', clubId] });
      if (meetingId) qc.invalidateQueries({ queryKey: ['meeting', clubId, meetingId] });
    },
  });
};

export const useUpdateTask = (clubId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: Parameters<typeof tasksApi.update>[2] }) =>
      tasksApi.update(clubId, taskId, data),
    onSuccess: (_, { taskId }) => {
      qc.invalidateQueries({ queryKey: ['tasks', clubId] });
      qc.invalidateQueries({ queryKey: ['task', clubId, taskId] });
      qc.invalidateQueries({ queryKey: ['dashboard', clubId] });
    },
  });
};

export const useDeleteTask = (clubId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => tasksApi.delete(clubId, taskId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', clubId] }),
  });
};

export const useAddComment = (clubId: string, taskId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => tasksApi.addComment(clubId, taskId, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['task', clubId, taskId] }),
  });
};

// ── Daily Updates ──────────────────────────────────────────────────────────────
export const useDailyUpdates = (clubId: string, params?: { authorId?: string; from?: string; to?: string; page?: number }) =>
  useQuery({ queryKey: ['updates', clubId, params], queryFn: () => updatesApi.list(clubId, params), enabled: !!clubId });

export const useCreateDailyUpdate = (clubId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof updatesApi.create>[1]) => updatesApi.create(clubId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['updates', clubId] }),
  });
};

export const useDeleteDailyUpdate = (clubId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (updateId: string) => updatesApi.delete(clubId, updateId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['updates', clubId] }),
  });
};

// ── Notes ──────────────────────────────────────────────────────────────────────
export const useNotes = (clubId: string, params?: { search?: string; tagId?: string }) =>
  useQuery({ queryKey: ['notes', clubId, params], queryFn: () => notesApi.list(clubId, params), enabled: !!clubId });

export const useNote = (clubId: string, noteId: string) =>
  useQuery({ queryKey: ['note', clubId, noteId], queryFn: () => notesApi.get(clubId, noteId), enabled: !!noteId });

export const useCreateNote = (clubId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof notesApi.create>[1]) => notesApi.create(clubId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes', clubId] }),
  });
};

export const useUpdateNote = (clubId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ noteId, data }: { noteId: string; data: Parameters<typeof notesApi.update>[2] }) =>
      notesApi.update(clubId, noteId, data),
    onSuccess: (_, { noteId }) => {
      qc.invalidateQueries({ queryKey: ['notes', clubId] });
      qc.invalidateQueries({ queryKey: ['note', clubId, noteId] });
    },
  });
};

export const useDeleteNote = (clubId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (noteId: string) => notesApi.delete(clubId, noteId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes', clubId] }),
  });
};

// ── Tags ───────────────────────────────────────────────────────────────────────
export const useTags = () =>
  useQuery({ queryKey: ['tags'], queryFn: tagsApi.list });

export const useCreateTag = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tagsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tags'] }),
  });
};

// ── Notifications ──────────────────────────────────────────────────────────────
export const useNotifications = () => {
  const auth = useIsAuth();
  return useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.list,
    enabled: auth,
    refetchInterval: auth ? 30000 : false,
  });
};

export const useUnreadCount = () => {
  const auth = useIsAuth();
  return useQuery({
    queryKey: ['notifications-count'],
    queryFn: notificationsApi.unreadCount,
    enabled: auth,
    refetchInterval: auth ? 30000 : false,
  });
};

export const useMarkAllRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notifications-count'] });
    },
  });
};
