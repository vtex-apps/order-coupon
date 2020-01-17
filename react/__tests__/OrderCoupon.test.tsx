import React, { FunctionComponent } from 'react'
import { act, fireEvent, render } from '@vtex/test-tools/react'

import { insertCoupon as InsertCoupon } from 'vtex.checkout-resources/Mutations'
import { OrderFormProvider, useOrderForm } from 'vtex.order-manager/OrderForm'
import { OrderQueueProvider } from 'vtex.order-manager/OrderQueue'
import { OrderCouponProvider, useOrderCoupon } from '../OrderCoupon'
import { mockOrderForm } from '../__mocks__/mockOrderForm'
import { MockedProvider } from '@apollo/react-testing'

const mockedMarketingData = {
  coupon: 'newCoupon',
}

const mockInsertCouponMutation = (args: string, result: MarketingData) => ({
  request: {
    query: InsertCoupon,
    variables: {
      text: args,
    },
  },
  result: {
    data: {
      insertCoupon: {
        ...mockOrderForm,
        marketingData: result,
      },
    },
  },
})

describe('OrderCoupon', () => {
  it('should throw when useOrderCoupon is used outside a OrderCouponProvider', () => {
    const oldConsoleError = console.error
    console.error = () => {}
    const Component: FunctionComponent = () => {
      useOrderCoupon()
      return <div>foo</div>
    }

    expect(() => render(<Component />)).toThrow(
      'useOrderCoupon must be used within a OrderCouponProvider'
    )

    console.error = oldConsoleError
  })

  it('should insert a coupon', async () => {
    const Component: FunctionComponent = () => {
      const {
        orderForm: {
          marketingData: { coupon },
        },
      } = useOrderForm()
      const { insertCoupon } = useOrderCoupon()

      return (
        <div>
          {coupon}
          <button onClick={() => insertCoupon('newCoupon')}>mutate</button>
        </div>
      )
    }

    const mockInsertCoupon = mockInsertCouponMutation(
      'newCoupon',
      mockedMarketingData
    )

    const { getByText } = render(
      <OrderQueueProvider>
        <OrderFormProvider>
          <OrderCouponProvider>
            <Component />
          </OrderCouponProvider>
        </OrderFormProvider>
      </OrderQueueProvider>,
      { graphql: { mocks: [mockInsertCoupon] } }
    )

    const button = getByText('mutate')
    act(() => {
      fireEvent.click(button)
    })

    await act(() => new Promise(resolve => setTimeout(() => resolve())))
    expect(getByText('newCoupon')).toBeTruthy()
  })
})
