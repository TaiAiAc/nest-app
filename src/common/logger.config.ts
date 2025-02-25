import { WinstonModule, utilities as nestWinstonModuleUtilities } from 'nest-winston'
import { ElasticsearchTransport } from 'winston-elasticsearch'
import * as winston from 'winston'
import * as DailyRotateFile from 'winston-daily-rotate-file'
import { WinstonModuleOptions } from 'nest-winston'

const esTransport = new ElasticsearchTransport({
  level: 'info',
  clientOpts: {
    node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
    maxRetries: 5,
    requestTimeout: 60000
  },
  indexPrefix: 'nest-app-logs',
  source: '@type',
  transformer: logData => {
    return {
      '@timestamp': new Date().toISOString(),
      severity: logData.level,
      message: logData.message,
      ...logData.meta
    }
  }
})

const fileTransport = new DailyRotateFile({
  dirname: 'logs',
  filename: 'app-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json())
})

export const loggerConfig: WinstonModuleOptions = {
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.ms(),
        winston.format.colorize(),
        nestWinstonModuleUtilities.format.nestLike('NestApp', {
          prettyPrint: true,
          colors: true
        })
      )
    }),
    fileTransport,
    esTransport
  ]
}
