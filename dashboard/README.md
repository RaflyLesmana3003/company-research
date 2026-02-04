# Contact Extraction Metrics Dashboard

A real-time monitoring dashboard for the Contact Information Extraction pipeline, built with Next.js and connected to the same PostgreSQL database used by the n8n workflow.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: Tailwind CSS 4, Radix UI, shadcn/ui components
- **Charts**: Recharts
- **Database**: Neon PostgreSQL (serverless driver)
- **Language**: TypeScript

## Dashboard Components

| Component | Description |
|-----------|-------------|
| KPI Cards | Total processed, success rate, avg confidence, throughput |
| Pipeline Overview | End-to-end pipeline status summary |
| Field Rates Chart | Extraction rates per field (phone, email, address) |
| Confidence Histogram | Distribution of confidence scores |
| Fields Distribution | Breakdown of fields_found_count (0-3) |
| CRM Writeback Chart | HubSpot update success/failure tracking |
| Throughput Chart | Processing volume over time |
| Error Breakdown | Errors by type |
| Error Rate Trend | Error rate over time |
| Recent Errors | Latest error details |
| Runs Table | Workflow run history with metrics |
| Extracted Data Table | Detailed view of extracted contact data |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database with the extraction pipeline schema (see `database/schema.sql`)

### Setup

1. Install dependencies:

```bash
cd dashboard
npm install
```

2. Create `.env.local` from the example:

```bash
cp .env.local.example .env.local
```

3. Set your database connection string in `.env.local`:

```
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Deployment

Deploy to Vercel:

```bash
npx vercel
```

Set `DATABASE_URL` as an environment variable in the Vercel project settings.
