import apiClient from './client';

export interface User {
  id: number;
  email: string;
  name: string;
  user_type: 'athlete' | 'coach';
  profile_photo_url: string | null;
  sport: string | null;
  team: string | null;
  training_goals: string | null;
  coaching_credentials: string | null;
  bio: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  user_type: 'athlete' | 'coach';
  sport?: string;
  team?: string;
  training_goals?: string;
  coaching_credentials?: string;
  bio?: string;
}

export interface Exercise {
  id: number;
  name: string;
  sets: number;
  reps: number;
  percentage_of_max: number | null;
  target_exercise: string | null;
  target_weight: number | null;
  video_url: string | null;
  coach_notes: string | null;
  order: number;
}

export interface TodayWorkout {
  id: number;
  name: string;
  scheduled_date: string;
  exercises: Exercise[];
  workout_log_id: number | null;
  is_completed: boolean;
  is_flagged: boolean;
}

export interface CalendarWorkout {
  id: number;
  name: string;
  scheduled_date: string;
  is_completed: boolean;
  is_flagged: boolean;
}

export interface ProgressResponse {
  exercise_name: string;
  data: Array<{ date: string; max_weight: number }>;
}

export interface FlaggedAthlete {
  id: number;
  name: string;
  flag_reason: string;
  flagged_at: string;
}

export interface DashboardResponse {
  completed_workouts_today: number;
  flagged_athletes: FlaggedAthlete[];
  total_athletes: number;
}

export interface AthleteWithGroups {
  id: number;
  name: string;
  email: string;
  profile_photo_url: string | null;
  sport: string | null;
  team: string | null;
  groups: Array<{ id: number; name: string }>;
  subgroups: Array<{ id: number; name: string; training_focus: string | null }>;
}

export interface ProgramSummary {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  workout_count: number;
  workouts: any[];
}

export interface AthleteDetail {
  id: number;
  name: string;
  email: string;
  sport: string | null;
  team: string | null;
  training_goals: string | null;
  maxes: Array<{ exercise_name: string; max_weight: number; unit: string }>;
  recent_logs: Array<{
    workout_name: string;
    scheduled_date: string;
    is_completed: boolean;
    is_flagged: boolean;
    flag_reason: string | null;
  }>;
}

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<{ access_token: string }>('/api/auth/login', data),

  signup: (data: SignupRequest) =>
    apiClient.post<{ access_token: string }>('/api/auth/signup', data),

  me: () =>
    apiClient.get<User>('/api/auth/me'),
};

export const athleteApi = {
  onboarding: (data: {
    sport?: string;
    team?: string;
    training_goals?: string;
    maxes?: Record<string, number>;
  }) => apiClient.post('/api/athletes/onboarding', data),

  updateMax: (data: { exercise_name: string; max_weight: number; unit?: string }) =>
    apiClient.put('/api/athletes/maxes', data),

  getCalendar: (params?: { start_date?: string; end_date?: string }) =>
    apiClient.get<{ workouts: CalendarWorkout[] }>('/api/athletes/calendar', { params }),

  getTodayWorkout: () =>
    apiClient.get<TodayWorkout>('/api/athletes/workouts/today'),

  getWorkout: (workoutId: number) =>
    apiClient.get<TodayWorkout>(`/api/athletes/workouts/${workoutId}`),

  startWorkout: (workoutId: number) =>
    apiClient.post<{ workout_log_id: number; message: string }>(
      `/api/athletes/workouts/${workoutId}/start`
    ),

  logSet: (
    workoutId: number,
    data: {
      exercise_id: number;
      set_number: number;
      weight_used: number;
      reps_completed: number;
      rpe?: number;
      notes?: string;
      was_modified?: boolean;
    }
  ) => apiClient.post(`/api/athletes/workouts/${workoutId}/sets`, data),

  completeWorkout: (workoutId: number, data?: { notes?: string }) =>
    apiClient.post(`/api/athletes/workouts/${workoutId}/complete`, data ?? {}),

  flagWorkout: (workoutId: number, reason: string) =>
    apiClient.post(`/api/athletes/workouts/${workoutId}/flag`, { reason }),

  getProgress: () =>
    apiClient.get<ProgressResponse[]>('/api/athletes/progress'),
};

export const coachApi = {
  getDashboard: () =>
    apiClient.get<DashboardResponse>('/api/coaches/dashboard'),

  getRoster: () =>
    apiClient.get<{ athletes: AthleteWithGroups[] }>('/api/coaches/roster'),

  getAthleteDetail: (athleteId: number) =>
    apiClient.get<AthleteDetail>(`/api/coaches/athletes/${athleteId}`),

  getInviteLink: () =>
    apiClient.post<{ invite_link: string; coach_id: number }>('/api/coaches/invite'),

  createGroup: (data: { name: string; sport?: string }) =>
    apiClient.post('/api/coaches/groups', data),
};

export const programsApi = {
  list: () =>
    apiClient.get<ProgramSummary[]>('/api/programs'),

  get: (id: number) =>
    apiClient.get<any>(`/api/programs/${id}`),

  create: (data: { name: string; description?: string }) =>
    apiClient.post<{ id: number; name: string; description: string | null; created_at: string; workouts: any[] }>(
      '/api/programs',
      data
    ),

  addWorkout: (programId: number, data: { name: string; day_offset?: number }) =>
    apiClient.post<{ id: number; name: string; day_offset: number | null; scheduled_date: string; exercises: any[] }>(
      `/api/programs/${programId}/workouts`,
      data
    ),

  addExercise: (
    workoutId: number,
    data: {
      name: string;
      sets: number;
      reps: number;
      percentage_of_max?: number;
      target_exercise?: string;
      video_url?: string;
      coach_notes?: string;
      order: number;
    }
  ) => apiClient.post(`/api/programs/workouts/${workoutId}/exercises`, data),

  assign: (
    programId: number,
    data: {
      athlete_id?: number;
      group_id?: number;
      subgroup_id?: number;
      start_date: string;
    }
  ) => apiClient.post(`/api/programs/${programId}/assign`, data),
};
