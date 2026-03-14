# 🚀 Rental Agreement System - Quick Start Guide

## What is This?

A system that **automatically creates personalized rental agreements** for every booking with all customer and booking details pre-filled. You can export them as PDF for legal documentation and dispute resolution.

---

## 📍 How to Access

### **Step 1: Login to Admin**
```
URL: http://localhost:3000/admin/login
Password: admin123
```

### **Step 2: Navigate to Agreements**
- Click **"Agreements"** in the left sidebar
- Or go directly to: `http://localhost:3000/admin/rental-agreements`

---

## 🎯 Quick Actions

### **View an Agreement**

1. **Find the booking** using search or filters
2. Click **"View Agreement →"** button
3. See the complete agreement with all details filled in

### **Export as PDF**

1. Click **"View Agreement →"** on any booking
2. Click **"Export PDF"** button (top right)
3. PDF downloads automatically with filename:
   ```
   Captura_Rental_Agreement_JohnDoe_ABC12345_2024-11-14.pdf
   ```

### **Print Agreement**

1. Click **"View Agreement →"** on any booking
2. Click **"Print"** button (top right)
3. Use browser print dialog to print

---

## 📋 What's Included in Each Agreement?

### ✅ **Automatically Filled Information**

| Section | What's Included |
|---------|----------------|
| **Customer Details** | Name, IC/Passport, Email, Phone, Address |
| **Rental Details** | Camera name, Serial number, Dates, Duration |
| **Payment Info** | Daily rate, Total amount, Deposit, Delivery fee |
| **Emergency Contact** | Name and phone number |
| **Special Notes** | Any customer requests or notes |

### ✅ **Legal Sections**

- Complete Terms & Conditions (9 sections)
- Equipment Liability clauses
- Damage & Loss policies
- Cancellation & Refund policies
- Privacy & Data Protection
- Legal Compliance (Malaysian law)

### ✅ **Practical Sections**

- **Equipment Checklist** (Pickup & Return)
  - Camera body condition
  - Lens condition
  - Battery, charger, memory card
  - Bag, strap, accessories
  - Notes section for each

- **Signature Section**
  - Renter signature & date
  - Lessor (Captura) signature & date
  - Acknowledgment statement

---

## 💼 Real-World Usage

### **Scenario 1: Customer Picks Up Camera**

```
1. Customer arrives for pickup
2. Admin opens /admin/rental-agreements
3. Search for customer name
4. Click "View Agreement"
5. Click "Print" (print 2 copies)
6. Complete "At Pickup" checklist together
7. Both parties sign
8. Give customer their copy
```

### **Scenario 2: Damage Dispute**

```
1. Customer returns camera with damage
2. Admin retrieves signed agreement
3. Reference "Equipment Liability" section
4. Check "At Pickup" vs "At Return" checklist
5. Show customer agreed terms
6. Calculate charges per agreement
```

### **Scenario 3: Late Return**

```
1. Customer returns camera late
2. Admin retrieves agreement
3. Reference "Rental Period & Late Returns" section
4. Show penalty: RM10/hour or RM50/day
5. Calculate charges based on agreed terms
```

---

## 🔍 Search & Filter Features

### **Search By:**
- Customer name
- Email address
- Phone number
- Booking ID

### **Filter By Status:**
- All Statuses
- Pending Approval
- Confirmed
- Completed
- Cancelled
- Rejected

---

## 📊 Agreement Details Breakdown

### **Header**
```
CAPTURA
Camera Rental Agreement
Confirmation No: ABC12345
Agreement Date: 14 November 2024, 02:30 PM
```

### **Parties**
```
┌─────────────────────────────┬─────────────────────────────┐
│ Rental Company (Lessor)     │ Customer (Renter)           │
├─────────────────────────────┼─────────────────────────────┤
│ CAPTURA                     │ John Doe                    │
│ Camera Rental Services      │ IC: 123456-78-9012          │
│ Malaysia                    │ Email: john@email.com       │
│ Contact: +60 17-746 4121    │ Phone: +60 12-345 6789      │
└─────────────────────────────┴─────────────────────────────┘
```

### **Rental Details**
```
Equipment:        Canon EOS R50
Serial Number:    ABC123456
Rental Start:     15 November 2024
Rental End:       18 November 2024
Total Days:       3 days
Daily Rate:       RM50.00
Pickup Method:    Delivery
```

### **Payment Summary**
```
Rental Amount (3 days × RM50.00):        RM150.00
Delivery Fee:                            RM15.00
Security Deposit (Refundable):           RM100.00
─────────────────────────────────────────────────
Total Amount Due:                        RM165.00
```

---

## ⚠️ Important Notes

### **Before Exporting:**
- ✅ Verify all customer details are correct
- ✅ Check rental dates and amounts
- ✅ Ensure camera serial number is recorded
- ✅ Confirm emergency contact information

### **At Pickup:**
- ✅ Print 2 copies (customer + business)
- ✅ Complete equipment checklist together
- ✅ Take photos of equipment condition
- ✅ Both parties must sign
- ✅ Verify customer ID matches agreement

### **At Return:**
- ✅ Complete return checklist
- ✅ Compare with pickup condition
- ✅ Document any damages
- ✅ Process deposit refund if applicable
- ✅ Update booking status

### **Record Keeping:**
- ✅ Scan signed agreements
- ✅ Store digital copies securely
- ✅ Keep for minimum 7 years
- ✅ Protect customer data (PDPA compliance)

---

## 🎨 PDF Export Features

### **Professional Formatting**
- Clean, readable layout
- Proper page breaks
- Print-ready margins
- High-quality rendering

### **Automatic Filename**
Format: `Captura_Rental_Agreement_[Name]_[ConfNo]_[Date].pdf`

Example: `Captura_Rental_Agreement_JohnDoe_ABC12345_2024-11-14.pdf`

### **File Size**
- Typical size: 200-500 KB
- Optimized for email and storage
- Fast download and printing

---

## 🔧 Troubleshooting

### **Can't Find a Booking?**
- Check spelling in search
- Try searching by phone number
- Check booking status filter
- Verify booking exists in system

### **PDF Won't Download?**
- Check browser pop-up blocker
- Try different browser (Chrome recommended)
- Clear browser cache
- Check internet connection

### **Print Layout Looks Wrong?**
- Use Print Preview first
- Adjust margins in print settings
- Try "Save as PDF" instead
- Use landscape orientation if needed

### **Missing Customer Details?**
- Check customer record in database
- Verify all required fields filled
- Update customer information
- Refresh the page

---

## 📱 Mobile Access

Currently optimized for **desktop/tablet** use.

For mobile admin access, use the mobile admin interface:
```
/admin/mobile
```

---

## 🆘 Need Help?

### **Common Questions**

**Q: Can I edit the agreement after generating?**  
A: No, agreements are generated from booking data. Edit the booking first, then regenerate.

**Q: Can customers sign digitally?**  
A: Not yet. Currently requires physical signatures. Digital signatures coming soon.

**Q: Can I customize the terms?**  
A: Terms are standardized. Contact development team for custom templates.

**Q: How long are agreements stored?**  
A: Indefinitely in the system. Export and archive important ones separately.

**Q: Can I send agreements via email?**  
A: Not automatically yet. Export PDF and email manually, or use WhatsApp.

---

## ✨ Pro Tips

1. **Batch Export**: Open multiple tabs to export several agreements at once
2. **Quick Search**: Use booking ID for fastest search
3. **Print Preview**: Always preview before printing to save paper
4. **Photo Evidence**: Take photos of equipment condition alongside checklist
5. **Digital Archive**: Create a folder structure by month/year for PDFs
6. **Backup**: Keep both digital and physical copies of signed agreements

---

## 📞 Support

For technical issues or questions:
- Check the full documentation: `RENTAL_AGREEMENT_SYSTEM.md`
- Review code comments in component files
- Contact development team

---

**Quick Reference Card**

```
┌─────────────────────────────────────────────────┐
│  RENTAL AGREEMENT SYSTEM - QUICK REFERENCE      │
├─────────────────────────────────────────────────┤
│  Access:     /admin/rental-agreements           │
│  Search:     Name, Email, Phone, Booking ID     │
│  Filter:     By booking status                  │
│  Export:     Click "Export PDF" button          │
│  Print:      Click "Print" button               │
│  Filename:   Auto-generated with details        │
│  Storage:    Keep for 7+ years                  │
│  Signatures: Required from both parties         │
└─────────────────────────────────────────────────┘
```

---

**Last Updated**: November 2024  
**Version**: 1.0.0

