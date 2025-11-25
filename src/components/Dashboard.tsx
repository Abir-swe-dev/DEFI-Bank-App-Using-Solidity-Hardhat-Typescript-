import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpCircle, ArrowDownCircle, Wallet, TrendingUp, DollarSign, CreditCard } from "lucide-react";
import { useState, useEffect } from "react";
import { getBalance, getSavingsBalance, getLoanCount, getTransactionHistory } from "@/lib/web3";

const Dashboard = () => {
  const [balance, setBalance] = useState("0");
  const [savingsBalance, setSavingsBalance] = useState("0");
  const [loanCount, setLoanCount] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const bal = await getBalance();
      const sav = await getSavingsBalance();
      const loans = await getLoanCount();
      const txs = await getTransactionHistory();
      
      setBalance(bal);
      setSavingsBalance(sav);
      setLoanCount(loans);
      setTransactionCount(txs.length);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  const stats = [
    {
      title: "Account Balance",
      value: `${parseFloat(balance).toFixed(4)} ETH`,
      icon: Wallet,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Savings Balance",
      value: `${parseFloat(savingsBalance).toFixed(4)} ETH`,
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Active Loans",
      value: loanCount.toString(),
      icon: CreditCard,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Transactions",
      value: transactionCount.toString(),
      icon: DollarSign,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground mt-1">Overview of your account</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="bg-success/10 p-2 rounded-lg">
                <ArrowUpCircle className="h-5 w-5 text-success" />
              </div>
              Savings Interest Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">5.0% APY</div>
            <p className="text-sm text-muted-foreground mt-2">
              Earn interest on your savings daily
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="bg-warning/10 p-2 rounded-lg">
                <ArrowDownCircle className="h-5 w-5 text-warning" />
              </div>
              Loan Interest Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">8.0% APY</div>
            <p className="text-sm text-muted-foreground mt-2">
              Competitive rates for secured loans
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
