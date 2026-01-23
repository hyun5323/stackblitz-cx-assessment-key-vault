import React, { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { StripeProduct, formatPrice } from '../stripe-config'
import { useStripe } from '../hooks/useStripe'
import { useAuth } from '../hooks/useAuth'

interface PricingCardProps {
  product: StripeProduct
}

export function PricingCard({ product }: PricingCardProps) {
  const { user } = useAuth()
  const { createCheckoutSession, hasActivePurchase } = useStripe()
  const [loading, setLoading] = useState(false)

  const handlePurchase = async () => {
    if (!user) {
      alert('Please sign in to purchase')
      return
    }

    try {
      setLoading(true)
      await createCheckoutSession(product.priceId)
    } catch (error) {
      console.error('Purchase error:', error)
      alert('Failed to start checkout process')
    } finally {
      setLoading(false)
    }
  }

  const isOwned = hasActivePurchase()

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-indigo-200">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>
        <div className="mb-4">
          <span className="text-4xl font-bold text-indigo-600">
            {formatPrice(product.price, product.currency)}
          </span>
          {product.mode === 'payment' && (
            <span className="text-gray-500 ml-2">one-time</span>
          )}
        </div>
        <p className="text-gray-600 mb-6">{product.description}</p>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center">
            <Check className="w-5 h-5 text-green-500 mr-3" />
            <span className="text-gray-700">Unlimited secret storage</span>
          </div>
          <div className="flex items-center">
            <Check className="w-5 h-5 text-green-500 mr-3" />
            <span className="text-gray-700">Advanced masking features</span>
          </div>
          <div className="flex items-center">
            <Check className="w-5 h-5 text-green-500 mr-3" />
            <span className="text-gray-700">Priority developer support</span>
          </div>
          <div className="flex items-center">
            <Check className="w-5 h-5 text-green-500 mr-3" />
            <span className="text-gray-700">Lifetime access</span>
          </div>
        </div>

        <button
          onClick={handlePurchase}
          disabled={loading || isOwned}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
            isOwned
              ? 'bg-green-100 text-green-800 cursor-not-allowed'
              : loading
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Processing...
            </div>
          ) : isOwned ? (
            'Already Purchased'
          ) : (
            'Purchase Now'
          )}
        </button>
      </div>
    </div>
  )
}