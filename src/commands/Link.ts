import type { OTP } from '@prisma/client';
import crypto from 'crypto';
import type { ChatInputCommandInteraction } from 'discord.js';
import {
    ActionRowBuilder,
    ModalBuilder,
    SlashCommandBuilder,
    TextInputBuilder,
    TextInputStyle,
    inlineCode,
} from 'discord.js';
import { JSDOM } from 'jsdom';
import type { Config } from '../base/Command';
import Command from '../base/Command';
import { env } from '../env';
import { curlRequest } from '../utils';

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
            );

        super(cmd as unknown as Config);
        this.authToken = '';
        this.discordUserId = '';
        this.game = 'de_DE';
    }
    public async execute(interaction: ChatInputCommandInteraction) {
        this.discordUserId = interaction.user.id;

        const username = interaction.options.getString('username', true);
        this.game = interaction.options.getString(
            'game',
            true
        ) as keyof typeof GAME_SERVERS;

        const modal = new ModalBuilder()
            .setCustomId('otpModal')
            .setTitle('Link your account')
            .setComponents([
                new ActionRowBuilder<TextInputBuilder>().setComponents(
                    new TextInputBuilder()
                        .setCustomId('otp')
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder('Your OTP')
                        .setRequired(true)
                        .setMinLength(10)
                        .setMaxLength(10)
                        .setLabel('OTP')
                ),
            ]);
        await interaction.showModal(modal);

        try {
            await this.login().then(async response => {
                // console.log(response);
            });
            const otp = await this.createOTP(username);
            if (!otp)
                return interaction.followUp({
                    content:
                        'There was an error while creating your One-Time-Password. Please try again later.',
                });

            const res = await this.sendOTP(username, otp);
            console.log(res);
            if (res.status !== 200)
                return interaction.followUp(
                    'There was an error while sending your One-Time-Password. Please try again later.'
                );

            const modalSubmitInteraction = await interaction.awaitModalSubmit({
                time: 60000,
                filter: i => i.customId === 'otpModal',
                dispose: true,
            });
            const receivedOtpCode =
                modalSubmitInteraction.fields.getTextInputValue('otp');

            await modalSubmitInteraction.reply({
                content: `Confirming OTP ${inlineCode(receivedOtpCode)}...`,
                ephemeral: true,
            });

            const oTP = await this.db.oTP.findFirstOrThrow({
                where: { value: receivedOtpCode },
                include: { gameAccount: true },
            });
            const isValidOtp = await this.checkOTP(
                oTP.gameAccountName,
                receivedOtpCode
            );
            if (!isValidOtp)
                return modalSubmitInteraction.editReply(
                    'The provided One-Time-Password is invalid. Please try again.'
                );
            // this.linkAccounts(oTP.gameAccountName, this.discordUserId);
            return modalSubmitInteraction.editReply(
                'Your account has been linked!'
            );
        } catch (error) {
            console.error(error);
        }
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

    // private linkAccounts(username: string, discordId: string) {
    //     return this.db.gameAccount.update({
    //         where: { name: username },
    //         data: {
    //             discordUserId: discordId,
    //         },
    //     });
    // }

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
        console.log(res.body);
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
