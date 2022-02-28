import { prisma } from './Prisma';
import type { SanctionType } from '@prisma/client';

export default class SanctionManager {
    private member: string;
    private moderator: string;
    private reason: string;
    private guild: string;
    private type: SanctionType;

    private db: typeof prisma;

    public id: number;
    public timestamp: Date;
    public approved_by: string[];
    public sanctioning_end: Date;
    public terminatedBy: number;


    constructor(
        member: string,
        moderator: string,
        guild: string,
        type: SanctionType,
        reason = ''
    ) {
        this.member = member;
        this.moderator = moderator;
        this.reason = reason;
        this.guild = guild;
        this.type = type;
        this.db = prisma;
    }

    async create() {
        return await this.db.sanction.create({
            data: {
                type: this.type,
                reason: this.reason,
                Moderator: {
                    connectOrCreate: {
                        create: {
                            id: this.moderator,
                        },
                        where: {
                            id: this.moderator,
                        },
                    },
                },
                User: {
                    connectOrCreate: {
                        create: {
                            id: this.member,
                        },
                        where: {
                            id: this.member,
                        },
                    },
                },
            },
        });
    }

    async link(
        type: Omit<typeof this.type, 'KICK' | 'WARN' | 'UNMUTE'>,
        terminatingSanction: typeof this
    ) {
        const initialSanction = await this.db.sanction.findFirst({
            where: {
                userId: this.member,
            },
            include: {
                TerminatingSanction: true,
                User: true,
            },
            orderBy: {
                timestamp: 'desc',
            },
        });
        console.log(initialSanction);
    }
}
