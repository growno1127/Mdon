import dotenv from 'dotenv'
import express from 'express'
import redis from 'redis'
import pg from 'pg'
import log from 'npmlog'

const env = process.env.NODE_ENV || 'development'

dotenv.config({
  path: env === 'production' ? '.env.production' : '.env'
})

const pgConfigs = {
  development: {
    database: 'mastodon_development',
    host:     '/var/run/postgresql',
    max:      10
  },

  production: {
    user:     process.env.DB_USER || 'mastodon',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'mastodon_production',
    host:     process.env.DB_HOST || 'localhost',
    port:     process.env.DB_PORT || 5432,
    max:      10
  }
}

const app = express()
const pgPool = new pg.Pool(pgConfigs[env])

const authenticationMiddleware = (req, res, next) => {
  const authorization = req.get('Authorization')

  if (!authorization) {
    err = new Error('Missing access token')
    err.statusCode = 401

    return next(err)
  }

  const token = authorization.replace(/^Bearer /, '')

  pgPool.connect((err, client, done) => {
    if (err) {
      return next(err)
    }

    client.query('SELECT oauth_access_tokens.resource_owner_id, users.account_id FROM oauth_access_tokens INNER JOIN users ON oauth_access_tokens.resource_owner_id = users.id WHERE oauth_access_tokens.token = $1 LIMIT 1', [token], (err, result) => {
      done()

      if (err) {
        return next(err)
      }

      if (result.rows.length === 0) {
        err = new Error('Invalid access token')
        err.statusCode = 401

        return next(err)
      }

      req.accountId = result.rows[0].account_id

      next()
    })
  })
}

const errorMiddleware = (err, req, res, next) => {
  log.error(err)
  res.writeHead(err.statusCode || 500, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: err.statusCode ? `${err}` : 'An unexpected error occured' }))
}

const placeholders = (arr, shift = 0) => arr.map((_, i) => `$${i + 1 + shift}`).join(', ');

const streamFrom = (id, req, res, needsFiltering = false) => {
  log.verbose(`Starting stream from ${id} for ${req.accountId}`)

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Transfer-Encoding', 'chunked')

  const redisClient = redis.createClient({
    host:     process.env.REDIS_HOST     || '127.0.0.1',
    port:     process.env.REDIS_PORT     || 6379,
    password: process.env.REDIS_PASSWORD
  })

  redisClient.on('message', (channel, message) => {
    const { event, payload } = JSON.parse(message)

    // Only messages that may require filtering are statuses, since notifications
    // are already personalized and deletes do not matter
    if (needsFiltering && event === 'update') {
      pgPool.connect((err, client, done) => {
        if (err) {
          log.error(err)
          return
        }

        const unpackedPayload  = JSON.parse(payload)
        const targetAccountIds = [unpackedPayload.account.id].concat(unpackedPayload.mentions.map(item => item.id)).concat(unpackedPayload.reblog ? [unpackedPayload.reblog.account.id] : [])

        client.query(`SELECT target_account_id FROM blocks WHERE account_id = $1 AND target_account_id IN (${placeholders(targetAccountIds, 1)})`, [req.accountId].concat(targetAccountIds), (err, result) => {
          done()

          if (err) {
            log.error(err)
            return
          }

          if (result.rows.length > 0) {
            return
          }

          res.write(`event: ${event}\n`)
          res.write(`data: ${payload}\n\n`)
        })
      })
    } else {
      res.write(`event: ${event}\n`)
      res.write(`data: ${payload}\n\n`)
    }
  })

  const heartbeat = setInterval(() => res.write(':thump\n'), 15000)

  req.on('close', () => {
    log.verbose(`Ending stream from ${id} for ${req.accountId}`)
    clearInterval(heartbeat)
    redisClient.quit()
  })

  redisClient.subscribe(id)
}

app.use(authenticationMiddleware)
app.use(errorMiddleware)

app.get('/api/v1/streaming/user',    (req, res) => streamFrom(`timeline:${req.accountId}`, req, res))
app.get('/api/v1/streaming/public',  (req, res) => streamFrom('timeline:public', req, res, true))
app.get('/api/v1/streaming/hashtag', (req, res) => streamFrom(`timeline:hashtag:${req.params.tag}`, req, res, true))

log.level = 'verbose'
log.info(`Starting HTTP server on port ${process.env.PORT || 4000}`)

app.listen(process.env.PORT || 4000)
