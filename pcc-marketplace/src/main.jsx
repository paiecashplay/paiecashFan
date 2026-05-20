import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import ChatbotProvider from './context/ChatbotContext';
import { WalletProvider } from './context/WalletContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <WalletProvider>
        <ToastProvider>
          <CartProvider>
            <ChatbotProvider>
              <App />
            </ChatbotProvider>
          </CartProvider>
        </ToastProvider>
      </WalletProvider>
    </BrowserRouter>
  </React.StrictMode>
);
