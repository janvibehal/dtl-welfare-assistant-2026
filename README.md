# DTL Welfare Approval Monitoring System

A standalone React frontend prototype that demonstrates monitoring of
employee welfare-claim approvals through role-oriented views, stage
progression, correction/resubmission, overdue indicators, notifications,
and analytics.

> **Project status:** Frontend MVP / demonstration prototype\
> **Organisation context:** Delhi Transco Limited (DTL)\
> **Integration:** Not connected to DTL's SAP ERP\
> **Data:** Synthetic demonstration records only

## 1. Problem Context

The project was shaped by an internship-based study of welfare-claim
workflows.

Rather than duplicate capabilities, this prototype focuses on
**approval monitoring**: making pending claims, current approval stages,
elapsed time, and overdue items easier to review.

The workflow represented in the demo is:

`HR Verification → Department Head → Final Authority → Finance → Completed`

The exact approval structure and official service timelines must be
validated with DTL before being treated as organisational policy.

## 2. Features

-   Role-oriented demo views for:
    -   Admin
    -   HR / LWO Officer
    -   Approving Authority
    -   Finance Officer
    -   Senior Management
    -   Employee
-   Dashboard with total, pending, overdue, approved, and rejected claim
    summaries.
-   Claim listing, search, and filtering.
-   Claim detail view and approval history.
-   Simulated multi-stage approval progression.
-   Return-for-correction and employee resubmission flow.
-   Simulated finance payment completion.
-   SLA-based overdue indicators using sample configured limits.
-   In-app demonstration notifications.
-   Stage-wise workload and summary analytics.
-   Browser `localStorage` persistence for demo changes.

## 3. Technology Stack

  Technology             Purpose
  ---------------------- --------------------------------------
  React                  Frontend user interface
  JavaScript             Application logic
  Vite                   Development server and build tooling
  CSS                    Styling and responsive layout
  Lucide React           Icons
  Browser localStorage   Persistence of demo claim state

## 4. Getting Started

### Prerequisites

-   Node.js (LTS recommended)
-   npm

### Installation

``` bash
git clone <your-repository-url>
cd dtl-welfare-assistant
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173/`.

### Build

``` bash
npm run build
npm run preview
```

## 5. Project Structure

``` text
dtl-welfare-assistant/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── data/
│   │   └── mockData.js
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

## 6. Demonstration Workflow

1.  Select a demo role from the role selector.
2.  Open the relevant claim list.
3.  Inspect a claim and its current stage/history.
4.  Perform an action permitted by the selected demo role.
5.  For a returned claim, switch to the associated employee and
    demonstrate resubmission.
6.  Continue the claim through approval stages and simulate finance
    completion.
7.  Review notifications, overdue claims, and analytics.

## 7. Data Model in the Frontend Demo

The sample claim objects contain fields such as:

-   `id`
-   `employee`
-   `employeeId`
-   `department`
-   `type`
-   `amount`
-   `submittedAt`
-   `currentStage`
-   `stageStartedAt`
-   `slaDays`
-   `status`
-   `history`

All sample names, IDs, amounts, and claim records are synthetic. The
values must not be interpreted as actual employee or claim information.


## 8. Architecture

Current implementation:

``` text
User
  |
  v
React UI (role selector, dashboard, claim views)
  |
  v
React state and workflow actions
  |
  v
Local mock data (src/data/mockData.js)
  |
  v
Browser localStorage
```

There is currently no Express backend, MongoDB database, secure
authentication service, or SAP integration.

## 9. Important Limitations

-   This is a frontend-only demonstration prototype.
-   Role switching is simulated and is not secure authentication.
-   Client-side role checks can be bypassed; they must not be relied
    upon for real access control.
-   `localStorage` is browser-specific and is not a central multi-user
    data store.
-   Notifications are in-app demonstration notifications.
-   SLA limits are sample configuration values, not official DTL
    timelines.
-   Finance processing is simulated; no actual payment is made.
-   No production DTL data is accessed or stored.

## 10. Future Scope

-   Node.js and Express REST API.
-   MongoDB collections for users, claims, approval history,
    notifications, and SLA rules.
-   Secure authentication and server-side role-based authorization.
-   Server-side workflow validation and audit logging.
-   Scheduled SLA checks and configurable escalation.
-   Secure document upload and validation.
-   Persistent, user-specific notifications.
-   Exportable analytics and reports.
-   Stakeholder review, security assessment, and usability testing.


## 11. Disclaimer

This project is an academic/internship demonstration prototype. It is
not an official DTL application, is not endorsed as a production system,
and is not integrated with DTL's SAP ERP. Do not upload confidential
organisational information, real employee details, medical documents,
credentials, or internal screenshots to this repository without explicit
authorisation.
