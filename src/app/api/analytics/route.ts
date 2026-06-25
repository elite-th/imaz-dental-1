import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Fetch all bookings — compute stats in JS since SQLite groupBy is limited
    const bookings = await db.booking.findMany({
      select: {
        id: true,
        phone: true,
        service: true,
        date: true,
        status: true,
        createdAt: true,
      },
    })

    // --- Overview ---
    const totalBookings = bookings.length
    const uniquePhones = new Set(bookings.map((b) => b.phone))
    const totalPatients = uniquePhones.size
    const pendingBookings = bookings.filter((b) => b.status === 'pending').length
    const confirmedBookings = bookings.filter((b) => b.status === 'confirmed').length

    const today = new Date()
    const todayStr = today.toISOString().split('T')[0] // "YYYY-MM-DD"
    const todayBookings = bookings.filter((b) => b.date === todayStr).length

    // --- bookingsByService ---
    const serviceMap = new Map<string, number>()
    for (const b of bookings) {
      serviceMap.set(b.service, (serviceMap.get(b.service) || 0) + 1)
    }
    const bookingsByService = Array.from(serviceMap.entries())
      .map(([service, count]) => ({ service, count }))
      .sort((a, b) => b.count - a.count)

    // --- bookingsByStatus ---
    const statusMap = new Map<string, number>()
    for (const b of bookings) {
      statusMap.set(b.status, (statusMap.get(b.status) || 0) + 1)
    }
    const bookingsByStatus = Array.from(statusMap.entries())
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count)

    // --- bookingsByDate (last 30 days based on date field) ---
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0]

    const dateMap = new Map<string, number>()
    for (const b of bookings) {
      if (b.date >= thirtyDaysAgoStr) {
        dateMap.set(b.date, (dateMap.get(b.date) || 0) + 1)
      }
    }
    const bookingsByDate = Array.from(dateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // --- weeklyTrend (last 7 days based on createdAt) ---
    const now = new Date()
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    // Initialize all 7 days with 0
    const weeklyMap = new Map<string, { bookings: number; confirmed: number }>()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dayKey = d.toISOString().split('T')[0]
      weeklyMap.set(dayKey, { bookings: 0, confirmed: 0 })
    }

    for (const b of bookings) {
      const createdDate = new Date(b.createdAt).toISOString().split('T')[0]
      if (weeklyMap.has(createdDate)) {
        const entry = weeklyMap.get(createdDate)!
        entry.bookings += 1
        if (b.status === 'confirmed') {
          entry.confirmed += 1
        }
      }
    }

    const weeklyTrend = Array.from(weeklyMap.entries()).map(([dateKey, data]) => {
      const dayOfWeek = new Date(dateKey + 'T00:00:00').getDay()
      return {
        day: dayNames[dayOfWeek],
        bookings: data.bookings,
        confirmed: data.confirmed,
      }
    })

    // --- monthlyTrend (last 6 months based on createdAt) ---
    const monthNames: string[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      monthNames.push(monthKey)
    }

    const monthlyMap = new Map<string, number>()
    for (const monthKey of monthNames) {
      monthlyMap.set(monthKey, 0)
    }

    for (const b of bookings) {
      const created = new Date(b.createdAt)
      const monthKey = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, '0')}`
      if (monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, monthlyMap.get(monthKey)! + 1)
      }
    }

    const monthlyTrend = Array.from(monthlyMap.entries())
      .map(([month, bookings]) => ({ month, bookings }))
      .sort((a, b) => a.month.localeCompare(b.month))

    return NextResponse.json({
      overview: {
        totalBookings,
        totalPatients,
        pendingBookings,
        confirmedBookings,
        todayBookings,
      },
      bookingsByService,
      bookingsByStatus,
      bookingsByDate,
      weeklyTrend,
      monthlyTrend,
    })
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}
