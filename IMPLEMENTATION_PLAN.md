# Patient Registration Form Modifications - Implementation Plan

## Overview
This plan outlines the changes needed to:
1. Rename "Age" field to "DOB" (Date of Birth)
2. Rename "Lab Text" field to "Lab Test"
3. Add "Follow up date" field (identical behavior to Diagnosis field)

## Files to Modify

### 1. Patient Context (`src/app/context/PatientContext.tsx`)
**Changes:**
- Add `followUpDate` field to `Patient` interface (line 8-30)
- Add `follow_up_date` to `PatientRecord` interface (line 33-55)
- Add `followUpDate` to form data state initialization
- Update data mapping in `fetchPatients` to convert snake_case to camelCase
- Update `addPatient` function to include `followUpDate`
- Update `editPatient` function to handle `followUpDate`
- Update `sanitizedData` for staff role

### 2. Patient Registration Form (`src/app/dashboard/patient-form/page.tsx`)
**Changes:**
- Line 20: Rename `age` to `followUpDate` in formData state
- Line 240-255: Change "Age" label to "DOB" and change input type to `date`
- Line 482-500: Rename "Lab Text" label to "Lab Test"
- Add new "Follow up date" field after Lab Test (matching Diagnosis field behavior)
- Update form reset function to include `followUpDate`
- Add `followUpDate` to `isStaff` restricted fields

### 3. Patient Edit Form (`src/app/components/PatientEditForm.tsx`)
**Changes:**
- Line 16: Add `followUpDate: patient.followUpDate` to formData state
- Line 102: Add `followUpDate: patient.followUpDate` in useEffect reset
- Rename Lab Text label to Lab Test
- Add Follow up date field (matching Diagnosis styling)
- Update form reset in useEffect

### 4. Excel Export (`src/lib/excelExport.ts`)
**Changes:**
- Line 9: Rename 'Age' to 'DOB' in export columns
- Line 23: Rename 'Lab Text' to 'Lab Test'
- Line 24-25: Add 'Follow Up Date' column
- Lines 45-46: Update column widths for renamed and new fields

### 5. PDF Generator (`src/lib/pdfGenerator.ts`)
**Changes:**
- Line 132: Rename 'Age' to 'DOB' in patient info table
- Add 'Follow Up Date' to medical information table
- Rename 'Lab Text' to 'Lab Test' in medical info table

### 6. Patients List Page (`src/app/dashboard/patients/page.tsx`)
**Changes:**
- Rename Age column header to DOB
- Add Follow Up Date column display
- Update any filters that use Age

### 7. Database Schema
**Changes:**
- Add `follow_up_date` column to patients table (if not already present)
- Run migration script or update create-patients-table.sql

## Field Behavior Specification

### Follow Up Date Field
The "Follow up date" field should behave identically to the "Diagnosis" field:
- **Form display:** Visible in patient form for data entry ✓
- **Edit mode:** Displayed in patient edit/view mode ✓
- **PDF reports:** Included in generated patient reports ✓
- **Patient list:** Included in table views ✓
- **Exports:** Included in PDF and Excel exports ✓
- **Database:** Persists to `follow_up_date` column ✓
- **Styling:** Same as Diagnosis field (input type, styling classes) ✓
- **Staff restrictions:** Follows same restrictions as Diagnosis (not editable by staff) ✓

### DOB Field (renamed from Age)
- **Label change:** "Age" → "DOB"
- **Input type:** `text` → `date`
- **Display:** Shows date picker instead of text input

### Lab Test Field (renamed from Lab Text)
- **Label change:** "Lab Text" → "Lab Test"

## Implementation Order

1. **Database Update** - Add `follow_up_date` column
2. **PatientContext** - Update interfaces and data handling
3. **Registration Form** - Rename fields and add new field
4. **Edit Form** - Rename fields and add new field
5. **Excel Export** - Update column names and add new column
6. **PDF Generator** - Update field names and add new field
7. **Patients List** - Update display columns
8. **Testing** - Verify all changes work correctly

## Testing Checklist
- [ ] New patient form shows DOB field with date picker
- [ ] New patient form shows renamed "Lab Test" field
- [ ] New patient form shows "Follow up date" field
- [ ] Follow up date is saved to database
- [ ] Edit form displays all renamed and new fields correctly
- [ ] Excel export contains renamed and new columns
- [ ] PDF report contains renamed and new fields
- [ ] Patient list shows DOB and Follow up date columns
- [ ] Staff restrictions work correctly on new fields
