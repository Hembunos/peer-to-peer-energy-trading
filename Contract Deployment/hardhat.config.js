require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.18",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545",
      chainID: 1337,
      accounts: [
        "0xbadd8a6222b645f4601b8380d4ece5ed108140f4eba9ed4290c853168b810590",
      ],
      gas: 6000000,
    },
  },
};
