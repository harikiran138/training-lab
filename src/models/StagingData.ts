import mongoose, { Schema, Document } from 'mongoose';

export interface IStagingData extends Document {
    type: 'ATTENDANCE' | 'TEST_RESULT';
    status: 'DRAFT' | 'PROCESSED' | 'REJECTED';
    imageUrl: string;
    branch_code?: string;
    section?: string;
    week_no?: number;
    semester?: string;
    rawAiOutput: any;
    structuredData: {
        data: Map<string, any>;
        confidence: Map<string, number>;
        userVerified: boolean;
    }[];
    createdAt: Date;
}

const StagingDataSchema: Schema = new Schema({
    type: {
        type: String,
        enum: ['ATTENDANCE', 'TEST_RESULT'],
        required: true
    },
    status: {
        type: String,
        enum: ['DRAFT', 'PROCESSED', 'REJECTED'],
        default: 'DRAFT'
    },
    imageUrl: { type: String, required: true },
    branch_code: { type: String },
    section: { type: String },
    week_no: { type: Number },
    semester: { type: String },
    rawAiOutput: { type: Schema.Types.Mixed }, // Flexible for different AI responses
    structuredData: [{
        data: { type: Map, of: Schema.Types.Mixed },
        confidence: { type: Map, of: Number },
        userVerified: { type: Boolean, default: false }
    }],
}, { timestamps: true });

export default mongoose.models.StagingData || mongoose.model<IStagingData>('StagingData', StagingDataSchema);
