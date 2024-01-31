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
    const [coin, setCoin] = useState<string>('BTC');
    const [quantity, setQuantity] = useState<number>(0);

    const backendURL: string = 'http://localhost:5000';
    const socket = io(backendURL);

    useEffect(() => {
        socket.on('connect', () => {
            console.log('Connected to backend');
        });
        socket.on('disconnect', () => {
            console.log('Disconnected from backend');
        });
        socket.on('coin purchase', (data: any) => {
            setMessage(`Purchased ${data.coin}`);
            getBalance(); // To update the balance after purchase
        });
    
        socket.on('coin sale', (data: any) => {
            setMessage(`Sold ${data.coin}`);
            getBalance(); // To update the balance after sale
        });
        socket.on('message', (message: string) => {
            setMessage(message);
        });
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

    const buyCoin = (coin: string) => {
        axios.post(`${backendURL}/buy`, { coin, quantity: quantity })
            .then(response => {
                setMessage(`Bought ${quantity} ${coin} successfully`);
            })
            .catch(error => {
                const errorMessage = error.response && error.response.data && error.response.data.error 
                    ? error.response.data.error 
                    : 'Error buying coin';
                setMessage(errorMessage);
            });
    }

    const sellCoin = (coin: string) => {
        axios.post(`${backendURL}/sell`, { coin, quantity: quantity })
            .then(response => {
                setMessage(`Sold ${quantity} ${coin} successfully`);
            })
            .catch(error => {
                setMessage('Error selling coin');
            });
    }
    

    return (
        <div>
            <input type="text" value={coin} onChange={(e) => setCoin(e.target.value.toUpperCase())}></input>
            <input type="number" value={quantity} onChange={(e) => setQuantity(parseFloat(e.target.value))} />
            <button onClick={getBalance}>Get Balance</button>
            <button onClick={() => buyCoin(coin)}>Buy {coin}</button>
            <button onClick={() => sellCoin(coin)}>Sell {coin}</button>
            
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
