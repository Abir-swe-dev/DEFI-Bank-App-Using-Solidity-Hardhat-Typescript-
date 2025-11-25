import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { deposit, withdraw } from "@/lib/web3";
import { toast } from "sonner";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";

const DepositWithdraw = () => {
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      await deposit(depositAmount);
      toast.success(`Successfully deposited ${depositAmount} ETH`);
      setDepositAmount("");
    } catch (error: any) {
      console.error("Deposit failed:", error);
      toast.error(error.message || "Deposit failed");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      await withdraw(withdrawAmount);
      toast.success(`Successfully withdrew ${withdrawAmount} ETH`);
      setWithdrawAmount("");
    } catch (error: any) {
      console.error("Withdrawal failed:", error);
      toast.error(error.message || "Withdrawal failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Deposit & Withdraw</h2>
        <p className="text-muted-foreground mt-1">Manage your account balance</p>
      </div>

      <Tabs defaultValue="deposit" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="deposit" className="gap-2">
            <ArrowDownCircle className="w-4 h-4" />
            Deposit
          </TabsTrigger>
          <TabsTrigger value="withdraw" className="gap-2">
            <ArrowUpCircle className="w-4 h-4" />
            Withdraw
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deposit">
          <Card>
            <CardHeader>
              <CardTitle>Deposit Funds</CardTitle>
              <CardDescription>
                Add ETH to your account balance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deposit-amount">Amount (ETH)</Label>
                <Input
                  id="deposit-amount"
                  type="number"
                  step="0.001"
                  placeholder="0.00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleDeposit} 
                disabled={loading}
                className="w-full"
              >
                {loading ? "Processing..." : "Deposit"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdraw">
          <Card>
            <CardHeader>
              <CardTitle>Withdraw Funds</CardTitle>
              <CardDescription>
                Transfer ETH from your account to your wallet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="withdraw-amount">Amount (ETH)</Label>
                <Input
                  id="withdraw-amount"
                  type="number"
                  step="0.001"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleWithdraw} 
                disabled={loading}
                className="w-full"
              >
                {loading ? "Processing..." : "Withdraw"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DepositWithdraw;
