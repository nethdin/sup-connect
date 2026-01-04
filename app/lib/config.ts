// Server-only validation - only runs on server
function validateServerEnv(key: string, defaultValue?: string): string {
    // Skip validation on client-side
    if (typeof window !== 'undefined') {
        return defaultValue || '';
    }

    const value = process.env[key] || defaultValue;

    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }

    return value;
}

// Client-safe validation - works on both client and server
function getEnv(key: string, defaultValue: string): string {
    return process.env[key] || defaultValue;
}

// Server-only config (database, API keys) - only validated on server
export const serverConfig = {
    db: {
        url: validateServerEnv('DATABASE_URL'),
    },
    ai: {
        geminiApiKey: validateServerEnv('GEMINI_API_KEY'),
        geminiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
    },
} as const;

// Auth config - has safe defaults for client-side
export const authConfig = {
    jwtSecret: getEnv('JWT_SECRET', 'your-super-secret-jwt-key'),
    jwtExpiry: getEnv('JWT_EXPIRY', '24h'),
} as const;

// App config - safe for client
export const appConfig = {
    url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
} as const;

// Combined config for backward compatibility
export const config = {
    db: serverConfig.db,
    auth: authConfig,
    ai: serverConfig.ai,
    app: appConfig,
} as const;
