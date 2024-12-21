class HyperliquidError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ClientError extends HyperliquidError {
  constructor(statusCode, errorCode, errorMessage, headers, errorData = null) {
    super(errorMessage);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.headers = headers;
    this.errorData = errorData;
  }
}

class ServerError extends HyperliquidError {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = {
  HyperliquidError,
  ClientError,
  ServerError
};
