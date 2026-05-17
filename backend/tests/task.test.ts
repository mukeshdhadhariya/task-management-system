import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';

describe('Tasks - create/get/update/delete', () => {
  let app: any;

  const createMockPrisma = () => {
    const users: any[] = [];
    const tasks: any[] = [];

    return {
      user: {
        findUnique: jest.fn(async ({ where }: any) => {
          if (where.email) return users.find((u) => u.email === where.email) ?? null;
          if (where.id) return users.find((u) => u.id === where.id) ?? null;
          return null;
        }),
        create: jest.fn(async ({ data }: any) => {
          const user = { id: data.id ?? `user-${users.length + 1}`, ...data, role: data.role ?? 'USER' };
          users.push(user);
          return user;
        }),
      },
      task: {
        create: jest.fn(async ({ data }: any) => {
          const t = { id: `task-${tasks.length + 1}`, ...data, createdAt: new Date(), attachments: [] };
          tasks.push(t);
          return t;
        }),
        findMany: jest.fn(async ({ where }: any) => {
          // simple filter by assignedToId
          if (where && where.assignedToId) return tasks.filter((t) => t.assignedToId === where.assignedToId);
          return tasks;
        }),
        count: jest.fn(async ({ where }: any) => {
          if (where && where.assignedToId) return tasks.filter((t) => t.assignedToId === where.assignedToId).length;
          return tasks.length;
        }),
        findUnique: jest.fn(async ({ where }: any) => tasks.find((t) => t.id === where.id) ?? null),
        update: jest.fn(async ({ where, data }: any) => {
          const idx = tasks.findIndex((t) => t.id === where.id);
          if (idx === -1) return null;
          tasks[idx] = { ...tasks[idx], ...data };
          return tasks[idx];
        }),
        delete: jest.fn(async ({ where }: any) => {
          const idx = tasks.findIndex((t) => t.id === where.id);
          if (idx === -1) return null;
          const [del] = tasks.splice(idx, 1);
          return del;
        }),
      },
    } as any;
  };

  beforeEach(async () => {
    jest.resetModules();
    const mockPrisma = createMockPrisma();
    // seed a user
    await mockPrisma.user.create({ data: { id: 'u1', email: 'owner@example.com', password: 'x' } });
    await mockPrisma.user.create({ data: { id: 'u2', email: 'other@example.com', password: 'x' } });
    jest.doMock('../src/config/prisma', () => ({ prisma: mockPrisma }));
    const mod = await import('../src/app');
    app = mod.default;
  });

  it('creates a task for authenticated user', async () => {
    const token = jwt.sign({ id: 'u1', role: 'USER' }, process.env.JWT_SECRET!);

    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'New Task', description: 'desc body', status: 'TODO', priority: 'LOW', dueDate: new Date().toISOString(), assignedToId: 'u1' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('New Task');
  });

  it('returns tasks list for user', async () => {
    const token = jwt.sign({ id: 'u1', role: 'USER' }, process.env.JWT_SECRET!);
    // create two tasks
    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'T1', description: 'desc body', status: 'TODO', priority: 'LOW', dueDate: new Date().toISOString(), assignedToId: 'u1' });

    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toHaveProperty('total');
  });

  it('allows owner to update task', async () => {
    const token = jwt.sign({ id: 'u1', role: 'USER' }, process.env.JWT_SECRET!);
    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'ToUpdate', description: 'desc body', status: 'TODO', priority: 'LOW', dueDate: new Date().toISOString(), assignedToId: 'u1' });

    const taskId = createRes.body.data.id;

    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated' })
      .expect(200);

    expect(res.body.data.title).toBe('Updated');
  });

  it('allows owner to delete task', async () => {
    const token = jwt.sign({ id: 'u1', role: 'USER' }, process.env.JWT_SECRET!);
    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'ToDelete', description: 'desc body', status: 'TODO', priority: 'LOW', dueDate: new Date().toISOString(), assignedToId: 'u1' });

    const taskId = createRes.body.data.id;

    await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
