import type { Snowflake } from "discord.js";
import type { Birthday } from "./model";
import type { OneBasedMonth } from "./model/Birthday";

import db from "./kysely";

export function getBirthday(
    userId: Snowflake,
    ctx = db(),
): Promise<Birthday | undefined> {
    return ctx
        .selectFrom("birthdays")
        .where("userId", "=", userId)
        .selectAll()
        .executeTakeFirst();
}

export function getTodaysBirthdays(ctx = db()): Promise<Birthday[]> {
    const today = new Date(); // TODO: Rewrite to Temporal API after it is available
    const oneBasedMonth = convertMonth(today.getMonth());
    return ctx
        .selectFrom("birthdays")
        .where("day", "=", today.getDate())
        .where("month", "=", oneBasedMonth)
        .selectAll()
        .execute();
}

export function insertBirthday(
    userId: Snowflake,
    day: number,
    month: OneBasedMonth,
    ctx = db(),
): Promise<Birthday> {
    const now = new Date().toISOString();
    return ctx
        .insertInto("birthdays")
        .values({
            id: crypto.randomUUID(),
            day,
            month,
            userId,
            createdAt: now,
            updatedAt: now,
        })
        .onConflict(oc =>
            oc.column("userId").doUpdateSet({
                day,
                month,
            }),
        )
        .returningAll()
        .executeTakeFirstOrThrow();
}

export function getAll(ctx = db()) {
    return ctx.selectFrom("birthdays").selectAll().execute();
}

function convertMonth(monthId: number): OneBasedMonth {
    return (monthId + 1) as OneBasedMonth;
}
