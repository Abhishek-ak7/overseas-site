"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  label?: string
  className?: string
  maxSize?: number // in MB
  accept?: string
  showUrl?: boolean
  context?: string // Upload context for categorization
}

export function ImageUpload({
  value = '',
  onChange,
  label = 'Image',
  className = '',
  maxSize = 5,
  accept = 'image/*',
  showUrl = true,
  context = 'hero-slides'
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size
    const maxBytes = maxSize * 1024 * 1024
    if (file.size > maxBytes) {
      setError(`File size must be less than ${maxSize}MB`)
      return
    }

    setError('')
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('context', context) // Add context for categorization

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      const result = await response.json()

      if (result.success) {
        onChange(result.file.url)
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleUrlChange = (url: string) => {
    setError('')
    onChange(url)
  }

  const handleRemove = () => {
    onChange('')
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <Label>{label}</Label>
      
      {/* Image Preview */}
      {value && (
        <div className="relative inline-block">
          <div className="w-32 h-32 border rounded-lg overflow-hidden bg-gray-50">
            <Image
              src={value}
              alt="Preview"
              width={128}
              height={128}
              className="w-full h-full object-cover"
              onError={() => setError('Failed to load image')}
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
            onClick={handleRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Upload Button */}
      {!value && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
          
          <div className="flex flex-col items-center gap-2">
            {uploading ? (
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            ) : (
              <ImageIcon className="w-8 h-8 text-gray-400" />
            )}
            
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading...' : 'Upload Image'}
            </Button>
            
            <p className="text-sm text-gray-500">
              Max size: {maxSize}MB
            </p>
          </div>
        </div>
      )}

      {/* Manual URL Input */}
      {showUrl && !value && (
        <div className="space-y-2">
          <Label className="text-sm">Or enter image URL</Label>
          <Input
            type="url"
            value=""
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://example.com/image.jpg or /assets/uploads/..."
            disabled={uploading}
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

export default ImageUpload