import type { MessageReaction, User } from "discord.js";

import type { BotContext } from "../context.js";
import type { ProcessableMessage } from "./commandService.js";

import * as dbEmote from "../storage/emote.js";
import * as emoteService from "./emoteService.js";

import log from "@log";

export async function processReactionAdd(
    reactionEvent: MessageReaction,
    invoker: User,
    _context: BotContext,
) {
    const message = reactionEvent.message;
    if (!message.inGuild()) {
        return;
    }

    const emote = reactionEvent.emoji;
    if (!emote.id || !emote.name) {
        return;
    }

    log.info({ emoji: reactionEvent.emoji }, "Reaction added");

    const parsedEmote = {
        id: emote.id,
        name: emote.name,
        animated: emote.animated ?? false,
    };

    await dbEmote.logReactionUse(
        parsedEmote.id,
        parsedEmote.name,
        parsedEmote.animated,
        emoteService.getEmoteUrl(parsedEmote),
        message,
        invoker,
    );
}

export async function processReactionRemove(
    reactionEvent: MessageReaction,
    invoker: User,
    _context: BotContext,
) {
    // TODO: Implement
    log.info({ emoji: reactionEvent.emoji }, "Reaction removed");
}

export async function processMessage(message: ProcessableMessage, context: BotContext) {
    const emotes = emoteService.extractEmotesFromMessage(message.content);
    for (const emote of emotes) {
        const resolvedEmote = context.client.emojis.cache.get(emote.id);
        if (!resolvedEmote) {
            log.warn({ emote }, "Could not resolve emote");
            continue;
        }

        log.info({ emote, resolvedEmote }, "Processing emote");

        await dbEmote.logMessageUse(
            emote.id,
            emote.name,
            emote.animated,
            emoteService.getEmoteUrl(emote),
            message,
        );
    }
}

export async function persistCurrentGuildEmotes(context: BotContext) {
    for (const guild of context.client.guilds.cache.values()) {
        for (const emote of guild.emojis.cache.values()) {
            if (!emote.id || !emote.name) {
                continue;
            }

            const parsed = {
                id: emote.id,
                name: emote.name,
                animated: emote.animated ?? false,
            };

            log.info({ emote: parsed }, "Ensuring emote");

            await dbEmote.ensureEmote(
                parsed.id,
                parsed.name,
                parsed.animated,
                emoteService.getEmoteUrl(parsed),
            );
        }
    }
}

export async function getUserStats(user: User, limit: number) {
    return dbEmote.getUsage(user, limit | 0);
}
