import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
  useCallback,
} from 'react'
import { compose, graphql } from 'react-apollo'
import {
  QueueStatus,
  useOrderQueue,
  useQueueStatus,
} from 'vtex.order-manager/OrderQueue'
import { useOrderForm } from 'vtex.order-manager/OrderForm'

import { insertCoupon as InsertCoupon } from 'vtex.checkout-resources/Mutations'

interface Context {
  coupon: string
  insertCoupon: (coupon: string) => Promise<boolean>
  couponErrorKey: string
  setCouponErrorKey: (errorKey: string) => void
}

interface OrderCouponProviderProps {
  children: ReactNode
  InsertCoupon: any
}

const couponKey = 'coupon'
const noError = ''
const TASK_CANCELLED = 'TASK_CANCELLED'

const OrderCouponContext = createContext<Context | undefined>(undefined)

export const OrderCouponProvider = compose(
  graphql(InsertCoupon, { name: 'InsertCoupon' })
)(({ children, InsertCoupon }: OrderCouponProviderProps) => {
  const { enqueue, listen } = useOrderQueue()
  const { orderForm, setOrderForm } = useOrderForm()
  const [couponErrorKey, setCouponErrorKey] = useState(noError)
  const coupon = orderForm.marketingData.coupon || ''

  const queueStatusRef = useQueueStatus(listen)

  const insertCoupon = useCallback(
    async (coupon: string) => {
      const task = async () => {
        const {
          data: { insertCoupon: newOrderForm },
        } = await InsertCoupon({
          variables: {
            text: coupon,
          },
        })

        return newOrderForm
      }

      try {
        const newOrderForm = await enqueue(task, couponKey)

        if (newOrderForm.messages.couponMessages.length) {
          const couponMessage = newOrderForm.messages.couponMessages.pop()
          setCouponErrorKey((couponMessage && couponMessage.code) || '')
        }
        if (queueStatusRef.current === QueueStatus.FULFILLED) {
          setOrderForm(newOrderForm)
        }

        return !!(
          newOrderForm.marketingData && newOrderForm.marketingData.coupon
        )
      } catch (error) {
        if (!error || error.code !== TASK_CANCELLED) {
          throw error
        }
        return false
      }
    },
    [InsertCoupon, enqueue, queueStatusRef, setOrderForm]
  )

  return (
    <OrderCouponContext.Provider
      value={{
        coupon,
        insertCoupon,
        couponErrorKey,
        setCouponErrorKey,
      }}
    >
      {children}
    </OrderCouponContext.Provider>
  )
})

export const useOrderCoupon = () => {
  const context = useContext(OrderCouponContext)
  if (context === undefined) {
    throw new Error('useOrderCoupon must be used within a OrderCouponProvider')
  }

  return context
}

export default { OrderCouponProvider, useOrderCoupon }
