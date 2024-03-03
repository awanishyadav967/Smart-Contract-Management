import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [transactionAmount, setTransactionAmount] = useState(1);
  const [transactions, setTransactions] = useState([]);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // Once the wallet is set, we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      const balanceValue = await atm.getBalance();
      if (balanceValue !== undefined) {
        setBalance(ethers.utils.formatUnits(balanceValue, "wei"));
      }
    }
  };

  const transfer = async (recipient, amount) => {
    try {
      if (atm) {
        // Check for valid address
        if (!ethers.utils.isAddress(recipient)) {
          throw new Error("Invalid recipient address");
        }

        // Check if sender and recipient are the same
        if (account === recipient) {
          throw new Error("Sender and recipient cannot be the same");
        }

        // Validate sufficient funds
        const senderBalance = await atm.getBalance();
        if (senderBalance < ethers.utils.parseEther(amount)) {
          throw new Error("Insufficient balance for transfer");
        }

        // Perform transaction
        let tx = await atm.transfer(recipient, {
          value: ethers.utils.parseEther(amount)
        });
        await tx.wait();
        getBalance();
        updateTransactions(`Transferred ${amount} ETH to ${recipient}`);
        console.log("Transfer successful");
        alert("Transfer successful");
      }
    } catch (error) {
      console.error("Transfer error:", error.message);
      alert(`Transfer failed: ${error.message}`);
    }
  };

  const deposit = async () => {
    try {
      if (atm) {
        // Check if the deposit amount is valid
        if (transactionAmount <= 0) {
          throw new Error("Enter a valid deposit amount");
        }

        // Perform transaction
        let tx = await atm.deposit({
          value: ethers.utils.parseEther(transactionAmount.toString())
        });
        await tx.wait();
        getBalance();
        updateTransactions(`Deposited ${transactionAmount} ETH`);
        console.log("Deposit successful");
        alert("Deposit successful");
      }
    } catch (error) {
      console.error("Deposit error:", error.message);
      alert(`Deposit failed: ${error.message}`);
    }
  };

  const withdraw = async () => {
    try {
      if (atm) {
        let tx = await atm.withdraw(transactionAmount);
        await tx.wait();
        getBalance();
        updateTransactions(`Withdrawn ${transactionAmount} ETH`);
        console.log("Withdrawal successful");
        alert("Withdrawal successful");
      }
    } catch (error) {
      console.error("Withdrawal error:", error.message);
      alert(`Withdrawal failed: ${error.message}`);
    }
  };

  const updateTransactions = (transaction) => {
    setTransactions((prevTransactions) => [transaction, ...prevTransactions]);
  };

  const initUser = () => {
    // Check to see if the user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask to use this ATM.</p>;
    }

    // Check to see if the user is connected. If not, connect to their account
    if (!account) {
      return (
        <div>
          <button onClick={connectAccount}>Connect your Metamask wallet</button>
        </div>
      );
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <div>
          <input
            type="number"
            value={transactionAmount}
            onChange={(e) => setTransactionAmount(e.target.value)}
          />
          <button onClick={deposit}>Deposit</button>
          <button onClick={withdraw}>Withdraw</button>
        </div>
        <h2>Transfer</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            transfer(e.target.recipient.value, e.target.amount.value);
          }}
        >
          <input type="text" name="recipient" placeholder="Recipient Address" />
          <input type="number" name="amount" placeholder="Amount" />
          <button type="submit">Transfer</button>
        </form>
        <h2>Recent Transactions</h2>
        <ul>
          {transactions.map((transaction, index) => (
            <li key={index}>{transaction}</li>
          ))}
        </ul>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
          padding: 20px;
        }

        header {
          background-color: #4caf50;
          padding: 10px;
          margin-bottom: 20px;
        }

        h1 {
          color: white;
        }

        p {
          font-size: 18px;
        }

        button {
          background-color: #008CBA;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          margin: 5px;
        }

        input {
          padding: 10px;
          margin: 5px;
          border-radius: 5px;
          border: 1px solid #ccc;
        }

        form {
          margin-top: 20px;
        }

        ul {
          list-style-type: none;
          padding: 0;
        }

        li {
          background-color: #f2f2f2;
          margin: 5px 0;
          padding: 10px;
          border-radius: 5px;
        }
      `}</style>
    </main>
  );
}
