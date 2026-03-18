export default () => ({
  port: parseInt(process.env.APP_PORT ?? '3000', 10),
  eushipments: {
    apiUrl: process.env.EUSHIPMENTS_API_URL,
    apiVersion: process.env.EUSHIPMENTS_API_VERSION,
    apiKey: process.env.EUSHIPMENTS_API_KEY,
    cabinetUrl: process.env.EUSHIPMENTS_CABINET_URL,
    cabinetUsername: process.env.EUSHIPMENTS_CABINET_USERNAME,
    cabinetPassword: process.env.EUSHIPMENTS_CABINET_PASSWORD,
    tgBotToken: process.env.EUSHIPMENTS_TG_BOT_TOKEN,
  },
});