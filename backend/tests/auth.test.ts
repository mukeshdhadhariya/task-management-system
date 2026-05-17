import request from 'supertest';
import bcrypt from 'bcrypt';

describe('Auth - register & login', () => {
  let app: any;

  const createMockPrisma = () => {
    const users: any[] = [];

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
    } as any;
  };

  beforeEach(async () => {
    jest.resetModules();
    const mockPrisma = createMockPrisma();
    jest.doMock('../src/config/prisma', () => ({ prisma: mockPrisma }));
    const mod = await import('../src/app');
    app = mod.default;
  });

  it('registers a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'alice@example.com', password: 'password123' })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('alice@example.com');
  });

  it('prevents duplicate registration', async () => {
    // Recreate modules so mock can be adjusted
    jest.resetModules();
    const mockPrisma = createMockPrisma();
    // seed existing user
    await mockPrisma.user.create({ data: { email: 'bob@example.com', password: 'x' } });
    jest.doMock('../src/config/prisma', () => ({ prisma: mockPrisma }));
    const mod = await import('../src/app');
    const localApp = mod.default;

    const res = await request(localApp)
      .post('/api/auth/register')
      .send({ email: 'bob@example.com', password: 'password123' })
      .expect(409);

    // Without a global error formatter the body may be empty; assert status only
    expect(res.status).toBe(409);
  });

  it('logs in an existing user and sets cookie', async () => {
    jest.resetModules();
    const mockPrisma = createMockPrisma();
    // create hashed password
    const hashed = await bcrypt.hash('secret', 10);
    await mockPrisma.user.create({ data: { email: 'carol@example.com', password: hashed, id: 'u1' } });
    jest.doMock('../src/config/prisma', () => ({ prisma: mockPrisma }));
    const mod = await import('../src/app');
    const localApp = mod.default;

    const res = await request(localApp)
      .post('/api/auth/login')
      .send({ email: 'carol@example.com', password: 'secret' })
      .expect(200);

    expect(res.body).toHaveProperty('token');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('rejects invalid login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'noone@example.com', password: 'nopass' })
      .expect(401);

    expect(res.status).toBe(401);
  });
});
