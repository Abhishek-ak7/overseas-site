import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getStorageSettings } from './settings'
import fs from 'fs/promises'
import path from 'path'

// Create S3 client with dynamic settings
export async function createS3Client() {
  try {
    const storageSettings = await getStorageSettings()

    return new S3Client({
      region: storageSettings.awsRegion || process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: storageSettings.awsAccessKeyId || process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: storageSettings.awsSecretAccessKey || process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
  } catch (error) {
    console.error('Failed to create S3 client with database settings, falling back to env vars:', error)

    // Fallback to environment variables
    return new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
  }
}

// Get bucket name from settings
export async function getBucketName(): Promise<string> {
  try {
    const storageSettings = await getStorageSettings()
    return storageSettings.awsS3Bucket || process.env.AWS_S3_BUCKET!
  } catch (error) {
    console.error('Failed to get bucket name from settings, falling back to env var:', error)
    return process.env.AWS_S3_BUCKET!
  }
}

// Legacy configurations for backward compatibility (deprecated)
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET!

// File type configurations
export const fileTypes = {
  image: {
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
    contentTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  },
  video: {
    extensions: ['.mp4', '.avi', '.mov', '.wmv', '.flv'],
    maxSize: 100 * 1024 * 1024, // 100MB
    contentTypes: ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-ms-wmv'],
  },
  document: {
    extensions: ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
    maxSize: 10 * 1024 * 1024, // 10MB
    contentTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/rtf',
    ],
  },
  audio: {
    extensions: ['.mp3', '.wav', '.m4a', '.ogg'],
    maxSize: 20 * 1024 * 1024, // 20MB
    contentTypes: ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg'],
  },
}

// Upload categories with different folder structures
export enum UploadCategory {
  PROFILE_PICTURES = 'profile-pictures',
  COURSE_THUMBNAILS = 'course-thumbnails',
  COURSE_CONTENT = 'course-content',
  TEST_AUDIO = 'test-audio',
  TEST_IMAGES = 'test-images',
  BLOG_IMAGES = 'blog-images',
  TESTIMONIAL_IMAGES = 'testimonial-images',
  DOCUMENTS = 'documents',
  CERTIFICATES = 'certificates',
  HERO_SLIDES = 'hero-slides',
}

// Generate file path based on category and user
export function generateFilePath(
  category: UploadCategory,
  userId: string,
  originalName: string,
  fileExtension: string
): string {
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(2, 15)
  const fileName = `${timestamp}-${randomId}${fileExtension}`

  switch (category) {
    case UploadCategory.PROFILE_PICTURES:
      return `users/${userId}/profile/${fileName}`
    case UploadCategory.COURSE_THUMBNAILS:
      return `courses/thumbnails/${fileName}`
    case UploadCategory.COURSE_CONTENT:
      return `courses/content/${userId}/${fileName}`
    case UploadCategory.TEST_AUDIO:
      return `tests/audio/${fileName}`
    case UploadCategory.TEST_IMAGES:
      return `tests/images/${fileName}`
    case UploadCategory.BLOG_IMAGES:
      return `blog/images/${fileName}`
    case UploadCategory.TESTIMONIAL_IMAGES:
      return `testimonials/${fileName}`
    case UploadCategory.DOCUMENTS:
      return `documents/${userId}/${fileName}`
    case UploadCategory.CERTIFICATES:
      return `certificates/${userId}/${fileName}`
    case UploadCategory.HERO_SLIDES:
      return `hero-slides/${fileName}`
    default:
      return `uploads/${fileName}`
  }
}

// Validate file type and size with dynamic settings
export async function validateFileWithSettings(
  file: { name: string; size: number; type: string },
  allowedType: keyof typeof fileTypes
): Promise<{ valid: boolean; error?: string }> {
  try {
    const storageSettings = await getStorageSettings()
    const config = fileTypes[allowedType]

    // Use settings max file size (in MB) if available, otherwise use default
    const maxFileSize = (storageSettings.maxFileSize || 10) * 1024 * 1024 // Convert MB to bytes
    const allowedTypes = storageSettings.allowedFileTypes?.split(',') || Object.keys(fileTypes)

    // Check if file type is allowed
    if (!allowedTypes.includes(allowedType)) {
      return {
        valid: false,
        error: `File type ${allowedType} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      }
    }

    // Check file size
    if (file.size > maxFileSize) {
      return {
        valid: false,
        error: `File size exceeds ${maxFileSize / (1024 * 1024)}MB limit`,
      }
    }

    // Check content type
    if (!config.contentTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed. Allowed types: ${config.contentTypes.join(', ')}`,
      }
    }

    // Check file extension
    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!config.extensions.includes(extension)) {
      return {
        valid: false,
        error: `File extension ${extension} is not allowed. Allowed extensions: ${config.extensions.join(', ')}`,
      }
    }

    return { valid: true }
  } catch (error) {
    // Fallback to static validation if settings fail
    return validateFile(file, allowedType)
  }
}

// Legacy validate file function (deprecated)
export function validateFile(
  file: { name: string; size: number; type: string },
  allowedType: keyof typeof fileTypes
): { valid: boolean; error?: string } {
  const config = fileTypes[allowedType]

  // Check file size
  if (file.size > config.maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${config.maxSize / (1024 * 1024)}MB limit`,
    }
  }

  // Check content type
  if (!config.contentTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${config.contentTypes.join(', ')}`,
    }
  }

  // Check file extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!config.extensions.includes(extension)) {
    return {
      valid: false,
      error: `File extension ${extension} is not allowed. Allowed extensions: ${config.extensions.join(', ')}`,
    }
  }

  return { valid: true }
}

// Upload file to local storage
export async function uploadToLocal({
  file,
  category,
  userId,
  metadata = {},
}: {
  file: { buffer: Buffer; name: string; type: string }
  category: UploadCategory
  userId: string
  metadata?: Record<string, string>
}): Promise<{ success: boolean; url?: string; key?: string; error?: string }> {
  try {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    const key = generateFilePath(category, userId, file.name, fileExtension)

    // Create local path
    const uploadPath = path.join(process.cwd(), 'public', 'assets', 'uploads')
    const fullPath = path.join(uploadPath, key)
    const dir = path.dirname(fullPath)

    // Create directory if it doesn't exist
    await fs.mkdir(dir, { recursive: true })

    // Write file to local storage
    await fs.writeFile(fullPath, file.buffer)

    // Generate public URL for local file
    const url = `/assets/uploads/${key}`

    return {
      success: true,
      url,
      key,
    }
  } catch (error) {
    console.error('Local upload error:', error)
    return {
      success: false,
      error: 'Failed to upload file to local storage',
    }
  }
}

// Upload file with fallback (S3 -> Local)
export async function uploadFile({
  file,
  category,
  userId,
  metadata = {},
}: {
  file: { buffer: Buffer; name: string; type: string }
  category: UploadCategory
  userId: string
  metadata?: Record<string, string>
}): Promise<{ success: boolean; url?: string; key?: string; error?: string; storage?: 'S3' | 'LOCAL' }> {
  try {
    const storageSettings = await getStorageSettings()

    // Check if S3 is configured and enabled
    const isS3Configured = storageSettings.provider === 'S3' &&
                          storageSettings.awsAccessKeyId &&
                          storageSettings.awsSecretAccessKey &&
                          storageSettings.awsS3Bucket

    if (isS3Configured) {
      console.log('Attempting S3 upload...')
      const s3Result = await uploadToS3({ file, category, userId, metadata })
      if (s3Result.success) {
        return { ...s3Result, storage: 'S3' }
      }
      console.log('S3 upload failed, falling back to local storage:', s3Result.error)
    } else {
      console.log('S3 not configured, using local storage')
    }

    // Fallback to local storage
    const localResult = await uploadToLocal({ file, category, userId, metadata })
    return { ...localResult, storage: 'LOCAL' }

  } catch (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      error: 'Failed to upload file',
    }
  }
}

// Upload file to S3 (legacy function for backward compatibility)
export async function uploadToS3({
  file,
  category,
  userId,
  metadata = {},
}: {
  file: { buffer: Buffer; name: string; type: string }
  category: UploadCategory
  userId: string
  metadata?: Record<string, string>
}): Promise<{ success: boolean; url?: string; key?: string; error?: string }> {
  try {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    const key = generateFilePath(category, userId, file.name, fileExtension)

    // Get dynamic S3 client and bucket name
    const dynamicS3Client = await createS3Client()
    const bucketName = await getBucketName()
    const storageSettings = await getStorageSettings()

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.type,
      Metadata: {
        originalName: file.name,
        userId,
        category,
        uploadedAt: new Date().toISOString(),
        ...metadata,
      },
    })

    await dynamicS3Client.send(command)

    // Generate public URL using dynamic settings
    const region = storageSettings.awsRegion || process.env.AWS_REGION || 'us-east-1'
    const url = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`

    return {
      success: true,
      url,
      key,
    }
  } catch (error) {
    console.error('S3 upload error:', error)
    return {
      success: false,
      error: 'Failed to upload file to S3',
    }
  }
}

// Generate presigned URL for direct upload from frontend
export async function generatePresignedUrl({
  key,
  contentType,
  expiresIn = 3600, // 1 hour
}: {
  key: string
  contentType: string
  expiresIn?: number
}): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Get dynamic S3 client and bucket name
    const dynamicS3Client = await createS3Client()
    const bucketName = await getBucketName()

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
    })

    const url = await getSignedUrl(dynamicS3Client, command, { expiresIn })

    return {
      success: true,
      url,
    }
  } catch (error) {
    console.error('Presigned URL generation error:', error)
    return {
      success: false,
      error: 'Failed to generate presigned URL',
    }
  }
}

// Generate presigned URL for downloading
export async function generateDownloadUrl({
  key,
  expiresIn = 3600, // 1 hour
}: {
  key: string
  expiresIn?: number
}): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Get dynamic S3 client and bucket name
    const dynamicS3Client = await createS3Client()
    const bucketName = await getBucketName()

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    })

    const url = await getSignedUrl(dynamicS3Client, command, { expiresIn })

    return {
      success: true,
      url,
    }
  } catch (error) {
    console.error('Download URL generation error:', error)
    return {
      success: false,
      error: 'Failed to generate download URL',
    }
  }
}

// Delete file from S3
export async function deleteFromS3(key: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Get dynamic S3 client and bucket name
    const dynamicS3Client = await createS3Client()
    const bucketName = await getBucketName()

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    })

    await dynamicS3Client.send(command)

    return { success: true }
  } catch (error) {
    console.error('S3 delete error:', error)
    return {
      success: false,
      error: 'Failed to delete file from S3',
    }
  }
}

// Get file info from S3 key
export function parseS3Key(key: string) {
  const parts = key.split('/')
  const fileName = parts[parts.length - 1]
  const category = parts[0] as UploadCategory

  return {
    fileName,
    category,
    fullPath: key,
  }
}

// Generate optimized image variants (thumbnails, etc.)
export function getImageVariants(originalUrl: string) {
  // This is a placeholder for image optimization
  // In production, you might use AWS Lambda, CloudFront, or a service like Cloudinary

  const baseUrl = originalUrl.split('.').slice(0, -1).join('.')
  const extension = originalUrl.split('.').pop()

  return {
    original: originalUrl,
    thumbnail: `${baseUrl}_thumb.${extension}`,
    medium: `${baseUrl}_medium.${extension}`,
    large: `${baseUrl}_large.${extension}`,
  }
}

// File processing utilities
export function getFileInfo(file: { name: string; size: number; type: string }) {
  const extension = '.' + file.name.split('.').pop()?.toLowerCase()
  const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, '')

  return {
    name: file.name,
    nameWithoutExtension,
    extension,
    size: file.size,
    sizeFormatted: formatFileSize(file.size),
    type: file.type,
    category: getFileCategoryFromType(file.type),
  }
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Determine file category from MIME type
export function getFileCategoryFromType(mimeType: string): keyof typeof fileTypes {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  return 'document'
}

// Generate unique filename to prevent conflicts
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = '.' + originalName.split('.').pop()?.toLowerCase()
  const nameWithoutExtension = originalName.replace(/\.[^/.]+$/, '')

  return `${nameWithoutExtension}-${timestamp}-${randomString}${extension}`
}

// Virus scan placeholder (integrate with actual antivirus service)
export async function scanFileForVirus(buffer: Buffer): Promise<{ safe: boolean; threat?: string }> {
  // Placeholder for virus scanning
  // In production, integrate with services like ClamAV, VirusTotal, or AWS GuardDuty

  // Basic file content checks
  const content = buffer.toString('binary', 0, Math.min(buffer.length, 1024))

  // Check for suspicious patterns (very basic)
  const suspiciousPatterns = [
    'MZ', // Windows executable
    '#!/bin/sh', // Shell script
    '#!/bin/bash', // Bash script
    '<script', // HTML script tag
  ]

  for (const pattern of suspiciousPatterns) {
    if (content.includes(pattern)) {
      return { safe: false, threat: 'Suspicious file content detected' }
    }
  }

  return { safe: true }
}