import { ethers } from "ethers";
import DeFiBankABI from "../contracts/DeFiBank.json";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

let provider: ethers.BrowserProvider | null = null;
let signer: ethers.Signer | null = null;
let contract: ethers.Contract | null = null;

// Initialize Web3
export const initializeWeb3 = async () => {
  if (typeof (window as any).ethereum === "undefined") {
    throw new Error("Please install MetaMask!");
  }

  provider = new ethers.BrowserProvider((window as any).ethereum);
  signer = await provider.getSigner();
  contract = new ethers.Contract(CONTRACT_ADDRESS, DeFiBankABI.abi, signer);
  
  return { provider, signer, contract };
};

// Connect Wallet
export const connectWallet = async () => {
  if (typeof (window as any).ethereum === "undefined") {
    throw new Error("Please install MetaMask!");
  }

  const accounts = await (window as any).ethereum.request({
    method: "eth_requestAccounts",
  });
  await initializeWeb3();
  return accounts[0];
};

// Getters
export const getContract = () => {
  if (!contract) throw new Error("Contract not initialized");
  return contract;
};

export const getProvider = () => {
  if (!provider) throw new Error("Provider not initialized");
  return provider;
};

export const getSigner = () => {
  if (!signer) throw new Error("Signer not initialized");
  return signer;
};

// Helpers
export const formatEther = (value: bigint) => ethers.formatEther(value);
export const parseEther = (value: string) => ethers.parseEther(value);

// Check Account
export const checkAccountExists = async () => {
  try {
    const contract = getContract();
    const account = await contract.accounts(await getSigner().getAddress());
    return account.exists;
  } catch {
    return false;
  }
};

// Account Operations
export const createAccount = async () => {
  const contract = getContract();
  const tx = await contract.createAccount();
  await tx.wait();
  return tx;
};

export const deposit = async (amount: string) => {
  const contract = getContract();
  const tx = await contract.deposit({ value: parseEther(amount) });
  await tx.wait();
  return tx;
};

export const withdraw = async (amount: string) => {
  const contract = getContract();
  const tx = await contract.withdraw(parseEther(amount));
  await tx.wait();
  return tx;
};

export const transfer = async (toAddress: string, amount: string) => {
  const contract = getContract();
  const tx = await contract.transfer(toAddress, parseEther(amount));
  await tx.wait();
  return tx;
};

// Savings Operations
export const depositToSavings = async (amount: string) => {
  const contract = getContract();
  const tx = await contract.depositToSavings(parseEther(amount));
  await tx.wait();
  return tx;
};

export const withdrawFromSavings = async (amount: string) => {
  const contract = getContract();
  const tx = await contract.withdrawFromSavings(parseEther(amount));
  await tx.wait();
  return tx;
};

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
  minCollateralPercent: number
) => {
  const contract = getContract();
  const tx = await contract.createLoanOffer(
    parseEther(amount),
    interestRate * 100,
    durationInDays,
    minCollateralPercent
  );
  await tx.wait();
  return tx;
};

export const acceptLoanOffer = async (offerId: number) => {
  const contract = getContract();
  const tx = await contract.acceptLoanOffer(offerId);
  await tx.wait();
  return tx;
};

export const cancelLoanOffer = async (offerId: number) => {
  const contract = getContract();
  const tx = await contract.cancelLoanOffer(offerId);
  await tx.wait();
  return tx;
};

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

export const getLoan = async (index: number) => {
  const contract = getContract();
  const loan = await contract.getLoan(index);
  return {
    amount: formatEther(loan.amount),
    interestRate: Number(loan.interestRate),
    startTime: Number(loan.startTime),
    duration: Number(loan.duration),
    active: loan.active,
    repaidAmount: formatEther(loan.repaidAmount),
    totalDue: formatEther(loan.totalDue),
  };
};

export const getActiveLoanOffers = async () => {
  const contract = getContract();
  const offers = await contract.getActiveLoanOffers();
  return offers.map((offer: any) => ({
    id: Number(offer.id),
    lender: offer.lender,
    amount: formatEther(offer.amount),
    interestRate: Number(offer.interestRate),
    durationInDays: Number(offer.durationInDays),
    minCollateralPercent: Number(offer.minCollateralPercent),
    active: offer.active,
    borrower: offer.borrower,
  }));
};

export const getTransactionHistory = async () => {
  const contract = getContract();
  const transactions = await contract.getTransactionHistory();
  return transactions.map((tx: any) => ({
    from: tx.from,
    to: tx.to,
    amount: formatEther(tx.amount),
    timestamp: Number(tx.timestamp),
    transactionType: tx.transactionType,
  }));
};
