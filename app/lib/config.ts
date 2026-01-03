function validateEnv(key: string, defaultValue?: string): string {
    const value = process.env[key] || defaultValue;

    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }

    return value;
}

export const config = {
    db: {
        url: validateEnv('DATABASE_URL'),
    },
    auth: {
        jwtSecret: validateEnv('JWT_SECRET', 'your-super-secret-jwt-key'), // Warning: Fallback for dev only
        jwtExpiry: validateEnv('JWT_EXPIRY', '24h'),
    },
    ai: {
        geminiApiKey: validateEnv('GEMINI_API_KEY'),
        geminiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
    },
    app: {
        url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    },
} as const;
