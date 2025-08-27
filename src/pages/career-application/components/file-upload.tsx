

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, X } from "lucide-react"

interface FileUploadProps {
  onFileSelected: (file: File | null) => void
  value?: string
  className?: string
}

export function FileUpload({ onFileSelected, value, className }: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      onFileSelected(file)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onFileSelected(null)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
      />

      {preview ? (
        <div className="relative w-32 h-32 mx-auto">
          <img
            src={preview || "/placeholder.svg"}
            alt="Preview"
            className="w-full h-full object-cover rounded-full border-2 border-gray-200"
          />
          <button
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-full w-32 h-32 mx-auto">
          <Upload className="h-8 w-8 text-gray-400" />
          <span className="text-xs text-gray-500 mt-1 ">Upload Photo</span>
        </div>
      )}

      <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}               className="bg-watney text-white hover:bg-watney/90"
>
        {preview ? "Change Photo" : "Upload Photo"}
      </Button>
    </div>
  )
}
