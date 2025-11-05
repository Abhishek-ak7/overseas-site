import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getStorageSettings } from './settings'

let s3Client: S3Client | null = null

async function getS3Client() {
  if (s3Client) {
    return s3Client
  }

  try {
    const settings = await getStorageSettings()

    if (settings.provider !== 'S3') {
      throw new Error('S3 storage not configured as provider')
    }

    const accessKeyId = settings.awsAccessKeyId || process.env.AWS_ACCESS_KEY_ID
    const secretAccessKey = settings.awsSecretAccessKey || process.env.AWS_SECRET_ACCESS_KEY
    const region = settings.awsRegion || process.env.AWS_REGION || 'us-east-1'

    if (!accessKeyId || !secretAccessKey) {
      throw new Error('AWS credentials not configured')
    }

    s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })

    return s3Client
  } catch (error) {
    console.error('Failed to initialize S3 client:', error)
    throw new Error('S3 not configured properly')
  }
}

export async function uploadFileToS3(file: Buffer, key: string, contentType?: string) {
  try {
    const settings = await getStorageSettings()
    const bucket = settings.awsS3Bucket || process.env.AWS_S3_BUCKET

    if (!bucket) {
      throw new Error('S3 bucket not configured')
    }

    const client = await getS3Client()

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file,
      ContentType: contentType,
    })

    await client.send(command)

    return {
      success: true,
      url: `https://${bucket}.s3.amazonaws.com/${key}`,
      key,
    }
  } catch (error) {
    console.error('S3 upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload file',
    }
  }
}

export async function deleteFileFromS3(key: string) {
  try {
    const settings = await getStorageSettings()
    const bucket = settings.awsS3Bucket || process.env.AWS_S3_BUCKET

    if (!bucket) {
      throw new Error('S3 bucket not configured')
    }

    const client = await getS3Client()

    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })

    await client.send(command)

    return {
      success: true,
    }
  } catch (error) {
    console.error('S3 delete error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete file',
    }
  }
}

export async function getSignedUrlForUpload(key: string, contentType?: string, expiresIn = 3600) {
  try {
    const settings = await getStorageSettings()
    const bucket = settings.awsS3Bucket || process.env.AWS_S3_BUCKET

    if (!bucket) {
      throw new Error('S3 bucket not configured')
    }

    const client = await getS3Client()

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    })

    const signedUrl = await getSignedUrl(client, command, { expiresIn })

    return {
      success: true,
      url: signedUrl,
      key,
    }
  } catch (error) {
    console.error('S3 signed URL error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate signed URL',
    }
  }
}

export async function getSignedUrlForDownload(key: string, expiresIn = 3600) {
  try {
    const settings = await getStorageSettings()
    const bucket = settings.awsS3Bucket || process.env.AWS_S3_BUCKET

    if (!bucket) {
      throw new Error('S3 bucket not configured')
    }

    const client = await getS3Client()

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })

    const signedUrl = await getSignedUrl(client, command, { expiresIn })

    return {
      success: true,
      url: signedUrl,
    }
  } catch (error) {
    console.error('S3 download URL error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate download URL',
    }
  }
}

// Helper to generate a unique key for uploaded files
export function generateS3Key(folder: string, filename: string) {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
  return `${folder}/${timestamp}_${randomString}_${cleanFilename}`
}

// Helper to validate file size and type
export async function validateFile(file: File) {
  const settings = await getStorageSettings()
  const maxSize = settings.maxFileSize || 10 * 1024 * 1024 // 10MB default
  const allowedTypes = settings.allowedFileTypes?.split(',').map(t => t.trim()) || []

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit`,
    }
  }

  if (allowedTypes.length > 0 && !allowedTypes.some(type => file.type.includes(type))) {
    return {
      valid: false,
      error: `File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    }
  }

  return { valid: true }
}
