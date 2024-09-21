import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import Knex from 'knex'

export default class DbCreate extends BaseCommand {
  static commandName = 'db:create'
  static description = ''

  static options: CommandOptions = {
    startApp: true,
    staysAlive: true,
  }

  async run() {
    const { default: env } = await import('#start/env')
    const databaseConfig = await import('#config/database')

    const connName = env.get('DB_CONNECTION')
    const conn: any = databaseConfig.default.connections[connName!]

    const envDBName = env.get('DB_DATABASE')
    const dbName = envDBName

    try {
      conn.connection.database = null

      const knex = Knex(conn)
      await knex.raw(`CREATE DATABASE ${dbName}`)
      await knex.destroy()
      this.logger.info(`DB (${dbName}) created`)
    } catch (e) {
      if (e.code === 'ER_DB_CREATE_EXISTS') {
        this.logger.error(`DB (${dbName}) already exist`)
      } else {
        this.logger.error(e)
      }
    }
  }
}
