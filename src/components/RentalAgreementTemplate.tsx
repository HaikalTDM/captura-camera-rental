'use client';

import React, { useRef } from 'react';
import { format } from 'date-fns';

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

interface RentalAgreementTemplateProps {
  booking: Booking;
  customer: Customer;
  camera: Camera;
  confirmationNumber?: string;
}

export default function RentalAgreementTemplate({
  booking,
  customer,
  camera,
  confirmationNumber
}: RentalAgreementTemplateProps) {
  const agreementRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy');
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy, hh:mm a');
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return `RM${amount.toFixed(2)}`;
  };

  // Calculate pickup date (day before rental start)
  const getPickupDate = () => {
    try {
      const startDate = new Date(booking.start_date);
      const pickupDate = new Date(startDate);
      pickupDate.setDate(pickupDate.getDate() - 1);
      return formatDate(pickupDate.toISOString());
    } catch {
      return formatDate(booking.start_date);
    }
  };

  // Inline styles for better PDF compatibility
  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px',
      backgroundColor: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      color: '#000000',
      lineHeight: '1.6'
    },
    header: {
      textAlign: 'center' as const,
      marginBottom: '30px',
      borderBottom: '3px solid #2563eb',
      paddingBottom: '20px'
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: '8px',
      letterSpacing: '2px'
    },
    subtitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#000000',
      marginBottom: '12px'
    },
    infoText: {
      fontSize: '12px',
      color: '#333333',
      margin: '4px 0'
    },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#000000',
      marginTop: '24px',
      marginBottom: '12px',
      paddingBottom: '8px',
      borderBottom: '2px solid #e5e7eb',
      textTransform: 'uppercase' as const
    },
    partiesContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px',
      marginBottom: '24px'
    },
    partyBox: {
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      padding: '16px',
      backgroundColor: '#f9fafb'
    },
    partyTitle: {
      fontSize: '12px',
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: '12px',
      textTransform: 'uppercase' as const
    },
    partyInfo: {
      fontSize: '11px',
      color: '#000000',
      margin: '6px 0'
    },
    detailsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      marginBottom: '20px'
    },
    detailRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: '1px solid #e5e7eb'
    },
    detailLabel: {
      fontSize: '12px',
      color: '#000000',
      fontWeight: '500'
    },
    detailValue: {
      fontSize: '12px',
      color: '#000000',
      fontWeight: 'bold'
    },
    summaryBox: {
      border: '2px solid #2563eb',
      borderRadius: '8px',
      padding: '20px',
      marginTop: '24px',
      backgroundColor: '#f8fafc'
    },
    summaryTitle: {
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: '16px',
      textTransform: 'uppercase' as const
    },
    summaryRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 0',
      fontSize: '12px',
      color: '#000000'
    },
    totalRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '12px 0',
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#000000',
      borderTop: '2px solid #2563eb',
      marginTop: '8px'
    },
    termsBox: {
      marginTop: '24px',
      padding: '16px',
      backgroundColor: '#f9fafb',
      border: '1px solid #d1d5db',
      borderRadius: '8px'
    },
    termsList: {
      fontSize: '10px',
      color: '#000000',
      lineHeight: '1.8',
      paddingLeft: '20px'
    },
    signatureSection: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '40px',
      marginTop: '40px',
      paddingTop: '24px',
      borderTop: '2px solid #9ca3af'
    },
    signatureBox: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '16px'
    },
    signatureLabel: {
      fontSize: '12px',
      fontWeight: '500',
      color: '#000000',
      marginBottom: '12px'
    },
    signatureLine: {
      borderBottom: '2px solid #9ca3af',
      height: '64px',
      marginBottom: '0'
    },
    signatureImage: {
      height: '128px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start'
    },
    signatureInfo: {
      fontSize: '12px',
      color: '#000000',
      margin: '4px 0'
    },
    signatureDate: {
      fontSize: '12px',
      color: '#000000',
      marginTop: '8px'
    },
    acknowledgment: {
      marginTop: '24px',
      padding: '16px',
      backgroundColor: '#f3f4f6',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      fontSize: '10px',
      color: '#000000',
      fontStyle: 'italic'
    },
    footer: {
      textAlign: 'center' as const,
      marginTop: '40px',
      paddingTop: '20px',
      borderTop: '1px solid #d1d5db',
      fontSize: '10px',
      color: '#666666'
    }
  };

  return (
    <div ref={agreementRef} style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>CAPTURA</h1>
        <h2 style={styles.subtitle}>Camera Rental Agreement</h2>
        <p style={styles.infoText}>
          <strong>Confirmation No:</strong> {confirmationNumber || booking.id.substring(0, 8).toUpperCase()}
        </p>
        <p style={styles.infoText}>
          Agreement Date: {formatDateTime(booking.created_at)}
        </p>
      </div>

      {/* Agreement Parties */}
      <div style={styles.partiesContainer}>
        {/* Rental Company */}
        <div style={styles.partyBox}>
          <div style={styles.partyTitle}>Rental Company (Lessor)</div>
          <div style={styles.partyInfo}><strong>CAPTURA</strong></div>
          <div style={styles.partyInfo}>Camera Rental Services</div>
          <div style={styles.partyInfo}>Malaysia</div>
          <div style={styles.partyInfo}>Contact: +60 17-746 4121</div>
        </div>

        {/* Customer */}
        <div style={styles.partyBox}>
          <div style={styles.partyTitle}>Customer (Renter)</div>
          <div style={styles.partyInfo}><strong>{customer.full_name}</strong></div>
          <div style={styles.partyInfo}>Email: {customer.email}</div>
          <div style={styles.partyInfo}>Phone: {customer.phone}</div>
          {customer.id_number && (
            <div style={styles.partyInfo}>IC/Passport: {customer.id_number}</div>
          )}
        </div>
      </div>

      {/* Rental Details */}
      <h3 style={styles.sectionTitle}>Rental Details</h3>
      <div style={styles.detailsGrid}>
        <div>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Equipment:</span>
            <span style={styles.detailValue}>{camera.name}</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Rental Start:</span>
            <span style={styles.detailValue}>{formatDate(booking.start_date)}</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Rental End:</span>
            <span style={styles.detailValue}>{formatDate(booking.end_date)}</span>
          </div>
        </div>
        <div>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Total Days:</span>
            <span style={styles.detailValue}>{booking.total_days} day{booking.total_days > 1 ? 's' : ''}</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Daily Rate:</span>
            <span style={styles.detailValue}>{formatCurrency(booking.daily_rate)}</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Pickup Method:</span>
            <span style={{ ...styles.detailValue, textTransform: 'capitalize' }}>{booking.pickup_method}</span>
          </div>
        </div>
      </div>

      {/* Payment Summary */}
      <div style={styles.summaryBox}>
        <div style={styles.summaryTitle}>Payment Summary</div>
        <div style={styles.summaryRow}>
          <span>Rental Amount ({booking.total_days} days × {formatCurrency(booking.daily_rate)}):</span>
          <span style={{fontWeight: 'bold'}}>{formatCurrency(booking.total_days * booking.daily_rate)}</span>
        </div>
        {booking.pickup_method === 'delivery' && booking.delivery_fee && (
          <div style={styles.summaryRow}>
            <span>Delivery Fee:</span>
            <span style={{fontWeight: 'bold'}}>{formatCurrency(booking.delivery_fee)}</span>
          </div>
        )}
        <div style={styles.summaryRow}>
          <span>Security Deposit (Refundable):</span>
          <span style={{fontWeight: 'bold'}}>{formatCurrency(booking.deposit_amount)}</span>
        </div>
        <div style={styles.totalRow}>
          <span>TOTAL AMOUNT:</span>
          <span>{formatCurrency(booking.total_amount)}</span>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div style={styles.termsBox}>
        <h3 style={styles.sectionTitle}>Terms and Conditions</h3>
        <ol style={styles.termsList}>
          <li style={{marginBottom: '8px'}}>
            <strong>Rental Period:</strong> Equipment must be picked up one day before the rental start date and returned on the rental end date.
          </li>
          <li style={{marginBottom: '8px'}}>
            <strong>Security Deposit:</strong> A refundable security deposit of {formatCurrency(booking.deposit_amount)} is required. The deposit will be refunded within 7 business days after equipment return, subject to inspection.
          </li>
          <li style={{marginBottom: '8px'}}>
            <strong>Equipment Care:</strong> The renter agrees to use the equipment with reasonable care and return it in the same condition as received.
          </li>
          <li style={{marginBottom: '8px'}}>
            <strong>Damage/Loss:</strong> The renter is responsible for any damage or loss of equipment. Repair or replacement costs will be deducted from the security deposit. Maximum liability is RM3,600.
          </li>
          <li style={{marginBottom: '8px'}}>
            <strong>Late Returns:</strong> Late returns will incur additional daily rental charges at the agreed daily rate.
          </li>
          <li style={{marginBottom: '8px'}}>
            <strong>Cancellation:</strong> Cancellations must be made at least 48 hours before the rental start date for a full refund.
          </li>
          <li style={{marginBottom: '8px'}}>
            <strong>Insurance:</strong> The renter is advised to obtain insurance coverage for the rented equipment.
          </li>
          <li style={{marginBottom: '8px'}}>
            <strong>Prohibited Use:</strong> Equipment may not be used for illegal purposes or subleased to third parties.
          </li>
        </ol>
      </div>

      {/* Signature Section */}
      <div style={{marginBottom: '32px', borderTop: '2px solid #9ca3af', paddingTop: '24px'}}>
        <h3 style={{fontSize: '16px', fontWeight: 'bold', color: '#000000', marginBottom: '24px'}}>
          Agreement Acknowledgment
        </h3>

        <div style={styles.signatureSection}>
          {/* Renter Signature */}
          <div style={styles.signatureBox}>
            <div>
              <p style={styles.signatureLabel}>Renter's Signature:</p>
              <div style={styles.signatureLine}></div>
            </div>
            <div>
              <p style={styles.signatureInfo}>
                Name: <span style={{fontWeight: 'bold'}}>{customer.full_name}</span>
              </p>
              <p style={styles.signatureInfo}>
                IC/Passport: {customer.id_number || '___________________'}
              </p>
            </div>
            <div>
              <p style={styles.signatureDate}>
                Date: <span style={{fontWeight: 'bold'}}>{getPickupDate()}</span>
              </p>
            </div>
          </div>

          {/* Lessor Signature */}
          <div style={styles.signatureBox}>
            <div>
              <p style={styles.signatureLabel}>Lessor's Signature (Captura):</p>
              <div style={styles.signatureImage}>
                <img
                  src="/images/HaikalSign.png"
                  alt="Muhammad Haikal Signature"
                  style={{maxHeight: '128px', width: 'auto', objectFit: 'contain', maxWidth: '300px'}}
                />
              </div>
            </div>
            <div>
              <p style={styles.signatureInfo}>
                Name: <span style={{fontWeight: 'bold'}}>Muhammad Haikal</span>
              </p>
              <p style={styles.signatureInfo}>Position: Owner / CEO</p>
            </div>
            <div>
              <p style={styles.signatureDate}>
                Date: <span style={{fontWeight: 'bold'}}>{getPickupDate()}</span>
              </p>
            </div>
          </div>
        </div>

        <div style={styles.acknowledgment}>
          <p>
            By signing this agreement, both parties acknowledge that they have read, understood, and agree to be bound by all terms and conditions stated herein. The Renter confirms receipt of the equipment in good working condition and agrees to return it in the same condition, subject to normal wear and tear.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <p><strong>CAPTURA Camera Rental Services | Malaysia</strong></p>
        <p style={{marginTop: '4px'}}>Contact: +60 17-746 4121 | This is a legally binding agreement</p>
        <p style={{marginTop: '4px'}}>Agreement ID: {booking.id}</p>
        {confirmationNumber && (
          <p style={{marginTop: '4px'}}>Confirmation: {confirmationNumber}</p>
        )}
      </div>
    </div>
  );
}


