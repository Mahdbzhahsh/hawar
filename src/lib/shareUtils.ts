"use client";

import { Patient } from '@/app/context/PatientContext';
import { shortenUrl } from './pdfGenerator';

/**
 * Shares a treatment card link to WhatsApp or system share sheet
 */
export const shareTreatmentCard = async (patient: Patient, content: string, title: string) => {
  try {
    // Map title/content type to URL parameter cardType
    let cardType = 'treatment';
    if (title === 'Imaging Card') cardType = 'imaging';
    else if (title === 'Ultrasound Card') cardType = 'ultrasound';
    else if (title === 'Lab Test Card') cardType = 'lab';
    else if (title === 'Report Card') cardType = 'report';

    // Construct the public sharing URL
    const shareUrl = `${window.location.origin}/share/card/${patient.id}/${cardType}`;
    
    // Shorten the URL using is.gd API
    const shortUrl = await shortenUrl(shareUrl);

    // Filter mobile number to digits only
    let mobileNumber = patient.mobileNumber.replace(/\D/g, '');
    
    // Normalize number (assuming Iraq 964 if it starts with 07 or 7)
    if (mobileNumber.startsWith('07')) {
      mobileNumber = '964' + mobileNumber.substring(1);
    } else if (mobileNumber.startsWith('7') && mobileNumber.length === 15) {
      // Already has country code prefix
    } else if (mobileNumber.startsWith('7') && mobileNumber.length === 10) {
      mobileNumber = '964' + mobileNumber;
    } else if (mobileNumber.startsWith('00')) {
      mobileNumber = mobileNumber.substring(2);
    }

    const messageText = `Here is the ${title} link for ${patient.name}: ${shortUrl}`;

    // Open WhatsApp with the pre-filled link message
    if (mobileNumber) {
      const text = encodeURIComponent(messageText);
      const waUrl = `https://api.whatsapp.com/send?phone=${mobileNumber}&text=${text}`;
      window.open(waUrl, '_blank');
    } else {
      // Copy to clipboard if mobile number is missing
      try {
        await navigator.clipboard.writeText(messageText);
        alert(`Link copied to clipboard!\n\nPatient mobile number is missing or invalid, so WhatsApp could not be opened automatically.\n\nURL: ${shortUrl}`);
      } catch (clipErr) {
        console.error('Clipboard copy failed:', clipErr);
        alert(`Patient mobile number is missing or invalid. Here is the sharing link:\n\n${shortUrl}`);
      }
    }
  } catch (error) {
    console.error('Error sharing treatment card:', error);
    alert('Failed to share the card.');
  }
};
