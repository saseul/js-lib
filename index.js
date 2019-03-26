const crypto = require('crypto');

const nacl = require('tweetnacl');

const { keyPair } = nacl.sign;

const dayjs = require('dayjs');

const http = require('./http');

const ADDRESS_PREFIX = '0x6f';
const ADDRESS_SALT_PREFIX = '0x00';

const pad = (source, length) => source.padStart(length, '0');

const fromHex = x => Buffer.from(x, 'hex');
const toHex = x => Buffer.from(x).toString('hex');

const sha256 = x => crypto.createHash('sha256').update(x).digest('hex');
const rmd160 = x => crypto.createHash('rmd160').update(x).digest('hex');

const makePrivateKey = () => {
  const privateKey = crypto.randomBytes(24);
  const time = process.hrtime.bigint().toString(16);
  return toHex(privateKey) + pad(time, 16);
};

const makePublicKey = privateKey => {
  const { publicKey } = keyPair.fromSeed(fromHex(privateKey));
  return toHex(publicKey);
};

const makeAddress = publicKey => {
  const digest = sha256(ADDRESS_SALT_PREFIX + publicKey);
  const address = ADDRESS_PREFIX + rmd160(digest);
  const checksum = sha256(sha256(address)).slice(0, 4);
  return address + checksum;
};

const createAccount = seed => {
  const privateKey = seed || makePrivateKey();
  const publicKey = makePublicKey(privateKey || makePrivateKey());
  const address = makeAddress(publicKey);
  return { privateKey, publicKey, address };
};

const sign = (data, { privateKey }) => {
  const { secretKey } = keyPair.fromSeed(fromHex(privateKey));
  const signature = nacl.sign.detached(Buffer.from(data), secretKey);
  return toHex(signature);
};

const signTransaction = (transaction, { privateKey, publicKey }) => {
  const rawTransaction = JSON.stringify(transaction);
  const thash = sha256(rawTransaction);

  return {
    thash,
    transaction: rawTransaction,
    public_key: publicKey,
    signature: sign(thash, { privateKey }),
  };
};

const sendTransaction = async (transaction, account) => {
  const signedTransaction = signTransaction(transaction, account);
  const { body } = await http.request('/transaction', signedTransaction);
  return {
    thash: signedTransaction.thash,
    transaction: body.transaction,
  };
};

const signRequest = (request, { privateKey, publicKey }) => {
  const rawRequest = JSON.stringify(request);
  const digest = sha256(rawRequest);

  return {
    request: rawRequest,
    public_key: publicKey,
    signature: sign(digest, { privateKey }),
  };
};

const sendRequest = async (request, account) => {
  const signedRequest = signRequest(request, account);
  const { body } = await http.request('/request', signedRequest);
  return body;
};

const getBalance = async (account) => {
  const request = {
    version: '0.5',
    type: 'GetBalance',
    from: account.address,
    timestamp: dayjs().valueOf() * 1000,
  };
  return await sendRequest(request, account);
};

const getTransactions = async ({ address }) => {
  const { body } = await http.request('/simple/gettransactions', {
    address,
  });
  return body;
};

module.exports = {
  pad,
  sha256,
  rmd160,
  createAccount,
  sign,
  signTransaction,
  sendTransaction,
  signRequest,
  sendRequest,
  getBalance,
  getTransactions,
};
