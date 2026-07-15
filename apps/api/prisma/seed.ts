import { PrismaClient, Priority, TicketStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.comment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.user.deleteMany();

  const alice = await prisma.user.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      role: 'ADMIN',
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: 'Bob Smith',
      email: 'bob@example.com',
      role: 'AGENT',
    },
  });

  const carol = await prisma.user.create({
    data: {
      name: 'Carol Davis',
      email: 'carol@example.com',
      role: 'AGENT',
    },
  });

  const ticket1 = await prisma.ticket.create({
    data: {
      title: 'Cannot login to dashboard',
      description: 'User reports 500 error when accessing the main dashboard after password reset.',
      priority: Priority.HIGH,
      status: TicketStatus.OPEN,
      createdById: alice.id,
      assignedToId: bob.id,
    },
  });

  const ticket2 = await prisma.ticket.create({
    data: {
      title: 'Email notifications delayed',
      description: 'Support emails are arriving 2+ hours late for premium customers.',
      priority: Priority.MEDIUM,
      status: TicketStatus.IN_PROGRESS,
      createdById: bob.id,
      assignedToId: carol.id,
    },
  });

  const ticket3 = await prisma.ticket.create({
    data: {
      title: 'Export CSV feature request',
      description: 'Customer wants to export ticket history as CSV from the admin panel.',
      priority: Priority.LOW,
      status: TicketStatus.RESOLVED,
      createdById: carol.id,
      assignedToId: bob.id,
    },
  });

  await prisma.ticket.create({
    data: {
      title: 'Duplicate charge on invoice',
      description: 'Billing issue resolved and refund processed.',
      priority: Priority.URGENT,
      status: TicketStatus.CLOSED,
      createdById: alice.id,
      assignedToId: carol.id,
    },
  });

  await prisma.ticket.create({
    data: {
      title: 'Outdated browser support',
      description: 'Decided not to support IE11; closing as wont-fix.',
      priority: Priority.LOW,
      status: TicketStatus.CANCELLED,
      createdById: bob.id,
    },
  });

  await prisma.comment.create({
    data: {
      ticketId: ticket1.id,
      message: 'Reproduced locally. Checking auth service logs.',
      createdById: bob.id,
    },
  });

  await prisma.comment.create({
    data: {
      ticketId: ticket2.id,
      message: 'SMTP queue backlog identified. Scaling workers.',
      createdById: carol.id,
    },
  });

  await prisma.comment.create({
    data: {
      ticketId: ticket3.id,
      message: 'CSV export implemented in v2.1. Awaiting customer confirmation.',
      createdById: bob.id,
    },
  });

  console.log('Seed completed:', { users: 3, tickets: 5, comments: 3 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
