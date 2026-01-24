import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'admin' | 'faculty' | 'viewer';

export interface IUser extends Document {
    email: string;
    password?: string;
    name: string;
    role: UserRole;
    branches?: string[]; // Code of branches this user can access (empty for all/admin)
    active: boolean;
    last_login?: Date;
}

const UserSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true }, // Hashed
    name: { type: String, required: true },
    role: {
        type: String,
        enum: ['admin', 'faculty', 'viewer'],
        default: 'viewer',
        required: true
    },
    branches: [{ type: String }],
    active: { type: Boolean, default: true },
    last_login: { type: Date }
}, {
    timestamps: true
});

// Avoid re-compiling model in Next.js hot reload
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
