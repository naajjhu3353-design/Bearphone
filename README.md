
You are a senior software architect, AI automation engineer, and retail systems designer.

Project Context:
I own a PHYSICAL smartphone retail store (not an online store).
All sales happen inside the shop, but I want a FULLY AUTOMATED WhatsApp-based post-sale system.

Main Goal:
Transform my physical store into a smart AI-driven retail system that automatically:
• Sends invoices
• Activates warranties
• Collects reviews
• Sends reminders and promotions
ALL via WhatsApp.

Important:
This system MUST work without a website checkout.
Sales data is entered manually by the store employee or via POS.

Core Requirements:

1) Sale Registration (Manual Input)
• Employee inputs sale data into a simple dashboard or form:
  - Customer name
  - WhatsApp number
  - Product name
  - Device condition (New / Used – Excellent / Used – Good)
  - Price
  - Sale date
  - Serial number (optional)

2) Automatic WhatsApp Invoice
• Generate a professional PDF invoice
• Send automatically to the customer via WhatsApp Business API
• Message must be branded and polite

3) AI-Based Warranty Logic (VERY IMPORTANT)
Do NOT hardcode warranty durations.
Instead, create an AI-driven warranty decision logic.

AI must analyze:
• Product type
• New or used
• Device condition
• Price range
• Internal store policy

Then dynamically decide warranty duration:
• 7 days
• 1 month
• 3 months
• 6 months
• 12 months

AI must:
• Store warranty start and end dates
• Generate a warranty confirmation message
• Send it via WhatsApp automatically

4) WhatsApp Review Automation
• After a configurable number of days (default 3 days):
  - Send a WhatsApp message asking for a review
  - Allow reply-based rating (1–5 stars) OR a review link
• If rating < 4:
  - Flag customer for support follow-up
• If rating ≥ 4:
  - Save as positive review

5) Reminder & Promotion Engine
• Warranty expiration reminders (7 days before expiry)
• Device-based promotions (e.g. accessories for phone model)
• Inactive customer reminders (30+ days)

6) Admin Dashboard
• Simple dashboard for physical store staff
• View:
  - Sales
  - Warranty status
  - Message logs
  - Reviews
• Ability to enable / disable automation steps

7) WhatsApp Integration
• Use WhatsApp Business API (Meta Cloud / Twilio)
• No unofficial WhatsApp solutions

8) Technology Preference
• Backend: Node.js or Firebase
• Database: Firestore or SQL
• AI: OpenAI or Claude
• PDF invoices
• Cloud-based automation

Final Deliverables Required:
• System architecture diagram (text-based)
• Database schema
• AI warranty decision logic
• WhatsApp message templates
• Automation flow explanation
• Deployment-ready guidance

Think like a real production system for a physical store, not a demo.
Prioritize reliability, simplicity for staff, and customer trust.

Store Employee
|
v
Admin Dashboard (Web)
|
v
Backend (Firebase Functions / Node.js)
|
+–> Firestore Database
|
+–> AI Engine (OpenAI / Claude)
|
+–> PDF Generator
|
+–> Scheduler (Cron Jobs)
|
v
WhatsApp Business Cloud API
|
v
Customer WhatsApp

---

## 3. Admin Dashboard (For Store Staff)

A **simple internal dashboard** for shop employees.

### Sale Registration Form:
- Customer Name
- WhatsApp Number
- Product Name
- Device Condition:
  - New
  - Used – Excellent
  - Used – Good
- Price
- Sale Date
- Serial Number (Optional)

Button:
- **Save & Trigger Automation**

> No payments.  
> No website checkout.  
> Just sale registration.

---

## 4. Database Design

### 4.1 Customers Collection
```json
{
  "id": "CUST001",
  "name": "Ahmed Ali",
  "whatsapp": "+9665XXXXXXX",
  "createdAt": "timestamp"
}

{
  "id": "SALE001",
  "customerId": "CUST001",
  "productName": "iPhone 13",
  "condition": "Used - Excellent",
  "price": 2800,
  "saleDate": "2026-02-01",
  "serialNumber": "SN123456"
}

{
  "saleId": "SALE001",
  "duration": "6 months",
  "startDate": "2026-02-01",
  "endDate": "2026-08-01",
  "logicReason": "Used device, excellent condition, mid-to-high price range"
}

{
  "saleId": "SALE001",
  "type": "invoice | warranty | review | reminder | promotion",
  "status": "sent",
  "sentAt": "timestamp"
}

{
  "saleId": "SALE001",
  "rating": 5,
  "comment": "Excellent service",
  "needsFollowUp": false
}

5. AI Warranty Decision Logic (CRITICAL)

Warranty durations must NOT be hardcoded.

AI System Prompt

You are an AI warranty decision engine for a physical smartphone retail store.

Analyze the following inputs:
- Product name
- Device condition
- New or Used
- Sale price
- Internal store policy

Choose the most appropriate warranty duration from:
7 days, 1 month, 3 months, 6 months, 12 months

Return JSON ONLY with:
- duration
- reasoning

{
  "duration": "6 months",
  "reasoning": "Used phone in excellent condition with stable resale value"
}

Thank you for purchasing from Dub Phone 🙏
Your invoice for order #SALE001 is attached.
We are always happy to serve you.

Your device warranty has been activated ✅
Duration: 6 months
Expiry Date: 01/08/2026
Thank you for trusting Dub Phone 🤝

We would love to hear your feedback 🌟
Please rate your experience with us from 1 to 5.

Reminder 🔔
Your device warranty will expire in 7 days.
Please visit us if you need inspection or support.

Because you purchased an iPhone 📱
We have exclusive offers on original accessories.
Contact us on WhatsApp for details.
7. Automation Workflow

Trigger: Sale Registration
	1.	Save customer & sale data
	2.	Generate PDF invoice
	3.	Send invoice via WhatsApp
	4.	Call AI warranty decision engine
	5.	Save warranty details
	6.	Send warranty confirmation
	7.	Schedule:
	•	Review request (3 days)
	•	Warranty expiry reminder (7 days before end)
	•	Promotional campaigns

8. Technology Stack

Backend
	•	Firebase Functions (Node.js)

Database
	•	Firestore

AI
	•	OpenAI or Claude API

Messaging
	•	WhatsApp Business Cloud API (Meta) or Twilio

PDF
	•	PDFKit or equivalent

Automation
	•	Firebase Scheduler / Cloud Cron Jobs

⸻

9. Production Principles
	•	Built exclusively for physical stores
	•	No online checkout required
	•	Simple UI for staff
	•	Reliable automation
	•	Easily expandable to mobile app
	•	Secure and scalable

⸻

10. Future Extensions
	•	POS integration
	•	Loyalty & rewards system
	•	Staff mobile app
	•	Customer purchase history
	•	AI upselling & recommendations

⸻

Project Purpose

A real-world AI retail automation system that transforms a physical store into a smart WhatsApp-powered sales machine.

---
