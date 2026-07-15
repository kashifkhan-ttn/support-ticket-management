import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/api/client';
import { Badge, priorityBadgeVariant, statusBadgeVariant } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { formatDate, formatStatus } from '@/lib/utils';
import { PRIORITIES, STATUS_TRANSITIONS, type TicketStatus } from '@/types';

const editSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  assignedToId: z.string().nullable(),
});

const commentSchema = z.object({
  message: z.string().min(1, 'Comment cannot be empty'),
});

type EditForm = z.infer<typeof editSchema>;
type CommentForm = z.infer<typeof commentSchema>;

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const { data: ticket, isLoading, isError, error } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => api.getTicket(id!),
    enabled: !!id,
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: api.getUsers,
  });

  const editForm = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    values: ticket
      ? {
          title: ticket.title,
          description: ticket.description,
          priority: ticket.priority,
          assignedToId: ticket.assignedToId,
        }
      : undefined,
  });

  const commentForm = useForm<CommentForm>({
    resolver: zodResolver(commentSchema),
    defaultValues: { message: '' },
  });

  const updateMutation = useMutation({
    mutationFn: (data: EditForm) => api.updateTicket(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setIsEditing(false);
      toast({ title: 'Ticket updated' });
    },
    onError: (err: Error) => {
      toast({ title: 'Update failed', description: err.message, variant: 'destructive' });
    },
  });

  const statusMutation = useMutation({
    mutationFn: (status: TicketStatus) => api.updateTicketStatus(id!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast({ title: 'Status updated' });
    },
    onError: (err: Error) => {
      toast({ title: 'Invalid transition', description: err.message, variant: 'destructive' });
    },
  });

  const commentMutation = useMutation({
    mutationFn: (message: string) => api.addComment(id!, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      commentForm.reset();
      toast({ title: 'Comment added' });
    },
    onError: (err: Error) => {
      toast({ title: 'Failed to add comment', description: err.message, variant: 'destructive' });
    },
  });

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-lg bg-slate-200" />;
  }

  if (isError || !ticket) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive">{(error as Error)?.message || 'Ticket not found'}</p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/">Back to list</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const nextStatuses = STATUS_TRANSITIONS[ticket.status];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div className="flex flex-wrap gap-2">
          <Badge variant={statusBadgeVariant(ticket.status)}>{formatStatus(ticket.status)}</Badge>
          <Badge variant={priorityBadgeVariant(ticket.priority)}>{ticket.priority}</Badge>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-2xl">{ticket.title}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Created by {ticket.createdBy.name} · {formatDate(ticket.createdAt)}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsEditing((v) => !v)}>
            {isEditing ? 'Cancel edit' : 'Edit'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <form
              onSubmit={editForm.handleSubmit((data) => updateMutation.mutate(data))}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Title</Label>
                <Input {...editForm.register('title')} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea rows={4} {...editForm.register('description')} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={editForm.watch('priority')}
                    onValueChange={(v) =>
                      editForm.setValue('priority', v as EditForm['priority'])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Assignee</Label>
                  <Select
                    value={editForm.watch('assignedToId') ?? 'none'}
                    onValueChange={(v) =>
                      editForm.setValue('assignedToId', v === 'none' ? null : v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Unassigned</SelectItem>
                      {users?.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" disabled={updateMutation.isPending}>
                Save changes
              </Button>
            </form>
          ) : (
            <>
              <p className="whitespace-pre-wrap text-slate-700">{ticket.description}</p>
              <p className="text-sm text-muted-foreground">
                Assignee: {ticket.assignedTo?.name ?? 'Unassigned'}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status actions</CardTitle>
        </CardHeader>
        <CardContent>
          {nextStatuses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No further status transitions available.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {nextStatuses.map((status) => (
                <Button
                  key={status}
                  variant="secondary"
                  size="sm"
                  disabled={statusMutation.isPending}
                  onClick={() => statusMutation.mutate(status)}
                >
                  Move to {formatStatus(status)}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Comments ({ticket.comments?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {ticket.comments?.length === 0 && (
              <p className="text-sm text-muted-foreground">No comments yet.</p>
            )}
            {ticket.comments?.map((comment) => (
              <div key={comment.id} className="rounded-md border bg-slate-50 p-3">
                <p className="text-sm text-slate-800">{comment.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {comment.createdBy.name} · {formatDate(comment.createdAt)}
                </p>
              </div>
            ))}
          </div>

          <form
            onSubmit={commentForm.handleSubmit((data) => commentMutation.mutate(data.message))}
            className="space-y-2"
          >
            <Label htmlFor="comment">Add comment</Label>
            <Textarea id="comment" rows={3} {...commentForm.register('message')} />
            {commentForm.formState.errors.message && (
              <p className="text-sm text-destructive">
                {commentForm.formState.errors.message.message}
              </p>
            )}
            <Button type="submit" size="sm" disabled={commentMutation.isPending}>
              Post comment
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
