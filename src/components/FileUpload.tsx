import { useCallback, useState } from "react";
import { Upload, X, FileText, Loader2 } from "lucide-react";
import { Button } from "./ui/button";

interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void>;
}

export function FileUpload({ onUpload }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length > 0) {
      setIsUploading(true);
      try {
        await onUpload(selectedFiles);
        setSelectedFiles([]);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
            ? "border-[#6A89A7] bg-[#BDDDFC]/20"
            : "border-gray-300 hover:border-[#6A89A7]"
          } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip"
          disabled={isUploading}
        />
        <Upload className="w-12 h-12 mx-auto mb-4 text-[#6A89A7]" />
        <p className="text-lg font-medium text-[#384959] mb-2">
          Drag and drop files here
        </p>
        <p className="text-sm text-gray-500 mb-4">
          or click to browse your computer
        </p>
        <p className="text-xs text-gray-400">
          Supports: PDF, Word, Excel, Images, ZIP (Max 50MB per file)
        </p>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <p className="font-medium text-[#384959]">
            Selected Files ({selectedFiles.length})
          </p>
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-[#6A89A7]" />
                <div>
                  <p className="text-sm font-medium text-[#384959]">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                disabled={isUploading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full bg-[#6A89A7] hover:bg-[#88BDF2] text-white"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading to Cloud...
              </>
            ) : (
              `Upload ${selectedFiles.length} ${selectedFiles.length === 1 ? "File" : "Files"}`
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
