import type {
  ApiError,
  Comment,
  CreateTicketInput,
  Ticket,
  TicketStatus,
  UpdateTicketInput,
  User,
} from '@/types';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = data as ApiError;
    throw new Error(error.errors?.[0]?.message ?? error.message ?? 'Request failed');
  }

  return data as T;
}

export const api = {
  getTickets: (params?: { search?: string; status?: TicketStatus }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    const qs = query.toString();
    return request<Ticket[]>(`/api/tickets${qs ? `?${qs}` : ''}`);
  },

  getTicket: (id: string) => request<Ticket>(`/api/tickets/${id}`),

  createTicket: (input: CreateTicketInput) =>
    request<Ticket>('/api/tickets', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  updateTicket: (id: string, input: UpdateTicketInput) =>
    request<Ticket>(`/api/tickets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  updateTicketStatus: (id: string, status: TicketStatus) =>
    request<Ticket>(`/api/tickets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  addComment: (ticketId: string, message: string) =>
    request<Comment>(`/api/tickets/${ticketId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  getUsers: () => request<User[]>('/api/users'),
};
