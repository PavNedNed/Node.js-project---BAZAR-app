import * as z from 'zod';
import bcrypt from 'bcrypt';

export const createUserSchema = z.object({
    username: z.string()
        .min(3, { message: "Username must be at least 3 characters long" })
        .trim(),
    email: z.string()
        .email({ message: "Invalid email address" })
        .min(10, { message: "Email must be at least 10 characters long" })
        .trim(),
    password: z.string()
        .min(6, { message: "Password must be at least 6 characters long" }),
    rePassword: z.string()
}).refine((data) => data.password === data.rePassword, {
    message: "Passwords do not match",
    path: ["rePassword"],
}).transform(async ({rePassword, ...data}) => {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return {
        ...data,
        password: hashedPassword,
    }
})

export const loginUserSchema = z.object({
    email: z.string()
        .email({ message: "Invalid email address" })
        .trim(),
    password: z.string()
        .min(1, { message: "Password must be at least 1 characters long" }),
})