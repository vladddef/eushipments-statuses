export default () => ({
  port: parseInt(process.env.APP_PORT ?? '3000', 10),
  db: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    sync: process.env.DB_SYNC === 'true',
  },
  eushipments: {
    apiUrl: process.env.EUSHIPMENTS_API_URL,
    apiVersion: process.env.EUSHIPMENTS_API_VERSION,
    apiKey: process.env.EUSHIPMENTS_API_KEY,
    cabinetUrl: process.env.EUSHIPMENTS_CABINET_URL,
    cabinetUsername: process.env.EUSHIPMENTS_CABINET_USERNAME,
    cabinetPassword: process.env.EUSHIPMENTS_CABINET_PASSWORD,
    syncStartDate: process.env.EUSHIPMENTS_SYNC_START_DATE,
    tgBotToken: process.env.EUSHIPMENTS_TG_BOT_TOKEN,
  },
});