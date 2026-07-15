import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { api } from '@/api/client';
import { Badge, priorityBadgeVariant, statusBadgeVariant } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDate, formatStatus } from '@/lib/utils';
import { STATUSES, type TicketStatus } from '@/types';

export default function TicketListPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<TicketStatus | 'ALL'>('ALL');

  const { data: tickets, isLoading, isError, error } = useQuery({
    queryKey: ['tickets', search, status],
    queryFn: () =>
      api.getTickets({
        search: search || undefined,
        status: status === 'ALL' ? undefined : status,
      }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>
        <p className="text-muted-foreground">Search and filter support tickets</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={status} onValueChange={(v) => setStatus(v as TicketStatus | 'ALL')}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {formatStatus(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-slate-200" />
          ))}
        </div>
      )}

      {isError && (
        <Card className="border-destructive">
          <CardContent className="pt-6 text-destructive">
            {(error as Error).message || 'Failed to load tickets'}
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && tickets?.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No tickets found. Try adjusting your filters or create a new ticket.
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {tickets?.map((ticket) => (
          <Link key={ticket.id} to={`/tickets/${ticket.id}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <h2 className="font-semibold text-slate-900">{ticket.title}</h2>
                  <p className="line-clamp-1 text-sm text-muted-foreground">{ticket.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Updated {formatDate(ticket.updatedAt)}
                    {ticket.assignedTo && ` · Assigned to ${ticket.assignedTo.name}`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={statusBadgeVariant(ticket.status)}>
                    {formatStatus(ticket.status)}
                  </Badge>
                  <Badge variant={priorityBadgeVariant(ticket.priority)}>{ticket.priority}</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
