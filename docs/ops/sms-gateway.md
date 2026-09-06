# SMS gateway ops (pilot)

Phone OTP for Kasina uses a **device-based SMS gateway** (e.g. [android-sms-gateway](https://github.com/capcom6/android-sms-gateway) or similar): a phone with a local SIM sends messages via the carrier. **Do not** default to Africa’s Talking or reseller gateways (send.et, FalconVAS) unless the device approach is proven unworkable.

## Pilot scope: one device

Onboarding is **school-by-school, class-by-class** over days/weeks — not 1,500–2,000 simultaneous signups. One gateway phone/SIM is enough for this bursty load profile.

**Post-pilot:** design the sender so a second device/SIM (failover, ideally different carriers) can be added without rewriting auth. Dual-device is **not** a pilot build requirement.

## Non-negotiables before first onboarding day

1. **Load-test** the SIM: send a burst of test OTPs; record practical throughput before carrier throttle/spam flags. Size each school’s signup rate (students/hour) to that number.
2. **Onboarding-window monitoring:** whoever runs signup must know immediately if the phone/gateway goes offline (power, WiFi, app reachability). Person-alerted — not necessarily 24/7 infra-grade.
3. **Manual fallback:** admin view of pending/failed OTP sends; a team member can text codes from a personal phone if the device fails mid-session.
4. Prefer a **business-registered SIM** if available.
5. Confirm **deliverability/latency** in real pilot regions with the production device (not a sandbox number).

## App integration

- Worker env: `SMS_GATEWAY_URL`, `SMS_GATEWAY_USER`, `SMS_GATEWAY_PASSWORD` (or token).
- Soft rate-limit / queue in the API so a class cannot dump unlimited concurrent OTP requests onto one SIM.
- Approval outcome SMS (approve/reject) uses the same gateway.

## Escape hatch

If device SMS cannot meet deliverability after honest testing, document the failure and only then evaluate a reseller. Do not pre-build reseller integration as the primary path.
