# 📄 Rental Agreement System

## Overview

The Rental Agreement System automatically generates personalized, legally-binding rental agreements for each booking. These agreements are pre-filled with customer and booking details and can be exported as PDF documents for record-keeping and dispute resolution.

---

## ✨ Features

### 1. **Auto-Filled Agreement Templates**
- ✅ Customer information (name, IC/Passport, contact details)
- ✅ Booking details (dates, camera, rental period)
- ✅ Payment breakdown (rental fees, deposits, delivery charges)
- ✅ Equipment condition checklist (pickup & return)
- ✅ Complete terms & conditions
- ✅ Signature sections for both parties

### 2. **PDF Export**
- ✅ One-click PDF generation
- ✅ Professional formatting
- ✅ Print-ready layout
- ✅ Automatic filename generation

### 3. **Admin Interface**
- ✅ Browse all bookings
- ✅ Search by customer name, email, phone, or booking ID
- ✅ Filter by booking status
- ✅ Preview agreements before export
- ✅ Print directly from browser

---

## 🚀 How to Use

### **Access the Rental Agreements Page**

1. **Login to Admin Panel**
   - Navigate to `/admin/login`
   - Enter admin credentials

2. **Go to Agreements Section**
   - Click **"Agreements"** in the sidebar navigation
   - Or visit `/admin/rental-agreements`

### **View & Export an Agreement**

1. **Find the Booking**
   - Use the search bar to find customer by name, email, or phone
   - Or filter by booking status (Pending, Confirmed, Completed, etc.)

2. **View Agreement**
   - Click **"View Agreement →"** on any booking row
   - Preview the complete agreement with all details filled in

3. **Export Options**
   - **Print**: Click "Print" button to print directly
   - **Export PDF**: Click "Export PDF" to download as PDF file
   - PDF filename format: `Captura_Rental_Agreement_[CustomerName]_[ConfirmationNo]_[Date].pdf`

4. **Return to List**
   - Click **"← Back to List"** to return to bookings overview

---

## 📋 Agreement Contents

### **Header Section**
- Company name (CAPTURA)
- Agreement title
- Confirmation number
- Agreement date/time

### **Parties Information**
- **Lessor (Captura)**
  - Company name
  - Contact information
  
- **Renter (Customer)**
  - Full name
  - IC/Passport number
  - Email & phone
  - Address

### **Rental Details**
- Equipment name & serial number
- Rental start date
- Rental end date
- Total rental days
- Daily rate
- Pickup method (Self-pickup or Delivery)
- Delivery address (if applicable)

### **Payment Summary**
- Rental amount calculation
- Delivery fee (if applicable)
- Security deposit (RM100 - refundable)
- Total amount due

### **Emergency Contact**
- Emergency contact name
- Emergency contact phone

### **Terms & Conditions**
1. **General Terms** - Age requirement, ID verification
2. **Rental Period & Late Returns** - Penalties (RM10/hour or RM50/day)
3. **Security Deposit** - Refund conditions
4. **Equipment Liability** - Renter responsibilities
5. **Damage, Loss & Replacement** - Up to RM3,600 replacement cost
6. **Cancellations & Refunds** - 24-hour policy
7. **Privacy & Data Protection** - Information usage
8. **Legal Compliance** - Malaysian law jurisdiction

### **Equipment Condition Checklist**
Two-column checklist for:
- **At Pickup**: Document equipment condition when rented
- **At Return**: Document equipment condition when returned

Items checked:
- Camera body
- Lens
- Battery
- Charger
- Memory card
- Camera bag
- Strap
- Other accessories

### **Signature Section**
- Renter signature & date
- Lessor (Captura) signature & date
- Acknowledgment statement

### **Footer**
- Company contact information
- Agreement ID
- Confirmation number

---

## 🔧 Technical Implementation

### **Files Created**

1. **`src/components/RentalAgreementTemplate.tsx`**
   - Main agreement template component
   - Renders complete agreement with all sections
   - Accepts booking, customer, and camera data as props

2. **`src/utils/pdfExport.ts`**
   - PDF export utility functions
   - Uses `html2pdf.js` library
   - Handles filename generation
   - Print functionality

3. **`src/app/admin/rental-agreements/page.tsx`**
   - Admin page for browsing agreements
   - Search and filter functionality
   - Preview and export interface

4. **`src/components/QuickAgreementExport.tsx`**
   - Quick access component
   - Can be embedded in booking detail pages
   - Modal preview with export options

### **Dependencies**

```json
{
  "html2pdf.js": "^0.10.2"
}
```

### **Data Structure**

The agreement template requires:

```typescript
interface Booking {
  id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  daily_rate: number;
  total_amount: number;
  deposit_amount: number;
  final_payment_amount: number;
  pickup_method: 'pickup' | 'delivery';
  pickup_address?: string;
  delivery_fee?: number;
  notes?: string;
  created_at: string;
}

interface Customer {
  full_name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  address?: string;
  id_number?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

interface Camera {
  name: string;
  brand?: string;
  model?: string;
  serial_number?: string;
}
```

---

## 💡 Use Cases

### **1. Booking Confirmation**
When a booking is confirmed, generate and send the agreement to the customer for review and signature.

### **2. Pickup Documentation**
Print the agreement at pickup time for both parties to sign and complete the equipment checklist.

### **3. Dispute Resolution**
If issues arise (damage, late return, etc.), reference the signed agreement as legal documentation.

### **4. Record Keeping**
Export and archive all agreements for business records and compliance.

### **5. Customer Reference**
Provide customers with a copy of their agreement for their records.

---

## 🎯 Best Practices

### **Before Pickup**
1. Generate the agreement
2. Review all details for accuracy
3. Print 2 copies (one for customer, one for business)
4. Have both parties sign at pickup

### **During Pickup**
1. Complete the "At Pickup" equipment checklist
2. Take photos of equipment condition
3. Verify customer ID matches agreement
4. Collect security deposit

### **During Return**
1. Complete the "At Return" equipment checklist
2. Compare with pickup condition
3. Document any damages with photos
4. Process deposit refund if applicable

### **After Return**
1. Scan signed agreement
2. Store digital copy with booking record
3. Archive physical copy
4. Update booking status to "Completed"

---

## 🔐 Legal Considerations

### **Binding Agreement**
- Both parties must sign for the agreement to be legally binding
- Ensure customer reads and understands all terms before signing
- Keep signed copies for minimum 7 years (business record retention)

### **Data Protection**
- Store agreements securely
- Protect customer personal information
- Comply with Malaysian Personal Data Protection Act (PDPA)

### **Dispute Resolution**
- Agreement is governed by Malaysian law
- Signed agreement serves as evidence in disputes
- Include mediation clause before legal action

---

## 📱 Future Enhancements

### **Planned Features**
- [ ] Digital signature capture
- [ ] Email agreement directly to customer
- [ ] WhatsApp integration for sending agreements
- [ ] Multi-language support (Malay, Chinese)
- [ ] Photo upload for equipment condition
- [ ] Agreement version history
- [ ] Bulk export for multiple bookings
- [ ] Custom agreement templates
- [ ] E-signature integration (DocuSign, etc.)

---

## 🆘 Troubleshooting

### **PDF Export Not Working**
- Check browser compatibility (Chrome, Firefox, Safari recommended)
- Ensure `html2pdf.js` is installed: `npm install html2pdf.js`
- Clear browser cache and try again

### **Missing Booking Details**
- Verify booking data is complete in database
- Check customer and camera records exist
- Ensure all required fields are populated

### **Print Layout Issues**
- Use "Print Preview" to check layout
- Adjust browser print settings (margins, scale)
- Use "Save as PDF" from print dialog as alternative

---

## 📞 Support

For issues or questions about the Rental Agreement System:
- Check this documentation first
- Review the code comments in the component files
- Contact the development team

---

## 📝 Changelog

### Version 1.0.0 (Current)
- ✅ Initial release
- ✅ Auto-filled agreement templates
- ✅ PDF export functionality
- ✅ Admin interface for browsing and exporting
- ✅ Equipment condition checklist
- ✅ Complete terms & conditions
- ✅ Search and filter capabilities

---

**Last Updated**: November 2024  
**Maintained By**: Captura Development Team

