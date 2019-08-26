import React, { createContext, ReactNode, useContext, useState } from 'react'
import { compose, graphql } from 'react-apollo'
import { useOrderManager } from 'vtex.order-manager/OrderManager'

import InsertCoupon from './graphql/insertCoupon.graphql'

interface Context {
  insertCoupon: (coupon: string) => PromiseLike<void>
  coupon: string
  isShowingPromoButton: boolean
  errorMessage: string
  changeCoupon: (coupon: string) => void
  handleCouponChange: (evt: any) => void
  resetCouponInput: () => void
  setIsShowingPromoButton: (value: boolean) => void
  submitCoupon: (evt: any) => void
}

interface OrderItemsProviderProps {
  children: ReactNode
  InsertCoupon: any
  coupon: string
  changeCoupon: (coupon: string) => void
}

const NO_ERROR = ''
const CODE_DOESNT_EXIST = `Code doesn't exist`

const OrderCouponContext = createContext<Context | undefined>(undefined)

export const OrderCouponProvider = compose(
  graphql(InsertCoupon, { name: 'InsertCoupon' })
)(({ children, InsertCoupon }: OrderItemsProviderProps) => {
  const { enqueue } = useOrderManager()
  const [coupon, setCoupon] = useState('')
  const [isShowingPromoButton, setIsShowingPromoButton] = useState(true)
  const [errorMessage, setErrorMessage] = useState(NO_ERROR)

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
    setIsShowingPromoButton(false)
  }

  const submitCoupon = (evt: any) => {
    evt.preventDefault()
    insertCoupon(coupon)
  }

  const insertCoupon = (coupon: string) => {
    return enqueue(async () => {
      const mutationResult = await InsertCoupon({
        variables: {
          text: coupon,
        },
      })

      const newCoupon = mutationResult.data.insertCoupon.code
        ? mutationResult.data.insertCoupon.code
        : ''

      if (newCoupon) {
        setIsShowingPromoButton(true)
        setErrorMessage(NO_ERROR)
      } else {
        setErrorMessage(CODE_DOESNT_EXIST)
      }

      setCoupon(newCoupon)
    })
  }

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
        errorMessage: errorMessage,
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
