import gql from 'graphql-tag'

export const insertCoupon = gql`
  mutation MockMutation($text: String) {
    insertCoupon(text: $text) {
      marketingData {
        coupon
      }
    }
  }
`
