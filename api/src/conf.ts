/**
 * This module provides type information for the bits of configuration the API needs.
 * We use classes instead of interfaces to enforce the immutability of the values.
 */
import * as nconf from 'nconf';

export class DBConfig {
    public constructor(
        readonly host: string,
        readonly database: string,
        readonly user: string,
        readonly password: string,
        readonly port?: number,
        readonly schema?: string
    ) {}

    public withoutSchema(): DBConfig {
        return new DBConfig(
            this.host,
            this.database,
            this.user,
            this.password,
            this.port
        );
    }
}

export class S2APIConfig {
    public constructor(readonly apiKey?: string) {}
}

export class Config {
    constructor(
        readonly db: DBConfig,
        readonly s2: S2APIConfig
    ) {}

    static fromConfig(conf: nconf.Provider) {
        const db = conf.get("database");
        const s2 = conf.get("s2"); 
        const algolia = conf.get("algolia");
        return new Config(
            new DBConfig(db.host, db.database, db.user, db.password, db.port, db.schema),
            new S2APIConfig(s2 && s2.apiKey)
        );
    }
}
