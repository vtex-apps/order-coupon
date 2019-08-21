import React, { createContext, ReactNode, useContext } from 'react'
import { compose, graphql } from 'react-apollo'
import { useOrderManager } from 'vtex.order-manager/OrderManager'

import InsertCoupon from './graphql/insertCoupon.graphql'

interface Context {
  insertCoupon: (coupon: string) => PromiseLike<void>
}

interface OrderItemsProviderProps {
  children: ReactNode
  InsertCoupon: any
}

const OrderCouponContext = createContext<Context | undefined>(undefined)

export const OrderCouponProvider = compose(
  graphql(InsertCoupon, { name: 'InsertCoupon' })
)(({ children, InsertCoupon }: OrderItemsProviderProps) => {
  const { enqueue } = useOrderManager()

  const insertCoupon = (coupon: string) => {
    return enqueue(async () => {
      InsertCoupon({
        variables: {
          text: coupon,
        },
      }).then(response => {
        console.log(response)
      })
    })
  }

  return (
    <OrderCouponContext.Provider value={{ insertCoupon: insertCoupon }}>
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
