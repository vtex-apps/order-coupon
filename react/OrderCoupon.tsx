import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react'
import { compose, graphql } from 'react-apollo'
import { useOrderQueue } from 'vtex.order-manager/OrderQueue'
import { useOrderForm } from 'vtex.order-manager/OrderForm'

import InsertCoupon from './graphql/insertCoupon.graphql'

interface Context {
  coupon: string
  setCoupon: (coupon: string) => void
  insertCoupon: (coupon: string) => void
  errorKey: string
  setErrorKey: (errorKey: string) => void
  showPromoButton: boolean
  setShowPromoButton: (value: boolean) => void
}

interface OrderItemsProviderProps {
  children: ReactNode
  InsertCoupon: any
  CouponQuery: any
  coupon: string
  changeCoupon: (coupon: string) => void
}

const couponKey = 'coupon'
const noError = ''

const OrderCouponContext = createContext<Context | undefined>(undefined)

export const OrderCouponProvider = compose(
  graphql(InsertCoupon, { name: 'InsertCoupon' })
)(({ children, InsertCoupon }: OrderItemsProviderProps) => {
  const { enqueue, listen } = useOrderQueue()
  const { orderForm, setOrderForm } = useOrderForm()
  const [coupon, setCoupon] = useState(orderForm.marketingData.coupon || '')
  const [showPromoButton, setShowPromoButton] = useState(true)
  const [errorKey, setErrorKey] = useState(noError)

  const isQueueBusy = useRef(false)
  useEffect(() => {
    const unlisten = listen('Pending', () => (isQueueBusy.current = true))
    return unlisten
  })
  useEffect(() => {
    const unlisten = listen('Fulfilled', () => (isQueueBusy.current = false))
    return unlisten
  })

  const insertCoupon = useCallback(
    (coupon: string) => {
      const marketingData = { ...orderForm.marketingData, coupon }

      setOrderForm({ marketingData })

      setShowPromoButton(true)

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

      enqueue(task, couponKey)
        .then((newOrderForm: OrderForm) => {
          if (!isQueueBusy.current) {
            setOrderForm(newOrderForm)
          }
        })
        .catch((error: any) => {
          if (!error || error.code !== 'TASK_CANCELLED') {
            throw error
          }
        })
    },
    [InsertCoupon, enqueue, orderForm, setOrderForm]
  )

  return (
    <OrderCouponContext.Provider
      value={{
        coupon: coupon,
        setCoupon: setCoupon,
        insertCoupon: insertCoupon,
        showPromoButton: showPromoButton,
        setShowPromoButton: setShowPromoButton,
        errorKey: errorKey,
        setErrorKey: setErrorKey,
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
