import {
    createAccount  
} from '../server/controllers/users.js';
import authenticationService from '../server/services/authentication.service.js';
import {
    getWishlist,
    createWishlist,
    hasWishlist
} from '../server/services/student.service.js';
import { it, describe, expect } from 'vitest'

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
            governate: "Cairo",
            district: "Nasr City",
            education_system: "National",
            specialization: "Physics",
            language: "English"
        }
        const res = await authService.signup(req)
        expect(res).toHaveProperty('id')
        expect(res.email).toBe(req.email)
    })

    it('should create a student wishlist successfully if student doesn\'t have', async () => {
        const studentId = 'student-id-1'
        const has = await hasWishlist(studentId)
        if (!has) {
            const wishlist = await createWishlist(studentId)
            expect(wishlist).toHaveProperty('studentId', studentId)
        } else {
            expect(has).toBe(false)
        }
    })

    it('shouldn\'t create a student wishlist successfully if student already have', async () => {
        const studentId = 'student-id-2'
        await createWishlist(studentId)
        await expect(createWishlist(studentId)).rejects.toThrow()
    })

    it('should login successfully with valid credentials', async () => {
        const email = "testingEXMPL@modaresy.me"
        const password = "mySecretPassword123"
        const res = await authService.login(email, password)
        expect(res).toHaveProperty('token')
    })

    it('should fail to login with invalid credentials', async () => {
        const email = "wrong@modaresy.me"
        const password = "wrongPassword"
        await expect(authService.login(email, password)).rejects.toThrow()
    })

    it('should retrieve user profile data successfully', async () => {
        const email = "testingEXMPL@modaresy.me"
        const password = "mySecretPassword123"
        await authService.login(email, password)
        const profile = await authService.getProfile()
        expect(profile).toHaveProperty('email', email)
    })

    it('should update user profile data successfully', async () => {
        const email = "testingEXMPL@modaresy.me"
        const password = "mySecretPassword123"
        await authService.login(email, password)
        const update = { name: "John Updated" }
        const res = await authService.updateProfile(update)
        expect(res).toHaveProperty('name', "John Updated")
    })

    it('should retrieve user stats successfully', async () => {
        const email = "testingEXMPL@modaresy.me"
        const password = "mySecretPassword123"
        await authService.login(email, password)
        const stats = await authService.getStats()
        expect(stats).toHaveProperty('courses')
    })

    it('shouldn\'t create a student wishlist successfully if student already have', async () => {

    })
})
