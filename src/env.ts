import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
    isServer: true,
    server: {
        DISCORD_TOKEN: z.string().min(1),
        DISCORD_CLIENT_ID: z.string().min(1),
        DISCORD_DEV_GUILD_ID: z.string().min(1),
        DISCORD_CLIENT_SECRET: z.string().min(1),
        DISCORD_REDIRECT_URI: z.string().url().min(1),

        COOKIE_SECRET: z.string().min(32),
        DATABASE_URL: z.string().url().min(1),

        PORT: z
            .string()
            .min(1)
            .transform(s => parseInt(s, 10))
            .pipe(z.number()),
        HOST: z.string().min(1),

        // rm .min(1) and add .optional() if needed
        GAME_DE: z.string().url().optional(),
        GAME_DE_USERNAME: z.string().min(1),
        GAME_DE_PASSWORD: z.string().min(1),
    },
    runtimeEnv: {
        ...process.env,
    },
    skipValidation: process.env.NODE_ENV === 'development',
});
