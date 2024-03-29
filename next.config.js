module.exports = {
  reactStrictMode: true,
  env: {
    WEBSITE_URL: process.env.WEBSITE_URL,
    WEBSITE_EMAIL: process.env.WEBSITE_EMAIL,
    WEBSITE_ADDRESS_NAME: process.env.WEBSITE_ADDRESS_NAME,
    WEBSITE_ADDRESS_STREET: process.env.WEBSITE_ADDRESS_STREET,
    WEBSITE_ADDRESS_CITY: process.env.WEBSITE_ADDRESS_CITY,
    NUDEPLACES_BACKEND_URL: process.env.NUDEPLACES_BACKEND_URL,
    NUDEPLACES_BACKEND_URL_DEV: process.env.NUDEPLACES_BACKEND_URL_DEV,
  }
}
