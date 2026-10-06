# PREMIUM POWER — PowerBank Station Frontend

Frontend-only MQTT web application for a PowerBank rental/return station.

## Main behavior
- MQTT status is always a small dot in the top-right: green = connected, red = offline, amber = reconnecting.
- Pages do not block on an MQTT connection screen. MQTT connects silently in the background.
- On supported web hosting, `mqtt-worker.js` uses a SharedWorker so the MQTT WebSocket can be shared across pages. If SharedWorker is unavailable (common with direct `file://` opening), the app falls back to a page-level MQTT connection.
- No backend is included.

## Rental flow
1. Home → Rent a Power Bank.
2. `rent.html` creates `request_id` and `customer_id` and publishes `POWERBANK/001/RENT_REQUEST`.
3. `devices.html` listens for `POWERBANK/001/AVAILABILITY` and shows available devices.
4. Customer selects a device/slot.
5. `payment.html` publishes `PAYMENT_SUCCESS` with `command: OPEN_SLOT` after the test payment button is pressed.

## Return flow
1. Home → Return Power Bank.
2. Customer presses **OPEN CAMERA & SCAN QR**.
3. QR supplies the PowerBank/device number.
4. Website publishes `RETURN_REQUEST` with station number, device number, request ID and customer ID.
5. STM32 replies on `POWERBANK/001/AVAILABILITY` with `empty_slots` (or `slots`).
6. Customer selects an empty slot. Website publishes `RETURN_OPEN_SLOT` / `OPEN_SLOT`.
7. Customer inserts the PowerBank.
8. Customer presses **POWER BANK INSERTED — CLOSE SLOT**. Website publishes `RETURN_CLOSE_SLOT` / `CLOSE_SLOT`.

## Suggested return availability JSON
```json
{
  "event":"RETURN_AVAILABILITY",
  "station_id":"POWERBANK001",
  "request_id":"RET-1234567890",
  "available":true,
  "empty_slots":[1,3,5,7]
}
```

## Return request JSON
```json
{
  "event":"RETURN_REQUEST",
  "station_id":"POWERBANK001",
  "station_number":"001",
  "device_number":"PB001",
  "request_id":"RET-1234567890",
  "customer_id":"CUS-ABC123"
}
```

## Topics
- `POWERBANK/001/RENT_REQUEST`
- `POWERBANK/001/AVAILABILITY`
- `POWERBANK/001/PAYMENT`
- `POWERBANK/001/RETURN`

Broker: `wss://broker.emqx.io:8084/mqtt`

> Camera permissions are controlled by the browser. Live camera access is normally reliable when the site is opened through HTTPS (for example GitHub Pages). When a page is opened directly as a `file://` URL, use the camera-photo fallback if live camera access is blocked.
