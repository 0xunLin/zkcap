/**
 * CLI configuration — backend URL and GitHub OAuth settings.
 */

const config = {
  // Backend API base URL
  backendUrl: process.env.ZKCAP_API_URL || 'http://localhost:8000',

  // GitHub OAuth Device Flow endpoints
  github: {
    clientId: process.env.ZKCAP_GITHUB_CLIENT_ID || '',
    deviceCodeUrl: 'https://github.com/login/device/code',
    accessTokenUrl: 'https://github.com/login/oauth/access_token',
    userUrl: 'https://api.github.com/user',
    scopes: 'repo read:user',
  },

  // Credentials file path
  credentialsDir: '.zkcap',
  credentialsFile: 'credentials.json',
};

export default config;
