import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { step, data } = await request.json()

    // Create setup data directory if it doesn't exist
    const setupDir = path.join(process.cwd(), '.setup')
    try {
      await fs.mkdir(setupDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Save step data to temporary file
    const stepFile = path.join(setupDir, `${step}.json`)
    await fs.writeFile(stepFile, JSON.stringify(data, null, 2))

    return NextResponse.json({
      success: true,
      message: `${step} configuration saved`
    })
  } catch (error) {
    console.error('Save step error:', error)
    return NextResponse.json(
      { error: 'Failed to save setup data' },
      { status: 500 }
    )
  }
}