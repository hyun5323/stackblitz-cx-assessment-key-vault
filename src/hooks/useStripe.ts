import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export interface UserSubscription {
  customer_id: string | null
  subscription_id: string | null
  subscription_status: string | null
  price_id: string | null
  current_period_start: number | null
  current_period_end: number | null
  cancel_at_period_end: boolean | null
  payment_method_brand: string | null
  payment_method_last4: string | null
}

export interface UserOrder {
  customer_id: string | null
  order_id: number | null
  checkout_session_id: string | null
  payment_intent_id: string | null
  amount_subtotal: number | null
  amount_total: number | null
  currency: string | null
  payment_status: string | null
  order_status: string | null
  order_date: string | null
}

export function useStripe() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [orders, setOrders] = useState<UserOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setSubscription(null)
      setOrders([])
      setLoading(false)
      return
    }

    fetchStripeData()
  }, [user])

  const fetchStripeData = async () => {
    try {
      setLoading(true)

      // Fetch subscription data
      const { data: subscriptionData } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .single()

      setSubscription(subscriptionData)

      // Fetch orders data
      const { data: ordersData } = await supabase
        .from('stripe_user_orders')
        .select('*')
        .order('order_date', { ascending: false })

      setOrders(ordersData || [])
    } catch (error) {
      console.error('Error fetching Stripe data:', error)
    } finally {
      setLoading(false)
    }
  }

  const createCheckoutSession = async (priceId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Error creating checkout session:', error)
      throw error
    }
  }

  const hasActivePurchase = () => {
    // Check for completed orders (one-time payments)
    const hasCompletedOrder = orders.some(order => 
      order.order_status === 'completed' && order.payment_status === 'paid'
    )

    // Check for active subscription
    const hasActiveSubscription = subscription?.subscription_status === 'active'

    return hasCompletedOrder || hasActiveSubscription
  }

  const getPlanName = () => {
    if (hasActivePurchase()) {
      return 'Key Vault Pro'
    }
    return 'Free'
  }

  return {
    subscription,
    orders,
    loading,
    createCheckoutSession,
    hasActivePurchase,
    getPlanName,
    refetch: fetchStripeData,
  }
}