/**
 * 🎫 EXEMPLE FRONTEND REACT - Achat Ticket NFT avec Paiement Stablecoin
 * Interface mobile-first pour acheter des billets avec PaieCashFan
 */

import React, { useState, useEffect } from 'react';
import {
  ThirdwebProvider,
  ConnectButton,
  useActiveAccount,
  useReadContract,
  useSendTransaction
} from 'thirdweb/react';
import { createThirdwebClient, getContract } from 'thirdweb';
import { transfer } from 'thirdweb/extensions/erc20';
import { claimTo } from 'thirdweb/extensions/erc721';
import { polygon } from 'thirdweb/chains';

// Configuration Thirdweb
const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!
});

const stablecoinContract = getContract({
  client,
  address: '0xSTABLECOIN_ADDRESS',
  chain: polygon
});

const nftContract = getContract({
  client,
  address: '0xNFT_TICKET_CONTRACT',
  chain: polygon
});

// Interface Event
interface Event {
  id: string;
  name: string;
  clubName: string;
  clubLogo: string;
  date: string;
  venue: string;
  price: number;
  currency: string;
  posterUrl: string;
  availableTickets: number;
}

// Composant principal
export default function TicketPurchasePage() {
  return (
    <ThirdwebProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600">
        <TicketPurchaseApp />
      </div>
    </ThirdwebProvider>
  );
}

function TicketPurchaseApp() {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [nftTokenId, setNftTokenId] = useState<string>('');
  
  const account = useActiveAccount();
  
  useEffect(() => {
    loadEventDetails();
  }, []);
  
  async function loadEventDetails() {
    try {
      // Récupérer les détails de l'événement depuis l'API
      const response = await fetch('/api/events/angers-psg-2025');
      const data = await response.json();
      setEvent(data);
    } catch (error) {
      console.error('Error loading event:', error);
    } finally {
      setLoading(false);
    }
  }
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!event) {
    return <ErrorScreen message="Événement non trouvé" />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">PaieCashFan</h1>
          <p className="text-purple-200">Billetterie Officielle</p>
        </div>
        
        {/* Bouton de connexion Thirdweb */}
        <ConnectButton
          client={client}
          theme="light"
          connectButton={{
            label: "Se connecter",
            style: {
              background: "white",
              color: "#667eea"
            }
          }}
        />
      </header>
      
      {/* Contenu principal */}
      {step === 'details' && (
        <EventDetails
          event={event}
          account={account}
          onPurchase={() => setStep('payment')}
        />
      )}
      
      {step === 'payment' && (
        <PaymentStep
          event={event}
          account={account}
          onSuccess={(txHash, tokenId) => {
            setTransactionHash(txHash);
            setNftTokenId(tokenId);
            setStep('success');
          }}
          onBack={() => setStep('details')}
        />
      )}
      
      {step === 'success' && (
        <SuccessStep
          event={event}
          transactionHash={transactionHash}
          nftTokenId={nftTokenId}
        />
      )}
    </div>
  );
}

// Composant Détails de l'Événement
function EventDetails({
  event,
  account,
  onPurchase
}: {
  event: Event;
  account: any;
  onPurchase: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
      {/* Image de l'événement */}
      <img
        src={event.posterUrl}
        alt={event.name}
        className="w-full h-96 object-cover"
      />
      
      {/* Détails */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <img
            src={event.clubLogo}
            alt={event.clubName}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{event.name}</h2>
            <p className="text-gray-600">{event.clubName}</p>
          </div>
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-gray-700">
            <span className="text-xl">📅</span>
            <span>{new Date(event.date).toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-700">
            <span className="text-xl">📍</span>
            <span>{event.venue}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-700">
            <span className="text-xl">🎫</span>
            <span>{event.availableTickets} billets disponibles</span>
          </div>
        </div>
        
        {/* Prix */}
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-6 mb-6">
          <div className="text-sm text-gray-600 mb-2">Prix du billet</div>
          <div className="text-5xl font-bold text-purple-600">
            {event.price} {event.currency}
          </div>
        </div>
        
        {/* Bouton d'achat */}
        <button
          onClick={onPurchase}
          disabled={!account || event.availableTickets === 0}
          className={`
            w-full py-4 rounded-xl font-semibold text-lg transition-all
            ${account && event.availableTickets > 0
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-2xl hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {!account
            ? 'Connectez votre wallet pour acheter'
            : event.availableTickets === 0
            ? 'Complet'
            : 'Acheter maintenant'
          }
        </button>
        
        {/* Infos sécurité */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
          <span>🔒</span>
          <span>Paiement sécurisé par PaieCashFan × Thirdweb</span>
        </div>
      </div>
    </div>
  );
}

// Composant Étape Paiement
function PaymentStep({
  event,
  account,
  onSuccess,
  onBack
}: {
  event: Event;
  account: any;
  onSuccess: (txHash: string, tokenId: string) => void;
  onBack: () => void;
}) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'stablecoin' | 'sepa' | 'mobile-money'>('stablecoin');
  
  const { mutate: sendTransaction } = useSendTransaction();
  
  async function handlePayment() {
    if (!account) return;
    
    setProcessing(true);
    setError('');
    
    try {
      if (paymentMethod === 'stablecoin') {
        await payWithStablecoin();
      } else if (paymentMethod === 'sepa') {
        await payWithSEPA();
      } else if (paymentMethod === 'mobile-money') {
        await payWithMobileMoney();
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Erreur lors du paiement');
      setProcessing(false);
    }
  }
  
  async function payWithStablecoin() {
    // 1. Récupérer l'adresse wallet du club
    const clubResponse = await fetch(`/api/clubs/${event.id}/wallet`);
    const { walletAddress: clubWalletAddress } = await clubResponse.json();
    
    // 2. Transférer le stablecoin au club
    const amountInWei = BigInt(Math.floor(event.price * 10**18));
    
    const transaction = transfer({
      contract: stablecoinContract,
      to: clubWalletAddress,
      amount: amountInWei
    });
    
    sendTransaction(transaction, {
      onSuccess: async (result) => {
        const txHash = result.transactionHash;
        console.log('✅ Payment successful:', txHash);
        
        // 3. Appeler l'API backend pour mint le NFT
        const nftResponse = await fetch('/api/nft/ticket/mint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: account.address,
            eventId: event.id,
            paymentTransactionHash: txHash
          })
        });
        
        const nftData = await nftResponse.json();
        
        // 4. Succès
        onSuccess(txHash, nftData.tokenId);
      },
      onError: (error) => {
        throw error;
      }
    });
  }
  
  async function payWithSEPA() {
    // Initier paiement SEPA via backend
    const response = await fetch('/api/payments/sepa/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: account.address,
        amount: event.price.toString(),
        eventId: event.id
      })
    });
    
    const { paymentUrl } = await response.json();
    
    // Ouvrir iframe ou redirect
    window.location.href = paymentUrl;
  }
  
  async function payWithMobileMoney() {
    // Initier paiement Mobile Money via backend
    const phoneNumber = prompt('Entrez votre numéro de téléphone Mobile Money:');
    
    if (!phoneNumber) {
      throw new Error('Numéro de téléphone requis');
    }
    
    const response = await fetch('/api/payments/mobile-money/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: account.address,
        amount: event.price.toString(),
        phoneNumber,
        provider: 'orange_money',
        eventId: event.id
      })
    });
    
    const { instructions } = await response.json();
    
    alert(instructions);
  }
  
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6">
      <button
        onClick={onBack}
        className="mb-6 text-purple-600 hover:text-purple-800 flex items-center gap-2"
      >
        ← Retour
      </button>
      
      <h2 className="text-2xl font-bold mb-6">Méthode de paiement</h2>
      
      {/* Méthodes de paiement */}
      <div className="space-y-3 mb-6">
        <PaymentMethodButton
          method="stablecoin"
          selected={paymentMethod === 'stablecoin'}
          onClick={() => setPaymentMethod('stablecoin')}
          icon="💰"
          name="Stablecoin (Recommandé)"
          details="Instant • Frais ~0.10 €"
        />
        
        <PaymentMethodButton
          method="sepa"
          selected={paymentMethod === 'sepa'}
          onClick={() => setPaymentMethod('sepa')}
          icon="🏦"
          name="SEPA Instant"
          details="1-2 min • Frais 0.20 €"
        />
        
        <PaymentMethodButton
          method="mobile-money"
          selected={paymentMethod === 'mobile-money'}
          onClick={() => setPaymentMethod('mobile-money')}
          icon="📱"
          name="Mobile Money"
          details="Orange Money, MTN, M-Pesa • Frais 1.5%"
        />
      </div>
      
      {/* Erreur */}
      {error && (
        <div className="bg-red-100 text-red-700 rounded-lg p-4 mb-6">
          ⚠️ {error}
        </div>
      )}
      
      {/* Récapitulatif */}
      <div className="bg-gray-100 rounded-xl p-4 mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Billet</span>
          <span className="font-semibold">{event.price} {event.currency}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Frais</span>
          <span className="font-semibold">
            {paymentMethod === 'stablecoin' ? '0.10' : paymentMethod === 'sepa' ? '0.20' : (event.price * 0.015).toFixed(2)} {event.currency}
          </span>
        </div>
        <div className="border-t pt-2 mt-2 flex justify-between">
          <span className="font-bold">Total</span>
          <span className="font-bold text-purple-600 text-xl">
            {paymentMethod === 'stablecoin'
              ? (event.price + 0.10).toFixed(2)
              : paymentMethod === 'sepa'
              ? (event.price + 0.20).toFixed(2)
              : (event.price * 1.015).toFixed(2)
            } {event.currency}
          </span>
        </div>
      </div>
      
      {/* Bouton de paiement */}
      <button
        onClick={handlePayment}
        disabled={processing}
        className={`
          w-full py-4 rounded-xl font-semibold text-lg transition-all
          ${processing
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-2xl hover:scale-105'
          }
        `}
      >
        {processing ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span>
            Transaction en cours...
          </span>
        ) : (
          `Payer ${event.price} ${event.currency}`
        )}
      </button>
    </div>
  );
}

function PaymentMethodButton({
  method,
  selected,
  onClick,
  icon,
  name,
  details
}: {
  method: string;
  selected: boolean;
  onClick: () => void;
  icon: string;
  name: string;
  details: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all
        ${selected
          ? 'border-purple-600 bg-purple-50'
          : 'border-gray-300 hover:border-purple-400'
        }
      `}
    >
      <span className="text-3xl">{icon}</span>
      <div className="flex-1 text-left">
        <div className="font-semibold">{name}</div>
        <div className="text-sm text-gray-600">{details}</div>
      </div>
      {selected && <span className="text-purple-600">✓</span>}
    </button>
  );
}

// Composant Succès
function SuccessStep({
  event,
  transactionHash,
  nftTokenId
}: {
  event: Event;
  transactionHash: string;
  nftTokenId: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
      <div className="text-6xl mb-6">✅</div>
      
      <h2 className="text-3xl font-bold mb-4">Paiement réussi !</h2>
      <p className="text-gray-600 mb-8">
        Votre ticket NFT a été créé avec succès
      </p>
      
      {/* NFT Token ID */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-6 mb-6">
        <div className="text-sm opacity-80 mb-2">NFT Token ID</div>
        <div className="text-4xl font-bold">#{nftTokenId}</div>
      </div>
      
      {/* Transaction Hash */}
      <div className="bg-gray-100 rounded-lg p-4 mb-8">
        <div className="text-xs text-gray-600 mb-2">Transaction Hash</div>
        <div className="font-mono text-sm break-all">
          {transactionHash}
        </div>
      </div>
      
      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={() => window.location.href = '/my-tickets'}
          className="w-full py-4 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-2xl hover:scale-105 transition-all"
        >
          Voir mon ticket
        </button>
        
        <button
          onClick={() => window.location.href = '/events'}
          className="w-full py-4 rounded-xl font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
        >
          Explorer d'autres événements
        </button>
      </div>
    </div>
  );
}

// Composants utilitaires
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-white text-center">
        <div className="text-6xl mb-4 animate-spin">⏳</div>
        <div className="text-2xl">Chargement...</div>
      </div>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-white text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <div className="text-2xl">{message}</div>
      </div>
    </div>
  );
}
