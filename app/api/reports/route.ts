import { NextRequest, NextResponse } from 'next/server'
import { resortDb } from '@/lib/db/resort-db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const reportType = searchParams.get('type') || 'arrivals'
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
    const format = searchParams.get('format') // 'csv' or 'json'

    const reservations = await resortDb.getReservations()
    const guests = await resortDb.getGuests()
    const wristbands = await resortDb.getWristbands()
    const logs = await resortDb.getAccessLogs()

    let rows: any[] = []
    let filename = `resort_report_${reportType}_${date}.csv`

    if (reportType === 'arrivals') {
      rows = reservations
        .filter((r) => r.check_in_date === date)
        .map((r) => ({
          Reference: r.reference_number,
          Guest: r.guest?.full_name || 'N/A',
          Category: r.guest?.category || 'Regular',
          Phone: r.guest?.phone || 'N/A',
          Accommodation: r.room_or_accommodation,
          Status: r.status,
          Adults: r.adults_count,
          Children: r.children_count,
          Wristband: r.wristband?.wristband_code || 'Unassigned',
          ActualCheckIn: r.actual_check_in_time ? new Date(r.actual_check_in_time).toLocaleTimeString() : 'Pending',
        }))
    } else if (reportType === 'departures') {
      rows = reservations
        .filter((r) => r.check_out_date === date)
        .map((r) => ({
          Reference: r.reference_number,
          Guest: r.guest?.full_name || 'N/A',
          Accommodation: r.room_or_accommodation,
          Status: r.status,
          Wristband: r.wristband?.wristband_code || 'None',
          ActualCheckOut: r.actual_check_out_time ? new Date(r.actual_check_out_time).toLocaleTimeString() : 'Pending',
          BalanceDue: (r.total_amount - r.amount_paid).toFixed(2),
        }))
    } else if (reportType === 'occupancy') {
      rows = reservations
        .filter((r) => r.status === 'Checked In')
        .map((r) => ({
          Reference: r.reference_number,
          Guest: r.guest?.full_name || 'N/A',
          Category: r.guest?.category || 'Regular',
          Accommodation: r.room_or_accommodation,
          CheckInDate: r.check_in_date,
          ExpectedCheckOut: r.check_out_date,
          GuestsCount: (r.adults_count || 1) + (r.children_count || 0),
          Wristband: r.wristband?.wristband_code || 'Active',
          CheckedInBy: r.checked_in_by || 'Staff',
        }))
    } else if (reportType === 'vip') {
      rows = reservations
        .filter((r) => r.guest?.category === 'VIP')
        .map((r) => ({
          Guest: r.guest?.full_name || 'N/A',
          Email: r.guest?.email || 'N/A',
          Phone: r.guest?.phone || 'N/A',
          Reference: r.reference_number,
          Accommodation: r.room_or_accommodation,
          Status: r.status,
          SpecialRequests: r.special_requests || 'None',
          VIPNotes: r.guest?.notes || '',
        }))
    } else if (reportType === 'wristbands') {
      rows = wristbands.map((w) => ({
        WristbandCode: w.wristband_code,
        Status: w.status,
        Condition: w.condition,
        AssignedGuest: w.guest?.full_name || 'None',
        AssignedReservation: w.reservation?.reference_number || 'None',
        LastScanned: w.last_scanned_at ? new Date(w.last_scanned_at).toLocaleString() : 'Never',
        Notes: w.notes || '',
      }))
    } else if (reportType === 'staff_activity') {
      rows = logs.map((l) => ({
        Timestamp: new Date(l.timestamp).toLocaleString(),
        StaffMember: l.receptionist_name,
        Action: l.action_type,
        Method: l.verification_method,
        Guest: l.guest_name,
        Reference: l.reservation_ref || '',
        Wristband: l.wristband_code || '',
        Notes: l.notes || '',
      }))
    }

    if (format === 'csv') {
      if (rows.length === 0) {
        return new Response('No records found for selected criteria\n', {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="${filename}"`,
          },
        })
      }

      const headers = Object.keys(rows[0])
      const csvContent = [
        headers.join(','),
        ...rows.map((row) =>
          headers
            .map((h) => {
              const val = row[h] ? String(row[h]).replace(/"/g, '""') : ''
              return `"${val}"`
            })
            .join(',')
        ),
      ].join('\n')

      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    }

    return NextResponse.json({
      reportType,
      date,
      count: rows.length,
      data: rows,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
