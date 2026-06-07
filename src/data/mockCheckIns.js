export const MOCK_CHECK_INS = [
  {
    id: "check-1",
    patientId: "pt_jason",
    ts: Date.now() - 1000 * 60 * 60 * 20,
    pain: 2,
    swelling: 1,
    soreness: 3,
    confidence: 8,
    sleep: "Good",
    concern: "Stairs still feel slow but not painful.",
  },
  {
    id: "check-2",
    patientId: "pt_mike",
    ts: Date.now() - 1000 * 60 * 60 * 30,
    pain: 5,
    swelling: 5,
    soreness: 6,
    confidence: 4,
    sleep: "Fair",
    concern: "More swelling after standing at work.",
  },
];
