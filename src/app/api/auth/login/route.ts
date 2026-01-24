import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import { generateToken, hashPassword, setSession, verifyPassword } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { logAction } from '@/services/audit';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
        }

        // Temporary: Create initial admin if no users exist
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            const hashedPassword = await hashPassword(password);
            const admin = await User.create({
                email,
                password: hashedPassword,
                name: 'Admin User',
                role: 'admin',
                branches: []
            });
            await logAction(admin._id, 'SYSTEM_INIT', 'User', admin._id.toString(), { msg: 'First admin created' });
        }

        const user = await User.findOne({ email });

        if (!user || !(await verifyPassword(password, user.password!))) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        if (!user.active) {
            return NextResponse.json({ error: 'Account disabled' }, { status: 403 });
        }

        // Generate token
        const token = generateToken({
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            name: user.name
        });

        // Set cookie
        await setSession(token);

        // Update last login
        user.last_login = new Date();
        await user.save();

        await logAction(user._id, 'LOGIN', 'User', user._id.toString());

        return NextResponse.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
