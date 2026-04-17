import hardhatEthers from "@nomicfoundation/hardhat-ethers";
import { defineConfig } from "hardhat/config";
import dotenv from "dotenv";

dotenv.config();

const {
  RPC_URL,
  RPC_URL_SEPOLIA,
  RPC_URL_MUMBAI,
  PRIVATE_KEY,
} = process.env;
const networks = {};

const sepoliaUrl = RPC_URL_SEPOLIA || RPC_URL;
const mumbaiUrl = RPC_URL_MUMBAI || RPC_URL;

if (sepoliaUrl && PRIVATE_KEY) {
  networks.sepolia = {
    type: "http",
    url: sepoliaUrl,
    accounts: [PRIVATE_KEY],
    chainId: 11155111,
  };
}

if (mumbaiUrl && PRIVATE_KEY) {
  networks.mumbai = {
    type: "http",
    url: mumbaiUrl,
    accounts: [PRIVATE_KEY],
    chainId: 80001,
  };
}

export default defineConfig({
  plugins: [hardhatEthers],
  solidity: "0.8.28",
  networks,
});
