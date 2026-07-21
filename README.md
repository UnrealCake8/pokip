# POKIP Demo Checkout Scaffold

## Invalid request behaviour

Opening the checkout page without the required query parameters:

```text
https://checkouturl.example/
```

shows:

```text
It looks like you don't have a proper request.
```

## Valid checkout URL

The checkout requires:

- `amount`
- `merchant`

Example:

```text
https://checkouturl.example/?amount=5.00&merchant=Acme%20Developers&reference=TASK1
```

`reference` is optional.

## Card lookup endpoint

The checkout requests:

```text
GET https://aut1.example.com/{cardNumber}/accountfetch
```

Expected JSON response:

```json
{
  "active": true,
  "name": "Demo Customer",
  "cardholderId": "CUST-1001",
  "balance": 50,
  "currency": "POK"
}
```

Update `AUTH_BASE` inside `js/config.js` when you have your real demo endpoint.
