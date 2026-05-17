import { jest } from '@jest/globals';

/// <reference types="jest" />
// Basic test setup
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';
// Provide dummy Cloudinary env vars for tests to avoid config errors
process.env.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'test-cloud';
process.env.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || 'test-key';
process.env.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || 'test-secret';

// Silence express logs in tests
if (typeof jest !== 'undefined') {
	jest.spyOn(console, 'log').mockImplementation(() => {});
	jest.spyOn(console, 'info').mockImplementation(() => {});
	jest.spyOn(console, 'warn').mockImplementation(() => {});
}
