// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DeFiBank {
   
    
    // Structs
    struct Account {
        uint256 balance;
        uint256 savingsBalance;
        uint256 savingsStartTime;
        uint256 lastInterestCalculation;
        bool exists;
    }
    
    struct Loan {
        uint256 amount;
        uint256 interestRate;
        uint256 startTime;
        uint256 duration;
        bool active;
        uint256 repaidAmount;
        address lender; // address(0) for bank loans, lender address for P2P loans
    }
    
    struct Transaction {
        address from;
        address to;
        uint256 amount;
        uint256 timestamp;
        string transactionType;
    }
    
    struct LoanOffer {
        uint256 id;
        address lender;
        uint256 amount;
        uint256 interestRate;
        uint256 durationInDays;
        uint256 minCollateralPercent;
        bool active;
        address borrower;
    }

     // State variables
     
    address public owner;
    uint256 public totalDeposits;
    uint256 public totalLoans;
    
    // Interest rates (in basis points, 1% = 100)

    uint256 public savingsInterestRate = 500; // 5% APY
    uint256 public loanInterestRate = 800; // 8% APY
    
    // Mappings
    mapping(address => Account) public accounts;
    mapping(address => Loan[]) public loans;
    mapping(address => Transaction[]) public transactions;
    mapping(uint256 => LoanOffer) public loanOffers;
    uint256 public nextOfferId;
    uint256[] public activeLoanOfferIds;
    
    // Events
    event Deposit(address indexed user, uint256 amount, uint256 timestamp);
    event Withdrawal(address indexed user, uint256 amount, uint256 timestamp);
    event SavingsDeposit(address indexed user, uint256 amount, uint256 timestamp);
    event SavingsWithdrawal(address indexed user, uint256 amount, uint256 timestamp);
    event LoanTaken(address indexed user, uint256 amount, uint256 duration, uint256 timestamp);
    event LoanRepaid(address indexed user, uint256 loanIndex, uint256 amount, uint256 timestamp);
    event Transfer(address indexed from, address indexed to, uint256 amount, uint256 timestamp);
    event InterestCredited(address indexed user, uint256 amount, uint256 timestamp);
    event LoanOfferCreated(uint256 indexed offerId, address indexed lender, uint256 amount, uint256 interestRate);
    event LoanOfferAccepted(uint256 indexed offerId, address indexed borrower);
    event LoanOfferCancelled(uint256 indexed offerId);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        // Create account for the owner
        accounts[owner] = Account({
            balance: 0,
            savingsBalance: 0,
            savingsStartTime: 0,
            lastInterestCalculation: block.timestamp,
            exists: true
        });
    }
    
    // Internal function to ensure account exists
    function _ensureAccountExists(address user) internal {
        if (!accounts[user].exists) {
            accounts[user] = Account({
                balance: 0,
                savingsBalance: 0,
                savingsStartTime: 0,
                lastInterestCalculation: block.timestamp,
                exists: true
            });
        }
    }
    
    // Deposit funds
    function deposit() public payable {
        _ensureAccountExists(msg.sender);
        require(msg.value > 0, "Deposit amount must be greater than 0");
        
        accounts[msg.sender].balance += msg.value;
        totalDeposits += msg.value;
        
        _addTransaction(msg.sender, msg.sender, msg.value, "Deposit");
        emit Deposit(msg.sender, msg.value, block.timestamp);
    }
    
    // Withdraw funds
    function withdraw(uint256 amount) public {
        _ensureAccountExists(msg.sender);
        require(amount > 0, "Withdrawal amount must be greater than 0");
        require(accounts[msg.sender].balance >= amount, "Insufficient balance");
        
        accounts[msg.sender].balance -= amount;
        totalDeposits -= amount;
        
        payable(msg.sender).transfer(amount);
        
        _addTransaction(msg.sender, msg.sender, amount, "Withdrawal");
        emit Withdrawal(msg.sender, amount, block.timestamp);
    }
    
    // Deposit to savings
    function depositToSavings(uint256 amount) public {
        _ensureAccountExists(msg.sender);
        require(amount > 0, "Amount must be greater than 0");
        require(accounts[msg.sender].balance >= amount, "Insufficient balance");
        
        // Calculate and credit any pending interest
        if (accounts[msg.sender].savingsBalance > 0) {
            _calculateAndCreditInterest(msg.sender);
        }
        
        accounts[msg.sender].balance -= amount;
        accounts[msg.sender].savingsBalance += amount;
        
        if (accounts[msg.sender].savingsStartTime == 0) {
            accounts[msg.sender].savingsStartTime = block.timestamp;
        }
        
        accounts[msg.sender].lastInterestCalculation = block.timestamp;
        
        _addTransaction(msg.sender, msg.sender, amount, "Savings Deposit");
        emit SavingsDeposit(msg.sender, amount, block.timestamp);
    }
    
    // Withdraw from savings
    function withdrawFromSavings(uint256 amount) public {
        _ensureAccountExists(msg.sender);
        require(amount > 0, "Amount must be greater than 0");
        require(accounts[msg.sender].savingsBalance >= amount, "Insufficient savings balance");
        
        // Calculate and credit any pending interest
        _calculateAndCreditInterest(msg.sender);
        
        accounts[msg.sender].savingsBalance -= amount;
        accounts[msg.sender].balance += amount;
        
        if (accounts[msg.sender].savingsBalance == 0) {
            accounts[msg.sender].savingsStartTime = 0;
        }
        
        accounts[msg.sender].lastInterestCalculation = block.timestamp;
        
        _addTransaction(msg.sender, msg.sender, amount, "Savings Withdrawal");
        emit SavingsWithdrawal(msg.sender, amount, block.timestamp);
    }
    
    // Calculate and credit interest
    function _calculateAndCreditInterest(address user) internal {
        Account storage account = accounts[user];
        
        if (account.savingsBalance == 0) return;
        
        uint256 timeElapsed = block.timestamp - account.lastInterestCalculation;
        uint256 interest = (account.savingsBalance * savingsInterestRate * timeElapsed) / (365 days * 10000);
        
        if (interest > 0) {
            account.savingsBalance += interest;
            emit InterestCredited(user, interest, block.timestamp);
        }
        
        account.lastInterestCalculation = block.timestamp;
    }
    
    // Take a loan
    function takeLoan(uint256 amount, uint256 durationInDays) public {
        _ensureAccountExists(msg.sender);
        require(amount > 0, "Loan amount must be greater than 0");
        require(durationInDays > 0, "Duration must be greater than 0");
        require(address(this).balance >= amount, "Insufficient contract balance");
        
        // Check collateral (savings must be at least 150% of loan)
        uint256 requiredCollateral = (amount * 150) / 100;
        require(accounts[msg.sender].savingsBalance >= requiredCollateral, "Insufficient collateral");
        
        Loan memory newLoan = Loan({
            amount: amount,
            interestRate: loanInterestRate,
            startTime: block.timestamp,
            duration: durationInDays * 1 days,
            active: true,
            repaidAmount: 0,
            lender: address(0)
        });
        
        loans[msg.sender].push(newLoan);
        accounts[msg.sender].balance += amount;
        totalLoans += amount;
        
        _addTransaction(address(this), msg.sender, amount, "Loan");
        emit LoanTaken(msg.sender, amount, durationInDays, block.timestamp);
    }
    
    // Repay loan
    function repayLoan(uint256 loanIndex, uint256 amount) public {
        _ensureAccountExists(msg.sender);
        require(loanIndex < loans[msg.sender].length, "Invalid loan index");
        require(loans[msg.sender][loanIndex].active, "Loan is not active");
        require(amount > 0, "Repayment amount must be greater than 0");
        require(accounts[msg.sender].balance >= amount, "Insufficient balance");
        
        Loan storage loan = loans[msg.sender][loanIndex];
        
        // Calculate total amount due with interest
        uint256 timeElapsed = block.timestamp - loan.startTime;
        uint256 interest = (loan.amount * loan.interestRate * timeElapsed) / (365 days * 10000);
        uint256 totalDue = loan.amount + interest - loan.repaidAmount;
        
        require(amount <= totalDue, "Repayment exceeds loan amount");
        
        accounts[msg.sender].balance -= amount;
        loan.repaidAmount += amount;
        
        // Check if loan is fully repaid
        if (loan.repaidAmount >= loan.amount + interest) {
            loan.active = false;
            if (loan.lender == address(0)) {
                // Bank loan - reduce total loans
                totalLoans -= loan.amount;
            }
        }
        
        // Return funds to lender (for P2P loans) or contract (for bank loans)
        if (loan.lender != address(0)) {
            _ensureAccountExists(loan.lender);
            accounts[loan.lender].balance += amount;
            _addTransaction(msg.sender, loan.lender, amount, "P2P Loan Repayment");
        } else {
            _addTransaction(msg.sender, address(this), amount, "Loan Repayment");
        }
        
        emit LoanRepaid(msg.sender, loanIndex, amount, block.timestamp);
    }
    
    // Transfer funds to another account
    function transfer(address to, uint256 amount) public {
        _ensureAccountExists(msg.sender);
        require(to != address(0), "Invalid recipient address");
        require(amount > 0, "Transfer amount must be greater than 0");
        require(accounts[msg.sender].balance >= amount, "Insufficient balance");
        
        // Ensure recipient account exists
        _ensureAccountExists(to);
        
        accounts[msg.sender].balance -= amount;
        accounts[to].balance += amount;
        
        _addTransaction(msg.sender, to, amount, "Transfer");
        emit Transfer(msg.sender, to, amount, block.timestamp);
    }
    
    // Add transaction to history
    function _addTransaction(address from, address to, uint256 amount, string memory transactionType) internal {
        Transaction memory newTransaction = Transaction({
            from: from,
            to: to,
            amount: amount,
            timestamp: block.timestamp,
            transactionType: transactionType
        });
        
        transactions[from].push(newTransaction);
        if (from != to) {
            transactions[to].push(newTransaction);
        }
    }
    
    // Get account balance
    function getBalance() public view returns (uint256) {
        if (!accounts[msg.sender].exists) return 0;
        return accounts[msg.sender].balance;
    }
    
    // Get savings balance with accrued interest
    function getSavingsBalance() public view returns (uint256) {
        if (!accounts[msg.sender].exists) return 0;
        
        Account memory account = accounts[msg.sender];
        
        if (account.savingsBalance == 0) return 0;
        
        uint256 timeElapsed = block.timestamp - account.lastInterestCalculation;
        uint256 interest = (account.savingsBalance * savingsInterestRate * timeElapsed) / (365 days * 10000);
        
        return account.savingsBalance + interest;
    }
    
    // Get loan details
    function getLoan(uint256 loanIndex) public view returns (
        uint256 amount,
        uint256 interestRate,
        uint256 startTime,
        uint256 duration,
        bool active,
        uint256 repaidAmount,
        uint256 totalDue
    ) {
        if (!accounts[msg.sender].exists || loanIndex >= loans[msg.sender].length) {
            return (0, 0, 0, 0, false, 0, 0);
        }
        
        Loan memory loan = loans[msg.sender][loanIndex];
        uint256 timeElapsed = block.timestamp - loan.startTime;
        uint256 interest = (loan.amount * loan.interestRate * timeElapsed) / (365 days * 10000);
        uint256 due = loan.amount + interest - loan.repaidAmount;
        
        return (
            loan.amount,
            loan.interestRate,
            loan.startTime,
            loan.duration,
            loan.active,
            loan.repaidAmount,
            due
        );
    }
    
    // Get number of loans
    function getLoanCount() public view returns (uint256) {
        if (!accounts[msg.sender].exists) return 0;
        return loans[msg.sender].length;
    }
    
    // Get transaction history
    function getTransactionHistory() public view returns (Transaction[] memory) {
        if (!accounts[msg.sender].exists) {
            return new Transaction[](0);
        }
        return transactions[msg.sender];
    }
    
    // Get transaction count
    function getTransactionCount() public view returns (uint256) {
        if (!accounts[msg.sender].exists) return 0;
        return transactions[msg.sender].length;
    }
    
    // Admin functions
    function setSavingsInterestRate(uint256 rate) public onlyOwner {
        savingsInterestRate = rate;
    }
    
    function setLoanInterestRate(uint256 rate) public onlyOwner {
        loanInterestRate = rate;
    }
    
    // P2P Lending functions
    function createLoanOffer(
        uint256 amount,
        uint256 interestRate,
        uint256 durationInDays,
        uint256 minCollateralPercent
    ) public {
        _ensureAccountExists(msg.sender);
        require(amount > 0, "Loan amount must be greater than 0");
        require(interestRate > 0, "Interest rate must be greater than 0");
        require(durationInDays > 0, "Duration must be greater than 0");
        require(accounts[msg.sender].balance >= amount, "Insufficient balance");
        
        accounts[msg.sender].balance -= amount;
        
        uint256 offerId = nextOfferId++;
        loanOffers[offerId] = LoanOffer({
            id: offerId,
            lender: msg.sender,
            amount: amount,
            interestRate: interestRate,
            durationInDays: durationInDays,
            minCollateralPercent: minCollateralPercent,
            active: true,
            borrower: address(0)
        });
        
        activeLoanOfferIds.push(offerId);
        emit LoanOfferCreated(offerId, msg.sender, amount, interestRate);
    }
    
    function acceptLoanOffer(uint256 offerId) public {
        _ensureAccountExists(msg.sender);
        LoanOffer storage offer = loanOffers[offerId];
        require(offer.active, "Loan offer is not active");
        require(offer.lender != msg.sender, "Cannot accept your own loan offer");
        
        uint256 requiredCollateral = (offer.amount * offer.minCollateralPercent) / 100;
        require(accounts[msg.sender].savingsBalance >= requiredCollateral, "Insufficient collateral");
        
        offer.active = false;
        offer.borrower = msg.sender;
        
        Loan memory newLoan = Loan({
            amount: offer.amount,
            interestRate: offer.interestRate,
            startTime: block.timestamp,
            duration: offer.durationInDays * 1 days,
            active: true,
            repaidAmount: 0,
            lender: offer.lender
        });
        
        loans[msg.sender].push(newLoan);
        accounts[msg.sender].balance += offer.amount;
        
        _removeFromActiveLoanOffers(offerId);
        _addTransaction(offer.lender, msg.sender, offer.amount, "P2P Loan");
        emit LoanOfferAccepted(offerId, msg.sender);
    }
    
    function cancelLoanOffer(uint256 offerId) public {
        _ensureAccountExists(msg.sender);
        LoanOffer storage offer = loanOffers[offerId];
        require(offer.active, "Loan offer is not active");
        require(offer.lender == msg.sender, "Only lender can cancel");
        
        offer.active = false;
        accounts[msg.sender].balance += offer.amount;
        
        _removeFromActiveLoanOffers(offerId);
        emit LoanOfferCancelled(offerId);
    }
    
    function getActiveLoanOffers() public view returns (LoanOffer[] memory) {
        LoanOffer[] memory activeOffers = new LoanOffer[](activeLoanOfferIds.length);
        uint256 count = 0;
        
        for (uint256 i = 0; i < activeLoanOfferIds.length; i++) {
            uint256 offerId = activeLoanOfferIds[i];
            if (loanOffers[offerId].active) {
                activeOffers[count] = loanOffers[offerId];
                count++;
            }
        }
        
        LoanOffer[] memory result = new LoanOffer[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeOffers[i];
        }
        
        return result;
    }
    
    function _removeFromActiveLoanOffers(uint256 offerId) internal {
        for (uint256 i = 0; i < activeLoanOfferIds.length; i++) {
            if (activeLoanOfferIds[i] == offerId) {
                activeLoanOfferIds[i] = activeLoanOfferIds[activeLoanOfferIds.length - 1];
                activeLoanOfferIds.pop();
                break;
            }
        }
    }
    
    // Fallback function to receive ETH
    receive() external payable {}
}