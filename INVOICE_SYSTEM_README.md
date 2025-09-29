# 🧾 Captura Rental Invoice System

A comprehensive invoice generation and management system for Captura's camera rental business.

## ✨ Features

### **Invoice Generation**
- ✅ Auto-generate professional PDF invoices
- ✅ Sequential invoice numbering (INV-YYYY-NNNN)
- ✅ Integration with booking data
- ✅ Professional company branding
- ✅ Comprehensive line items and pricing

### **Admin Management**
- ✅ Generate invoices from any booking
- ✅ Download invoices as PDF
- ✅ Share invoices via WhatsApp
- ✅ Track payment status
- ✅ View invoice statistics
- ✅ Complete invoice management dashboard

### **Customer Experience**
- ✅ Download invoices from booking confirmation
- ✅ Professional, branded PDF documents
- ✅ Clear pricing breakdown
- ✅ Payment status tracking

## 🗄️ Database Schema

### **invoices** table
```sql
- id (UUID, Primary Key)
- invoice_number (VARCHAR, Unique) - Auto-generated (INV-YYYY-NNNN)
- booking_id (UUID, Foreign Key)
- customer_id (UUID, Foreign Key)
- invoice_date (DATE)
- due_date (DATE)
- subtotal (DECIMAL)
- discount_amount (DECIMAL)
- tax_amount (DECIMAL)
- total_amount (DECIMAL)
- payment_status ('pending' | 'partial' | 'paid' | 'overdue')
- payment_method (VARCHAR)
- paid_amount (DECIMAL)
- paid_date (TIMESTAMP)
- pdf_url (TEXT)
- notes (TEXT)
- sent_to_customer (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### **invoice_items** table
```sql
- id (UUID, Primary Key)
- invoice_id (UUID, Foreign Key)
- item_type ('camera' | 'accessory' | 'delivery' | 'discount' | 'other')
- item_name (VARCHAR)
- description (TEXT)
- quantity (INTEGER)
- unit_price (DECIMAL)
- total_price (DECIMAL)
- created_at (TIMESTAMP)
```

## 📁 File Structure

```
src/
├── lib/
│   ├── api/
│   │   └── invoices.ts          # Invoice API functions
│   ├── invoicePDF.ts            # PDF generation utility
│   └── supabase.ts              # Updated with Invoice types
├── app/
│   └── api/
│       └── invoices/
│           ├── route.ts         # GET/POST invoices
│           ├── [id]/route.ts    # GET/PUT/DELETE specific invoice
│           └── [id]/pdf/route.ts # PDF generation endpoint
└── app/admin/
    ├── invoices/
    │   └── page.tsx             # Invoice management dashboard
    └── bookings/[id]/
        └── page.tsx             # Updated with invoice integration
```

## 🚀 Usage

### **1. Admin: Generate Invoice from Booking**
```typescript
// In booking details page (/admin/bookings/[id])
const handleGenerateInvoice = async () => {
  const response = await fetch('/api/invoices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ booking_id: bookingId }),
  });
  const data = await response.json();
  // Invoice created: data.invoice
};
```

### **2. Download Invoice PDF**
```typescript
import { InvoicePDFGenerator } from '@/lib/invoicePDF';

const handleDownload = (invoice: Invoice) => {
  InvoicePDFGenerator.generateAndDownload({ invoice });
};
```

### **3. Share Invoice via WhatsApp**
```typescript
const handleShareWhatsApp = (invoice: Invoice) => {
  const message = `Hi ${customerName}! 📄\n\nInvoice: ${invoice.invoice_number}\nAmount: RM ${invoice.total_amount}`;
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
};
```

## 📄 PDF Features

### **Invoice Layout**
- **Header**: Company branding with blue gradient
- **Company Info**: Contact details and branding
- **Invoice Details**: Number, date, due date, status
- **Customer Info**: Billing details and booking reference
- **Items Table**: Detailed line items with pricing
- **Payment Summary**: Subtotal, discounts, taxes, total
- **Footer**: Terms & conditions and contact info

### **Professional Design**
- Clean, modern layout
- Company color scheme (Blue #3498db)
- Responsive typography
- Status color coding (Green=Paid, Orange=Pending, Red=Overdue)
- Professional formatting with proper spacing

## 🔧 API Endpoints

### **GET /api/invoices**
Fetch all invoices with related data
```json
{
  "success": true,
  "invoices": [...],
  "count": 10
}
```

### **POST /api/invoices**
Create invoice from booking
```json
{
  "booking_id": "uuid-here"
}
```

### **GET /api/invoices/[id]**
Fetch specific invoice
```json
{
  "success": true,
  "invoice": {...}
}
```

### **PUT /api/invoices/[id]**
Update invoice details
```json
{
  "payment_status": "paid",
  "paid_amount": 150.00,
  "payment_method": "bank_transfer"
}
```

### **DELETE /api/invoices/[id]**
Delete invoice

### **GET /api/invoices/[id]/pdf**
Generate PDF (returns invoice data for client-side generation)

## 🎯 Integration Points

### **Booking Flow Integration**
1. **Booking Creation**: Invoices can be auto-generated after booking approval
2. **Booking Details**: Admin can generate/manage invoices from booking page
3. **Customer Success**: Customers can download invoices from confirmation page

### **Payment Integration**
- Payment status tracking
- Automatic status updates when payments are recorded
- Support for partial payments
- Overdue invoice detection

### **Admin Dashboard**
- Invoice statistics on main dashboard
- Direct access from navigation
- Integration with existing booking management

## 📊 Statistics & Reporting

The system tracks:
- **Total Invoices**: Count of all invoices
- **Total Amount**: Sum of all invoice values
- **Paid Amount**: Sum of all payments received
- **Pending Amount**: Outstanding balance
- **Status Distribution**: Breakdown by payment status

## 🎨 Customization

### **Company Branding**
Update branding in `src/lib/invoicePDF.ts`:
```typescript
const companyInfo = {
  name: 'Captura',
  address: ['Camera Rental Services', 'Kuala Lumpur, Malaysia'],
  phone: '+60 12-345-6789',
  email: 'hello@captura.my',
  website: 'www.captura.my'
};
```

### **Invoice Template**
The PDF generator supports:
- Custom colors and styling
- Logo integration (future enhancement)
- Additional sections
- Custom terms and conditions

## 🔄 Auto-Generation Workflow

1. **Booking Confirmed** → Optional auto-invoice generation
2. **Admin Trigger** → Manual invoice generation from booking
3. **PDF Creation** → Client-side PDF generation with jsPDF
4. **Customer Access** → Download link in booking confirmation
5. **WhatsApp Sharing** → Admin can share via WhatsApp

## 📱 Mobile-Friendly

- Responsive invoice management interface
- Touch-friendly admin controls
- Mobile-optimized PDF viewing
- WhatsApp integration for easy sharing

## 🛡️ Data Security

- UUID-based invoice IDs
- Secure API endpoints
- Customer data protection
- Audit trail with timestamps

## 🚀 Future Enhancements

- **Email Integration**: Send invoices via email
- **Payment Gateway**: Direct payment processing
- **Recurring Invoices**: For repeat customers
- **Invoice Templates**: Multiple template options
- **Logo Upload**: Custom company logo integration
- **Multi-currency**: Support for different currencies
- **Invoice Approval**: Workflow for invoice approval
- **Customer Portal**: Self-service invoice access

## 📋 Setup Instructions

1. **Database Setup**:
   ```bash
   # Run the SQL schema in your Supabase dashboard
   psql -f database-invoice-schema.sql
   ```

2. **Install Dependencies**:
   ```bash
   npm install jspdf jspdf-autotable html2canvas
   ```

3. **Update Navigation**:
   - Invoice link added to admin sidebar
   - Accessible at `/admin/invoices`

4. **Test Invoice Generation**:
   - Go to any booking in admin
   - Click "Generate Invoice"
   - Download and verify PDF output

## 🎉 Benefits

### **For Business**
- ✅ Professional appearance
- ✅ Better payment tracking
- ✅ Improved customer trust
- ✅ Streamlined billing process
- ✅ Automated invoice numbering
- ✅ Comprehensive reporting

### **For Customers**
- ✅ Professional invoices
- ✅ Easy download access
- ✅ Clear pricing breakdown
- ✅ Payment status visibility
- ✅ WhatsApp convenience

### **For Admins**
- ✅ One-click invoice generation
- ✅ Easy sharing via WhatsApp
- ✅ Complete invoice management
- ✅ Payment tracking
- ✅ Professional documentation

---

**Ready to use!** The invoice system is now fully integrated into Captura Rental and ready for production use. 🚀
