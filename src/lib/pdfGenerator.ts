"use client";

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Patient } from '@/app/context/PatientContext';

// Function to shorten URL using is.gd API
<<<<<<< HEAD
export const shortenUrl = async (url: string): Promise<string> => {
=======
const shortenUrl = async (url: string): Promise<string> => {
>>>>>>> ffc76def9e3743f262c40b24cec341f069341772
  if (!url) return 'N/A';

  try {
    // Check if URL is valid
    new URL(url);

    // Call is.gd API to shorten the URL
    const response = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}`);

    if (!response.ok) {
      console.error('URL shortening failed:', response.statusText);
      return url; // Return original URL if shortening fails
    }

    const data = await response.json();
    return data.shorturl || url;
  } catch (error) {
    console.error('Error shortening URL:', error);
    return url; // Return original URL if there's an error
  }
};

// Function to generate a PDF report for a patient
export const generatePatientPDF = async (patient: Patient) => {
  // Shorten the image URL if it exists
  let shortenedImageUrl = 'N/A';
  if (patient.imageUrl) {
<<<<<<< HEAD
    const urls = patient.imageUrl.split(',').filter(Boolean);
    const shortenedUrls = await Promise.all(urls.map(url => shortenUrl(url.trim())));
    shortenedImageUrl = shortenedUrls.join('\n');
=======
    shortenedImageUrl = await shortenUrl(patient.imageUrl);
>>>>>>> ffc76def9e3743f262c40b24cec341f069341772
  }
  // Create new PDF document in A5 format
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5'
  });

  // Page constants for A5
  const PAGE_HEIGHT = 190; // Maximum safe height for A5 (210mm total)
  const PAGE_MARGIN = 15;
  const CONTENT_WIDTH = 118; // Width of content area for A5 (148mm total)

  // Tracking variables
  let currentY = 0;
  let currentPage = 1;

  // Function to add a new page and reset position
  const addNewPage = () => {
    doc.addPage();
    currentPage++;
    currentY = PAGE_MARGIN;
  };

  // Function to check if we need a page break
  const checkPageBreak = (heightNeeded: number) => {
    if (currentY + heightNeeded > PAGE_HEIGHT) {
      addNewPage();
      return true;
    }
    return false;
  };

  // Function to estimate text height
  const estimateTextHeight = (text: string, fontSize: number) => {
    const lines = doc.splitTextToSize(text, CONTENT_WIDTH);
    return (lines.length * fontSize * 0.5) + 10; // 0.5 is a multiplier for line spacing
  };

  // Helper function to add a section title
  const addSectionTitle = (title: string) => {
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(title, PAGE_MARGIN, currentY);
    currentY += 10;
  };

  // Helper function to add a text section
  const addTextSection = (title: string, content: string, checkNewPage = true) => {
    // Skip if content is empty
    if (!content || !content.trim()) {
      return;
    }

    const textLines = doc.splitTextToSize(content, CONTENT_WIDTH);
    const estimatedHeight = 20 + (textLines.length * 6); // title + content

    // Check if we need a page break
    if (checkNewPage && checkPageBreak(estimatedHeight)) {
      // We're on a new page already, don't check again
      addSectionTitle(title);
    } else {
      addSectionTitle(title);
    }

    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text(textLines, PAGE_MARGIN, currentY);
    currentY += textLines.length * 6 + 15; // Add some extra space after the text
  };

  // Add title
  currentY = PAGE_MARGIN;
  doc.setFontSize(18); // Smaller font for A5
  doc.setTextColor(0, 51, 102);
  doc.text('Patient Report', 74, currentY, { align: 'center' }); // 74 is half of 148mm
  currentY += 12;

  // Add clinic ID and date
  doc.setFontSize(10); // Smaller font for A5
  doc.setTextColor(100, 100, 100);
  doc.text(`Clinic ID: ${patient.clinicId || 'N/A'}`, 74, currentY, { align: 'center' });
  currentY += 5;
  doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 74, currentY, { align: 'center' });
  currentY += 8;

  // Add horizontal line
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(PAGE_MARGIN, currentY, PAGE_MARGIN + CONTENT_WIDTH, currentY);
  currentY += 10;

  // Add patient information title
  addSectionTitle('Patient Information');

  // Add patient basic information as a table
  autoTable(doc, {
    startY: currentY,
    head: [['Field', 'Value']],
    body: [
      ['Name', patient.name || 'N/A'],
      ['DOB', patient.dob || 'N/A'],
      ['Sex', patient.sex || 'N/A'],
      ['Mobile Number', patient.mobileNumber || 'N/A'],
      ['Hospital File Number', patient.hospitalFileNumber || 'N/A'],
      ['Image URL', shortenedImageUrl]
    ],
    theme: 'striped',
    headStyles: {
      fillColor: [66, 133, 244],
      textColor: 255,
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 40, fontStyle: 'bold' }
    },
    styles: { overflow: 'linebreak', cellPadding: 3, fontSize: 10 }
  });

  // Update Y position
  currentY = (doc as any).lastAutoTable.finalY + 15;

  // Add medical information title
  addSectionTitle('Medical Information');

  // Add medical information table
  autoTable(doc, {
    startY: currentY,
    head: [['Field', 'Value']],
    body: [
      ['Diagnosis', patient.diagnosis || 'N/A'],
      ['Age of Diagnosis', patient.ageOfDiagnosis || 'N/A'],
      ['Treatment', patient.treatment || 'N/A'],
      ['Response', patient.response || 'N/A'],
      ['Imaging', patient.imaging || 'N/A'],
      ['Ultrasound', patient.ultrasound || 'N/A'],
      ['Lab Test', patient.labText || 'N/A'],
      ['Report', patient.report || 'N/A'],
      ['Follow Up Date', patient.followUpDate || 'N/A']
    ],
    theme: 'striped',
    headStyles: {
      fillColor: [66, 133, 244],
      textColor: 255,
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 40, fontStyle: 'bold' }
    },
    styles: { overflow: 'linebreak', cellPadding: 3, fontSize: 10 }
  });

  // Update Y position
  currentY = (doc as any).lastAutoTable.finalY + 15;

  // Check current treatment length
  const currentTreatmentText = patient.currentTreatment?.trim() || '';
  const currentTreatmentHeight = currentTreatmentText ? estimateTextHeight(currentTreatmentText, 12) : 0;

  // Check notes length
  const notesText = patient.note?.trim() || '';
  const notesHeight = notesText ? estimateTextHeight(notesText, 12) : 0;

  // Determine if current treatment can fit on first page
  const remainingSpace = PAGE_HEIGHT - currentY;

  // If current treatment is short, or it can fit with plenty of room to spare, keep it on page 1
  if (currentTreatmentText && (currentTreatmentHeight < 50 || remainingSpace > currentTreatmentHeight + 30)) {
    // Current treatment is short or fits well, add it to page 1
    addTextSection('Current Treatment', currentTreatmentText);

    // If notes are also short and can fit on page 1, add them too
    if (notesText && currentY + notesHeight < PAGE_HEIGHT) {
      addTextSection('Notes', notesText);
    }
    // Otherwise, notes go to page 2 if they exist
    else if (notesText) {
      addNewPage();
      addTextSection('Notes', notesText, false); // Skip page check since we just created a new page
    }
  }
  // If current treatment is long, or treatment + notes need their own page
  else if (currentTreatmentText) {
    // Current treatment is long, move to page 2
    addNewPage();
    addTextSection('Current Treatment', currentTreatmentText, false);

    // Check if notes can fit on the same page after treatment
    if (notesText && currentY + notesHeight < PAGE_HEIGHT) {
      addTextSection('Notes', notesText);
    }
    // Notes are also long, move to page 3
    else if (notesText) {
      addNewPage();
      addTextSection('Notes', notesText, false);
    }
  }
  // If only notes exist but no treatment
  else if (notesText) {
    // Check if notes can fit on first page
    if (remainingSpace > notesHeight + 20) {
      addTextSection('Notes', notesText);
    } else {
      addNewPage();
      addTextSection('Notes', notesText, false);
    }
  }

  // Add table data if available
  if (patient.tableData) {
    try {
      const tableData = JSON.parse(patient.tableData);
      if (Array.isArray(tableData) && tableData.length > 0) {
        // Estimate table height - approximately 20px per row plus header
        const estimatedTableHeight = (tableData.length * 20) + 30;

        // Check if table needs a new page
        if (checkPageBreak(estimatedTableHeight + 10)) {
          addSectionTitle('Additional Data');
        } else {
          addSectionTitle('Additional Data');
        }

        autoTable(doc, {
          startY: currentY,
          body: tableData,
          theme: 'grid',
          styles: { overflow: 'linebreak', cellPadding: 5 }
        });

        // Update Y position
        currentY = (doc as any).lastAutoTable.finalY + 10;
      }
    } catch (e) {
      console.error('Error parsing table data for PDF:', e);
    }
  }

  // Add footer with page number
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount}`, 74, 205, { align: 'center' });
  }

  // Generate filename with just the clinic ID
  const filename = `${patient.clinicId || 'report'}.pdf`;

  // Save and open the PDF
  doc.save(filename);
};

export const generateCardPDF = async (patient: Patient, content: string, title: string): Promise<jsPDF> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5'
  });

  const calculateAge = (dob: string): string => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return 'N/A';
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  };

  try {
    doc.addImage('/drhawar.jpg', 'JPEG', 0, 0, 148, 210);
  } catch (e) {
    console.warn('Could not add background image to PDF share:', e);
  }

  const infoY = 56;
  const leftX = 15;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Name:', leftX, infoY);
  doc.setFont('helvetica', 'normal');
  doc.text(patient.name || 'N/A', leftX + 13, infoY);

  const detailsY = infoY + 8;
  doc.setFont('helvetica', 'bold');
  doc.text('Age:', leftX, detailsY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${calculateAge(patient.dob)} / DOB: ${patient.dob || 'N/A'}`, leftX + 13, detailsY);

  doc.setFont('helvetica', 'bold');
  doc.text('clinic ID:', 90, detailsY);
  doc.setFont('helvetica', 'normal');
  doc.text(patient.clinicId || 'N/A', 106, detailsY);

  const contentY = 74;
  doc.setDrawColor(0, 0, 0);
  doc.setLineDashPattern([1, 1], 0);
  doc.line(leftX, contentY, 133, contentY);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setLineDashPattern([], 0);
  const textLines = doc.splitTextToSize(content, 118);
  doc.text(textLines, leftX + 2, contentY + 10);

  return doc;
};