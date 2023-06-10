require('dotenv').config();
const { MNEMONIC, PROJECT_ID } = process.env;

const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
    },
    goerli: {
      provider: function () { return new HDWalletProvider({ mnemonic: { phrase: MNEMONIC }, providerOrUrl: `https://goerli.infura.io/v3/${process.env.INFURA_ID}` }) },
      network_id: 5,
    },
    mumbai: {
      provider: function () { return new HDWalletProvider({ mnemonic: { phrase: MNEMONIC }, providerOrUrl: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_ID}` }) },
      network_id: 80001,
    },
  },

  // Set default mocha options here, use special reporters, etc.
  mocha: {
    reporter: 'eth-gas-reporter',
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.20",
      settings: {
        optimizer: {
          enabled: false,
          runs: 200
        },
      }
    }
  },
};
