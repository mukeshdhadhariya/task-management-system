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
const bcrypt_1 = __importDefault(require("bcrypt"));
describe('Auth - register & login', () => {
    let app;
    const createMockPrisma = () => {
        const users = [];
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
        };
    };
    beforeEach(async () => {
        jest.resetModules();
        const mockPrisma = createMockPrisma();
        jest.doMock('../src/config/prisma', () => ({ prisma: mockPrisma }));
        const mod = await Promise.resolve().then(() => __importStar(require('../src/app')));
        app = mod.default;
    });
    it('registers a new user', async () => {
        const res = await (0, supertest_1.default)(app)
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
        const mod = await Promise.resolve().then(() => __importStar(require('../src/app')));
        const localApp = mod.default;
        const res = await (0, supertest_1.default)(localApp)
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
        const hashed = await bcrypt_1.default.hash('secret', 10);
        await mockPrisma.user.create({ data: { email: 'carol@example.com', password: hashed, id: 'u1' } });
        jest.doMock('../src/config/prisma', () => ({ prisma: mockPrisma }));
        const mod = await Promise.resolve().then(() => __importStar(require('../src/app')));
        const localApp = mod.default;
        const res = await (0, supertest_1.default)(localApp)
            .post('/api/auth/login')
            .send({ email: 'carol@example.com', password: 'secret' })
            .expect(200);
        expect(res.body).toHaveProperty('token');
        expect(res.headers['set-cookie']).toBeDefined();
    });
    it('rejects invalid login', async () => {
        const res = await (0, supertest_1.default)(app)
            .post('/api/auth/login')
            .send({ email: 'noone@example.com', password: 'nopass' })
            .expect(401);
        expect(res.status).toBe(401);
    });
});
