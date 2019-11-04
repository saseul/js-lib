const axios = require('axios');

const instance = axios.create({
  baseURL: process.env.SASEUL_API_BASE_URL || 'http://localhost:8080',
});

const request = async (path, params) => {
  const { body } = await instance.get(path, { params });
  return { body };
};

module.exports = {
  request,
};
