import React, { useState } from 'react';
import axios from 'axios';

const BinanceActions: React.FC = () => {
    const [balance, setBalance] = useState<any[]>([]);
    const [message, setMessage] = useState<string>('');

    const backendURL: string = 'http://localhost:5000';

    const getBalance = () => {
        axios.get(`${backendURL}/balance`)
            .then(response => {
                setBalance(response.data);
                setMessage('Fetched balance successfully');
            })
            .catch(error => {
                setMessage('Error fetching balance');
            });
    };

    const buyBitcoin = () => {
        axios.post(`${backendURL}/buy-bitcoin`)
            .then(response => {
                setMessage('Bought Bitcoin successfully');
            })
            .catch(error => {
                if (error.response && error.response.data && error.response.data.error) {
                    console.error("Error:", error.response.data.error);
                    setMessage(error.response.data.error);
                } else {
                    console.error("Error buying Bitcoin");
                    setMessage('Error buying Bitcoin');
                }
            });
    };

    const buyEthereum = () => {
        axios.post(`${backendURL}/buy-ethereum`)
            .then(response => {
                setMessage('Bought Ethereum successfully');
            })
            .catch(error => {
                setMessage('Error buying Ethereum');
            });
    };

    const sellCoin = (coin: string) => {
        axios.post(`${backendURL}/sell/${coin}`)
            .then(response => {
                setMessage(`Sold ${coin} successfully`);
            })
            .catch(error => {
                setMessage(`Error selling ${coin}`);
            });
    };

    return (
        <div>
            <button onClick={getBalance}>Get Balance</button>
            <button onClick={buyBitcoin}>Buy 0.5 Bitcoin</button>
            <button onClick={buyEthereum}>Buy 0.5 Ethereum</button>
            <button onClick={() => sellCoin('BTC')}>Sell Bitcoin</button>
            <button onClick={() => sellCoin('ETH')}>Sell Ethereum</button>
            
            <div>
                <h2>Balance:</h2>
                <ul>
                    {balance.map((coin, index) => (
                        <li key={index}>{coin.asset}: {coin.free}</li>
                    ))}
                </ul>
            </div>

            <p>{message}</p>
        </div>
    );
};

export default BinanceActions;
