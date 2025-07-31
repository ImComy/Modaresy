import {
    createAccount,  
    login,
    getProfile, updateProfile, getStats
} from '../server/controllers/users.js';
import {
    calculateUserStats
} from '../server/events/user_stats.js';
import { it, describe, expect } from 'vitest'
let studentId, teacherId;
let token;

describe('User Authentication Tests', () => {
    it('should create a student account successfully', async () => {
        const req = {
            name: 'John Doe',
            type: 'Student',
            email: "testingEXMPL@modaresy.me",
            phone_number: '011111111111',
            password: "mySecretPassword123",
            governate: "Ismailia",
            district: "El-shiekh zayed",
            education_system: "National",
            grade: "Secondary 3",
            sector: "Mathematics",
            language: "Arabic"
        }
        const res = await createAccount(req);
        if (res && res.id) {
            studentId = res.id; // Store the student ID for later use
        }
        expect(res).toHaveProperty('id');
        expect(res.email).toBe(req.email);
    })

    it('should create a teacher account successfully', async () => {
        const req = {
            name: 'Jane Smith',
            type: 'Teacher',
            email: "teacherEXMPL@modaresy.me",
            phone_number: '022222222222',
            password: "teacherPassword456",
            experience_years: 4,
            grades: ["Secondary 1", "Secondary 2"],
            sectors: ["Mathematics", "Physics"],
            languages: ["English", "Arabic"],
            governate: "Ismailia",
            district: "El-shiekh zayed",
            education_system: "National",
        }
        const res = await createAccount(req);
        if (res && res.id) {
            teacherId = res.id; // Store the student ID for later use
        }

        expect(res).toHaveProperty('id');
        expect(res.email).toBe(req.email);
    })

    it('student should login successfully with valid credentials', async () => {
        const email = "testingEXMPL@modaresy.me"
        const password = "mySecretPassword123"
        const res = await login(req);
        if (res && res.token) {
            token = res.token;
        }
        expect(res).toHaveProperty('token')
    })
    it('teacher should login successfully with valid credentials', async () => {
        const email = "teacherEXMPL@modaresy.me"
        const password = "teacherPassword456"
        const res = await login(req);
        expect(res).toHaveProperty('token')
    })

    it('should fail to login with invalid credentials', async () => {
    const req = { email: "wrong@modaresy.me", password: "wrongPassword" }
    let res;
    try {
        res = await login(req);
    } catch (err) {
        res = err;
    }
    expect(res).toHaveProperty('error', "Login failed.");
    expect(res).toHaveProperty('details');
    })

    it('should retrieve user stats successfully', async () => {
        const stats = await calculateUserStats();
        expect(stats).toHaveProperty('studentCount');
        expect(stats).toHaveProperty('teacherCount');
        expect(stats).toHaveProperty('totalDistricts');
    })
})
