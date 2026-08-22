import { prisma } from '../prisma.js';
import bcrypt from 'bcrypt';

export async function register(userData){
    const result = await prisma.user.create({
        data: userData
    });

    return result;
}

export async function login(email, password){
    //console.log( email)
    const user = await prisma.user.findUnique({
        where: { email }
    });

    if(!user){
        throw new Error('User not found');
    }

    

    const isValid = await bcrypt.compare(password, user.password);

    if(!isValid){
        throw new Error('Invalid email or password');
    }

    return user;
}

export function remove(userId) {
    return prisma.user.delete({
        where: {
            id: userId,
        },
    });
}

export async function getUserNameById(userId) {
    const result = await prisma.user.findUnique({
        where: {
            id: userId
        },
    });

    return result;
}