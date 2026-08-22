import * as z from 'zod';

export const createPostSchema = z.object({
    title: z
        .string()
        .trim()
        .min(3, 'Title must be at least 3 characters long.'),

    imageUrl: z
        .string()
        .url('Image URL must be a valid URL.')
        .refine(
            (url) => url.startsWith('http://') || url.startsWith('https://'),
            'Image URL must start with http:// or https://.'
        ),

    category: z.enum([
        'Vehicles',
        'Electronics',
        'Furniture',
        'Clothes',
        'Other',
    ]),

    price: z.coerce
        .number()
        .positive('Price must be a positive number.'),

    description: z
        .string()
        .trim()
        .min(10, 'Description must be at least 10 characters long.')
        .max(500, 'Description must be at most 500 characters long.'),
});
