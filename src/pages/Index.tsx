import { useState, useEffect } from "react";
import { useWeb3 } from "@/contexts/Web3Context";
import Navbar from "@/components/Navbar";
// import Dashboard from "@/components/Dashboard";
// import DepositWithdraw from "@/components/DepositWithdraw";
// import Savings from "@/components/Savings";
// import Loans from "@/components/Loans";
// import Transactions from "@/components/Transactions";
// import Transfer from "@/components/Transfer";
// import P2PLending from "@/components/P2PLending";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { createAccount, checkAccountExists } from "@/lib/web3";
import { toast } from "sonner";
import { 
  LayoutDashboard, 
  Wallet, 
  PiggyBank, 
  CreditCard, 
  Receipt, 
  Send,
  Handshake
} from "lucide-react";

const Index = () => {
  const { isConnected } = useWeb3();
  const [hasAccount, setHasAccount] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingAccount, setCheckingAccount] = useState(true);

  useEffect(() => {
    if (isConnected) {
      checkAccount();
    } else {
      setCheckingAccount(false);
    }
  }, [isConnected]);

  const checkAccount = async () => {
    setCheckingAccount(true);
    try {
      const exists = await checkAccountExists();
      setHasAccount(exists);
    } catch (error) {
      console.error("Error checking account:", error);
    } finally {
      setCheckingAccount(false);
    }
  };

  const handleCreateAccount = async () => {
    setLoading(true);
    try {
      await createAccount();
      setHasAccount(true);
      toast.success("Account created successfully!");
    } catch (error: any) {
      console.error("Failed to create account:", error);
      if (error.message.includes("Account already exists")) {
        setHasAccount(true);
        toast.info("Account already exists");
      } else {
        toast.error(error.message || "Failed to create account");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">Welcome to DeFi Bank</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Connect your wallet to access decentralized banking services
            </p>
            <p className="text-sm text-muted-foreground">
              Please connect your MetaMask wallet to continue
            </p>
          </div>
        </div>
      </>
    );
  }

  if (checkingAccount) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Wallet className="w-10 h-10 text-primary-foreground" />
            </div>
            <p className="text-lg text-muted-foreground">Checking account status...</p>
          </div>
        </div>
      </>
    );
  }

  if (!hasAccount) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">Create Your Account</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Set up your DeFi Bank account to start managing your finances
            </p>
            <Button 
              onClick={handleCreateAccount} 
              disabled={loading}
              size="lg"
              className="px-8"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 gap-2">
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="deposit-withdraw" className="gap-2">
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">Deposit</span>
            </TabsTrigger>
            <TabsTrigger value="savings" className="gap-2">
              <PiggyBank className="w-4 h-4" />
              <span className="hidden sm:inline">Savings</span>
            </TabsTrigger>
            <TabsTrigger value="loans" className="gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Bank Loans</span>
            </TabsTrigger>
            <TabsTrigger value="p2p" className="gap-2">
              <Handshake className="w-4 h-4" />
              <span className="hidden sm:inline">P2P Lending</span>
            </TabsTrigger>
            <TabsTrigger value="transfer" className="gap-2">
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Transfer</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="gap-2">
              <Receipt className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
          </TabsList>

          {/* <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent> */}

          {/* <TabsContent value="deposit-withdraw">
            <DepositWithdraw />
          </TabsContent>

          <TabsContent value="savings">
            <Savings />
          </TabsContent>

          <TabsContent value="loans">
            <Loans />
          </TabsContent>

          <TabsContent value="p2p">
            <P2PLending />
          </TabsContent>

          <TabsContent value="transfer">
            <Transfer />
          </TabsContent>

          <TabsContent value="transactions">
            <Transactions />
          </TabsContent> */}
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
