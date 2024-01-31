import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

interface Balance {
    asset: string;
    free: string;
}

interface TransactionMessage {
    coin: string;
    amountInUSD: number;
    quantity: number;
}

const BinanceActions: React.FC = () => {
    const [balance, setBalance] = useState<Balance[]>([]);
    const [message, setMessage] = useState<string>('');
    const [coin, setCoin] = useState<string>('BTC');
    const [quantity, setQuantity] = useState<number>(0);
    const [usdtBalance, setUsdtBalance] = useState<string>('$0');
    const [transactionMessage, setTransactionMessage] = useState<string>('');

    const backendURL: string = 'http://localhost:5000';
    const socket = io(backendURL);

    useEffect(() => {
        socket.on('connect', () => {
            console.log('Connected to backend');
        });
        socket.on('disconnect', () => {
            console.log('Disconnected from backend');
        });
        socket.on('coin purchase', (data: TransactionMessage) => {
            const formattedAmount = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 2
            }).format(data.amountInUSD);
        
            setTransactionMessage(`Bought ${data.quantity} ${data.coin} for ${formattedAmount}`);
            getBalance();
        });
        
        socket.on('coin sale', (data: TransactionMessage) => {
            const formattedAmount = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 2
            }).format(data.amountInUSD);
        
            setTransactionMessage(`Sold ${data.quantity} ${data.coin} for ${formattedAmount}`);
            getBalance();
        });
        
        socket.on('message', (message: string) => {
            setMessage(message);
        });
        
        getBalance();

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('coin purchase');
            socket.off('coin sale');
            socket.off('message');
        }
    }, []);

    const getBalance = () => {
        axios.get(`${backendURL}/balance`)
            .then(response => {
                const balances: Balance[] = response.data;
                setBalance(balances);
                const usdt = balances.find(bal => bal.asset === 'USDT');
                if (usdt) {
                    const formattedBalance = new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        maximumFractionDigits: 2
                    }).format(parseFloat(usdt.free));
                    setUsdtBalance(formattedBalance);
                } else {
                    setUsdtBalance('$0.00');
                }
            })
            .catch(error => {
                const errorMessage = error.response && error.response.data && error.response.data.error 
                    ? error.response.data.error 
                    : 'Error getting balance';
                setMessage(errorMessage);
            });
    };
    

    const buyCoin = (coin: string) => {
        axios.post(`${backendURL}/buy`, { coin, quantity: quantity })
            .catch(error => {
                const errorMessage = error.response && error.response.data && error.response.data.error 
                    ? error.response.data.error 
                    : 'Error buying coin';
                setMessage(errorMessage);
            });
    }

    const sellCoin = (coin: string) => {
        axios.post(`${backendURL}/sell`, { coin, quantity: quantity })
            .catch(error => {
                const errorMessage = error.response && error.response.data && error.response.data.error 
                    ? error.response.data.error 
                    : 'Error selling coin';
                setMessage(errorMessage);
            });
    }
    
    return (
        <div>
            <h2>Account Balance: {usdtBalance}</h2>
            <p>{transactionMessage}</p>
            <p>{message}</p>
            <input type="text" value={coin} onChange={(e) => setCoin(e.target.value.toUpperCase())}></input>
            <input type="number" value={quantity} onChange={(e) => setQuantity(parseFloat(e.target.value))} />
            <button onClick={() => buyCoin(coin)}>Buy {coin}</button>
            <button onClick={() => sellCoin(coin)}>Sell {coin}</button>
            
            <div>
                <h2>Portfolio:</h2>
                    {balance.map((coin, index) => (
                        <p key={index}>{coin.asset}: {coin.free}</p>
                    ))}
            </div>
        </div>
    );
};

export default BinanceActions;
