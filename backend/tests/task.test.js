"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
describe('Tasks - create/get/update/delete', () => {
    let app;
    const createMockPrisma = () => {
        const users = [];
        const tasks = [];
        return {
            user: {
                findUnique: jest.fn(async ({ where }) => {
                    if (where.email)
                        return users.find((u) => u.email === where.email) ?? null;
                    if (where.id)
                        return users.find((u) => u.id === where.id) ?? null;
                    return null;
                }),
                create: jest.fn(async ({ data }) => {
                    const user = { id: data.id ?? `user-${users.length + 1}`, ...data, role: data.role ?? 'USER' };
                    users.push(user);
                    return user;
                }),
            },
            task: {
                create: jest.fn(async ({ data }) => {
                    const t = { id: `task-${tasks.length + 1}`, ...data, createdAt: new Date(), attachments: [] };
                    tasks.push(t);
                    return t;
                }),
                findMany: jest.fn(async ({ where }) => {
                    // simple filter by assignedToId
                    if (where && where.assignedToId)
                        return tasks.filter((t) => t.assignedToId === where.assignedToId);
                    return tasks;
                }),
                count: jest.fn(async ({ where }) => {
                    if (where && where.assignedToId)
                        return tasks.filter((t) => t.assignedToId === where.assignedToId).length;
                    return tasks.length;
                }),
                findUnique: jest.fn(async ({ where }) => tasks.find((t) => t.id === where.id) ?? null),
                update: jest.fn(async ({ where, data }) => {
                    const idx = tasks.findIndex((t) => t.id === where.id);
                    if (idx === -1)
                        return null;
                    tasks[idx] = { ...tasks[idx], ...data };
                    return tasks[idx];
                }),
                delete: jest.fn(async ({ where }) => {
                    const idx = tasks.findIndex((t) => t.id === where.id);
                    if (idx === -1)
                        return null;
                    const [del] = tasks.splice(idx, 1);
                    return del;
                }),
            },
        };
    };
    beforeEach(async () => {
        jest.resetModules();
        const mockPrisma = createMockPrisma();
        // seed a user
        await mockPrisma.user.create({ data: { id: 'u1', email: 'owner@example.com', password: 'x' } });
        await mockPrisma.user.create({ data: { id: 'u2', email: 'other@example.com', password: 'x' } });
        jest.doMock('../src/config/prisma', () => ({ prisma: mockPrisma }));
        const mod = await Promise.resolve().then(() => __importStar(require('../src/app')));
        app = mod.default;
    });
    it('creates a task for authenticated user', async () => {
        const token = jsonwebtoken_1.default.sign({ id: 'u1', role: 'USER' }, process.env.JWT_SECRET);
        const res = await (0, supertest_1.default)(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'New Task', description: 'desc body', status: 'TODO', priority: 'LOW', dueDate: new Date().toISOString(), assignedToId: 'u1' })
            .expect(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.title).toBe('New Task');
    });
    it('returns tasks list for user', async () => {
        const token = jsonwebtoken_1.default.sign({ id: 'u1', role: 'USER' }, process.env.JWT_SECRET);
        // create two tasks
        await (0, supertest_1.default)(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'T1', description: 'desc body', status: 'TODO', priority: 'LOW', dueDate: new Date().toISOString(), assignedToId: 'u1' });
        const res = await (0, supertest_1.default)(app)
            .get('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.meta).toHaveProperty('total');
    });
    it('allows owner to update task', async () => {
        const token = jsonwebtoken_1.default.sign({ id: 'u1', role: 'USER' }, process.env.JWT_SECRET);
        const createRes = await (0, supertest_1.default)(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'ToUpdate', description: 'desc body', status: 'TODO', priority: 'LOW', dueDate: new Date().toISOString(), assignedToId: 'u1' });
        const taskId = createRes.body.data.id;
        const res = await (0, supertest_1.default)(app)
            .patch(`/api/tasks/${taskId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Updated' })
            .expect(200);
        expect(res.body.data.title).toBe('Updated');
    });
    it('allows owner to delete task', async () => {
        const token = jsonwebtoken_1.default.sign({ id: 'u1', role: 'USER' }, process.env.JWT_SECRET);
        const createRes = await (0, supertest_1.default)(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'ToDelete', description: 'desc body', status: 'TODO', priority: 'LOW', dueDate: new Date().toISOString(), assignedToId: 'u1' });
        const taskId = createRes.body.data.id;
        await (0, supertest_1.default)(app)
            .delete(`/api/tasks/${taskId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
    });
});
