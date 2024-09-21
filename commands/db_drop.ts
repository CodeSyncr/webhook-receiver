import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import Knex from 'knex'

export default class DbDrop extends BaseCommand {
  static commandName = 'db:drop'
  static description = 'drop database'

  static options: CommandOptions = {
    startApp: true,
    staysAlive: true,
  }

  async run(): Promise<void> {
    const { default: env } = await import('#start/env')
    const databaseConfig = await import('#config/database')

    const connName = env.get('DB_CONNECTION')
    const conn: any = databaseConfig.default.connections[connName!]
    const envDBName = env.get('DB_DATABASE')
    const dbPassword = env.get('DB_PASSWORD')

    const dbName = envDBName

    try {
      const knexWithoutDB = Knex({
        client: conn.client,
        connection: {
          ...conn.connection,
          database: connName, // Use a default database like 'postgres'
          password: dbPassword,
        },
      })
      await knexWithoutDB.raw(`DROP DATABASE ${dbName}`)
      await knexWithoutDB.destroy()
      this.logger.info(`DB (${dbName}) dropped`)
    } catch (e) {
      if (e.code === 'ER_BAD_DB_ERROR') {
        this.logger.error(`DB (${dbName}) doesn't exist`)
      } else {
        this.logger.error(e)
      }
    }
  }
}
