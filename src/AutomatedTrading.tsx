import React, { useState } from 'react';
import axios from 'axios';

interface IndicatorConfig {
    name: string;
    options: { [key: string]: number };
    thresholds: {
        upper: number;
        lower: number;
    };
}

interface StrategyConfig {
    baseAsset: string;
    quoteAsset: string;
    quantity: number;
    indicators: IndicatorConfig[];
    historicalData: {
        timeframe: string;
        dataPoints: number;
    };
}

const defaultIndicator: IndicatorConfig = {
    name: '',
    options: {},
    thresholds: { upper: 0, lower: 0 }
};

const AutomatedTrading: React.FC = () => {
    const [strategy, setStrategy] = useState<StrategyConfig>({
        baseAsset: 'BTC',
        quoteAsset: 'USDT',
        quantity: 0.01,
        indicators: [],
        historicalData: { timeframe: '1h', dataPoints: 100 }
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, index?: number, field?: string) => {
        const { name, value, type } = e.target;
        if (index != null && field) {
            // Handling changes in indicators
            const updatedIndicators = strategy.indicators.map((indicator, idx) => {
                if (idx === index) {
                    if (field === 'name') {
                        return { ...indicator, [field]: value };
                    } else if (['upper', 'lower'].includes(field)) {
                        const thresholds = { ...indicator.thresholds, [field]: parseFloat(value) };
                        return { ...indicator, thresholds };
                    } else {
                        const options = { ...indicator.options, [field]: parseFloat(value) };
                        return { ...indicator, options };
                    }
                }
                return indicator;
            });
            setStrategy({ ...strategy, indicators: updatedIndicators });
        } else if (type === 'number') {
            if (name === "dataPoints") {
                setStrategy({ ...strategy, historicalData: { ...strategy.historicalData, dataPoints: parseInt(value) }});
            } else {
                setStrategy({ ...strategy, [name]: parseFloat(value) });
            }
        } else {
            setStrategy({ ...strategy, [name]: value });
        }
    };

    const addIndicator = () => {
        setStrategy(prev => ({
            ...prev,
            indicators: [...prev.indicators, { ...defaultIndicator }]
        }));
    };

    const removeIndicator = (index: number) => {
        setStrategy(prev => ({
            ...prev,
            indicators: prev.indicators.filter((_, idx) => idx !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const backendURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
        try {
            await axios.post(`${backendURL}/api/strategy`, strategy);
            alert('Strategy submitted successfully!');
        } catch (error: any) {
            alert(`Failed to submit strategy: ${error.response?.data?.error || error.message}`);
        }
    };

    const handleStopStrategy = async () => {
        const backendURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
        try {
            await axios.post(`${backendURL}/api/strategy/stop/${strategy.baseAsset}`);
            alert('Strategy stopped successfully!');
        } catch (error: any) {
            alert(`Failed to stop strategy: ${error.response?.data?.error || error.message}`);
        }
    };
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '20px' }}>
            <h1>Trading Strategy</h1>
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                {/* Each label-input group wrapped in a div for better layout control */}
                <div style={{ marginBottom: '10px' }}>
                    <label>Base Asset:
                        <input type="text" name="baseAsset" value={strategy.baseAsset} onChange={handleInputChange} />
                    </label>
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Quote Asset:
                        <input type="text" name="quoteAsset" value={strategy.quoteAsset} onChange={handleInputChange} />
                    </label>
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Quantity:
                        <input type="number" name="quantity" value={strategy.quantity} onChange={handleInputChange} step="0.01" />
                    </label>
                </div>
                {strategy.indicators.map((indicator, index) => (
                    <div key={index} style={{ marginBottom: '10px' }}>
                        <div>
                        <label>Indicator Name:
                            <select value={indicator.name} onChange={e => handleInputChange(e, index, 'name')}>
                                <option value="">Select Indicator</option>
                                <option value="RSI">RSI</option>
                                <option value="SMA">SMA</option>
                                <option value="MACD">MACD</option>
                            </select>
                        </label>
                        </div>
                        <div>
                        <label>
                            Period (if applicable):
                            <input type="number" value={indicator.options.period || ''} onChange={e => handleInputChange(e, index, 'period')} />
                        </label>
                        </div>
                        <div>
                        <label>
                            Upper Threshold:
                            <input type="number" value={indicator.thresholds.upper || ''} onChange={e => handleInputChange(e, index, 'upper')} />
                        </label>
                        </div>
                        <div>
                        <label>
                            Lower Threshold:
                            <input type="number" value={indicator.thresholds.lower || ''} onChange={e => handleInputChange(e, index, 'lower')} />
                        </label>
                        </div>
                    </div>
                ))}
                <div style={{ marginTop: '20px' }}>
                    <label>
                        Timeframe:
                        <select name="timeframe" value={strategy.historicalData.timeframe} onChange={handleInputChange}>
                            <option value="1m">1 Minute</option>
                            <option value="5m">5 Minutes</option>
                            <option value="1h">1 Hour</option>
                            <option value="1d">1 Day</option>
                        </select>
                    </label>
                </div>
                <div style={{ marginTop: '10px' }}>
                    <label>
                        Data Points:
                        <input type="number" name="dataPoints" value={strategy.historicalData.dataPoints} onChange={handleInputChange} />
                    </label>
                </div>
                <div style={{ marginTop: '20px' }}>
                    <button type="button" onClick={addIndicator} style={{ marginTop: '10px', marginRight: '10px' }}>Add Indicator</button>
                    <button type="submit" style={{ marginRight: '10px' }}>Submit Strategy</button>
                    <button type="button" onClick={handleStopStrategy}>Stop Strategy</button>
                </div>
            </form>
        </div>
    );
};

export default AutomatedTrading;

