# Specification

## Summary
**Goal:** Raise the maximum allowed winner payout percentage from 70% to 90% in both the backend validation and the admin frontend UI.

**Planned changes:**
- Update `backend/main.mo` `createLottery` endpoint to accept `winnerPayoutPercent` values from 1–90 (reject values > 90 with `#err(#invalidPrizeConfig)`)
- Update `frontend/src/pages/admin/LotteryManagement.tsx` to allow the "Winner Payout %" field to accept values up to 90, show a validation error only for values > 90, update the helper text to say "Max 90%", and correctly calculate the system profit summary

**User-visible outcome:** Admins can now create lotteries with a winner payout percentage up to 90% without errors, and the UI correctly reflects the new maximum.
