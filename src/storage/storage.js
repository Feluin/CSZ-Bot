import * as path from "path";

import { Sequelize } from "sequelize";

// Models
import AdditionalMessageData from "./model/AdditionalMessageData";
import Birthday from "./model/Birthday";
import FadingMessage from "./model/FadingMessage";
import GuildRagequit from "./model/GuildRagequit";
import Stempel from "./model/Stempel";
import Ban from "./model/Ban";
import log from "../utils/logger";
import Penis from "./model/Penis";
import Nicknames from "./model/Nicknames";
import Boob from "./model/Boob";

export async function initialize() {
    const sequelize = new Sequelize({
        dialect: "sqlite",
        storage: path.resolve(__dirname, "..", "..", "storage.db"),
        logQueryParameters: true,
        logging: (sql) => {
            // currently way too noisy because of the fading messages
            if(!sql.includes(FadingMessage.tableName)) {
                log.debug(sql);
            }
        }
    });

    log.debug("Initializing Database Schemas...");

    FadingMessage.initialize(sequelize);
    AdditionalMessageData.initialize(sequelize);
    GuildRagequit.initialize(sequelize);
    Stempel.initialize(sequelize);
    Birthday.initialize(sequelize);
    Ban.initialize(sequelize);
    Penis.initialize(sequelize);
    Boob.initialize(sequelize);
    Nicknames.initialize(sequelize);

    await sequelize.sync();
}
