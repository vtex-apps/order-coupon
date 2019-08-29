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
  insertCoupon: (coupon: string) => void
  coupon: string
  isShowingPromoButton: boolean
  errorKey: string
  changeCoupon: (coupon: string) => void
  handleCouponChange: (evt: any) => void
  resetCouponInput: () => void
  setIsShowingPromoButton: (value: boolean) => void
  submitCoupon: (evt: any) => void
}

interface OrderItemsProviderProps {
  children: ReactNode
  InsertCoupon: any
  CouponQuery: any
  coupon: string
  changeCoupon: (coupon: string) => void
}

const NO_ERROR = ''

const OrderCouponContext = createContext<Context | undefined>(undefined)

export const OrderCouponProvider = compose(
  graphql(InsertCoupon, { name: 'InsertCoupon' })
)(({ children, InsertCoupon }: OrderItemsProviderProps) => {
  const { enqueue, listen } = useOrderQueue()
  const { orderForm, setOrderForm } = useOrderForm()
  const [coupon, setCoupon] = useState(
    orderForm.marketingData.coupon ? orderForm.marketingData.coupon : ''
  )
  const [isShowingPromoButton, setIsShowingPromoButton] = useState(true)
  const [errorKey, setErrorKey] = useState(NO_ERROR)

  const changeCoupon = (coupon: string) => {
    setCoupon(coupon)
  }

  const handleCouponChange = (evt: any) => {
    evt.preventDefault()
    const newCoupon = evt.target.value.trim()
    changeCoupon(newCoupon)
  }

  const resetCouponInput = () => {
    changeCoupon('')
    insertCoupon('')
    setIsShowingPromoButton(false)
  }

  const submitCoupon = (evt: any) => {
    evt.preventDefault()
    setErrorKey(NO_ERROR)
    insertCoupon(coupon)
  }

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

      setOrderForm({
        ...orderForm,
        marketingData: marketingData,
      })

      setIsShowingPromoButton(true)

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

      enqueue(task)
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
        insertCoupon: insertCoupon,
        coupon: coupon,
        changeCoupon: changeCoupon,
        handleCouponChange: handleCouponChange,
        resetCouponInput: resetCouponInput,
        setIsShowingPromoButton: setIsShowingPromoButton,
        isShowingPromoButton: isShowingPromoButton,
        submitCoupon: submitCoupon,
        errorKey: errorKey,
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
