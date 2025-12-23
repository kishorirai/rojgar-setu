const axios = require('axios');
require('dotenv').config({path: '../.env'});

async function getZoomAccessToken() {
  const accountId = process.env.ZOOM_ACCOUNT_ID;
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;

  const tokenUrl = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`;
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await axios.post(tokenUrl, null, {
    headers: {
      Authorization: `Basic ${basicAuth}`,
    },
  });
  return res.data.access_token;
}

module.exports = getZoomAccessToken; 