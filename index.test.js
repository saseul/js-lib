const {
  sha256,
  createAccount,
  sign,
  signTransaction,
  signRequest,
} = require('.');

describe('Saseul.js', () => {
  describe('createAccount', () => {
    const privateKey = '0'.repeat(32 * 2);

    it('returns a new account', () => {
      const account = createAccount(privateKey);

      expect(account.privateKey).toHaveLength(32 * 2);
      expect(account.publicKey).toHaveLength(32 * 2);
      expect(account.address).toHaveLength(24 * 2);

      expect(account.privateKey).toBe(privateKey);

      expect(account.publicKey).toContain('3b6a27b');

      expect(account.address).toContain('0x6f3b');
      expect(account.address).toContain('0f5b');
    });
  });

  describe('sign', () => {
    const privateKey = '0'.repeat(32 * 2);

    const transaction = {
      version: '0.5',
      type: 'SendCoin',
      from: '0xFROM',
      to: '0xTO',
      amount: '1',
      fee: '0.003',
      timestamp: 1000000,
    };

    beforeEach(() => {
      this.account = createAccount(privateKey);
    });

    it('returns signature', () => {
      const rawTransaction = JSON.stringify(transaction);
      const txid = sha256(rawTransaction);

      const signature = sign(txid, this.account);

      expect(signature).toHaveLength(64 * 2);
      expect(signature).toContain('dd30a62');
    });
  });

  describe('signTransaction', () => {
    const privateKey = '0'.repeat(32 * 2);

    const transaction = {
      version: '0.5',
      type: 'SendCoin',
      from: '0xFROM',
      to: '0xTO',
      amount: '1',
      fee: '0.003',
      timestamp: 1000000,
    };

    beforeEach(() => {
      this.account = createAccount(privateKey);
    });

    it('returns signed transaction', () => {
      const signedTransaction = signTransaction(transaction, this.account);

      expect(signedTransaction.thash).toContain('3f2cf30');
      expect(signedTransaction.transaction).toContain('"type":"SendCoin"');
      expect(signedTransaction.public_key).toContain('3b6a27b');
      expect(signedTransaction.signature).toContain('dd30a62');
    });
  });

  describe('signRequest', () => {
    const privateKey = '0'.repeat(32 * 2);

    const request = {
      version: '0.5',
      type: 'GetBalance',
      from: '0xFROM',
      timestamp: 1000000,
    };

    beforeEach(() => {
      this.account = createAccount(privateKey);
    });

    it('returns signed request', () => {
      const signedRequest = signRequest(request, this.account);

      expect(signedRequest.request).toContain('"type":"GetBalance"');
      expect(signedRequest.public_key).toContain('3b6a27b');
      expect(signedRequest.signature).toContain('cee2f80');
    });
  });
});
