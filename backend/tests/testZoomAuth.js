const axios = require('axios');
require('dotenv').config({path:"../.env"});

async function testZoomAuth() {
  try {
    console.log('Testing Zoom Authentication...');
    console.log('Environment variables loaded:');
    console.log('ZOOM_ACCOUNT_ID:', process.env.ZOOM_ACCOUNT_ID ? '✓ Present' : '✗ Missing');
    console.log('ZOOM_CLIENT_ID:', process.env.ZOOM_CLIENT_ID ? '✓ Present' : '✗ Missing');
    console.log('ZOOM_CLIENT_SECRET:', process.env.ZOOM_CLIENT_SECRET ? '✓ Present' : '✗ Missing');
    console.log('ZOOM_USER_ID:', process.env.ZOOM_USER_ID ? '✓ Present' : '✗ Missing');

    const accountId = process.env.ZOOM_ACCOUNT_ID;
    const clientId = process.env.ZOOM_CLIENT_ID;
    const clientSecret = process.env.ZOOM_CLIENT_SECRET;

    if (!accountId || !clientId || !clientSecret) {
      throw new Error('Missing required Zoom credentials in environment variables');
    }

    console.log('\nAttempting to get access token...');
    const tokenUrl = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`;
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const res = await axios.post(tokenUrl, null, {
      headers: {
        Authorization: `Basic ${basicAuth}`,
      },
    });

    console.log('✓ Successfully obtained access token');
    console.log('Token expires in:', res.data.expires_in, 'seconds');

    // Test creating a meeting
    console.log('\nTesting meeting creation...');
    const meetingRes = await axios.post(
      `https://api.zoom.us/v2/users/${process.env.ZOOM_USER_ID}/meetings`,
      {
        topic: 'Test Meeting',
        type: 2,
        start_time: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        duration: 30,
        timezone: 'UTC',
        settings: {
          join_before_host: true,
          approval_type: 0,
          registration_type: 1,
          enforce_login: false,
          waiting_room: true
        }
      },
      {
        headers: {
          Authorization: `Bearer ${res.data.access_token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✓ Successfully created test meeting');
    console.log('Meeting ID:', meetingRes.data.id);
    console.log('Join URL:', meetingRes.data.join_url);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testZoomAuth(); 