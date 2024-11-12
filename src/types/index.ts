export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: string;
}