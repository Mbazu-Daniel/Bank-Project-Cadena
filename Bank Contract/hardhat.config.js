require("@nomiclabs/hardhat-waffle"); // library from Hardhat to enable us write this kind of code
require("dotenv").config({ path: ".env" }); // This gets the environment variables

const POKT_RINKEBY_URL = process.env.POKT_RINKEBY_URL;
const RINKEBY_PRIVATE_KEY = process.env.RINKEBY_PRIVATE_KEY;

module.exports = {
  solidity: "0.8.4",
  networks: {
    rinkeby: {
      url: POKT_RINKEBY_URL,
      accounts: [RINKEBY_PRIVATE_KEY],
    },
  },

  // networks: {
  //   ganache: {
  //     url: "localhost", // Localhost (default: none)
  //     accounts: "remote", // Port number
  //     // network_id: "*" // Match any network id
  //   },
  // },
};


