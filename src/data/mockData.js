
const today = new Date();

const daysAgo = (days) => {
  const date = new Date(today);
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

export const initialClaims = [
  {
    id: "DTL-1024",
    employee: "Amit Sharma",
    employeeId: "DTL-E001",
    department: "Transmission",
    type: "Medical Reimbursement",
    amount: 15000,
    submittedAt: daysAgo(12),
    currentStage: "Department Head",
    stageStartedAt: daysAgo(8),
    slaDays: 3,
    status: "Pending",
    history: [
      { stage: "Submitted", date: daysAgo(12), action: "Completed" },
      { stage: "HR Verification", date: daysAgo(11), action: "Approved" },
      { stage: "Department Head", date: daysAgo(8), action: "Pending" }
    ]
  },
  {
    id: "DTL-1025",
    employee: "Priya Verma",
    employeeId: "DTL-E002",
    department: "Human Resources",
    type: "Children Education Fund",
    amount: 25000,
    submittedAt: daysAgo(4),
    currentStage: "HR Verification",
    stageStartedAt: daysAgo(2),
    slaDays: 3,
    status: "Pending",
    history: [
      { stage: "Submitted", date: daysAgo(4), action: "Completed" },
      { stage: "HR Verification", date: daysAgo(2), action: "Pending" }
    ]
  },
  {
    id: "DTL-1026",
    employee: "Rahul Gupta",
    employeeId: "DTL-E003",
    department: "Finance",
    type: "LTC",
    amount: 32000,
    submittedAt: daysAgo(15),
    currentStage: "Final Authority",
    stageStartedAt: daysAgo(2),
    slaDays: 3,
    status: "Pending",
    history: [
      { stage: "Submitted", date: daysAgo(15), action: "Completed" },
      { stage: "HR Verification", date: daysAgo(13), action: "Approved" },
      { stage: "Department Head", date: daysAgo(7), action: "Approved" },
      { stage: "Final Authority", date: daysAgo(2), action: "Pending" }
    ]
  },
  {
    id: "DTL-1027",
    employee: "Neha Singh",
    employeeId: "DTL-E004",
    department: "Operations",
    type: "Medical Reimbursement",
    amount: 8500,
    submittedAt: daysAgo(3),
    currentStage: "Finance",
    stageStartedAt: daysAgo(1),
    slaDays: 3,
    status: "Pending",
    history: [
      { stage: "Submitted", date: daysAgo(3), action: "Completed" },
      { stage: "HR Verification", date: daysAgo(2), action: "Approved" },
      { stage: "Department Head", date: daysAgo(1), action: "Approved" },
      { stage: "Final Authority", date: daysAgo(1), action: "Approved" },
      { stage: "Finance", date: daysAgo(1), action: "Pending" }
    ]
  },
  {
    id: "DTL-1028",
    employee: "Karan Mehta",
    employeeId: "DTL-E005",
    department: "Maintenance",
    type: "Children Education Fund",
    amount: 18000,
    submittedAt: daysAgo(20),
    currentStage: "Completed",
    stageStartedAt: daysAgo(10),
    slaDays: 3,
    status: "Approved",
    history: [
      { stage: "Submitted", date: daysAgo(20), action: "Completed" },
      { stage: "HR Verification", date: daysAgo(18), action: "Approved" },
      { stage: "Department Head", date: daysAgo(15), action: "Approved" },
      { stage: "Final Authority", date: daysAgo(12), action: "Approved" },
      { stage: "Finance", date: daysAgo(10), action: "Approved" }
    ]
  },
  {
    id: "DTL-1029",
    employee: "Anjali Rao",
    employeeId: "DTL-E006",
    department: "Transmission",
    type: "LTC",
    amount: 22000,
    submittedAt: daysAgo(10),
    currentStage: "Department Head",
    stageStartedAt: daysAgo(7),
    slaDays: 3,
    status: "Pending",
    history: [
      { stage: "Submitted", date: daysAgo(10), action: "Completed" },
      { stage: "HR Verification", date: daysAgo(9), action: "Approved" },
      { stage: "Department Head", date: daysAgo(7), action: "Pending" }
    ]
  },
  {
    id: "DTL-1030",
    employee: "Rohit Malhotra",
    employeeId: "DTL-E007",
    department: "Finance",
    type: "Medical Reimbursement",
    amount: 12000,
    submittedAt: daysAgo(6),
    currentStage: "Completed",
    stageStartedAt: daysAgo(3),
    slaDays: 3,
    status: "Approved",
    history: [
      { stage: "Submitted", date: daysAgo(6), action: "Completed" },
      { stage: "HR Verification", date: daysAgo(5), action: "Approved" },
      { stage: "Department Head", date: daysAgo(4), action: "Approved" },
      { stage: "Final Authority", date: daysAgo(3), action: "Approved" },
      { stage: "Finance", date: daysAgo(3), action: "Approved" }
    ]
  },
  {
    id: "DTL-1031",
    employee: "Simran Kaur",
    employeeId: "DTL-E008",
    department: "Human Resources",
    type: "LTC",
    amount: 27000,
    submittedAt: daysAgo(5),
    currentStage: "HR Verification",
    stageStartedAt: daysAgo(4),
    slaDays: 3,
    status: "Pending",
    history: [
      { stage: "Submitted", date: daysAgo(5), action: "Completed" },
      { stage: "HR Verification", date: daysAgo(4), action: "Pending" }
    ]
  }
];
