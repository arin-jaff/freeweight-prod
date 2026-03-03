import apiClient from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  user_type: 'athlete' | 'coach';
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    user_type: 'athlete' | 'coach';
  };
}

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>('/auth/login', data),

  signup: (data: SignupRequest) =>
    apiClient.post<AuthResponse>('/auth/signup', data),

  me: () =>
    apiClient.get<AuthResponse['user']>('/auth/me'),
};

export const athleteApi = {
  getWorkouts: () =>
    apiClient.get('/athlete/workouts'),

  getWorkoutById: (id: string) =>
    apiClient.get(`/athlete/workouts/${id}`),
};

export const coachApi = {
  getRoster: () =>
    apiClient.get('/coach/roster'),

  getPrograms: () =>
    apiClient.get('/coach/programs'),
};
