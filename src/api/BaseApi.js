const axios = require('axios');
const { URLS } = require('../utils/constants');
const { ClientError, ServerError } = require('../utils/errors');

class BaseApi {
  constructor(baseUrl = null) {
    this.baseUrl = baseUrl || URLS.MAINNET.API;
    this.session = axios.create({
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async post(urlPath, payload = {}) {
    try {
      const url = this.baseUrl + urlPath;
      const response = await this.session.post(url, payload);
      return response.data;
    } catch (error) {
      this._handleException(error);
    }
  }

  _handleException(error) {
    const response = error.response;
    if (!response) {
      throw error;
    }

    const statusCode = response.status;
    if (statusCode < 400) {
      return;
    }

    if (statusCode >= 400 && statusCode < 500) {
      try {
        const err = response.data;
        if (!err) {
          throw new ClientError(statusCode, null, response.data, null, response.headers);
        }
        throw new ClientError(
          statusCode,
          err.code,
          err.msg,
          response.headers,
          err.data
        );
      } catch (e) {
        if (e instanceof ClientError) {
          throw e;
        }
        throw new ClientError(statusCode, null, response.data, null, response.headers);
      }
    }

    throw new ServerError(statusCode, response.data);
  }
}

module.exports = BaseApi;
