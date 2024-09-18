import type { GuildChannel, GuildMember, Message, TextChannel, User } from "discord.js";
import { type ExpressionBuilder, sql } from "kysely";

import type { BotContext } from "@/context.js";
import type { Database, Loot, LootId, LootInsertable, LootOrigin, LootTable } from "./db/model.js";

import db from "@db";
