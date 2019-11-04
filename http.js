const axios = require('axios');

const instance = axios.create({
  baseURL: process.env.SASEUL_API_BASE_URL || 'http://localhost:8080',
});

const request = async (path, params) => {
  const { data } = await instance.get(path, { params });

  if (data.status === 'fail') {
    throw Object.assign({}, data, { message: data.msg });
  }

  return { body: data.data };
};

module.exports = {
  request,
};
