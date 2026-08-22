// //import { PrismaClient } from '@prisma/client';
// import { PrismaClient } from '../generated/prisma/client.ts';
// import bcrypt from 'bcrypt';

// const prisma = new PrismaClient();

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.ts';
import 'dotenv/config';
import bcrypt from 'bcrypt';

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
    adapter,
});


async function main() {
    // Clear existing data
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const pavelPassword = await bcrypt.hash('pavel123', 10);
    const mitkoPassword = await bcrypt.hash('mitko123', 10);

    // Create admin - no relations
    const admin = await prisma.user.create({
        data: {
            username: 'admin',
            email: 'admin@abv.bg',
            password: adminPassword,
            role: 'admin',
        },
    });

    // Create Pavel with 2 posts
    const pavel = await prisma.user.create({
        data: {
            username: 'pavel',
            email: 'pavel@abv.bg',
            password: pavelPassword,
            role: 'user',

            posts: {
                create: [
                    {
                        title: 'BMW 320d',
                        imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e',
                        category: 'Vehicles',
                        price: 12500,
                        description:
                            'Well-maintained BMW 320d in excellent condition.',
                    },
                    {
                        title: 'Gaming PC',
                        imageUrl: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c',
                        category: 'Electronics',
                        price: 1800,
                        description:
                            'Powerful gaming PC suitable for modern games.',
                    },
                ],
            },
        },
    });

    // Create Mitko with 2 posts
    const mitko = await prisma.user.create({
        data: {
            username: 'mitko',
            email: 'mitko@abv.bg',
            password: mitkoPassword,
            role: 'user',

            posts: {
                create: [
                    {
                        title: 'Modern Sofa',
                        imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc',
                        category: 'Furniture',
                        price: 650,
                        description:
                            'Comfortable modern sofa in very good condition.',
                    },
                    {
                        title: 'Winter Jacket',
                        imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0mDbNr19gwH8yJQ93Z4VQLPJ7FHZJ4CES-GZam3ZVfg&s=10',
                        category: 'Clothes',
                        price: 120,
                        description:
                            'Warm winter jacket, lightly used and well preserved.',
                    },
                ],
            },
        },
    });

    console.log('Database seeded successfully!');
    console.log(`Admin: ${admin.email}`);
    console.log(`Pavel: ${pavel.email}`);
    console.log(`Mitko: ${mitko.email}`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });