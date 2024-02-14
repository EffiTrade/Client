import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

interface Balance {
    asset: string;
    free: string;
}

interface TransactionMessage {
    baseAsset: string;
    quoteAsset: string;
    amount: number;
    quantity: number;
}

interface AssetOption {
    value: string;
    label: string;
    baseAsset: string;
    quoteAsset: string;
}

const BinanceActions: React.FC = () => {
    const [balance, setBalance] = useState<Balance[]>([]);
    const [message, setMessage] = useState<string>('');
    const [asset, setAsset] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(0);
    const [usdtBalance, setUsdtBalance] = useState<string>('$0');
    const [transactionMessage, setTransactionMessage] = useState<string>('');
    const [assets, setAssets] = useState<AssetOption[]>([]); 
    const [selectedSymbol, setSelectedSymbol] = useState<{ baseAsset: string, quoteAsset: string }>({ baseAsset: '', quoteAsset: '' });

    const backendURL: string = process.env.REACT_APP_BACKEND_URL || '';
    const socketRef = React.useRef<Socket>();

    const fetchAssets = async () => {
        try {
            const response = await axios.get(process.env.REACT_APP_EXCHANGE_INFO || '');
            const assetOptions: AssetOption[] = response.data.symbols
                .filter((symbol: any) => symbol.status === 'TRADING')
                .map((symbol: any) => ({
                    label: `${symbol.baseAsset} (${symbol.symbol})`,
                    value: symbol.symbol,
                    baseAsset: symbol.baseAsset,
                    quoteAsset: symbol.quoteAsset,
                }));
            setAssets(assetOptions); 
    
            if (assetOptions.length > 0) {
                const defaultAssetOption = assetOptions[3]; // BTCUSDT
                setAsset(defaultAssetOption.value);
                setSelectedSymbol({
                    baseAsset: defaultAssetOption.baseAsset,
                    quoteAsset: defaultAssetOption.quoteAsset
                });
            }
        } catch (error) {
            console.error('Failed to fetch assets:', error);
            setMessage('Failed to fetch asset list');
        }
    };
    
    const getBalance = useCallback(() => {
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
    }, [backendURL]);

    useEffect(() => {
        if (!socketRef.current) {
            socketRef.current = io(backendURL);
        }
    
        const socket = socketRef.current;
        socket.on('asset purchase', (data: TransactionMessage) => {        
            setTransactionMessage(`Bought ${data.quantity} ${data.baseAsset} for ${data.amount} ${data.quoteAsset}`);
            getBalance();
        });
    
        socket.on('asset sale', (data: TransactionMessage) => {
            setTransactionMessage(`Sold ${data.quantity} ${data.baseAsset} for ${data.amount} ${data.quoteAsset}`);
            getBalance();
        });
    
        socket.on('message', (newMessage: string) => {
            setMessage(newMessage);
        });
    
        fetchAssets();
        getBalance();
    
        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('asset purchase');
            socket.off('asset sale');
            socket.off('message');
        };
    }, [backendURL, getBalance]);
    

    const buyAsset = () => {
        setMessage('');
        axios.post(`${backendURL}/api/buy`, {
            baseAsset: selectedSymbol.baseAsset,
            quoteAsset: selectedSymbol.quoteAsset,
            quantity
        })
        .then(() => {
            getBalance();
        })
        .catch(error => {
            setMessage(error.response?.data?.error || 'Error buying asset');
        });
    }

    const sellAsset = () => {
        setMessage('');
        axios.post(`${backendURL}/api/sell`, {
            baseAsset: selectedSymbol.baseAsset,
            quoteAsset: selectedSymbol.quoteAsset,
            quantity
        })
        .then(() => {
            getBalance();
        })
        .catch(error => {
            setMessage(error.response?.data?.error || 'Error selling asset');
        });
    }

    return (
        <div>
            <h2>Account Balance: {usdtBalance}</h2>
            <p>{transactionMessage}</p>
            <p>{message}</p>
            <select value={asset} onChange={(e) => {
                const symbol = e.target.value;
                const selectedOption = assets.find(assetOption => assetOption.value === symbol);
                if (selectedOption) {
                    setAsset(symbol);
                    setSelectedSymbol({ baseAsset: selectedOption.baseAsset, quoteAsset: selectedOption.quoteAsset });
                }
            }}>
                {assets.map((assetOption) => (
                    <option key={assetOption.value} value={assetOption.value}>
                        {assetOption.label}
                    </option>
                ))}
            </select>
            <input type="number" value={quantity} onChange={(e) => setQuantity(parseFloat(e.target.value))} />
            <button onClick={() => buyAsset()}>Buy: {asset}</button>
            <button onClick={() => sellAsset()}>Sell: {asset}</button>

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
