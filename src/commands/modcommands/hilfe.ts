import type { MessageCommand } from "../command.js";
import type { BotContext } from "../../context.js";
import type { ProcessableMessage } from "../../service/commandService.js";

import { replacePrefixPlaceholders } from "../hilfe.js";
import * as commandService from "../../service/commandService.js";

export default class ModHilfeCommand implements MessageCommand {
    modCommand = true;
    name = "hilfe";
    description = "Listet alle mod-commands auf";

    async handleMessage(message: ProcessableMessage, context: BotContext): Promise<void> {
        const prefix = context.prefix.command;

        const commandObj: Record<string, string> = {};
        const newCommands = await commandService.readAvailableCommands(context);
        for (const command of newCommands) {
            if (!command.modCommand) {
                continue;
            }

            const commandStr = prefix + command.name;
            commandObj[commandStr] = replacePrefixPlaceholders(command.description, context);
        }

        let commandText = "";
        for (const [commandName, description] of Object.entries(commandObj)) {
            commandText += commandName;
            commandText += ":\n";
            commandText += replacePrefixPlaceholders(description, context);
            commandText += "\n\n";
        }

        // Add :envelope: reaction to authors message
        await message.author.send(
            `Hallo, ${message.author}!\n\nHier ist eine Liste mit mod-commands:\n\n\`\`\`CSS\n${commandText}\`\`\``,
        );
        await message.react("✉"); // Send this last, so we only display a confirmation when everything actually worked
    }
}
