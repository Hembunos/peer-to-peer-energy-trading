require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.18",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545",
      chainID: 1337,
      accounts: [
        "0xb7b8059c9298dc0d40ff046ec30b538aff3e742930802409a90e7878ad2e8dab",
      ],
      gas: 6000000,
    },
  },
};
