import React, { useState, useEffect } from "react";
import Web3 from "web3";
import P2PEnergyTrading from "./P2PEnergyTrading.json"; // Replace with your ABI file

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [offers, setOffers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [offerEnergyAmount, setOfferEnergyAmount] = useState("");
  const [offerPricePerKWh, setOfferPricePerKWh] = useState("");
  const [requestEnergyAmount, setRequestEnergyAmount] = useState("");
  const [requestMaxPricePerKWh, setRequestMaxPricePerKWh] = useState("");
  const [contractBalance, setContractBalance] = useState(0);

  useEffect(() => {
    fetchContractBalance();
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);

      const contractAddress = "0x5deb94C2fF5Ba91C95953B028fB1105361D624f6"; // Replace with your deployed contract address
      const contractInstance = new web3.eth.Contract(
        P2PEnergyTrading.abi,
        contractAddress
      );
      setContract(contractInstance);
    } else {
      alert("Please install MetaMask");
    }
  };

  const fetchOffers = async () => {
    try {
      if (contract) {
        const result = await contract.methods.getOffers().call();

        console.log("Raw Offers Data:", result);

        // Extract energy amounts, prices, and sellers
        const energyAmounts = result.energyAmounts;
        const pricesPerKWh = result.pricesPerKWh;
        const sellers = result.sellers;

        // Combine them into a unified array
        const parsedOffers = energyAmounts.map((_, index) => ({
          seller: sellers[index],
          energyAmount: Web3.utils.fromWei(
            energyAmounts[index].toString(),
            "ether"
          ), // Convert from Wei to Ether
          pricePerKWh: Web3.utils.fromWei(
            pricesPerKWh[index].toString(),
            "ether"
          ), // Convert from Wei to Ether
        }));

        console.log("Parsed Offers Data:", parsedOffers);

        // Update state with parsed offers
        setOffers(parsedOffers);
      } else {
        console.error("Contract is not initialized.");
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
    }
  };

  const fetchRequests = async () => {
    try {
      if (contract) {
        // Fetch requests data from the contract
        const result = await contract.methods.getRequests().call();

        console.log("Raw Requests Data:", result);

        // Extract energy amounts, max prices, and buyers
        const energyAmounts = result.energyAmounts;
        const maxPricesPerKWh = result.maxPricesPerKWh;
        const buyers = result.buyers;

        // Combine them into a unified array
        const parsedRequests = energyAmounts.map((_, index) => ({
          buyer: buyers[index],
          energyAmount: Web3.utils.fromWei(
            energyAmounts[index].toString(),
            "ether"
          ), // Convert from Wei to Ether
          maxPricePerKWh: Web3.utils.fromWei(
            maxPricesPerKWh[index].toString(),
            "ether"
          ), // Convert from Wei to Ether
        }));

        console.log("Parsed Requests Data:", parsedRequests);

        // Update state with parsed requests
        setRequests(parsedRequests);
      } else {
        console.error("Contract is not initialized.");
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const placeOffer = async () => {
    if (
      !offerEnergyAmount ||
      isNaN(offerEnergyAmount) ||
      !offerPricePerKWh ||
      isNaN(offerPricePerKWh)
    ) {
      alert(
        "Please enter valid numeric values for energy amount and price per kWh."
      );
      return;
    }

    const energyAmountInWei = Web3.utils.toWei(
      offerEnergyAmount.toString(),
      "ether"
    );
    const pricePerKWhInWei = Web3.utils.toWei(
      offerPricePerKWh.toString(),
      "ether"
    );

    if (contract) {
      await contract.methods
        .placeOffer(energyAmountInWei, pricePerKWhInWei)
        .send({ from: account });
      fetchOffers();
    }
  };

  const placeRequest = async () => {
    if (
      !requestEnergyAmount ||
      isNaN(requestEnergyAmount) ||
      requestEnergyAmount <= 0 ||
      !requestMaxPricePerKWh ||
      isNaN(requestMaxPricePerKWh) ||
      requestMaxPricePerKWh <= 0
    ) {
      alert(
        "Please enter valid numeric values for energy amount and max price per kWh."
      );
      return;
    }

    const energyAmountInWei = Web3.utils.toWei(
      requestEnergyAmount.toString(),
      "ether"
    );
    const maxPricePerKWhInWei = Web3.utils.toWei(
      requestMaxPricePerKWh.toString(),
      "ether"
    );
    const totalValue = Web3.utils.toWei(
      (requestEnergyAmount * requestMaxPricePerKWh).toString(),
      "ether"
    );
    
    

    if (contract) {
      const result=await contract.methods
        .placeRequest(energyAmountInWei, maxPricePerKWhInWei)
        .send({
          from: account,
          value: totalValue,
          gas:300000,
        });
    }
    console.log("Request placed successfully.");
    fetchRequests();
    fetchContractBalance();
  };

  const fetchContractBalance = async () => {
    try {
      if (contract) {
        // Call the getContractBalance method to fetch the contract's balance
        const balanceWei = await contract.methods.getContractBalance().call();

        // Convert from Wei to Ether using Web3 utility
        const balanceEther = Web3.utils.fromWei(balanceWei, "ether");

        console.log("Contract Balance (in Ether):", balanceEther);

        // You can update the UI or state with the balance
        setContractBalance(balanceEther);
      } else {
        console.error("Contract is not initialized.");
      }
    } catch (error) {
      console.error("Error fetching contract balance:", error);
    }
  };

  return (
    <div>
      <h1>P2P Energy Trading</h1>
      <button onClick={connectWallet}>Connect Wallet</button>
      <p>Connected Account: {account}</p>

      <div>
        <h2>Place Offer</h2>
        <input
          type="text"
          placeholder="Energy Amount (kWh)"
          value={offerEnergyAmount}
          onChange={(e) => setOfferEnergyAmount(e.target.value)}
        />
        <input
          type="text"
          placeholder="Price per kWh (Wei)"
          value={offerPricePerKWh}
          onChange={(e) => setOfferPricePerKWh(e.target.value)}
        />
        <button onClick={placeOffer}>Place Offer</button>
      </div>

      <div>
        <h2>Place Request</h2>
        <input
          type="text"
          placeholder="Energy Amount (kWh)"
          value={requestEnergyAmount}
          onChange={(e) => setRequestEnergyAmount(e.target.value)}
        />
        <input
          type="text"
          placeholder="Max Price per kWh (Wei)"
          value={requestMaxPricePerKWh}
          onChange={(e) => setRequestMaxPricePerKWh(e.target.value)}
        />
        <button onClick={placeRequest}>Place Request</button>
      </div>

      <div>
        <h2>Offers</h2>
        <button onClick={fetchOffers}>Fetch Offers</button>
        <ul>
          {offers.map((offer, index) => (
            <li key={index}>
              Seller: {offer.seller}, Energy: {offer.energyAmount} kWh, Price:{" "}
              {offer.pricePerKWh} Wei
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2>Requests</h2>
        <button onClick={fetchRequests}>Fetch Requests</button>
        <ul>
          {requests.map((request, index) => (
            <li key={index}>
              Buyer: {request.buyer}, Energy: {request.energyAmount} kWh, Max
              Price: {request.maxPricePerKWh} Wei
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3>Contract Balance: {contractBalance} ETH</h3>
      </div>
    </div>
  );
}

export default App;
