import { prisma } from '../prisma.js';

export async function create(postData, userId) {
    const result = await prisma.post.create({
        data: {
            ...postData,
            authorId: userId,
        },
    });

    // console.log("result", result);

    return result;
}

export async function getAll() {
    const posts = await prisma.post.findMany({
        include: {
            followers: true,
            author: true,
        },
    });

    return posts;
}

export async function getLatest() {
    const posts = await prisma.post.findMany({
        orderBy: {
            createdAt: 'desc',
        },
        take: 3,
    });

    return posts;
}

export async function getById(postId) {
    const result = await prisma.post.findUnique({
        where: {
            id: postId
        },
        include: {
            followers: true,
            author: true,
        },
    });

    return result;
}

export async function getByUser(userId) {
    const result = await prisma.post.findMany({
        where: {
            authorId: userId,
        },
        include: {
            followers: true,
            author: true,
        },
    });

    return result;
}

export async function follow(postId, userId) {
    // MNOGO VAJNO!
    const post = await prisma.post.update({
        where: {
            id: postId,
        },
        data: {
            followers: {
                connect: { id: userId },
            },
        },
    });

    if (!post) {
        throw new Error('Post not found');
    }
}
export async function unfollow(postId, userId) {
    const post = await prisma.post.update({
        where: {
            id: postId,
        },
        data: {
            followers: {
                disconnect: { id: userId },
            },
        },
    });

    if (!post) {
        throw new Error('Post not found');
    }
}

export function remove(postId, userId, username) {
    return prisma.post.delete({
        where: {
            id: postId,
            ...(username !== "admin" && {
                authorId: userId,
            }),
        },
    });
}

export function update(postId, postData, userId) {
    // zapomni ownerId, a ne userId
    return prisma.post.update({
        where: {
            id: postId,
            authorId: userId,
        },
        data: {
            ...postData,
        },
    });
}

export async function loadProfiles() {
    const result = await prisma.user.findMany({
        include: {
            _count: {
                select: {
                    posts: true,
                },
            },
        },
    });

    // console.log(result);

    return result;
}
////////////// REST
export async function getLastPosts() {
    const posts = await prisma.post.findMany({
        orderBy: {
            createdAt: 'desc',
        },
        take: 3,
        select: {
            id: true,
            title: true,
            imageUrl: true,
            category: true,
            price: true,
            description: true,
            createdAt: true,
            author: {
                select: {
                    id: true,
                    username: true,
                },
            },
            followers: {
                select: {
                    id: true,
                },
            },
        },
    });

    const result = posts.map(post => ({
        id: post.id,
        title: post.title,
        imageUrl: post.imageUrl,
        category: post.category,
        price: Number(post.price),
        description: post.description,
        createdAt: post.createdAt,
        author: post.author,
        followersCount: post.followers.length,
    }));

    return result;
}