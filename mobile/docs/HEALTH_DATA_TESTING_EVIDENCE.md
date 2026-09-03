# Health Data Frontend Testing Evidence

## 1. Purpose

This document records the frontend testing completed for the Health Data module developed by Prathyusha Biradar (M3).

The testing covers the Health Data user interface, client-side input validation, valid health-data entry, API connection error handling, and Clear Form functionality.

## 2. Health Data UI Verification

The Health Data screen was opened and tested in the Expo web application.

The following fields and controls were verified:

- User ID
- Steps
- Heart Rate
- Sleep Hours
- Water Intake (L)
- Calories Burned
- Submit Health Data
- Clear Form

**Result:** PASS

## 3. Required Field Validation

The Submit Health Data action was tested with the required User ID field left empty.

**Expected result:**

The application should prevent submission and display:

`Please enter User ID.`

**Observed result:**

`Please enter User ID.`

**Result:** PASS

## 4. Sleep Hours Range Validation

The Sleep Hours field was tested using an invalid value of `25`.

The frontend validation requires Sleep Hours to be within the range of `0` to `24`.

**Expected result:**

The application should prevent submission and display:

`Sleep hours must be between 0 and 24.`

**Observed result:**

`Sleep hours must be between 0 and 24.`

**Result:** PASS

## 5. Valid Health Data Input

The Health Data form was tested using the following valid values:

| Field | Test Value |
|---|---:|
| User ID | 2 |
| Steps | 8000 |
| Heart Rate | 72 |
| Sleep Hours | 7.5 |
| Water Intake | 2.5 L |
| Calories Burned | 2200 |

All entered values were accepted by the frontend validation.

**Result:** PASS

## 6. API Connection Error Handling

The valid health data was submitted from the local frontend.

At the time of testing, the backend was running on another team member's local machine and was therefore not directly accessible through `localhost:3000` from the frontend machine.

The frontend handled the unavailable backend connection and displayed:

`Health data could not be submitted. Please check the backend connection and User ID.`

The application remained functional and did not crash.

**Result:** PASS

## 7. Clear Form Functionality

The Clear Form action was tested after entering health data.

The entered health-data fields were successfully cleared.

**Result:** PASS

## 8. TypeScript Validation

The mobile application was checked using:

```text
npx tsc --noEmit