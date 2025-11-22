import {ethers} from 'ethers';
import DeFiBankABI from "../contracts/defiBank-address.json";

let provider: ethers.BrowserProvider | null = null;
let signer: ethers.Signer | null = null;
let contract: ethers.Contract | null = null;

const CONTRACT_ADDrESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const initializeWeb3 = async () => {
    if(typeof (window as any).ethereum !== 'undefined') {
        try {
            provider = new ethers.BrowserProvider((window as any).ethereum);
            signer = await provider.getSigner();
            contract = new ethers.Contract(CONTRACT_ADDrESS, DeFiBankABI.abi, signer);
            return {provider, signer, contract};
        } catch (error) {
            console.error("Error initializing web3:", error);
            throw error;
        }
    } else {
        throw new Error("Please Install MetaMask!");
    }
}

export const connectWallet = async () => {
    if(typeof (window as any).ethereum !== 'undefined') {
        try {
            const accounts = await (window as any).ethereum.request({
                method: 'eth_requestAccounts'
            });
            await initializeWeb3();
            return accounts[0];
        } catch (error) {
            console.error("Error connecting wallet:", error);
            throw error;
        }
    } else {
        throw new Error("Please Install MetaMask!");
    }
}

export const getContract = () => {
    if(!contract) {
        throw new Error("Contract is not initialized. Please call initializeWeb3 first.");
    }
    return contract;
}

export const getProvider = () => {
    if(!provider) {
        throw new Error("Provider is not initialized. Please call initializeWeb3 first.");
    }
    return provider;
}

