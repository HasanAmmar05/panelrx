# PRD: Multi‑TPA Claims & Payment Reconciliation Prototype for Malaysian GP Clinics
## 1. Overview
General practice (GP) clinics in Malaysia increasingly depend on a fragmented ecosystem of third‑party administrators (TPAs), insurers and government schemes to get paid for outpatient visits. Each TPA runs its own portal, verification rules, payment cycle and deduction structure, making it extremely difficult for clinics to track eligibility, submit claims, follow up, and reconcile payments in a timely way.[^1][^2][^3]

This PRD defines a prototype for a **TPA‑agnostic operations layer** that sits between a clinic’s practice management system and multiple TPAs, automating as much as possible of:

- Eligibility/benefit verification
- Claim creation and submission
- Claim status tracking
- Payment ingestion and reconciliation
- TPA‑level analytics

The initial target user is a Malaysian GP clinic such as Dr Vani’s practice, which is currently panel for a mix of insurers, TPAs and public schemes including AIA, MiCare, MediExpress, PMCare, SelCare, MedKad, HealthMetrics, Mednefits, Compumed, IHP, PeKa B40, Skim Perubatan Madani, FOMEMA, PERKESO Sehati and others. The system will be designed so that additional payers can be added via configuration rather than bespoke development for each.
## 2. Problem Statement
### 2.1 Operational pain points
MMA and Malaysian media report that GPs face mounting financial strain from TPAs due to low consultation caps, high admin fees and significantly delayed payments. Clinics often wait 3–6 months and sometimes up to 9 months for payment, with significant variability in batching (one patient at a time vs large, irregular batches), making cash‑flow planning and reconciliation difficult.[^1][^2][^3]

At the clinic level, the current process typically looks like:

1. Front‑desk staff manually identify the patient’s payer/TPA from their card or app.
2. Staff call the TPA hotline or log into a dedicated portal/app to verify eligibility, plan limits and panel status.
3. After consultation, staff key visit and billing details into the clinic system **and** separately into each TPA portal.
4. Staff repeatedly log into multiple portals or make calls to track claim statuses.
5. Months later, TPAs pay via bank transfer and send statements (PDF/Excel) listing many patients with various deductions.
6. Finance staff manually match each remittance line back to clinic visits, investigate variances and post receipts to the accounting system.

Because every TPA uses different portals, file formats, status codes, payment cycles and admin‑fee structures, clinics lack a single, real‑time view of:

- Which TPAs owe how much
- How long each TPA takes to pay
- Which claims are stuck or short‑paid
- How much revenue is lost to deductions and write‑offs
### 2.2 Scope of initial prototype
There are 55 Managed Care Organisations (MCOs) registered with the Ministry of Health, many of which function as TPAs or benefit managers. However, most clinics work with a smaller active subset, and early prototypes do not need to support all of them.[^4]

For v1, the product will focus on **digitally enabled TPAs that are common across urban GP clinics**, including but not limited to:

- MiCare
- MediExpress
- PMCare
- SelCare
- MedKad
- HealthMetrics
- Mednefits
- Compumed
- IHP

These payers all operate portals or mobile apps for members and providers, indicating underlying digital processes that can be integrated via APIs, scripted browser automations, or semi‑structured file exchanges.[^5][^6][^7][^8][^9][^10][^11]
## 3. Goals and Non‑Goals
### 3.1 Goals
- **G1 – Single operations view:** Provide clinics with a unified dashboard of claims, statuses and receivables across multiple TPAs.
- **G2 – Reduce manual data entry:** Enable staff to enter visit and billing data once and automatically transform/submit it to multiple TPAs.
- **G3 – Automate reconciliation:** Ingest TPA payment statements and automatically match payments to claims, highlighting exceptions.
- **G4 – Improve cash‑flow visibility:** Provide real‑time metrics on outstanding amounts, ageing and admin‑fee leakage by TPA.
- **G5 – Be TPA‑agnostic:** Design a connector architecture that allows new TPAs to be added through configuration and mapping rather than rewriting core logic.
### 3.2 Non‑Goals (for v1)
- Replacing existing clinic practice management or EMR systems end‑to‑end.
- Deep clinical decision support (e.g. restricting prescriptions to plan formularies).
- Patient‑facing mobile apps (beyond minimal email/SMS notifications).
- Full automation for TPAs that only operate via fax or manual paper claims.
## 4. Actors and User Profiles
| Actor | Description | Primary Needs |
|-------|-------------|---------------|
| Front‑Desk Staff | Reception/administrative staff performing eligibility checks, registration and claim creation. | Fast eligibility check, single place to create claims, clear prompts for required data per TPA. |
| Finance/Accounts Staff | Staff responsible for following up on claims, downloading statements, reconciling payments and managing ageing. | Unified view of claim statuses, automated payment matching, clear exception lists and reports. |
| Clinic Owner / GP | Medical practitioner owning or managing the clinic. | High‑level view of receivables by TPA, payment timelines, admin‑fee impact and cash‑flow risk. |
| System Admin (Clinic) | Person configuring TPAs, bank accounts, user access. | Easy onboarding of TPAs, role‑based access control, audit logs. |
| TPA / Payer (indirect) | TPAs such as MiCare, MediExpress, PMCare who interact via existing portals/APIs. | Receive complete, valid claims and minimal manual support burden (indirect benefit). |
## 5. High‑Level Solution
The prototype is a **middleware layer** between the clinic system and multiple TPAs:

- Ingests clinic encounter and billing data via API, file upload or embedded module.
- Maintains a canonical **Claim** record independent of any single TPA.
- Provides a unified **Operations UI** for eligibility checking, claim submission, status tracking and reconciliation.
- Integrates with TPAs via a pluggable **Connector Framework**.
- Ingests payment statements (PDF/Excel) via upload or automated download and runs a reconciliation engine.
## 6. Functional Requirements
### 6.1 Eligibility & Benefit Verification
#### 6.1.1 Description

The system should provide a single interface for checking patient eligibility and benefit limits across multiple TPAs, abstracting away differences between portals and mobile apps. Existing payer apps such as MediExpress and MiCare already expose entitlement and balance limits to members, indicating available data elements.[^6][^9][^10]

#### 6.1.2 User Stories

- **US‑E1:** As front‑desk staff, I can select a payer (e.g. MiCare, MediExpress, PMCare) and enter card/member details, then click **Check Coverage** to see whether the patient is eligible for outpatient visit at my clinic and what remaining limits apply.
- **US‑E2:** As front‑desk staff, I can see the result in a standardised format (valid/invalid, remaining annual limit, per‑visit cap, co‑pay requirement) regardless of which TPA responds.
- **US‑E3:** As front‑desk staff, I can attach the eligibility response to the Claim record to avoid re‑checking during reconciliation.

#### 6.1.3 Key Behaviours

- System accepts input: payer_id, member_id, card_number, employer code (optional), visit_type.
- Connector calls the relevant TPA channel: API if available, otherwise scripted web interaction or guided manual entry.
- Response is normalised to a common schema: `eligibility_status`, `remaining_limit`, `visit_cap`, `copay_percent`, `notes`.
- Errors (e.g. invalid card, resigned employee) surface with clear messages; system can suggest alternative payment options.
### 6.2 Claim Creation & Submission
#### 6.2.1 Description

Most TPAs require similar core data on paper or digital forms: member details, provider details, diagnosis, procedures and itemised charges. Today, clinics re‑enter this information separately into each TPA portal.[^12][^13][^6]

#### 6.2.2 User Stories

- **US‑C1:** As front‑desk staff, I can create a new claim linked to a patient encounter with fields for all common data elements (member, diagnosis, procedures, itemised charges, supporting documents).
- **US‑C2:** As front‑desk staff, I can choose the payer/TPA once, and the system knows which additional fields are required for that payer.
- **US‑C3:** As front‑desk staff, I can submit the claim from within the system without opening external portals.
- **US‑C4:** As finance staff, I can see a log of all submissions, including payer‑specific reference numbers and timestamps.

#### 6.2.3 Claim Data Model (Canonical)

Core fields inferred from typical reimbursement forms and guides:[^13][^6][^10][^12]

- Patient / Member: member_id, full_name, NRIC/passport, employer, plan_id, payer_id.
- Encounter: clinic_id, doctor_id, visit_date, visit_type (OP/IP/ER), diagnosis_code(s), procedure_code(s).
- Financials: gross_amount, discount, expected_covered_amount, estimated_patient_share.
- Line Items: description, quantity, unit_price, line_total, category (consultation, lab, X‑ray, medication).
- Attachments: invoice_pdf, receipt_pdf, prescription, referral letter.
- Metadata: created_by_user, created_at, updated_at, audit trail.

#### 6.2.4 Submission Flow

- On **Submit**, system validates mandatory fields depending on payer configuration.
- Connector module transforms canonical Claim into payer‑specific format:
  - Web form filling (headless browser automation).
  - File generation (e.g. CSV, Excel, XML) for batch upload.
  - Direct API call where available.
- Payer response (claim reference number, initial status) is parsed and stored back into the Claim.
### 6.3 Claim Status Tracking
#### 6.3.1 Description

TPAs like MediExpress and MiCare expose claim history and guarantee letter status through their apps and portals. Clinics currently monitor these manually across multiple sites.[^6][^9]

#### 6.3.2 User Stories

- **US‑S1:** As finance staff, I can view a consolidated list of all claims across TPAs with their current status, amount, payer and ageing days.
- **US‑S2:** As finance staff, I can filter claims by payer, status (pending, queried, approved, rejected), date range and value.
- **US‑S3:** As finance staff, I receive alerts when a claim status changes to `queried` or `rejected`, or when a claim remains `pending` beyond configurable thresholds.

#### 6.3.3 Behaviour

- Scheduler (e.g. nightly) calls each payer connector to retrieve updated claim statuses in bulk where possible.
- Each connector maps payer‑specific statuses into a standard set (e.g. pending, in_review, queried, approved_full, approved_partial, rejected, paid).
- System updates Claim records, logs status history, and triggers notifications for configured events.
### 6.4 Payment Ingestion & Reconciliation
#### 6.4.1 Description

When TPAs finally pay, they send remittance advice or statements listing multiple claims with paid amounts and adjustments. Standard remittance advice formats internationally include claim ID, patient, date of service, billed amount, allowed amount, paid amount and adjustment/remark codes.[^14]

#### 6.4.2 User Stories

- **US‑R1:** As finance staff, I can upload a payer payment statement (PDF or Excel) and have the system automatically match payment lines to existing Claims.
- **US‑R2:** As finance staff, I can see a reconciliation summary for a payment batch: fully matched, partially matched, unmatched lines and variance.
- **US‑R3:** As finance staff, I can drill into discrepancies (e.g. short‑paid claims, unexplained deductions) and annotate actions (appealed, written off, under investigation).
- **US‑R4:** As finance staff, I can export reconciled transactions to the clinic’s accounting system.

#### 6.4.3 Payment Data Model (Canonical)

- Payment Batch: payer_id, payment_id, payment_date, deposit_reference, total_amount, file_source (portal, email, manual upload).
- Payment Line: claim_id (if known), patient_name, visit_date, billed_amount, allowed_amount, paid_amount, admin_fee_amount, adjustment_amount, adjustment_reason_code, remarks.
- Reconciliation Metadata: match_status (matched / partial / unmatched), variance_amount, reconciled_at, reconciled_by_user.

#### 6.4.4 Reconciliation Engine Behaviour

- Ingestion: parse PDF/Excel using OCR and table extraction tuned for healthcare remittance layouts.[^14]
- Matching logic (configurable per payer):
  - Primary keys: payer_claim_id, clinic_invoice_number.
  - Secondary keys: patient_name + visit_date + billed_amount.
  - Fuzzy matching thresholds to handle minor spelling/formatting differences.
- Auto‑posting:
  - Lines with exact matches and zero variance auto‑mark as reconciled.
  - Lines with small, explainable variances (e.g. known admin fee rate) can be auto‑reconciled with breakdown.
  - All others go into an exception queue for human review.
### 6.5 TPA Analytics & Dashboards
#### 6.5.1 Description

MMA has called for regulation of TPAs due to rising healthcare costs and opaque fee structures; aggregated data can support this advocacy. At clinic level, owners need visibility on which TPAs are most problematic.[^2][^3][^15]

#### 6.5.2 User Stories

- **US‑A1:** As a clinic owner, I can see a dashboard showing outstanding receivables by payer, average days to pay, and admin‑fee percentages.
- **US‑A2:** As a clinic owner, I can compare payers on metrics such as claim rejection rates, average deduction per claim and total revenue.
- **US‑A3:** As MMA or an association (future phase), I can view anonymised, aggregated statistics across participating clinics about TPA performance.

#### 6.5.3 Metrics

- By payer: total billed, total paid, total admin fees, average days from visit to payment, rejection rate, partial‑approval rate.
- By time: monthly/quarterly trends of outstanding amounts and ageing buckets (0–30, 31–60, 61–90, 90+ days).
## 7. TPA Connector Framework
### 7.1 Connector Concept
Each TPA will be represented as a **connector** implementing a standard interface:

- `check_eligibility(request) → response`
- `submit_claim(claim) → submission_result`
- `fetch_claim_statuses(since_timestamp) → [status_updates]`
- `download_statements(date_range) → [files]`

Internally, a connector may use APIs, browser automation, or prepared templates depending on the TPA’s capabilities.[^5][^6][^9][^11]
### 7.2 Configuration per TPA
For each payer in scope (e.g. MiCare, MediExpress, PMCare, SelCare, MedKad, HealthMetrics, Mednefits, Compumed, IHP), store configuration including:

- Portal URLs and API endpoints.
- Authentication method (username/password, OTP, certificate).
- Supported operations (eligibility, claim submission, status query, statement download).
- Required data fields and their mappings to canonical Claim fields.
- Payment statement formats (PDF, Excel, CSV) and known column layouts.
- Typical payment lags (for ageing and alert thresholds).[^8]
## 8. Integrations
### 8.1 Clinic Systems
Phase 1 will assume one of:

- Direct data entry into the prototype UI (embedded module used as the clinic’s claims console), or
- Simple integration with the clinic’s practice management system via CSV export/import or lightweight REST API.

Future phases can explore tight integrations with Malaysian clinic management software that already handle panel billing but lack advanced multi‑TPA reconciliation.[^16]
### 8.2 Accounting Systems
At minimum, provide CSV exports compatible with common accounting tools. Future phases may add direct integration to popular cloud accounting platforms to auto‑post receipts.
## 9. Non‑Functional Requirements
- **Security & Privacy:**
  - Encrypt data in transit and at rest.
  - Role‑based access control (front‑desk vs finance vs owner).
  - Detailed audit logs of all eligibility checks, submissions and edits.
  - No patient‑identifiable data stored longer than necessary for operations and statutory record‑keeping.

- **Reliability:**
  - Connector failures must be gracefully handled with clear error messages and re‑try mechanisms.
  - Local caching of submission artefacts in case TPA portals are temporarily unavailable.

- **Scalability:**
  - Designed to support dozens of clinics and thousands of claims per month in the prototype; architecture should be extendable to national scale.

- **Configurability:**
  - New payers can be onboarded by configuration/mapping rather than core code changes where possible.
## 10. Success Metrics for Prototype
- Reduction in average time spent per claim by front‑desk staff (e.g. minutes saved).
- Reduction in manual reconciliation time per payment batch.
- Percentage of claims auto‑matched on payment without manual intervention.
- Improvement in visibility: clinic can report, per payer, outstanding balance and average days to pay.
- Qualitative feedback from pilot clinics and MMA regarding usability and perceived impact.
## 11. Phase 1 Deliverables
- Working web‑based prototype with:
  - Eligibility check UI and underlying connector for at least 1–2 TPAs.
  - Canonical Claim data model and single‑entry claim creation UI.
  - Claim submission and status polling for at least 1–2 TPAs.
  - PDF/Excel statement upload, parsing and basic reconciliation engine.
  - Operations dashboard with key metrics and filters.

- Configuration and playbook for adding additional TPAs to the system.
## 12. Future Extensions
- Deeper, API‑level integrations with TPAs willing to expose provider APIs.
- Patient‑facing notifications (e.g. share EOB‑style breakdowns to patients).
- Advanced analytics for associations/regulators (MMA, MOH) on TPA behaviour using aggregated, de‑identified data.[^2][^3][^15]
- Integration with government schemes (PeKa B40, Madani) and social security health programmes (PERKESO Sehati) using similar connector patterns.[^17][^15]

---

## References

1. [Third-party administrator problem straining clinics financially, says ...](https://www.freemalaysiatoday.com/category/nation/2025/03/05/third-party-administrator-problem-straining-clinics-financially-says-mma) - “Many GPs are tied to TPA contracts that impose high administrative fees and fix low consultation ra...

2. [MMA warns of spiralling healthcare cost if MOH, BNM don't regulate ...](https://focusmalaysia.my/mma-warns-of-spiralling-healthcare-cost-if-moh-bnm-dont-regulate-third-party-administrators/) - Many GPs are faced with financial challenges as a result of delayed payments and the rejection of cl...

3. [Health Care Costs Will Rise Further If TPAs Remain Unregulated](https://vgh.pth.mybluehost.me/2024/06/health-care-costs-will-rise-further-if-tpas-remain-unregulated-mma/) - Many GPs are faced with financial challenges as a result of delayed payments and the rejection of cl...

4. [[PDF] senarai managed care organisation (mco ) yang telah berdaftar ...](https://hq.moh.gov.my/medicalprac/wp-content/uploads/2023/05/SENARAI-TERKINI-MANAGED-CARE-ORGANISATION-MCO-UPDATE-25.5.2023.pdf) - Malaysia. Tel : 03-20274788. Email : malaysia@inovacare.com. 2010. 29. INTERNATIONAL MEDICARE. GROUP...

5. [MediExpress](https://www.mediexpress.com.my) - MediExpress (M) Sdn Bhd. Member Login. For UOB employees to submit OP and Flexcare claim, please cli...

6. [MiCare MyMed User Manual Overview | PDF - Scribd](https://www.scribd.com/document/758825996/MiCare-User-Manual) - MiCare MyMed Top Features : e-Medical Card, Locate Panel Providers, Claims Submission, View Claims H...

7. [Malaysia's digital third-party administrator HealthMetrics launches in ...](https://technode.global/2025/04/21/malaysias-digital-third-party-administrator-healthmetrics-launches-in-indonesia/) - To further improve cross-border care, the HealthMetrics International Assistance Hub offers access t...

8. [Selcare Isn't Your Typical TPA With Fast Payments, No ...](https://vgh.pth.mybluehost.me/2024/03/selcare-isnt-your-typical-tpa-with-fast-payments-no-consultation-fee-cap/) - Selcare Management, a Selangor state-owned TPA, has no cap on consultation fees or a list of reimbur...

9. [[PDF] A Group Company -.:MediExpress:.](https://www.mediexpress.com.my/data/Mobile%20App%20User%20Guide.pdf) - View Claim History. A. Group Company. ▫ Choose claim type: Inpatient/Outpatient. ▫ Select the claim ...

10. [[PDF] MiCare Mobile App - EMGS](https://visa.educationmalaysia.gov.my/media/cms_upload/1._GETB_MiCare_Mobile_App_Guide25.pdf) - MiCare. Great Eastern Takaful Berhad. Claim Submission. Micare Claims HQ : claimshq@micaresvc.com. G...

11. [MeDKAD | Login](https://panel.medkad.com) - MeDKAD Panel Portal. Login with. Mkad SSO. OR. Identification Number. Password. Forgot Password? Log...

12. [[PDF] MediExpress Reimbursement Medical Form1 copy](http://www3.lgm.gov.my/upsm/Borang/KhidmatPekerja/Borang%20MediExpress%20(Inpatient).pdf) - (iii) Incomplete form may result in delay of insurance claims. (iv) Please provide copy of lab test ...

13. [MediExpress Medical Reimbursement Form | PDF | Clinic - Scribd](https://www.scribd.com/document/377680425/Reimbursement-Medical-Form-New) - (1) This is a medical reimbursement form used by MediExpress (Malaysia) Sdn Bhd to process insurance...

14. [REMITTANCE ADVICE:](https://www.icarehealthplan.org/Files/Resources/PROVIDER-DOCS/Remittance_Advice_Guide.pdf) - Explanation of Benefits (EOB) - Explains benefits provided to a member by identifying each line item...

15. [[PDF] Cost Drivers in Malaysia's Medical and Health Insurance/Takaful ...](https://documents1.worldbank.org/curated/en/099042926035539735/pdf/P515710-3669950b-3a47-4923-a32a-8cad71973717.pdf) - The full list of the predicted prices for the 100 services included ... Character TPA Code. 30. Paym...

16. [Best Clinic Management Software Malaysia | MedicalMet](https://medicalmet.com/blog/best-clinic-management-software-malaysia-2026/) - CxSYS is a Malaysian clinic management system serving GP and dental clinics. It includes patient man...

17. [[PDF] Daftar Provider Rumah Sakit Malaysia - Great Eastern](https://www.greateasternlife.com/content/dam/dmassets/great-eastern/indonesia/gel-id/asuransi-individu/dapatkanbantuan/layanan-nasabah/provider-list-gps-fhi-malaysia/geli-mktg-ai-ly-provider-list-gps-fhi-malaysia.pdf) - NO. HOSPITAL NAME. ADDRESS. CITY. COUNTRY CONTACT NUMBER. GROUP. 1. PANTAI HOSPITAL KUALA LUMPUR. 8 ...

