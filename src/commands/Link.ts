import crypto from 'crypto';
import type { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';
import { env } from '../env';
import { JSDOM } from 'jsdom';
import type { Config } from '../base/Command';
import Command from '../base/Command';
import { curlRequest } from '../utils';
import type { OTP } from '@prisma/client';

const GAME_SERVERS = {
    de_DE: {
        server: env.GAME_DE || 'https://www.leitstellenspiel.de',
        username: env.GAME_DE_USERNAME,
        password: env.GAME_DE_PASSWORD,
    },
    // nl_NL: {},
    // en_US: {},
    // en_GB: {},
    // en_AU: {},
} as const;

export default class Link extends Command {
    private authToken: string;
    private discordUserId: string;
    private game: keyof typeof GAME_SERVERS;
    constructor() {
        const cmd = new SlashCommandBuilder()
            .setName('link')
            .setDescription('Link a game account to your discord account')
            .addSubcommand(subCommand =>
                subCommand
                    .setName('request')
                    .setDescription('Request a one-time-passcode')
                    .addStringOption(stringOption =>
                        stringOption
                            .setName('game')
                            .setDescription(
                                'The game version to link to your discord account'
                            )
                            .setRequired(true)
                            .setChoices(
                                { name: 'Leitstellenspiel', value: 'de_DE' },
                                { name: 'Meldkamerspel', value: 'nl_NL' },
                                { name: 'Missionchief (US)', value: 'en_US' },
                                { name: 'Missionchief (UK)', value: 'en_GB' },
                                { name: 'Missionchief (AU)', value: 'en_AU' }
                            )
                    )
                    .addStringOption(stringOption =>
                        stringOption
                            .setName('username')
                            .setDescription('Your username')
                            .setRequired(true)
                            .setMinLength(1)
                    )
            )
            .addSubcommand(subCommand =>
                subCommand
                    .setName('confirm')
                    .setDescription('Confirm your one-time-passcode')
                    .addStringOption(stringOption =>
                        stringOption
                            .setName('code')
                            .setDescription('The received otp')
                            .setRequired(true)
                            .setMinLength(1)
                    )
            );

        super(cmd as unknown as Config);
        this.authToken = '';
        this.discordUserId = '';
        this.game = 'de_DE';
    }
    public async execute(interaction: ChatInputCommandInteraction) {
        let responseText = '';
        this.discordUserId = interaction.user.id;
        if (interaction.options.getSubcommand() === 'request') {
            interaction.reply('Requesting OTP...');
            const username = interaction.options.getString('username', true);
            this.game = interaction.options.getString(
                'game',
                true
            ) as keyof typeof GAME_SERVERS;

            await this.login().then(async response => {
                // console.log(response);
                const otp = await this.createOTP(username);
                if (!otp)
                    return (responseText =
                        'There was an error while creating your One-Time-Password. Please try again later.');

                const res = await this.sendOTP(username, otp);
                // console.log(res);
                if (res.status !== 200)
                    return (responseText =
                        'There was an error while sending your One-Time-Password. Please try again later.');

                responseText =
                    'OTP sent! Please check your inbox for messages from `UDOPT`.';
            });
        } else if (interaction.options.getSubcommand() === 'confirm') {
            interaction.reply('Confirming OTP...');
            try {
                const otpCode = interaction.options.getString('code', true);
                const oTP = await this.db.oTP.findFirstOrThrow({
                    where: { value: otpCode },
                    include: { gameAccount: true },
                });
                const isLinked = await this.checkOTP(
                    oTP.gameAccountName,
                    otpCode
                );
                if (!isLinked)
                    return (responseText =
                        'The provided One-Time-Password is invalid. Please try again.');
                responseText = 'Your account has been linked!';
            } catch (error) {
                console.log(error);
                responseText =
                    'There was an error while linking your account. Please try again later.';
            }
        }
        return interaction.editReply(responseText);
    }

    private updateAuthToken(html: string) {
        if (!html.includes('name="csrf-token"')) return;

        const {
            window: { document },
        } = new JSDOM(html);
        this.authToken =
            document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content') ?? '';
    }

    private async sendPN(username: string, message: string, subject: string) {
        const res = await curlRequest(
            GAME_SERVERS[this.game].server + '/messages',
            {
                post: true,
                readCookies: true,
                headers: [
                    'Content-Type: application/x-www-form-urlencoded; charset=UTF-8',
                ],
                postFields: {
                    'utf8': '✓',
                    'authenticity_token': this.authToken,
                    'message[body]': message,
                    'message[recipients]': username,
                    'message[subject]': subject,
                },
            }
        );
        this.updateAuthToken(res.body);
        return res;
    }

    private async login() {
        const gameLogin = GAME_SERVERS[this.game];
        const { body: signInPageHtml } = await curlRequest(gameLogin.server, {
            readCookies: false,
        });

        this.updateAuthToken(signInPageHtml);
        return curlRequest(gameLogin.server + '/users/sign_in', {
            post: true,
            readCookies: true,
            headers: ['Content-Type: application/x-www-form-urlencoded'],
            postFields: {
                'utf': '✓',
                'authenticity_token': this.authToken,
                'user[email]': gameLogin.username,
                'user[password]': gameLogin.password,
                'user[remember_me]': '0',
            },
        });
    }

    private async createOTP(gameAccountName: string) {
        const updated = await this.db.oTP.updateMany({
            where: { gameAccountName },
            data: {
                createdAt: new Date(),
                gameAccountName,
                value: crypto.randomBytes(5).toString('hex').toUpperCase(),
                used: false,
            },
        });
        if (updated.count)
            return await this.db.oTP.findUnique({ where: { gameAccountName } });
        return await this.db.oTP.create({
            data: {
                gameAccount: {
                    connectOrCreate: {
                        where: { name: gameAccountName },
                        create: {
                            name: gameAccountName,
                            game: this.game,
                            User: {
                                connectOrCreate: {
                                    where: { id: this.discordUserId },
                                    create: {
                                        id: this.discordUserId,
                                    },
                                },
                            },
                        },
                    },
                },
                value: crypto.randomBytes(5).toString('hex').toUpperCase(),
            },
            include: { gameAccount: true },
        });
    }

    private async checkOTP(username: string, otpValue: string) {
        const user = await this.db.gameAccount.findUnique({
            where: { name: username },
            select: { name: true, discordUserId: true, game: true },
        });
        if (!user) return false;
        const otp = await this.db.oTP.findUnique({
            where: { gameAccountName: username },
            select: { value: true, createdAt: true, used: true },
        });
        if (
            !otp ||
            otp.used ||
            otp.value !== otpValue ||
            Date.now() - otp.createdAt.getTime() > 20 * 60 * 1000
        )
            return false;
        await this.db.oTP.update({
            where: { gameAccountName: username },
            data: { used: true },
        });

        return user;
    }

    private async sendOTP(username: string, otp: OTP) {
        const response = await this.sendPN(
            username,
            `Hallo ${username},

    Anbei dein Einmalpasswort..
    ${otp.value}
    Dieses Einmalpasswort ist 20 Minuten gültig (bis ${new Date(
        otp.createdAt.getTime() + 20 * 60 * 1000
    ).toLocaleString('de-de', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Europe/Berlin',
        timeZoneName: 'shortGeneric',
    })}).

    Alle vorher angeforderten Einmalpasswörter, deren Ablaufdatum noch nicht erreicht war, verlieren damit ebenso automatisch ihre Gültigkeit.
    Solltest du kein Einmalpasswort angefordert haben, kannst du diese Nachricht einfach ignorieren.

    Viele Grüße
    Dein UnitedDispatch Team`,
            'Dein Einmalpasswort'
        );

        return response;
    }
}
