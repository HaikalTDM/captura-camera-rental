# 📋 Terms & Conditions Integration

## Overview

The CAPTURA application now includes a comprehensive Terms & Conditions modal that users must accept before completing their camera rental booking. This ensures legal compliance and sets clear expectations for both parties.

## 🎯 Key Features

### ✅ **Bilingual Support**
- **English (🇬🇧 EN)**: Complete terms in English
- **Bahasa Malaysia (🇲🇾 MS)**: Full translation in Bahasa Malaysia
- **Easy Toggle**: Switch between languages with one click
- **Consistent Content**: Both versions contain identical terms

### ✅ **Professional Design**
- **Modal Interface**: Clean, professional overlay design
- **Responsive Layout**: Works perfectly on all devices
- **Readable Typography**: Clear, well-formatted text
- **Branded Styling**: Matches CAPTURA design aesthetic

### ✅ **User Experience**
- **Mandatory Acceptance**: Users must check agreement box to continue
- **Clear Actions**: Cancel or Continue buttons
- **Scrollable Content**: Easy navigation through all terms
- **Language Persistence**: Remembers selected language during session

## 📋 Terms Coverage

### **1. General Terms**
- Age requirements (18+)
- ID verification requirements
- Service refusal rights

### **2. Rental Period & Fees**
- Rental duration definition
- Payment requirements
- Extension policies
- Late return penalties (RM10/hour, RM50/day)

### **3. Security Deposits**
- **Security Deposit**: RM100 (refundable)
- **Booking Deposit**: RM50 (refundable)
- Refund conditions
- Damage/loss coverage

### **4. Equipment Liability**
- Renter responsibility
- Usage restrictions
- Care requirements
- Technical issue reporting

### **5. Damage & Replacement**
- Repair cost responsibility
- Full replacement liability (up to RM3600)
- No self-repair policy

### **6. Cancellations & Refunds**
- **24+ hours**: Full refund eligible
- **<24 hours**: 50% charge
- **Booking deposit**: Non-refundable
- No early return refunds

### **7. Pickup & Delivery**
- Self-pickup option
- Delivery service (RM10-RM20 via Lalamove/GrabExpress)
- Transportation responsibility
- Return requirements

### **8. Privacy & Data Protection**
- Customer privacy respect
- Information usage policy
- Data protection compliance

### **9. Legal Compliance**
- Agreement acknowledgment
- Legal action consequences
- Malaysian law governance
- Amendment rights

## 🔧 Technical Implementation

### **Component Structure**
```
src/components/TermsModal.tsx
├── Bilingual content management
├── Language toggle functionality
├── Agreement checkbox validation
├── Modal state management
└── Responsive design implementation
```

### **Integration Points**
- **CalendarPricing.tsx**: Triggers modal before booking
- **Booking Flow**: Prevents booking without acceptance
- **State Management**: Handles modal visibility and agreement status

### **Content Management**
```typescript
const termsContent = {
  en: {
    title: "Terms & Conditions",
    agreementText: "I have read and agree to the Terms & Conditions.",
    content: `...` // Full English terms
  },
  ms: {
    title: "Terma & Syarat", 
    agreementText: "Saya telah membaca dan bersetuju dengan Terma & Syarat.",
    content: `...` // Full Bahasa Malaysia terms
  }
};
```

## 🎨 Design Features

### **Modal Layout**
- **Header**: Title and language toggle
- **Content**: Scrollable terms content
- **Footer**: Agreement checkbox and action buttons

### **Visual Elements**
- **Language Flags**: 🇬🇧 EN / 🇲🇾 MS
- **Professional Typography**: Clear, readable fonts
- **Responsive Grid**: Adapts to screen sizes
- **Branded Colors**: Blue theme matching CAPTURA

### **Interactive States**
- **Disabled Continue**: Until checkbox is checked
- **Language Toggle**: Active state highlighting
- **Hover Effects**: Button and link interactions
- **Scroll Indicators**: Custom scrollbar styling

## 🚀 User Flow

### **1. Date Selection**
User selects rental dates in the custom calendar

### **2. Pricing Review**
User reviews pricing and rental summary

### **3. Book Button Click**
User clicks "📋 Book [Camera Name]" button

### **4. Terms Modal Opens**
- Modal displays with English terms by default
- User can switch to Bahasa Malaysia if preferred
- User must scroll through and read all terms

### **5. Agreement Required**
- User must check "I have read and agree..." checkbox
- Continue button remains disabled until checked

### **6. Acceptance & Booking**
- User clicks "Continue" to accept terms
- Modal closes and booking proceeds
- Or user clicks "Cancel" to abort booking

## 📱 Mobile Optimization

### **Responsive Design**
- **Touch-Friendly**: Large buttons and checkboxes
- **Readable Text**: Appropriate font sizes
- **Scrollable Content**: Smooth scrolling on mobile
- **Compact Layout**: Efficient use of screen space

### **Mobile-Specific Features**
- **Larger Touch Targets**: Easy interaction
- **Optimized Typography**: Better readability
- **Efficient Scrolling**: Native mobile scroll behavior
- **Responsive Modal**: Adapts to screen orientation

## 🔒 Legal Compliance

### **Comprehensive Coverage**
- **Equipment Protection**: Clear damage/loss policies
- **Financial Terms**: Transparent pricing and fees
- **Cancellation Policy**: Fair and clear refund terms
- **Liability Coverage**: Defined responsibilities

### **Malaysian Law Compliance**
- **Governed by Malaysian Law**: Legal jurisdiction specified
- **IC/Passport Verification**: Identity requirements
- **Age Restrictions**: 18+ requirement
- **Amendment Rights**: Terms update flexibility

## 🎯 Benefits

### **✅ Legal Protection**
- **Clear Expectations**: Both parties understand terms
- **Liability Coverage**: Equipment protection defined
- **Dispute Prevention**: Clear policies reduce conflicts
- **Compliance**: Meets rental business requirements

### **✅ Professional Image**
- **Trust Building**: Professional terms increase confidence
- **Transparency**: Clear policies build customer trust
- **Bilingual Support**: Serves diverse customer base
- **Modern Interface**: Professional modal design

### **✅ Business Operations**
- **Risk Management**: Clear damage/loss policies
- **Payment Protection**: Deposit and fee structures
- **Operational Clarity**: Pickup/return procedures
- **Cancellation Management**: Fair refund policies

## 🔮 Future Enhancements

### **Potential Additions**
- **Digital Signature**: Electronic signature capture
- **Terms Versioning**: Track terms acceptance history
- **Custom Terms**: Camera-specific terms
- **Email Confirmation**: Terms acceptance receipt
- **Legal Updates**: Automatic terms update notifications

### **Advanced Features**
- **Terms Analytics**: Track acceptance rates
- **A/B Testing**: Optimize terms presentation
- **Integration**: Connect with legal management systems
- **Audit Trail**: Complete acceptance logging

Your CAPTURA application now provides comprehensive legal protection with a professional, user-friendly Terms & Conditions system that ensures compliance while maintaining an excellent user experience! 🎬📷
