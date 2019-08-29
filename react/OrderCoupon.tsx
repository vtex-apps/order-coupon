import React, { createContext, ReactNode, useContext, useState } from 'react'
import { compose, graphql } from 'react-apollo'
import { useOrderQueue } from 'vtex.order-manager/OrderQueue'

import InsertCoupon from './graphql/insertCoupon.graphql'

interface Context {
  insertCoupon: (coupon: string) => PromiseLike<void>
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
  coupon: string
  changeCoupon: (coupon: string) => void
}

const NO_ERROR = ''
const CODE_DOESNT_EXIST = `CodeDoesntExist`

const OrderCouponContext = createContext<Context | undefined>(undefined)

export const OrderCouponProvider = compose(
  graphql(InsertCoupon, { name: 'InsertCoupon' })
)(({ children, InsertCoupon }: OrderItemsProviderProps) => {
  const { enqueue } = useOrderQueue()
  const [coupon, setCoupon] = useState('')
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
    setIsShowingPromoButton(false)
  }

  const submitCoupon = (evt: any) => {
    evt.preventDefault()
    setErrorKey(NO_ERROR)
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
        setCoupon(newCoupon)
        setIsShowingPromoButton(true)
      } else {
        setErrorKey(CODE_DOESNT_EXIST)
      }
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
