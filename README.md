# 🏪 Bear Phone - Smart Physical Retail Automation System

**AI-Powered WhatsApp Automation for Smartphone Retail Stores**

Transform your physical retail store with intelligent automation that handles customer communications, warranty management, and engagement—all through WhatsApp.

-----

## 🎯 System Overview

This is a **production-ready** automation system designed specifically for **physical retail stores** (not e-commerce). It automates the entire post-sale customer journey:

1. **Manual Sale Entry** → Employee registers sale in dashboard
1. **AI Warranty Analysis** → Claude AI determines optimal warranty duration
1. **Automated WhatsApp** → Invoice, warranty, reviews, reminders sent automatically
1. **Customer Engagement** → Reviews, feedback, promotions managed automatically

-----

## ✨ Key Features

### 🤖 AI-Powered Warranty Decisions

- **No hardcoded rules** - AI analyzes each sale individually
- Considers: Product type, condition, price, store policy
- Provides reasoning for audit trail
- Fallback to safe defaults if AI unavailable

### 📱 WhatsApp Business Integration

- Official Meta Cloud API (free tier available)
- PDF invoice delivery
- Interactive review requests (star ratings)
- Warranty reminders
- Promotional campaigns

### 📊 Smart Customer Management

- Automatic customer profiling
- Purchase history tracking
- Lifetime value calculation
- Inactive customer re-engagement

### 🎨 Professional Invoice Generation

- Arabic-first design
- QR codes for warranty verification
- Store branding
- Auto-uploaded to cloud storage

### 📈 Analytics & Insights

- Message delivery tracking
- Review sentiment analysis
- Warranty claim patterns
- Sales performance metrics

-----

## 🏗️ Architecture

```
Physical Store → Employee Dashboard → API Server
                                      ↓
                                 AI Warranty Engine
                                      ↓
                                 PDF Generator
                                      ↓
                                 Message Queue
                                      ↓
                              WhatsApp Business API
                                      ↓
                              Customer Phone 📱
```

**Tech Stack:**

- **Backend:** Node.js + Express
- **Database:** Firebase Firestore
- **Queue:** Bull + Redis
- **AI:** Claude API (Anthropic)
- **WhatsApp:** Meta Cloud API
- **PDF:** PDFKit
- **Hosting:** Google Cloud Run / VPS

-----

## 📋 Prerequisites

- Google Cloud Platform account
- Meta Business Account (for WhatsApp)
- Claude API key (or OpenAI)
- Redis instance
- Domain name (optional)

-----

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/your-repo/bear-phone-backend.git
cd bear-phone-backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
nano .env
```

Required variables:

```bash
FIREBASE_PROJECT_ID=your-project
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
WHATSAPP_PHONE_NUMBER_ID=123456789
WHATSAPP_ACCESS_TOKEN=EAAxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

### 3. Initialize Database

```bash
node scripts/init_firestore.js
```

### 4. Start Server

```bash
npm start
# Server running on http://localhost:3000
```

### 5. Test Sale Creation

```bash
curl -X POST http://localhost:3000/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "أحمد محمد",
    "customer_phone": "966501234567",
    "product_name": "iPhone 13 Pro Max",
    "condition": "used_excellent",
    "price": 2500
  }'
```

**Expected Result:**

- ✅ Sale created
- ✅ AI warranty analyzed (e.g., 6 months)
- ✅ PDF invoice generated
- ✅ WhatsApp invoice sent
- ✅ WhatsApp warranty confirmation sent
- ✅ Review request scheduled (+3 days)
- ✅ Warranty reminder scheduled (-7 days before expiry)

-----

## 📁 Project Structure

```
bear-phone-backend/
├── backend_server.js           # Main API server
├── ai_warranty_engine.js       # AI warranty decision logic
├── SYSTEM_ARCHITECTURE.md      # Complete architecture docs
├── DEPLOYMENT_GUIDE.md         # Production deployment steps
├── WHATSAPP_TEMPLATES.md       # Message templates for Meta approval
├── package.json                # Dependencies
├── .env.example                # Environment template
└── scripts/
    └── init_firestore.js       # Database initialization
```

-----

## 🔧 Configuration

### AI Warranty Policy

Edit in Firestore (`settings/store_config`):

```javascript
{
  ai_warranty: {
    policy_rules: {
      new_devices: {
        flagship: 365,      // 1 year for new flagship
        mid_range: 180,     // 6 months for mid-range
        budget: 90          // 3 months for budget
      },
      used_excellent_multiplier: 0.5,  // 50% of new warranty
      used_good_multiplier: 0.3,       // 30% of new warranty
      minimum_warranty_days: 7         // Always at least 7 days
    }
  }
}
```

### Automation Settings

```javascript
{
  automation: {
    invoice_auto_send: true,
    warranty_auto_send: true,
    review_request_enabled: true,
    review_request_delay_days: 3,
    warranty_reminder_days_before: 7
  }
}
```

-----

## 📱 WhatsApp Setup

### 1. Create Meta Business Account

- Go to https://business.facebook.com/
- Create business account
- Verify your business

### 2. Setup WhatsApp Business API

- Create app at https://developers.facebook.com/
- Add WhatsApp product
- Get phone number verified
- Copy credentials to `.env`

### 3. Create Message Templates

- Follow templates in `WHATSAPP_TEMPLATES.md`
- Submit for Meta approval (24-48 hours)
- Required templates:
  - `invoice_delivery_v2`
  - `warranty_activation_v1`
  - `review_request_v1`

-----

## 💡 How AI Warranty Works

### Input to AI:

```javascript
{
  product: "iPhone 13 Pro Max",
  condition: "used_excellent",
  price: 2500 SAR,
  store_policy: {...}
}
```

### AI Analysis:

1. Identifies product tier (flagship)
1. Checks condition (used-excellent = 50% modifier)
1. Validates price (2500 SAR = premium tier)
1. Applies policy rules
1. Calculates final warranty

### AI Output:

```javascript
{
  warranty_duration_days: 180,
  warranty_duration_label: "6_months",
  start_date: "2025-02-09",
  end_date: "2025-08-09",
  reasoning: "iPhone 13 Pro Max is flagship (base: 12 months). 
              Used-Excellent condition = 50% modifier. 
              Final: 6 months.",
  exclusions_ar: [
    "التلف الناتج عن الماء",
    "الكسر والشروخ الخارجية",
    "البطارية (أجهزة مستعملة)"
  ]
}
```

-----

## 📊 Database Schema

### Collections:

**sales** - All sales records

- sale_id, customer_id, product, price, warranty_id, invoice_pdf_url

**customers** - Customer profiles

- customer_id, name, phone, total_purchases, lifetime_value

**warranties** - Warranty tracking

- warranty_id, sale_id, duration, start_date, end_date, ai_decision_log

**reviews** - Customer feedback

- review_id, sale_id, rating, sentiment, requires_followup

**messages** - WhatsApp message log

- message_id, type, status, delivered_at, read_at

-----

## 🔒 Security & Privacy

- **Firebase Authentication** for admin access
- **Role-based access control** (RBAC)
- **API key rotation** (monthly)
- **Data encryption** at rest (Firebase default)
- **GDPR compliance** - customer data deletion on request
- **Audit logs** for all data access

-----

## 💰 Cost Estimate

**500 sales/month:**

- Firebase: ~$3
- WhatsApp: ~$7.50
- Claude API: ~$10
- Redis: ~$15
- Cloud Run: ~$5
- **Total: ~$40/month**

**5,000 sales/month:**

- Total: ~$150/month

**50,000 sales/month:**

- Total: ~$800/month

-----

## 📈 Scaling

The system is designed to scale:

- **50 sales/day:** Single server, minimal resources
- **500 sales/day:** Auto-scaling, load balancer
- **5,000 sales/day:** Multiple regions, CDN, caching

Firebase and Cloud Run handle auto-scaling automatically.

-----

## 🐛 Troubleshooting

### WhatsApp messages not sending

- Check template approval status
- Verify access token
- Review message queue logs

### AI warranty analysis failing

- Check Claude API key
- Verify store policy in Firestore
- Review fallback warranty settings

### PDF generation errors

- Ensure Arabic font installed
- Check Firebase Storage permissions
- Verify memory allocation

-----

## 📚 Documentation

- **<SYSTEM_ARCHITECTURE.md>** - Complete system design
- **<DEPLOYMENT_GUIDE.md>** - Production deployment
- **<WHATSAPP_TEMPLATES.md>** - Message templates

-----

## 🤝 Support

For issues or questions:

1. Check documentation files
1. Review error logs: `gcloud run logs`
1. Test with curl commands
1. Contact support team

-----

## 📝 License

MIT License - Free for commercial use

-----

## 🎓 Best Practices

1. **Test in sandbox first** - Use test phone numbers
1. **Monitor AI costs** - Track Claude API usage
1. **Review warranties weekly** - Ensure AI quality
1. **Backup Firestore daily** - Automate exports
1. **Update templates** - Keep WhatsApp templates fresh

-----

## 🚦 Production Checklist

- [ ] Firebase project created
- [ ] WhatsApp templates approved
- [ ] Environment variables set
- [ ] SSL certificate installed
- [ ] Backup strategy implemented
- [ ] Monitoring configured
- [ ] Employee training completed
- [ ] Test sales successful

-----

## 📞 Example API Usage

### Create Sale

```bash
POST /api/sales
{
  "customer_name": "أحمد محمد",
  "customer_phone": "966501234567",
  "product_name": "iPhone 13 Pro Max",
  "condition": "new",
  "price": 3500,
  "serial_number": "F2LM1234567890"
}
```

### Get Warranty

```bash
GET /api/warranties/WARRANTY_123456
```

### Get Sale Details

```bash
GET /api/sales/SALE_123456
```

-----

**Built with ❤️ for Bear Phone Store**

*Making retail automation intelligent and effortless*