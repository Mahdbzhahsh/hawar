"use client";

import { Patient } from '@/app/context/PatientContext';
import { generateCardPDF } from './pdfGenerator';

/**
 * Shares a treatment card as a PDF to WhatsApp
 */
export const shareTreatmentCard = async (patient: Patient, content: string, title: string) => {
  try {
    const doc = await generateCardPDF(patient, content, title);
    const pdfBlob = doc.output('blob');
    const filename = `${patient.clinicId || 'card'}_${title.replace(/\s+/g, '_')}.pdf`;
    const file = new File([pdfBlob], filename, { type: 'application/pdf' });

    // Detect if mobile for sharing API
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    // 1. Try using Web Share API ONLY on Mobile (best for mobile as it can attach files)
    if (isMobile && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: title,
          text: `Patient Card: ${patient.name} (${patient.clinicId})`,
        });
        return; // Success
      } catch (shareError) {
        // User cancelled or share failed, continue to fallback
        console.log('Share API failed or cancelled:', shareError);
      }
    }

    // 2. Fallback for Desktop: Download + Open WhatsApp
    // Download the file
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Filter mobile number to digits only
    let mobileNumber = patient.mobileNumber.replace(/\D/g, '');
    
    // Normalize number (assuming Iraq 964 if it starts with 07 or 7)
    if (mobileNumber.startsWith('07')) {
      mobileNumber = '964' + mobileNumber.substring(1);
    } else if (mobileNumber.startsWith('7') && mobileNumber.length === 10) {
      mobileNumber = '964' + mobileNumber;
    } else if (mobileNumber.startsWith('00')) {
      mobileNumber = mobileNumber.substring(2);
    }

    if (mobileNumber) {
      // Use api.whatsapp.com for better Desktop app triggering in some environments
      const text = encodeURIComponent(`I have shared the ${title} for ${patient.name} as a PDF. Please attach the downloaded file "${filename}" to this chat.`);
      const waUrl = `https://api.whatsapp.com/send?phone=${mobileNumber}&text=${text}`;
      window.open(waUrl, '_blank');
    } else {
      alert('PDF downloaded. Patient mobile number is missing or invalid, so WhatsApp could not be opened automatically.');
    }
  } catch (error) {
    console.error('Error sharing treatment card:', error);
    alert('Failed to share the card. Please try downloading it instead.');
  }
};
