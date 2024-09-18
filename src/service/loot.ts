import { setTimeout } from "node:timers/promises";

import type { User, Guild, Snowflake, Message } from "discord.js";

import type { Loot, LootId, LootInsertable, LootOrigin } from "@/storage/db/model.js";
import * as loot from "@/storage/loot.js";
import * as emote from "./emote.js";
import * as lootDropService from "@/service/lootDrop.js";

const ACHTUNG_NICHT_DROPBAR_WEIGHT_KG = 0;

export enum LootKindId {
    NICHTS = 0,
    KADSE = 1,
    MESSERBLOCK = 2,
    KUEHLSCHRANK = 3,
    DOENER = 4,
    KINN = 5,
    KRANKSCHREIBUNG = 6,
    WUERFELWURF = 7,
    GESCHENK = 8,
    AYRAN = 9,
    PKV = 10,
    TRICHTER = 11,
    GRAFIKKARTE = 12,
    HAENDEDRUCK = 13,
    ERLEUCHTUNG = 14,
    BAN = 15,
    OETTINGER = 16,
    ACHIEVEMENT = 17,
    GME_AKTIE = 18,
    FERRIS = 19,
    HOMEPOD = 20,
    RADIOACTIVE_WASTE = 21,
    SAHNE = 22,
    AEHRE = 23,
    CROWDSTRIKE = 24,
    POWERADE_BLAU = 25,
    GAULOISES_BLAU = 26,
    MAXWELL = 27,
    SCHICHTBEGINN_ASSE_2 = 28,
    DRECK = 29,
    EI = 30,
    BRAVO = 31,
    VERSCHIMMELTER_DOENER = 32,
    THUNFISCHSHAKE = 33,
}

/**
 * @remarks The index of an item must be equal to the `LootTypeId` enum value.
 */
export const lootTemplates: loot.LootTemplate[] = [
    {
        id: LootKindId.NICHTS,
        weight: 55,
        displayName: "Nichts",
        titleText: "✨Nichts✨",
        dropDescription: "¯\\_(ツ)_/¯",
        asset: null,
        excludeFromInventory: true,
    },
    {
        id: LootKindId.KADSE,
        weight: 4,
        displayName: "Niedliche Kadse",
        titleText: "Eine niedliche Kadse",
        dropDescription: "Awww",
        emote: ":catsmile:",
        asset: "assets/loot/01-kadse.jpg",
    },
    {
        id: LootKindId.MESSERBLOCK,
        weight: 1,
        displayName: "Messerblock",
        titleText: "Einen Messerblock",
        dropDescription: "🔪",
        emote: "🔪",
        asset: "assets/loot/02-messerblock.jpg",
    },
    {
        id: LootKindId.KUEHLSCHRANK,
        weight: 1,
        displayName: "Sehr teurer Kühlschrank",
        titleText: "Ein sehr teurer Kühlschrank",
        dropDescription:
            "Dafür haben wir keine Kosten und Mühen gescheut und extra einen Kredit aufgenommen.",
        emote: "🧊",
        asset: "assets/loot/03-kuehlschrank.jpg",
        effects: ["Lässt Essen nicht schimmeln"],
    },
    {
        id: LootKindId.DOENER,
        weight: 5,
        displayName: "Döner",
        titleText: "Einen Döner",
        dropDescription: "Bewahre ihn gut als Geldanlage auf!",
        emote: "🥙",
        asset: "assets/loot/04-doener.jpg",
    },
    {
        id: LootKindId.KINN,
        weight: 0.5,
        displayName: "Kinn",
        titleText: "Ein Kinn",
        dropDescription: "Pass gut drauf auf, sonst flieht es!",
        emote: "👶",
        asset: "assets/loot/05-kinn.jpg",
    },
    {
        id: LootKindId.KRANKSCHREIBUNG,
        weight: 0.5,
        displayName: "Arbeitsunfähigkeitsbescheinigung",
        titleText: "Einen gelben Urlaubsschein",
        dropDescription: "Benutze ihn weise!",
        emote: "🩺",
        asset: "assets/loot/06-krankschreibung.jpg",
    },
    {
        id: LootKindId.WUERFELWURF,
        weight: 5,
        displayName: "Würfelwurf",
        titleText: "Einen Wurf mit einem Würfel",
        dropDescription: "🎲",
        emote: "🎲",
        asset: "assets/loot/07-wuerfelwurf.jpg",
        excludeFromInventory: true,
        onDrop: async (_content, winner, channel, _loot) => {
            const rollService = await import("./roll.js");
            await rollService.rollInChannel(winner.user, channel, 1, 6);
        },
    },
    {
        id: LootKindId.GESCHENK,
        weight: 2,
        displayName: "Geschenk",
        titleText: "Ein Geschenk",
        dropDescription: "Du kannst jemand anderem eine Freude machen :feelsamazingman:",
        emote: "🎁",
        asset: null,
        onUse: async (interaction, context, loot) => {
            await lootDropService.postLootDrop(
                context,
                interaction.channel,
                interaction.user,
                loot.id,
            );
            return false;
        },
    },
    {
        id: LootKindId.AYRAN,
        weight: 1,
        displayName: "Ayran",
        titleText: "Einen Ayran",
        dropDescription: "Der gute von Müller",
        emote: "🥛",
        asset: "assets/loot/09-ayran.jpg",
    },
    {
        id: LootKindId.PKV,
        weight: 1,
        displayName: "Private Krankenversicherung",
        titleText: "Eine private Krankenversicherung",
        dropDescription: "Fehlt dir nur noch das Geld zum Vorstrecken",
        emote: "💉",
        asset: "assets/loot/10-pkv.jpg",
        effects: ["` +100% ` Chance auf AU 📈"],
    },
    {
        id: LootKindId.TRICHTER,
        weight: 1,
        displayName: "Trichter",
        titleText: "Einen Trichter",
        dropDescription: "Für die ganz großen Schlücke",
        emote: ":trichter:",
        asset: "assets/loot/11-trichter.jpg",
    },
    {
        id: LootKindId.GRAFIKKARTE,
        weight: 1,
        displayName: "Grafikkarte aus der Zukunft",
        titleText: "Eine Grafikkarte aus der Zukunft",
        dropDescription: "Leider ohne Treiber, die gibt es erst in 3 Monaten",
        emote: "🖥️",
        asset: "assets/loot/12-grafikkarte.png",
    },
    {
        id: LootKindId.HAENDEDRUCK,
        weight: 1,
        displayName: "Feuchter Händedruck",
        titleText: "Einen feuchten Händedruck",
        dropDescription: "Glückwunsch!",
        emote: "🤝",
        asset: "assets/loot/13-haendedruck.jpg",
        excludeFromInventory: true,
    },
    {
        id: LootKindId.ERLEUCHTUNG,
        weight: 1,
        displayName: "Erleuchtung",
        titleText: "Eine Erleuchtung",
        dropDescription: "💡",
        emote: "💡",
        asset: null,
        excludeFromInventory: true,
        onDrop: async (_context, winner, channel, _loot) => {
            const erleuchtungService = await import("./erleuchtung.js");
            await setTimeout(3000);

            const embed = await erleuchtungService.getInspirationsEmbed(winner);
            await channel.send({
                embeds: [embed],
            });
        },
    },
    {
        id: LootKindId.BAN,
        weight: 1,
        displayName: "Willkürban",
        titleText: "Einen Ban aus reiner Willkür",
        dropDescription: "Tschüsseldorf!",
        emote: "🔨",
        asset: "assets/loot/15-ban.jpg",
        excludeFromInventory: true,
        onDrop: async (context, winner, _channel, _loot) => {
            const banService = await import("./ban.js");
            await banService.banUser(
                context,
                winner,
                context.client.user,
                "Willkürban aus der Lotterie",
                false,
                0.08,
            );
        },
    },
    {
        id: LootKindId.OETTINGER,
        weight: 1,
        displayName: "Oettinger",
        titleText: "Ein warmes Oettinger",
        dropDescription: "Ja dann Prost ne!",
        emote: "🍺",
        asset: "assets/loot/16-oettinger.jpg",
    },
    {
        id: LootKindId.ACHIEVEMENT,
        weight: 1,
        displayName: "Achievement",
        titleText: "Ein Achievement",
        dropDescription: "Das erreichen echt nicht viele",
        emote: "🏆",
        asset: "assets/loot/17-achievement.png",
    },
    {
        id: LootKindId.GME_AKTIE,
        weight: 5,
        displayName: "Wertlose GME-Aktie",
        titleText: "Eine wertlose GME-Aktie",
        dropDescription: "Der squeeze kommt bald!",
        emote: "📉",
        asset: "assets/loot/18-gme.jpg",
    },
    {
        id: LootKindId.FERRIS,
        weight: 3,
        displayName: "Ferris",
        titleText: "Einen Ferris - Die Krabbe",
        dropDescription: "Damit kann man ja endlich den Bot in Rust neuschreiben",
        emote: "🦀",
        asset: "assets/loot/19-ferris.png",
    },
    {
        id: LootKindId.HOMEPOD,
        weight: 5,
        displayName: "HomePod",
        titleText: "Einen Apple:registered: HomePod:copyright:",
        dropDescription: 'Damit dein "Smart Home" nicht mehr ganz so smart ist',
        emote: "🍎",
        asset: "assets/loot/20-homepod.jpg",
    },
    {
        id: LootKindId.RADIOACTIVE_WASTE,
        weight: 1,
        displayName: "Radioaktiver Müll",
        titleText: "Radioaktiver Müll",
        dropDescription:
            "Sollte dir ja nichts mehr anhaben, du bist ja durch den Server schon genug verstrahlt 🤷‍♂️",
        emote: "☢️",
        asset: "assets/loot/21-radioaktiver-muell.jpg",
        effects: ["` +5% ` Chance auf leeres Geschenk 🔻"],
    },
    {
        id: LootKindId.SAHNE,
        weight: 1,
        displayName: "Sprühsahne",
        titleText: "Sprühsahne",
        dropDescription: "Fürs Frühstück oder so",
        emote: ":sahne:",
        asset: "assets/loot/22-sahne.jpg",
    },
    {
        id: LootKindId.AEHRE,
        weight: 1,
        displayName: "Ehre",
        titleText: "Ehre aus Mitleid",
        dropDescription:
            "Irgendjemand muss ja den Server am laufen halten, kriegst dafür wertlose Internetpunkte",
        emote: ":aehre:",
        asset: "assets/loot/23-ehre.jpg",
        excludeFromInventory: true,
        onDrop: async (_context, winner, _channel, _loot) => {
            const ehre = await import("@/storage/ehre.js");
            await ehre.addPoints(winner.id, 1);
        },
    },
    {
        id: LootKindId.CROWDSTRIKE,
        weight: 1,
        displayName: "Crowdstrike Falcon",
        titleText: "Crowdstrike Falcon Installation",
        dropDescription: "Bitti nicht rebooti und Bitlocki nutzi",
        emote: ":eagle:",
        asset: "assets/loot/24-crowdstrike.jpg",
    },
    {
        id: LootKindId.POWERADE_BLAU,
        weight: 1,
        displayName: "Blaue Powerade",
        titleText: "Blaue Powerade",
        dropDescription: "Erfrischend erquickend. Besonders mit Vodka. Oder Korn.",
        asset: "assets/loot/25-powerade-blau.jpg",
    },
    {
        id: LootKindId.GAULOISES_BLAU,
        weight: 1,
        displayName: "Gauloises Blau",
        titleText: "Eine Schachtel Gauloises Blau",
        dropDescription:
            "Rauchig, kräftig, französisch. Wie du in deinen Träumen.\n\nVerursacht Herzanfälle, genau wie dieser Server",
        emote: "🚬",
        asset: "assets/loot/26-gauloises-blau.jpg",
    },
    {
        id: LootKindId.MAXWELL,
        weight: 1,
        displayName: "Maxwell",
        titleText: "Einen Maxwell",
        dropDescription: "Der ist doch tot, oder?",
        emote: "😸",
        asset: "assets/loot/27-maxwell.jpg",
    },
    {
        id: LootKindId.SCHICHTBEGINN_ASSE_2,
        weight: 1,
        displayName: "Wärter Asse II",
        titleText: "Den Schichtbeginn in der Asse II",
        dropDescription: "Deine Wärterschicht bei der Asse II beginnt!",
        emote: "🔒",
        asset: "assets/loot/28-asse-2.jpg",
        excludeFromInventory: true,
        onDrop: async (context, winner, channel, _loot) => {
            const lootRoles = await import("./lootRoles.js");
            await lootRoles.startAsseGuardShift(context, winner, channel);
        },
    },
    {
        id: LootKindId.DRECK,
        weight: 7,
        displayName: "Ein Glas Dreck",
        titleText: "Ein Glas Dreck",
        dropDescription: "Ich hab ein Glas voll Dreck",
        emote: ":jar:",
        asset: "assets/loot/29-dirt.jpg",
    },
    {
        id: LootKindId.EI,
        weight: 3,
        displayName: "Ei",
        titleText: "Ein Ei",
        dropDescription:
            "Jetzt wär geklärt, was zu erst da war, Ei oder ... (Ja was schlüpft daraus eigentlich?)",
        emote: ":egg:",
        asset: "assets/loot/30-egg.jpg",
    },
    {
        id: LootKindId.BRAVO,
        weight: 2,
        displayName: "Bravo",
        titleText: "Eine Bravo vom Dachboden",
        dropDescription: "Die Seiten kleben noch ein bisschen",
        emote: ":newspaper2:",
        asset: "assets/loot/31-bravo.jpg",
    },
    {
        id: LootKindId.VERSCHIMMELTER_DOENER,
        weight: ACHTUNG_NICHT_DROPBAR_WEIGHT_KG,
        displayName: "Verschimmelter Döner",
        titleText: "Einen verschimmelten Döner",
        dropDescription: "Du hättest ihn früher essen sollen",
        emote: "🥙",
        asset: null,
    },
    {
        id: LootKindId.THUNFISCHSHAKE,
        weight: 2,
        displayName: "Thunfischshake",
        titleText: "Ein Thunfischshake, serviert von Markus Rühl persönlich",
        dropDescription: "Nach Rezept zubereitet, bestehend aus Thunfisch und Reiswaffeln",
        emote: ":baby_bottle:",
        asset: "assets/loot/32-thunfischshake.jpg",
    },
] as const;

/*
    Ideas:
        - Pfeffi
        - eine Heiligsprechung von Jesus höchstpersönlich
        - Vogerlsalat
        - Einlass in den Berghain, am Eingang steht ein Golem, der einen verschimmelten Superdöner (besteht aus 3 verschimnelten Dönern) frisst

    Special Loots mit besonderer Aktion?
        - Timeout?
        - Sonderrolle, die man nur mit Geschenk gewinnen kann und jedes Mal weitergereicht wird (Wächter des Pfeffis?)? Wärter bei Asse II?
*/

export enum LootAttributeKindId {
    NORMAL = 0,
    SELTEN = 1,
    SEHR_SELTEN = 2,
    VERSTRAHLT = 3,
    // VERSCHIMMELT = 4,
    // VERDRECKT = 5,
}

export enum LootAttributeClassId {
    OTHER = 0,
    RARITY = 1,
}

/**
 * @remarks The index of an item must be equal to the `LootAttributeKindId` enum value.
 */
export const lootAttributes = [
    {
        id: LootAttributeKindId.NORMAL,
        classId: LootAttributeClassId.RARITY,
        displayName: "Normal",
        shortDisplay: "⭐",
        color: 0,
        initialDropWeight: 90,
        visible: false,
    },
    {
        id: LootAttributeKindId.SELTEN,
        classId: LootAttributeClassId.RARITY,
        displayName: "Selten",
        shortDisplay: "🌟",
        color: 0,
        initialDropWeight: 10,
        visible: true,
    },
    {
        id: LootAttributeKindId.SEHR_SELTEN,
        classId: LootAttributeClassId.RARITY,
        displayName: "Sehr Selten",
        shortDisplay: "✨",
        color: 0,
        initialDropWeight: 1,
        visible: true,
    },
    {
        id: LootAttributeKindId.VERSTRAHLT,
        classId: LootAttributeClassId.OTHER,
        displayName: "Verstrahlt",
        shortDisplay: "☢️",
        color: 0xff_ff_ff,
        visible: true,
    },
    /*
    {
        id: LootAttributeTypeId.VERSCHIMMELT,
        classId: LootAttributeClassId.OTHER,
        displayName: "Verschimmelt",
        shortDisplay: "🤢",
        color: 0,
        visible: true,
    },
    {
        id: LootAttributeTypeId.VERDRECKT,
        classId: LootAttributeClassId.OTHER,
        displayName: "Verdreckt",
        shortDisplay: null,
        color: 0,
        visible: true,
    },
    */
] satisfies loot.LootAttribute[];

export async function getInventoryContents(user: User) {
    const contents = await loot.findOfUser(user);
    const displayableLoot = contents.filter(
        l => !(resolveLootTemplate(l.lootKindId)?.excludeFromInventory ?? false),
    );
    return displayableLoot;
}

export function getEmote(guild: Guild, item: Loot) {
    const e = lootTemplates.find(t => t.id === item.lootKindId)?.emote;
    return emote.resolveEmote(guild, e);
}

export function resolveLootTemplate(lootKindId: number) {
    return lootTemplates.find(loot => loot.id === lootKindId);
}

export async function getUserLootsByTypeId(userId: Snowflake, lootTypeId: number) {
    return await loot.getUserLootsByTypeId(userId, lootTypeId);
}

export async function getUserLootById(userId: Snowflake, id: LootId) {
    return await loot.getUserLootById(userId, id);
}

export async function getUserLootCountById(userId: Snowflake, lootTypeId: number): Promise<number> {
    return (await loot.getUserLootsByTypeId(userId, lootTypeId)).length;
}

export async function getLootsByKindId(lootTypeId: LootKindId) {
    return await loot.getLootsByKindId(lootTypeId);
}

export function transferLootToUser(lootId: LootId, user: User, trackPredecessor: boolean) {
    return loot.transferLootToUser(lootId, user.id, trackPredecessor);
}

export function deleteLoot(lootId: LootId) {
    return loot.deleteLoot(lootId);
}

export function replaceLoot(
    lootId: LootId,
    replacement: LootInsertable,
    trackPredecessor: boolean,
) {
    return loot.replaceLoot(lootId, replacement, trackPredecessor);
}
export async function createLoot(
    template: loot.LootTemplate,
    winner: User,
    message: Message<true> | null,
    origin: LootOrigin,
    predecessorLootId: LootId | null,
) {
    return await loot.createLoot(template, winner, message, new Date(), origin, predecessorLootId);
}
