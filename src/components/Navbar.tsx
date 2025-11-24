import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/contexts/Web3Context";
import { Wallet, LogOut } from "lucide-react";

const Navbar = () => {
  const { account, isConnected, connect, disconnect } = useWeb3();

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <nav className="border-b border-border bg-card shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Wallet className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">DeFi Bank</h1>
            <p className="text-xs text-muted-foreground">Decentralized Banking Solution</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {isConnected && account ? (
            <>
              <div className="px-4 py-2 bg-secondary rounded-lg">
                <p className="text-sm font-medium text-secondary-foreground">
                  {formatAddress(account)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={disconnect}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Disconnect
              </Button>
            </>
          ) : (
            <Button onClick={connect} className="gap-2">
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
