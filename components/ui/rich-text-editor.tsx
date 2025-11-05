"use client"

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Link,
  Image,
  Code,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Eye,
  Monitor
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: number
  className?: string
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing...",
  minHeight = 300,
  className = ""
}: RichTextEditorProps) {
  const [isPreview, setIsPreview] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize editor content only once
  useEffect(() => {
    if (editorRef.current && !isInitialized) {
      if (value) {
        editorRef.current.innerHTML = value
      }
      setIsInitialized(true)
    }
  }, [value, isInitialized])

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  const handleInput = useCallback((e: any) => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML
      onChange(content)
    }
  }, [onChange])

  const insertLink = useCallback(() => {
    const url = prompt('Enter URL:')
    if (url) {
      execCommand('createLink', url)
    }
  }, [execCommand])

  const insertImage = useCallback(() => {
    const url = prompt('Enter image URL:')
    if (url) {
      execCommand('insertImage', url)
    }
  }, [execCommand])

  const formatBlock = useCallback((tag: string) => {
    execCommand('formatBlock', tag)
  }, [execCommand])

  const togglePreview = useCallback(() => {
    setIsPreview(!isPreview)
  }, [isPreview])

  const toolbarButtons = [
    {
      group: "text",
      buttons: [
        { icon: Bold, command: () => execCommand('bold'), title: 'Bold' },
        { icon: Italic, command: () => execCommand('italic'), title: 'Italic' },
        { icon: Underline, command: () => execCommand('underline'), title: 'Underline' },
        { icon: Strikethrough, command: () => execCommand('strikeThrough'), title: 'Strikethrough' },
      ]
    },
    {
      group: "alignment",
      buttons: [
        { icon: AlignLeft, command: () => execCommand('justifyLeft'), title: 'Align Left' },
        { icon: AlignCenter, command: () => execCommand('justifyCenter'), title: 'Align Center' },
        { icon: AlignRight, command: () => execCommand('justifyRight'), title: 'Align Right' },
      ]
    },
    {
      group: "lists",
      buttons: [
        { icon: List, command: () => execCommand('insertUnorderedList'), title: 'Bullet List' },
        { icon: ListOrdered, command: () => execCommand('insertOrderedList'), title: 'Numbered List' },
        { icon: Quote, command: () => formatBlock('blockquote'), title: 'Quote' },
      ]
    },
    {
      group: "insert",
      buttons: [
        { icon: Link, command: insertLink, title: 'Insert Link' },
        { icon: Image, command: insertImage, title: 'Insert Image' },
        { icon: Code, command: () => formatBlock('pre'), title: 'Code Block' },
      ]
    },
    {
      group: "history",
      buttons: [
        { icon: Undo, command: () => execCommand('undo'), title: 'Undo' },
        { icon: Redo, command: () => execCommand('redo'), title: 'Redo' },
      ]
    }
  ]

  return (
    <div className={`border rounded-lg ${className}`}>
      {/* Toolbar */}
      <div className="border-b bg-gray-50 p-2 flex items-center gap-1 flex-wrap">
        {/* Heading Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Type className="h-4 w-4 mr-2" />
              Format
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => formatBlock('p')}>
              <Type className="mr-2 h-4 w-4" />
              Paragraph
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => formatBlock('h1')}>
              <Heading1 className="mr-2 h-4 w-4" />
              Heading 1
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => formatBlock('h2')}>
              <Heading2 className="mr-2 h-4 w-4" />
              Heading 2
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => formatBlock('h3')}>
              <Heading3 className="mr-2 h-4 w-4" />
              Heading 3
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="h-6" />

        {/* Toolbar Button Groups */}
        {toolbarButtons.map((group, groupIndex) => (
          <div key={group.group} className="flex items-center gap-1">
            {group.buttons.map((button, buttonIndex) => (
              <Button
                key={buttonIndex}
                variant="ghost"
                size="sm"
                onClick={button.command}
                title={button.title}
                className="h-8 w-8 p-0"
              >
                <button.icon className="h-4 w-4" />
              </Button>
            ))}
            {groupIndex < toolbarButtons.length - 1 && (
              <Separator orientation="vertical" className="h-6 ml-1" />
            )}
          </div>
        ))}

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant={isPreview ? "default" : "ghost"}
            size="sm"
            onClick={togglePreview}
            title="Toggle Preview"
          >
            {isPreview ? <Monitor className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {isPreview ? "Edit" : "Preview"}
          </Button>
        </div>
      </div>

      {/* Editor/Preview Content */}
      <div className="relative">
        {isPreview ? (
          <div
            className="p-4 prose prose-sm max-w-none"
            style={{ minHeight }}
            dangerouslySetInnerHTML={{ __html: value }}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            className="p-4 outline-none focus:ring-0 min-h-[200px] border-0 focus:border-0"
            style={{ minHeight }}
            onInput={handleInput}
            onKeyDown={(e) => {
              // Prevent losing focus on certain operations
              if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault()
                document.execCommand('insertHTML', false, '<br><br>')
              }
            }}
            suppressContentEditableWarning={true}
            data-placeholder={placeholder}
          />
        )}
      </div>

      {/* Character Count */}
      <div className="border-t bg-gray-50 px-4 py-2 text-xs text-gray-500 text-right">
        {value.replace(/<[^>]*>/g, '').length} characters
      </div>

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          position: absolute;
        }

        .prose h1 { font-size: 2rem; font-weight: bold; margin-bottom: 1rem; }
        .prose h2 { font-size: 1.5rem; font-weight: bold; margin-bottom: 0.75rem; }
        .prose h3 { font-size: 1.25rem; font-weight: bold; margin-bottom: 0.5rem; }
        .prose p { margin-bottom: 1rem; }
        .prose ul, .prose ol { margin-left: 1.5rem; margin-bottom: 1rem; }
        .prose blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin-left: 0;
          font-style: italic;
          color: #6b7280;
        }
        .prose pre {
          background-color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.375rem;
          overflow-x: auto;
          font-family: 'Courier New', monospace;
        }
        .prose a { color: #3b82f6; text-decoration: underline; }
        .prose img { max-width: 100%; height: auto; border-radius: 0.375rem; }
      `}</style>
    </div>
  )
}