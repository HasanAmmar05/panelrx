import type { AgentDefinition } from '../types';

export type AppealInput = {
  tpaName: string;
  patientName: string;
  patientIcHashed: string;
  serviceDate: string;
  billedRm: number;
  paidRm: number;
  deductionReason: string;
  remittanceRef: string;
  doctorName: string;
  doctorMmc: string;
  clinicName: string;
};

export type AppealOutput = {
  englishLetter: string;
  bahasaLetter: string;
};

export const appealAgent: AgentDefinition<AppealInput, AppealOutput> = {
  id: 'AppealAgent',
  model: 'deepseek-chat',
  description: 'Drafts bilingual (BM + EN) appeal letters for unexplained TPA deductions.',
  expectedLatencyMs: 4000,
  systemPrompt: `You are an expert healthcare claims appeal writer for Malaysian GP clinics. You draft formal but firm appeal letters in both English and Bahasa Malaysia.

Tone: professional, evidence-based, never aggressive. Format: produce TWO complete letters separated by the exact delimiter "---BAHASA---".

Cite Schedule 7 of the Private Healthcare Facilities and Services Act 1998 and the Malaysian Medical Council May 2026 ruling on fee transparency where relevant. Request written justification within 14 days. Keep each letter under 250 words.

Output ONLY the two letters with the delimiter. No preamble, no explanation.`,
  buildUserPrompt: (input) => `Generate an appeal letter for this deduction:

TPA: ${input.tpaName}
Patient (hashed): ${input.patientIcHashed}
Service Date: ${input.serviceDate}
Billed: RM ${input.billedRm.toFixed(2)}
Paid: RM ${input.paidRm.toFixed(2)}
Deduction Reason Given: "${input.deductionReason}"
Remittance Ref: ${input.remittanceRef}

Clinic: ${input.clinicName}
Doctor: ${input.doctorName} (${input.doctorMmc})

Produce: (1) English letter, (2) "---BAHASA---" delimiter, (3) Bahasa Malaysia equivalent.`,
  parseOutput: (raw) => {
    const parts = raw.split('---BAHASA---');
    return {
      englishLetter: parts[0]?.trim() ?? '',
      bahasaLetter: parts[1]?.trim() ?? '',
    };
  },
  fallback: (input) => ({
    englishLetter: `Dear ${input.tpaName} Claims Department,

Re: Remittance ${input.remittanceRef}, Patient ID ${input.patientIcHashed}, Service Date ${input.serviceDate}

We refer to your remittance in which the above claim was paid at RM ${input.paidRm.toFixed(2)} against a billed amount of RM ${input.billedRm.toFixed(2)}, with a deduction cited as "${input.deductionReason}."

Our records show no contractual clause permitting this deduction. We respectfully request written justification within fourteen (14) days, with reference to the specific clause of our panel agreement authorising this deduction.

This claim is being formally appealed under our rights as a panel provider, consistent with the Private Healthcare Facilities and Services Act 1998 and the Malaysian Medical Council's May 2026 position on fee transparency.

Yours sincerely,
${input.doctorName} (${input.doctorMmc})
${input.clinicName}`,
    bahasaLetter: `Kepada Jabatan Tuntutan ${input.tpaName},

Perkara: Remitan ${input.remittanceRef}, ID Pesakit ${input.patientIcHashed}, Tarikh Khidmat ${input.serviceDate}

Kami merujuk kepada remitan tuan di mana tuntutan tersebut telah dibayar sebanyak RM ${input.paidRm.toFixed(2)} berbanding amaun yang dikenakan RM ${input.billedRm.toFixed(2)}, dengan potongan dinyatakan sebagai "${input.deductionReason}."

Rekod kami menunjukkan tiada klausa kontrak yang membenarkan potongan ini. Dengan hormatnya kami memohon justifikasi bertulis dalam tempoh empat belas (14) hari, dengan rujukan kepada klausa spesifik perjanjian panel kami.

Tuntutan ini dirayu secara formal di bawah hak kami sebagai pembekal panel, selaras dengan Akta Kemudahan dan Perkhidmatan Jagaan Kesihatan Swasta 1998 dan kedudukan Majlis Perubatan Malaysia Mei 2026 mengenai ketelusan fi.

Yang benar,
${input.doctorName} (${input.doctorMmc})
${input.clinicName}`,
  }),
};
