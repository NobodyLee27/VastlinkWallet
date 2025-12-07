export default () => ({
  signer: {
    privateKey: process.env.PRIVATE_KEY ?? '',
    ethPrivateKey: process.env.ETHEREUM_PRIVATE_KEY ?? '',
    litNetwork: process.env.LIT_NETWORK ?? 'DatilDev',
    pkpPublicKey: process.env.LIT_PKP_PUBLIC_KEY ?? '',
  },
});
