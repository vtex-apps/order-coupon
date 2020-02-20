import gql from 'graphql-tag'

export default gql`
  mutation MockMutation($text: String) {
    insertCoupon(text: $text) {
      marketingData {
        coupon
      }
    }
  }
`
