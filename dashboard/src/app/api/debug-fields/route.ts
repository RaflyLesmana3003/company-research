import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const sql = getDb();

  const [distinctPhones, distinctEmails, distinctAddresses, zeroFieldRecords] =
    await Promise.all([
      sql`
        SELECT LOWER(TRIM(extracted_phone)) as val, COUNT(*) as cnt
        FROM contact_extraction_results
        WHERE extraction_timestamp > NOW() - INTERVAL '30 days'
        GROUP BY 1
        ORDER BY cnt DESC
        LIMIT 30
      `,
      sql`
        SELECT LOWER(TRIM(extracted_email)) as val, COUNT(*) as cnt
        FROM contact_extraction_results
        WHERE extraction_timestamp > NOW() - INTERVAL '30 days'
        GROUP BY 1
        ORDER BY cnt DESC
        LIMIT 30
      `,
      sql`
        SELECT LOWER(TRIM(extracted_address)) as val, COUNT(*) as cnt
        FROM contact_extraction_results
        WHERE extraction_timestamp > NOW() - INTERVAL '30 days'
        GROUP BY 1
        ORDER BY cnt DESC
        LIMIT 30
      `,
      sql`
        SELECT fields_found, COUNT(*) as cnt
        FROM contact_extraction_results
        WHERE extraction_timestamp > NOW() - INTERVAL '30 days'
        GROUP BY fields_found
        ORDER BY fields_found
      `,
    ]);

  return NextResponse.json({
    distinctPhones,
    distinctEmails,
    distinctAddresses,
    zeroFieldRecords,
  });
}
