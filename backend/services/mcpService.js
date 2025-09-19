const axios = require('axios');

async function generateScript(prompt) {
  try {
    const response = await axios.post(process.env.MCP_API_ENDPOINT, { prompt });
    return response.data.text || response.data.script || '';
  } catch (err) {
    console.error('MCP error:', err.message);
    return 'Error generating script';
  }
}

module.exports = { generateScript };
