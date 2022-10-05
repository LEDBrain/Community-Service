import { prisma } from './Prisma';
import type { SanctionType } from '@prisma/client';

export default class SanctionManager {
    private member: string;
    private moderator: string;
    private reason: string;
    private guild: string;
    private type: SanctionType;

    private db: typeof prisma;

    public id: number | undefined;

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
        const newSanction = await this.db.sanction.create({
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
        this.id = newSanction.id;
        return newSanction;
    }

    async link(
        type: Omit<typeof this.type, 'KICK' | 'WARN' | 'UNMUTE'>,
        terminatingSanction: typeof this
    ) {
        return new Promise((resolve, reject) => {
            this.db.sanction
                .findFirst({
                    where: {
                        AND: {
                            userId: this.member,
                            type: type as SanctionType,
                        },
                    },
                    include: {
                        TerminatingSanction: true,
                        User: true,
                    },
                    orderBy: {
                        timestamp: 'desc',
                    },
                })
                .then(initialSanction => {
                    if (!initialSanction || initialSanction.terminatedBy)
                        return reject();
                    this.db.sanction
                        .update({
                            where: {
                                id: initialSanction.id,
                            },
                            data: {
                                TerminatingSanction: {
                                    connect: {
                                        id: terminatingSanction.id,
                                    },
                                },
                            },
                        })
                        .then(() => resolve(true));
                });
        });
    }
}
