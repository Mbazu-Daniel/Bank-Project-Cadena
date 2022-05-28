import { useState, useEffect } from 'react';
import { ethers, utils } from "ethers";
import abi from "./contracts/Bank.json";

function App() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isBankerOwner, setIsBankerOwner] = useState(false);
  const [inputValue, setInputValue] = useState({ withdraw: "", deposit: "", bankName: "" });
  const [bankOwnerAddress, setBankOwnerAddress] = useState(null);
  const [customerTotalBalance, setCustomerTotalBalance] = useState(null);
  const [currentBankName, setCurrentBankName] = useState(null);
  const [customerAddress, setCustomerAddress] = useState(null);
  const [error, setError] = useState(null);

  const contractAddress = "0xa7a9882E8bfb13bfb3D19Bfd07066D1e119Bd02D";
  const contractABI = abi.abi;

  // CONNECTING TO METAMASK

    /* 
    
    We use Web3Modal library to connect to Metamask.
    This checks if you have Metamask installed on your devices, if its not available it prompts you to installed Metamask */


  const checkIfWalletIsConnected = async () => {
    try {
      if(window.ethereum) {
        // Making a request to get array of MetaMask accounts
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      // Getting the first account at index 0, this is current connected account
      const acount = accounts[0];
      
      // when we receive the account, we set it to the state
      setIsWalletConnected(true);
      // We set the connected account as the Customer address
      setCustomerAddress(acount);
      // Print the connected account
      console.log('Account Connected: ', acount);
      } else {
        setError("Please install MetaMask wallet to use our bank");
        console.log('No Metamask detected')
      }
    } catch (error) {
      console.log(error);
    }
  }

  // checkIfWalletIsConnected() loads immediately our app loads via useEffect() on the render function
    //  End CONNECTING TO METAMASK 


    /*  */

    // GETTER FUNCTION

  const getBankName = async () => {
    try {
      if (window.ethereum) {
        // A provider that helps us connect to the blockchain
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        // This is an abstraction of metamask wallet that helps us interact with the blockchain without revealing your private keys
        const signer = provider.getSigner();
        // we get our contract address, ABI and signer
        const bankContract = new ethers.Contract(contractAddress, contractABI, signer);

        // we get the name of our bank by calling the public bankName variable from our contract
        let bankName = await bankContract.bankName();
        // We convert the bank name to a readable string
        bankName = utils.parseBytes32String(bankName);
        // We set the bank name to the state
        setCurrentBankName(bankName.toString());
      } else {
        console.log('Ethereum object not found, install MetaMask');
        setError('Please install MetaMask to use our bank');
      }
    } catch (error) {
      console.log(error);
    }
  }

    /*  There will be no bank name unless the owner sets it using the setter function*/
    // End GETTER FUNCTION


      // SETTER FUNCTION
  const setBankNameHandler = async (event) => {
    // This prevents our dapp from reloading everytime we submit our form
    event.preventDefault();
    try {
      if (window.ethereum) {
        // A provider that helps us connect to the blockchain
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        // This is an abstraction of metamask wallet that helps us interact with the blockchain without revealing your private keys
        const signer = provider.getSigner();
        // we get our contract address, ABI and signer
        const bankContract = new ethers.Contract(contractAddress, contractABI, signer);
        // Set Bank name and We convert the input value to bytes32
        const txn = await bankContract.setBankName(utils.formatBytes32String(inputValue.bankName));

        console.log('Setting Bank Name...')
        await txn.wait();
        console.log('Bank Name Set', txn.hash)
        await getBankName();
       
      } else {
        console.log('Ethereum object not found, install MetaMask');
        setError('Please install MetaMask to use our bank');
      }
    } catch (error) {
      console.log(error);
    }
  }
    // End SETTER FUNCTION

    
    // BANK OWNER FUNCTION
  const getbankOwnerHandler = async () => {
    try {
      if(window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(contractAddress, contractABI, signer);
        // Get the address of the bank owner
        let owner = await bankContract.bankOwner();
        setBankOwnerAddress(owner);
        console.log('Bank Owner: ', owner);
        // Get the current account 
        const[account] = await window.ethereum.request({ method: "eth_requestAccounts" });

        // Check if the current account is the bank owner that deployed the contract
        if(owner.toLowerCase() === account.toLowerCase()) {
          setIsBankerOwner(true);
        } else {
          console.log('Ethereum object not found, install MetaMask');
          setError('Please install MetaMask to use our bank');
        }

      }
    } catch (error) {
      console.log(error);
    }
  }
  // END BANK OWNER FUNCTION

  // CUSTOMER BALANCE FUNCTION
  const customerBalanceHandler = async () => {
    try {
      if(window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(contractAddress, contractABI, signer);
        // Get the Customer balance by call the getCustomerBalance of the contract
        let balance = await bankContract.getCustomerBalance();
        // set the balance in a state and format to Ether
        setCustomerTotalBalance(utils.formatEther(balance));
        console.log('Retrieved Balance: ', balance);
      } else {
        console.log('Ethereum object not found, install MetaMask');
        setError('Please install MetaMask to use our bank');
      }
    } catch (error) {
      console.log(error);
    }
  }

    // END CUSTOMER BALANCE FUNCTION

       /* This function lets us grab the value from our form inputs and pass it to our handler function*/
  const handleInputChange = (event) => {
    setInputValue(prevFormData => ({ ...prevFormData, [event.target.name]: event.target.value }));
  }

   // DEPOSITING MONEY FUNCTION
    
      /*  We are calling the depositMoney function and this will cost gass*/


  const deposityMoneyHandler = async (event) => {
    try {
      event.preventDefault();
      if(window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(contractAddress, contractABI, signer);
       
        // We convert the input value to wei
        let txn = await bankContract.depositMoney({value: ethers.utils.parseEther(inputValue.deposit)});
        console.log('Depositing Money...')
        await txn.wait();
        console.log('Deposited Money...done', txn.hash)
        // After transaction is completed we call this function to update the balance of our account
        customerBalanceHandler();
      } else {
        console.log('Ethereum object not found, install MetaMask');
        setError('Please install MetaMask to use our bank');
      }
    } catch (error) {
      console.log(error);
    }
  }
    //End DEPOSITING MONEY  FUNCTION


    // WITHDRAWING MONEY FUNCTION
  const withDrawMoneyHandler = async (event) => {
    try {
      event.preventDefault();
      if(window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(contractAddress, contractABI, signer);
        let myAddress = await signer.getAddress();
        console.log('Provider signer...', myAddress);

        // We convert the input value to wei
        let txn = await bankContract.withdrawMoney(myAddress, ethers.utils.parseEther(inputValue.withdraw));
        console.log('Withdrawing Money...')
        await txn.wait();
        console.log('Withdraw Money...done', txn.hash)
        // After transaction is completed we call this function to update the balance of our account
        customerBalanceHandler();
      }
    } catch (error) {
      console.log(error);
    }
  }



  /* userEffect is a react hook that loads up all of our function when the 
  dapp first loads, then if the wallet connection status changes it will 
  reload the functions inside of it. it does this by watching for changes 
  is the (isWalletConnected) function we declared */
  useEffect(() => {
    checkIfWalletIsConnected();
    getBankName();
    getbankOwnerHandler();
    customerBalanceHandler()
  }, [isWalletConnected]);

  return (
    <main className="main-container">
      <h2 className="headline"><span className="headline-gradient">Bank Contract Project</span> 💰</h2>
      <section className="customer-section px-10 pt-5 pb-10">
        {error && <p className="text-2xl text-red-700">{error}</p>}
        <div className="mt-5">
          {currentBankName === "" && isBankerOwner ?
            <p>"Setup the name of your bank." </p> :
            <p className="text-3xl font-bold">{currentBankName}</p>
          }
        </div>
        <div className="mt-7 mb-9">
          <form className="form-style">
            <input
              type="text"
              className="input-style"
              onChange={handleInputChange}
              name="deposit"
              placeholder="0.0000 ETH"
              value={inputValue.deposit}
            />
            <button
              className="btn-purple"
              onClick={deposityMoneyHandler}>Deposit Money In ETH</button>
          </form>
        </div>
        <div className="mt-10 mb-10">
          <form className="form-style">
            <input
              type="text"
              className="input-style"
              onChange={handleInputChange}
              name="withdraw"
              placeholder="0.0000 ETH"
              value={inputValue.withdraw}
            />
            <button
              className="btn-purple"
              onClick={withDrawMoneyHandler}>
              Withdraw Money In ETH
            </button>
          </form>
        </div>
        <div className="mt-5">
          <p><span className="font-bold">Customer Balance: </span>{customerTotalBalance}</p>
        </div>
        <div className="mt-5">
          <p><span className="font-bold">Bank Owner Address: </span>{bankOwnerAddress}</p>
        </div>
        <div className="mt-5">
          {isWalletConnected && <p><span className="font-bold">Your Wallet Address: </span>{customerAddress}</p>}
          <button className="btn-connect" onClick={checkIfWalletIsConnected}>
            {isWalletConnected ? "Wallet Connected 🔒" : "Connect Wallet 🔑"}
          </button>
        </div>
      </section>
      {
        isBankerOwner && (
          <section className="bank-owner-section">
            <h2 className="text-xl border-b-2 border-indigo-500 px-10 py-4 font-bold">Bank Admin Panel</h2>
            <div className="p-10">
              <form className="form-style">
                <input
                  type="text"
                  className="input-style"
                  onChange={handleInputChange}
                  name="bankName"
                  placeholder="Enter a Name for Your Bank"
                  value={inputValue.bankName}
                />
                <button
                  className="btn-grey"
                  onClick={setBankNameHandler}>
                  Set Bank Name
                </button>
              </form>
            </div>
          </section>
        )
      }
    </main>
  );
}
export default App;
