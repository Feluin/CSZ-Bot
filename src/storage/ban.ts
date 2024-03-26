import type { GuildMember, Message, Snowflake, User } from "discord.js";
import { sql } from "kysely";

import type { Ban } from "./model.js";

import db from "./db.js";
import log from "../utils/logger.js";

export async function persistOrUpdate(
    user: GuildMember,
    until: Date | null,
    isSelfBan: boolean,
    reason: string | null = null,
    ctx = db(),
): Promise<void> {
    log.debug(
        `Saving Ban for user ${user} until ${until} (is self ban: ${isSelfBan}, reason: ${reason})`,
    );

    const bannedUntil = until === null ? null : until.toISOString();
    await ctx
        .insertInto("bans")
        .values({
            id: crypto.randomUUID(),
            userId: user.id,
            bannedUntil,
            reason,
            isSelfBan,
            createdAt: sql`current_timestamp`,
            updatedAt: sql`current_timestamp`,
        })
        .onConflict(oc =>
            oc.column("userId").doUpdateSet({
                bannedUntil,
                reason,
                isSelfBan,
            }),
        )
        .execute();
}

export function findExisting(
    user: User | GuildMember,
    ctx = db(),
): Promise<Ban | undefined> {
    return ctx
        .selectFrom("bans")
        .where("userId", "=", user.id)
        .selectAll()
        .executeTakeFirst();
}

export async function remove(
    user: User | GuildMember,
    ctx = db(),
): Promise<void> {
    await ctx.deleteFrom("bans").where("userId", "=", user.id).execute();
}

export async function findExpiredBans(now: Date, ctx = db()): Promise<Ban[]> {
    return ctx
        .selectFrom("bans")
        .where("bannedUntil", "is not", null)
        .where("bannedUntil", "<=", now.toISOString())
        .selectAll()
        .execute();
}

export async function findAll(ctx = db()): Promise<Ban[]> {
    return ctx.selectFrom("bans").selectAll().execute();
}
