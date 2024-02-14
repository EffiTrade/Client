import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

interface Balance {
    asset: string;
    free: string;
}

interface TransactionMessage {
    coin: string;
    amountInUSD: number;
    quantity: number;
}

interface CoinOption {
    value: string;
    label: string;
}

const BinanceActions: React.FC = () => {
    const [balance, setBalance] = useState<Balance[]>([]);
    const [message, setMessage] = useState<string>('');
    const [coin, setCoin] = useState<string>('BTC');
    const [quantity, setQuantity] = useState<number>(0);
    const [usdtBalance, setUsdtBalance] = useState<string>('$0');
    const [transactionMessage, setTransactionMessage] = useState<string>('');
    const [coins, setCoins] = useState<CoinOption[]>([]);
    
    const backendURL: string = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
    const socketRef = React.useRef<Socket>();

    const fetchCoins = async () => {
        try {
            const response = await axios.get('https://api.binance.com/api/v3/exchangeInfo');
            const coinOptions: CoinOption[] = response.data.symbols
                .filter((symbol: any) => symbol.status === 'TRADING')
                .map((symbol: any) => ({
                    label: `${symbol.baseAsset} (${symbol.symbol})`,
                    value: symbol.baseAsset,
                }));
            setCoins(coinOptions);
            if (coinOptions.length > 0) {
                setCoin(coinOptions[0].value); // Default to the first coin if not already set
            }
        } catch (error) {
            console.error('Failed to fetch coins:', error);
            setMessage('Failed to fetch coin list');
        }
    };

    useEffect(() => {
        if (!socketRef.current) {
            socketRef.current = io(backendURL);
        }

        const socket = socketRef.current;

        socket.on('connect', () => console.log('Connected to backend'));
        socket.on('disconnect', () => console.log('Disconnected from backend'));
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

        socket.on('message', (newMessage: string) => {
            setMessage(newMessage);
        });

        fetchCoins();
        getBalance();

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('coin purchase');
            socket.off('coin sale'); 
            socket.off('message');
        };
    }, [backendURL]); // socketRef.current is stable, does not need to be a dependency

    const getBalance = () => {
        axios.get(`${backendURL}/api/balance`)
            .then(response => {
                const balances: Balance[] = response.data;
                setBalance(balances);
                const usdt = balances.find(bal => bal.asset === 'USDT');
                setUsdtBalance(usdt ? new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    maximumFractionDigits: 2
                }).format(parseFloat(usdt.free)) : '$0.00');
            })
            .catch(error => {
                setMessage(error.response?.data?.error || 'Error getting balance');
            });
    };

    const buyCoin = (selectedCoin: string) => {
        setMessage(''); // Clear previous message
        axios.post(`${backendURL}/api/buy`, { coin: selectedCoin, quantity })
            .then(() => {
                // Optionally handle success, e.g., clear the form or show a success message
            })
            .catch(error => {
                setMessage(error.response?.data?.error || 'Error buying coin');
            });
    }

    const sellCoin = (selectedCoin: string) => {
        setMessage(''); // Clear previous message
        axios.post(`${backendURL}/api/sell`, { coin: selectedCoin, quantity })
            .then(() => {
                // Optionally handle success
            })
            .catch(error => {
                setMessage(error.response?.data?.error || 'Error selling coin');
            });
    }
    
    return (
        <div>
            <h2>Account Balance: {usdtBalance}</h2>
            <p>{transactionMessage}</p>
            <p>{message}</p>
            <select value={coin} onChange={(e) => setCoin(e.target.value)}>
                {coins.map((coinOption) => (
                    <option key={coinOption.value} value={coinOption.value}>
                        {coinOption.label}
                    </option>
                ))}
            </select>
            <input type="number" value={quantity} onChange={(e) => setQuantity(parseFloat(e.target.value))} />
            <button onClick={() => buyCoin(coin)}>Buy {coin}</button>
            <button onClick={() => sellCoin(coin)}>Sell {coin}</button>
    
            <div>
                <h2>Portfolio:</h2>
                {balance.map((bal, index) => (
                    <p key={index}>{bal.asset}: {bal.free}</p>
                ))}
            </div>
        </div>
    );
    
};

export default BinanceActions;
