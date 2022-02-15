import { useState, useEffect } from 'react';
import { ethers, utils } from "ethers";
import abi from "./contracts/fundrasingContract.json";

function App() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isowner, setIsowner] = useState(false);
  const [inputValue, setInputValue] = useState({ deposit: "", projectname: "" });
  const [ownerAddress, setownerAddress] = useState(null);
  const [Totalfunds, setTotalfunds] = useState(null);
  const [projectname, setprojectname] = useState(null);
  const [useraddress, setuseraddress] = useState(null);
  const [error, setError] = useState(null);

  const contractAddress = '0xBB7E6C0C2ab85F2e2a5571ba73a3D0A5d08A7C56';
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        const account = accounts[0];
        setIsWalletConnected(true);
        setuseraddress(account);
        console.log("Account Connected: ", account);
      } else {
        setError("Please install a MetaMask wallet to use our project.");
        console.log("No Metamask detected");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getprojectname = async () => {
    try {
      if (window.ethereum) {

        //read data
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const fundrasingContract = new ethers.Contract(contractAddress, contractABI, signer);

        let projectname = await fundrasingContract.projectname;
        projectname = utils.parseBytes32String(projectname);
        setprojectname(projectname.toString());
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our project.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const setprojectNameHandler = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const fundrasingContract = new ethers.Contract(contractAddress, contractABI, signer);

        const txn = await fundrasingContract.setprojectname(utils.formatBytes32String(inputValue.projectname));
        console.log("Setting project Name...");
        await txn.wait();
        console.log("project Name Changed", txn.hash);
        getprojectname();

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our project.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getownerHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const fundrasingContract = new ethers.Contract(contractAddress, contractABI, signer);

        let owner = "0xDD52f07BbB4f634e41FFca2b943301702a388d52";
        setownerAddress(owner);

        const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });

        if (owner.toLowerCase() === account.toLowerCase()) {
          setIsowner(true);
        }
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our project.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const customerBalanceHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const fundrasingContract = new ethers.Contract(contractAddress, contractABI, signer);

        let balance = await fundrasingContract.getTotalfunds();
        setTotalfunds(utils.formatEther(balance));
        console.log("Retrieved balance...", balance);

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our project.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleInputChange = (event) => {
    setInputValue(prevFormData => ({ ...prevFormData, [event.target.name]: event.target.value }));
  }

  const deposityMoneyHandler = async (event) => {
    try {
      event.preventDefault();
      if (window.ethereum) {
        //write data
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const fundrasingContract = new ethers.Contract(contractAddress, contractABI, signer);

        const txn = await fundrasingContract.raisefund({ value: ethers.utils.parseEther(inputValue.deposit) });
        console.log("Deposting money...");
        await txn.wait();
        console.log("Deposited money...done", txn.hash);

        customerBalanceHandler();

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our project.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    getprojectname();
    getownerHandler();
    customerBalanceHandler()
  }, [isWalletConnected])

  return (
    <main className="main-container">
      <h2 className="headline"><span className="headline-gradient">fundrasingContract  Project</span> 💰</h2>
      <section className="customer-section px-10 pt-5 pb-10">
        {error && <p className="text-2xl text-red-700">{error}</p>}
        <div className="mt-5">
          {projectname === "" && isowner ?
            <p>"Setup the name of your project." </p> :
            <p className="text-3xl font-bold">{projectname}</p>
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
              onClick={deposityMoneyHandler}>Fund Project In ETH</button>
          </form>
        </div>
        <div className="mt-5">
          <p><span className="font-bold">Totalfunds: </span>{Totalfunds}</p>
        </div>
        <div className="mt-5">
          <p><span className="font-bold">Project Owner Address: </span>{ownerAddress}</p>
        </div>
        <div className="mt-5">
          {isWalletConnected && <p><span className="font-bold">Your Wallet Address: </span>{useraddress}</p>}
          <button className="btn-connect" onClick={checkIfWalletIsConnected}>
            {isWalletConnected ? "Wallet Connected 🔒" : "Connect Wallet 🔑"}
          </button>
        </div>
      </section>
      { isowner && (
          <section className="bank-owner-section">
            <h2 className="text-xl border-b-2 border-indigo-500 px-10 py-4 font-bold">project Admin Panel</h2>
            <div className="p-10">
              <form className="form-style">
                <input
                  type="text"
                  className="input-style"
                  onChange={handleInputChange}
                  name="projectname"
                  placeholder="Enter a Name for Your project"
                  value={inputValue.projectname}
                />
                <button
                  className="btn-grey"
                  onClick={setprojectNameHandler}>
                  Set project Name
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
