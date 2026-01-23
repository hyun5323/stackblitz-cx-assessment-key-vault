import React, { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { StripeProduct, formatPrice } from '../stripe-config'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

interface PricingCardProps {
  product: StripeProduct
  isPro?: boolean
}

export function PricingCard({ product, isPro = false }: PricingCardProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const handlePurchase = async () => {
    if (!user) {
      // Redirect to sign in
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: product.priceId,
          mode: product.mode,
          successUrl: `${window.location.origin}/success`,
          cancelUrl: `${window.location.origin}/pricing`,
        }),
      })

      const { url, error } = await response.json()

      if (error) {
        console.error('Checkout error:', error)
        return
      }

      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error creating checkout:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-indigo-500">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">{product.name}</h3>
        <div className="mb-6">
          <span className="text-4xl font-bold text-indigo-600">
            {formatPrice(product.price, product.currency)}
          </span>
          {product.mode === 'payment' && (
            <span className="text-gray-500 ml-2">one-time</span>
          )}
        </div>
        <p className="text-gray-600 mb-8">{product.description}</p>
        
        <div className="space-y-4 mb-8">
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

        {isPro ? (
          <button
            disabled
            className="w-full bg-gray-400 text-white py-3 px-6 rounded-lg font-semibold cursor-not-allowed"
          >
            Already Purchased
          </button>
        ) : (
          <button
            onClick={handlePurchase}
            disabled={loading || !user}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : !user ? (
              'Sign in to Purchase'
            ) : (
              'Get Pro Access'
            )}
          </button>
        )}
      </div>
    </div>
  )
}