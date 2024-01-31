import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

interface Balance {
    asset: string;
    free: string;
}

const BinanceActions: React.FC = () => {
    const [balance, setBalance] = useState<Balance[]>([]);
    const [message, setMessage] = useState<string>('');

    const backendURL: string = 'http://localhost:5000';
    const socket = io(backendURL);

    useEffect(() => {
        socket.on('balance update', (newBalance: Balance[]) => {
            setBalance(newBalance);
            setMessage('Balance updated');
        });

        socket.on('bitcoin purchase', () => {
            setMessage('Bitcoin purchase update received');
            getBalance();
        });

        socket.on('ethereum purchase', () => {
            setMessage('Ethereum purchase update received');
            getBalance();
        });

        socket.on('coin sale', () => {
            setMessage('Coin sale update received');
            getBalance();
        });

        // Clean up the socket connection when the component unmounts
        return () => {
            socket.off('balance update');
            socket.off('bitcoin purchase');
            socket.off('ethereum purchase');
            socket.off('coin sale');
        };
    }, []);

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
                setMessage('Error buying Bitcoin');
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
