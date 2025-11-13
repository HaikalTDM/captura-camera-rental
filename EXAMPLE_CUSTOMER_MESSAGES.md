# Example Customer Messages for AI Parser Testing

Use these example messages to test the AI-powered booking form filler in the admin panel.

## Example 1: Structured Message (English)
```
Name: Ahmad bin Abdullah
Phone: 012-345-6789
Email: ahmad@gmail.com
Camera: Sony A7 III
Dates: 25 Dec 2025 - 28 Dec 2025
Pickup: Self pickup
Notes: Need extra battery
```

## Example 2: Casual WhatsApp Message (Malay)
```
Hi boss, saya Ahmad (012-3456789). Nak sewa Sony A7III dari 25-28 Dec. Boleh hantar ke rumah saya tak? Alamat: 123 Jalan Merdeka, KL. Email saya ahmad@gmail.com
```

## Example 3: Phone Call Notes
```
Customer called:
- Name: Sarah Lee
- Contact: 0123456789
- Email: sarah@email.com
- Wants GoPro Hero 11
- From Christmas to New Year (25 Dec - 1 Jan)
- Will pickup herself
- Needs waterproof case
```

## Example 4: Minimal Information
```
Ahmad 012-345-6789 wants Canon R6 next Friday for 3 days
```

## Example 5: Delivery Request
```
Customer: Tan Wei Ming
Phone: +60177464121
Email: tanwm@outlook.com
Camera: DJI Osmo Action 4
Rental: 1-5 January 2026
Delivery to: 456 Jalan Sultan, Petaling Jaya, Selangor
Extra: Need 2 extra batteries and chest mount
```

## Example 6: Voice-to-Text Style
```
okay so the customer name is Ahmad bin Abdullah phone number zero one two three four five six seven eight nine email ahmad at gmail dot com he wants to rent the Sony A7 Mark 3 from December 25th to December 28th and he will pick it up himself he also mentioned he needs an extra battery
```

## Example 7: Mixed Language (Malay + English)
```
Nama: Nurul Aisyah
Tel: 012-987-6543
Email: nurul.aisyah@yahoo.com
Camera: Canon EOS R6
Tarikh: 20/12/2025 - 23/12/2025
Delivery ke Subang Jaya, Jalan SS15/4
Notes: First time renting, need tutorial on camera usage
```

## Example 8: Relative Dates
```
Customer: David Lim
Contact: 0198765432
Email: david.lim@company.com
Camera: Sony A7 III
Dates: This coming Saturday to next Tuesday
Pickup method: Self pickup
Special request: Need lens cleaning kit
```

## Tips for Testing:

1. **Structured messages** (Example 1, 3) should have HIGH confidence
2. **Casual messages** (Example 2, 4) should have MEDIUM confidence
3. **Minimal messages** (Example 4) will have LOW confidence for missing fields
4. **Relative dates** (Example 8) require AI to calculate actual dates
5. **Mixed language** (Example 7) tests multilingual support
6. **Voice-to-text** (Example 6) tests natural language processing

## What the AI Extracts:

- ✅ Customer name
- ✅ Phone number (formatted to +60xxxxxxxxx)
- ✅ Email address
- ✅ WhatsApp number (defaults to phone if not specified)
- ✅ Camera name (fuzzy matched to available cameras)
- ✅ Start date (converted to YYYY-MM-DD)
- ✅ End date (converted to YYYY-MM-DD)
- ✅ Pickup method (pickup/delivery)
- ✅ Delivery address (if delivery mentioned)
- ✅ Special notes/requests

## Confidence Levels:

- 🟢 **High**: Explicitly stated and clear
- 🟡 **Medium**: Inferred or partially clear
- 🟠 **Low**: Guessed or ambiguous
- ⚪ **None**: Not found in text

## After Extraction:

1. Review the extracted data in the form
2. Edit any incorrect or missing information
3. Create new customer if needed
4. Submit the booking
5. Send WhatsApp confirmation to customer

---

**Note**: The AI uses DeepSeek API which is very cost-effective (~RM0.0045 per request). Feel free to test extensively!

