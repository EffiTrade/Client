import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:4000');
    setSocket(newSocket);

    newSocket.on('orderResult', (data) => {
        console.log('Order Result:', data);
    });

    newSocket.on('orderError', (error) => {
        console.error('Order Error:', error);
    });

    return () => {
        newSocket.close(); // Disconnect socket when component unmounts
    };
  }, []);

  const handleOrder = () => {
    if (socket) {
      // Emitting order request to the backend
      socket.emit('placeOrder', {
        symbol: 'BTCUSDT',
        quantity: 0.001,
        price: 50
      });
    }
  };

  return (
    <div className="App">
      <button onClick={handleOrder}>Place Order</button>
    </div>
  );
}

export default App;
