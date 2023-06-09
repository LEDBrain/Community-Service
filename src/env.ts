import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
    isServer: typeof window === 'undefined',
    server: {
        DISCORD_TOKEN: z.string().min(1),
        DISCORD_CLIENT_ID: z.string().min(1),
        DISCORD_DEV_GUILD_ID: z.string().min(1),
        DISCORD_CLIENT_SECRET: z.string().min(1),
        DISCORD_REDIRECT_URI: z.string().url().min(1),

        COOKIE_SECRET: z.string(),
        DATABASE_URL: z.string().url().min(1),
    },
    runtimeEnv: process.env,
});
