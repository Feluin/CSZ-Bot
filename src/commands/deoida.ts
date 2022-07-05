import AustrianWord from "../storage/model/AustrianWord";
import type { CommandFunction } from "../types";

type Rule = {
    pattern: RegExp;
    /** Direct translation or a replacer function (see replaceAll) */
    translation: string | ((substring: string, ...args: any[]) => string);
}

const simpleRules: readonly Rule[] = [
    {
        pattern: /(^|\s+)a(\s+|$)/,
        translation: "ein"
    },
    {
        pattern: /(^|\s+)i(\s+|$)/,
        translation: "ich"
    },
    {
        pattern: /(^|\s+)I(\s+|$)/,
        translation: "Ich"
    }
];


async function deOidaLine(line: string): Promise<string> {
    // We cannot just split all words using \s*. That could tear apart words or translations like "fescher bub"
    // Also, we need to take line breaks into account. We assume that tokens that are one translation unit
    // won't get torn apart by a line break.
    // This also reduces the number of combinations to check

    const tokens = line
        .split(/\s+/)
        .map(s => s.trim().toLowerCase())
        .filter(s => s.length > 0);

    // We join adjacent tokens to terms that may come up in the database
    // We do longest token combinations first, so more precise translations can be matched. For example, when translating:
    // "oida der fesche bursch han recht"

    // And the database contains these two translations:
    // "der fesche bursch" | "holzi"
    // "bursch"            | "junge"

    // Then, we want to return "oida holzi han recht" instead of "oida der fesche junge han recht"

    const aussieWordsToReplace = [];

    // eslint-disable-next-line no-use-before-define
    for (const translationCandidate of enumerateAdjacentTokens(tokens)) {
        // eslint-disable-next-line no-await-in-loop
        const germanTranslation = await AustrianWord.findTranslation(translationCandidate);
        if (germanTranslation) {
            // This is a rather dumb way of doing this.
            // Consider the example from above: "oida der fesche bursch han recht"
            // If "der fesche bursch" is found, the process could actually skip all translations overlapping
            // with that three words, since they cannot occurr in any other translation any more

            // However, we do it the simple way and add all found translations one after another (the largest first)
            // This will lead to translations that don't replace anything, but we tolerate this flaw (who cares)
            aussieWordsToReplace.push(germanTranslation);
        }
    }

    let result = line;

    for(const dbTranslation of aussieWordsToReplace) {
        const caseInsensitivePattern = new RegExp(dbTranslation.austrian, "ig");
        result = result.replaceAll(caseInsensitivePattern, dbTranslation.german as string);
    }

    for (const { pattern, translation } of simpleRules) {
        result = result.replaceAll(pattern, translation as string);
    }
    return result;
}

function* enumerateAdjacentTokens(tokens: string[]) {
    // Then, we want to return "oida holzi han recht" instead of "oida der fesche junge han recht"

    // In that case, a rather inefficient lookup is made to the database. This example does queries for the following joined tokens:
    // "oida der fesche bursch han recht" (startIndex = 0, adjacentTokenCount = 6)
    // "oida der fesche bursch han" (startIndex = 0, adjacentTokenCount = 5)
    // "der fesche bursch han recht" (startIndex = 1, adjacentTokenCount = 5)
    // "oida der fesche bursch" (startIndex = 0, adjacentTokenCount = 4)
    // "der fesche bursch han" (startIndex = 1, adjacentTokenCount = 4)
    // "fesche bursch han recht" (startIndex = 2, adjacentTokenCount = 4)
    // "oida der fesche" (startIndex = 0, adjacentTokenCount = 3)
    // "der fesche bursch" (startIndex = 1, adjacentTokenCount = 3)
    // "fesche bursch han" (startIndex = 2, adjacentTokenCount = 3)
    // "bursch han recht" (startIndex = 3, adjacentTokenCount = 3)
    // "oida der" (startIndex = 0, adjacentTokenCount = 2)
    // "der fesche" (startIndex = 1, adjacentTokenCount = 2)
    // "fesche bursch" (startIndex = 2, adjacentTokenCount = 2)
    // "bursch han" (startIndex = 3, adjacentTokenCount = 2)
    // "han recht" (startIndex = 4, adjacentTokenCount = 2)
    // "oida" (startIndex = 0, adjacentTokenCount = 1)
    // "der" (startIndex = 1, adjacentTokenCount = 1)
    // "fesche" (startIndex = 2, adjacentTokenCount = 1)
    // "bursch" (startIndex = 3, adjacentTokenCount = 1)
    // "han" (startIndex = 4, adjacentTokenCount = 1)
    // "recht" (startIndex = 5, adjacentTokenCount = 1)

    // As this is O(n^2) (probably a bit less, dunno), we try to conceal this by breaking up the message into lines
    // Loop invariant: startIndex + adjacentTokenCount is always <= tokens.length

    // tl;dr: Sliding window over all adjacent words, starting with the largest window size

    // TODO: If a message is really large without sufficient line breaks, we should break it apart heuristically

    for (let adjacentTokenCount = tokens.length; adjacentTokenCount > 0; --adjacentTokenCount) {
        for (let startIndex = 0; startIndex <= tokens.length - adjacentTokenCount; ++startIndex) {
            const adjacentTokensForStartIndex = tokens.slice(startIndex, startIndex + adjacentTokenCount);
            yield adjacentTokensForStartIndex.join(" ");
        }
    }
}

async function deOida(value: string): Promise<string> {
    const lines = value.split("\n")
        .map(s => s.trim())
        .map(deOidaLine);

    const translatedLines = await Promise.all(lines);

    return translatedLines.join("\n");
}

export const run: CommandFunction = async (_client, message, args, _context) => {
    const messageToTranslate = message.reference?.messageId
        ? (await message.channel.messages.fetch(message.reference.messageId))
        : message;

    if (!messageToTranslate) {
        return "Nichts zum Übersetzen da :question:";
    }

    const textToTranslate = messageToTranslate === message
        ? args.join(" ")
        : messageToTranslate.content;

    if (!textToTranslate) {
        return "Nichts zum Übersetzen da :question:";
    }

    const translation = await deOida(textToTranslate);

    await messageToTranslate.reply(`🇦🇹 -> 🇩🇪: ${translation}`);
};

export const description = `
Wendet super komplexes De-Oidering an.
Usage: Mit dem Command auf eine veroiderte (🇦🇹) Nachricht antworten. Alternativ den zu de-oiderten Text übergeben.
`.trim();
