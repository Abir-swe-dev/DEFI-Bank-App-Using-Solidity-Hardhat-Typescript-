import { ethers } from "ethers";
import DeFiBankABI from "../contracts/DeFiBank.json";

let provider: ethers.BrowserProvider | null = null;
let signer: ethers.Signer | null = null;
let contract: ethers.Contract | null = null;

// Contract address - update after deployment
const CONTRACT_ADDRESS = " 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"; // Localhost default

export const initializeWeb3 = async () => {
  if (typeof (window as any).ethereum !== "undefined") {
    try {
      provider = new ethers.BrowserProvider((window as any).ethereum);
      signer = await provider.getSigner();
      contract = new ethers.Contract(CONTRACT_ADDRESS, DeFiBankABI.abi, signer);
      return { provider, signer, contract };
    } catch (error) {
      console.error("Failed to initialize Web3:", error);
      throw error;
    }
  } else {
    throw new Error("Please install MetaMask!");
  }
};

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

export const getSigner = () => {
    if(!signer) {
        throw new Error("Signer is not initialized. Please call initializeWeb3 first.");
    }
    return signer;
}

export const formatEther = (value:bigint) => ethers.formatEther(value);
export const parseEther = (value:string) => ethers.parseEther(value);


export const checkAccountExists = async () => {
  try {
    const contract = getContract();
    const account = await contract.accounts(await getSigner().getAddress());
    return account.exists;
  } catch (error) {
    return false;
  }
};


// Account Operations

export const createAccount = async () => {
    const contract = getContract();
    const tx = await contract.createAccount();
    await tx.wait();
    return tx;
}

export const deposit = async (amount:string) => {
    const contract = getContract();
    const tx = await contract.deposit({ value: parseEther(amount) });
    await tx.wait();
    return tx;
}


export const withdraw = async (amount:string) => {
    const contract = getContract();
    const tx = await contract.withdraw(parseEther(amount));
    await tx.wait();
    return tx;
}

export const transfer = async(toAddress: string, amount:string) => {
    const contract = getContract();
    const tx = await contract.transfer(toAddress, parseEther(amount));
    await tx.wait();
    return tx;
}

// Savings Operations

export const depositToSavings = async (amount:string) => {
    const contract = getContract();
    const tx = await contract.depositToSavings(parseEther(amount));
    await tx.wait();
    return tx;
}

export const withdrawFromSavings = async (amount:string) => {
    const contract = getContract();
    const tx = await contract.withdrawFromSavings(parseEther(amount));
    await tx.wait();
    return tx;
}


// Loan Operations

export const takeLoan = async (amount: string, durationInDays: number) => {
  const contract = getContract();
  const tx = await contract.takeLoan(parseEther(amount), durationInDays);
  await tx.wait();
  return tx;
};

export const repayLoan = async (loanIndex: number, amount: string) => {
  const contract = getContract();
  const tx = await contract.repayLoan(loanIndex, parseEther(amount));
  await tx.wait();
  return tx;
};

// P2P Lending Operations

export const createLoanOffer = async (
  amount: string,
  interestRate: number,
  durationInDays: number,
  minCollateralRatio: number
) => {
  const contract = getContract();
  const tx = await contract.createLoanOffer(
    parseEther(amount),
    interestRate*100,
    durationInDays,
    minCollateralRatio
  );
  await tx.wait();
  return tx;
}

export const acceptLoanOffer = async (offerId:number) => {
  const contract = getContract();
  const tx = await contract.acceptLoanOffer(offerId);
  await tx.wait();
  return tx;
}

export const cancelLoanOffer = async (offerId:number) => {
  const contract = getContract();
  const tx = await contract.cancelLoanOffer(offerId);
  await tx.wait();
  return tx;
}

// View Functions
export const getBalance = async () => {
  const contract = getContract();
  const balance = await contract.getBalance();
  return formatEther(balance);
};

export const getSavingsBalance = async () => {
  const contract = getContract();
  const balance = await contract.getSavingsBalance();
  return formatEther(balance);
};

export const getLoanCount = async () => {
  const contract = getContract();
  const count = await contract.getLoanCount();
  return Number(count);
};


