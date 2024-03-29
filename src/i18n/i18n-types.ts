// This file was auto-generated by 'typesafe-i18n'. Any manual changes will be overwritten.
/* eslint-disable */
import type {
    BaseTranslation as BaseTranslationType,
    LocalizedString,
    RequiredParams,
} from 'typesafe-i18n';

export type BaseTranslation = BaseTranslationType & DisallowNamespaces;
export type BaseLocale = 'en';

export type Locales = 'de' | 'en';

export type Translation = RootTranslation & DisallowNamespaces;

export type Translations = RootTranslation & {
    ButtonInteractions: NamespaceButtonInteractionsTranslation;
    commands: NamespaceCommandsTranslation;
};

type RootTranslation = {
    /**
     * H​i
     */
    HI: string;
};

export type NamespaceButtonInteractionsTranslation = {
    banRequestApprove: {
        /**
         * Y​o​u​ ​c​a​n​n​o​t​ ​a​p​p​r​o​v​e​ ​y​o​u​r​ ​o​w​n​ ​b​a​n​ ​r​e​q​u​e​s​t
         */
        error_noOwnApproval: string;
        /**
         * Y​o​u​ ​h​a​v​e​ ​a​l​r​e​a​d​y​ ​a​p​p​r​o​v​e​d​ ​t​h​i​s​ ​b​a​n​ ​r​e​q​u​e​s​t
         */
        error_alreadyApproved: string;
        /**
         * T​h​e​r​e​ ​s​e​e​m​s​ ​t​o​ ​b​e​ ​a​n​ ​i​s​s​u​e​ ​r​e​g​a​r​d​i​n​g​ ​t​h​i​s​ ​g​u​i​l​d​s​ ​s​e​t​t​i​n​g​s​.​ ​P​l​e​a​s​e​ ​c​o​n​t​a​c​t​ ​a​n​ ​a​d​m​i​n​ ​o​f​ ​t​h​i​s​ ​s​e​r​v​e​r​.
         */
        error_guildSettingsError: string;
    };
};

export type NamespaceCommandsTranslation = {
    ban: {
        /**
         * Y​o​u​ ​c​a​n​n​o​t​ ​b​a​n​ ​{​m​e​m​b​e​r​}
         * @param {string} member
         */
        error_noPerms: RequiredParams<'member'>;
    };
};

export type Namespaces = 'ButtonInteractions' | 'commands';

type DisallowNamespaces = {
    /**
     * reserved for 'ButtonInteractions'-namespace\
     * you need to use the `./ButtonInteractions/index.ts` file instead
     */
    ButtonInteractions?: "[typesafe-i18n] reserved for 'ButtonInteractions'-namespace. You need to use the `./ButtonInteractions/index.ts` file instead.";

    /**
     * reserved for 'commands'-namespace\
     * you need to use the `./commands/index.ts` file instead
     */
    commands?: "[typesafe-i18n] reserved for 'commands'-namespace. You need to use the `./commands/index.ts` file instead.";
};

export type TranslationFunctions = {
    /**
     * Hi
     */
    HI: () => LocalizedString;
    ButtonInteractions: {
        banRequestApprove: {
            /**
             * You cannot approve your own ban request
             */
            error_noOwnApproval: () => LocalizedString;
            /**
             * You have already approved this ban request
             */
            error_alreadyApproved: () => LocalizedString;
            /**
             * There seems to be an issue regarding this guilds settings. Please contact an admin of this server.
             */
            error_guildSettingsError: () => LocalizedString;
        };
    };
    commands: {
        ban: {
            /**
             * You cannot ban {member}
             */
            error_noPerms: (arg: { member: string }) => LocalizedString;
        };
    };
};

export type Formatters = {};
