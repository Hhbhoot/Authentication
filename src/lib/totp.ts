import { 
  TOTP, 
  generateURI, 
  NobleCryptoPlugin, 
  ScureBase32Plugin 
} from 'otplib';

/**
 * Configure TOTP for Google Authenticator compatibility
 * (Base32 secret, 6 digits, 30s window)
 */
const totpInstance = new TOTP({
  crypto: new NobleCryptoPlugin(),
  base32: new ScureBase32Plugin(),
});

export const authenticator = {
  generateSecret: (length: number = 20) => {
    // @ts-expect-error - length is supported by the underlying implementation
    return totpInstance.generateSecret(length);
  },
  
  generate: async (secret: string) => {
    return totpInstance.generate({ secret });
  },

  verify: async (options: { token: string; secret: string }) => {
    return totpInstance.verify(options.token, { secret: options.secret });
  },

  generateURI: (options: { issuer: string; accountName: string; secret: string }) => {
    return generateURI({
      issuer: options.issuer,
      label: options.accountName,
      secret: options.secret,
      strategy: 'totp',
    });
  }
};
