import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const { name, email, password, role } = await request.json();
        if (!name || !email || !password) {
            return new NextResponse(JSON.stringify({ error: 'Nome, email e senha são obrigatórios' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        // Basic uniqueness check
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return new NextResponse(JSON.stringify({ error: 'Email já cadastrado' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
        }

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password, // NOTE: plaintext for prototype; replace with hashing in production
                role: role ?? 'USER',
            },
        });

        const { password: _p, ...safe } = newUser as any;
        return new NextResponse(JSON.stringify(safe), { status: 201, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        console.error(error);
        return new NextResponse(JSON.stringify({ error: 'Erro ao cadastrar usuário' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
