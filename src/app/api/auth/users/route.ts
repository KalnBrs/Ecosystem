import z from 'zod';
import bcrypt from "bcrypt";

import { NextResponse } from 'next/server';
import { User } from '@/generated/prisma';

import signUp from '@/services/AuthService';

/**
 * POST /api/auth/users
 *
 * Creates a new user account. Validates the request body, hashes the
 * password, and delegates persistence to {@link signUp}.
 *
 * @param request - The incoming HTTP request containing `name`, `email`,
 *   and `password` fields as JSON.
 * @returns `201` with the sanitised user object on success; `400` for
 *   invalid input; `409` if the name or email is already taken; `500`
 *   on unexpected errors.
 */
export async function POST(request: Request) {
  try {
    const parsed = z
      .object({ email: z.email(), password: z.string().min(6).max(255), name: z.string().min(4).max(255) })
      .safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid input' }, { status: 400 })
    }

    const { name, email, password } = parsed.data;
    
    const user = { 
      id: crypto.randomUUID(),
      name: name, 
      email: email, 
      passwordHash: await bcrypt.hash(password, 10),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    const retUser: User | null = await signUp(user)

    if (retUser == null) {
      return NextResponse.json(
        {message: "User already exists with this name or email"},
        {status: 409}
      )
    }

    const sanitedUser = {
      id: retUser.id,
      email: retUser.email,
      name: retUser.name,
      createdAt: retUser.createdAt,
      updatedAt: retUser.updatedAt
    }
    
    return NextResponse.json(
      {message: 'User created successfully', data: sanitedUser},
      {status: 201}
    )
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json(
        {message: 'An error occurred while signing up: ' + error.message},
        {status: 500}
      )
    } else {
      return NextResponse.json(
        {message: 'An unexpected error occurred' + error},
        {status: 500}
      )
    }
    
  }
}