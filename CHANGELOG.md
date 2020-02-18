# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Tests to `insertCoupon` function.

### Removed
- `coupon` info in order to concentrate all the `orderForm` related data in `OrderManager`.

## [0.7.1] - 2020-02-19

### Changed

- Use the separate `default export`s from `vtex.checkout-resources`.

## [0.7.0] - 2019-11-14

### Changed

- `errorKey` value now is being provided as part of `insertCoupon` result.

## [0.6.0] - 2019-11-08

### Removed

- `showPromoButton`, `setShowPromoButton`, `setCoupon` and `setCouponErrorKey` from the data provided by `OrderCouponProvider`.

## [0.5.0] - 2019-10-14

## [0.4.0] - 2019-09-13

### Changed

- Get error code from `messages` field on `OrderForm`

## [0.3.1] - 2019-09-05

### Changed

- Get insertCoupon Mutation from checkout-resources

## [0.3.0] - 2019-09-04

## [0.2.2] - 2019-08-29

### Added

- Use OrderQueue and OrderForm

### Changed

- Move handleCouponChange, resetCouponInput and submitCoupon to UI component
- Rename flag isShowingPromoButton to showPromoButton

## [0.2.1] - 2019-08-27

## [0.2.0] - 2019-08-26

### Added

- Add coupon component's logic
- Error's logic

## [0.1.0] - 2019-08-26

### Added

- Initial config
- InsertCoupon query

- **Component** Create the VTEX Store Component _IO Base App_
