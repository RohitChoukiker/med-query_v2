import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, FileText, Image, File, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { DocumentUploadResponse, documentsAPI } from '../../api';

interface FileUploadProps {
  acceptedTypes?: string[];
  maxSize?: number; // in MB
  onUpload?: (files: File[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  acceptedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.png', '.jpeg'],
  maxSize = 10,
  onUpload
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return Image;
    if (type.includes('pdf') || type.includes('document')) return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File) => {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      toast.error(`File type ${fileExtension} not supported`);
      return false;
    }
    
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File size exceeds ${maxSize}MB limit`);
      return false;
    }
    
    return true;
  };

  const handleFiles = (newFiles: FileList) => {
    const validFiles = Array.from(newFiles).filter(validateFile);
    setFiles(prev => [...prev, ...validFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    setUploading(true);
    try {
      const successResponses: DocumentUploadResponse[] = [];
      const failedUploads: { name: string; error: string }[] = [];

      for (const file of files) {
        const response = await documentsAPI.upload(file);

        if (response.error || !response.data) {
          failedUploads.push({
            name: file.name,
            error: response.error || 'Unknown error occurred',
          });
        } else {
          successResponses.push(response.data);
        }
      }

      if (successResponses.length) {
        toast.success(`Successfully uploaded ${successResponses.length} file${successResponses.length > 1 ? 's' : ''}`);
        if (onUpload) {
          onUpload(files);
        }
        setFiles([]);
      }

      if (failedUploads.length) {
        failedUploads.forEach(({ name, error }) =>
          toast.error(`Failed to upload ${name}: ${error}`)
        );
      }
    } catch (error) {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          isDragging
            ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-900/20'
            : 'border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/50'
        }`}
      >
        <Upload className={`w-12 h-12 mx-auto mb-4 ${
          isDragging ? 'text-teal-500' : 'text-gray-400'
        }`} />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {isDragging ? 'Drop files here' : 'Upload Medical Documents'}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Drag and drop files here, or{' '}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-teal-600 hover:text-teal-700 font-medium"
          >
            browse
          </button>
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Supported formats: {acceptedTypes.join(', ')} • Max size: {maxSize}MB
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />
      </motion.div>

      {/* File List */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <h4 className="font-medium text-gray-900 dark:text-white">
            Selected Files ({files.length})
          </h4>
          {files.map((file, index) => {
            const Icon = getFileIcon(file.type);
            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#0EA5E9] rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Upload Button */}
      {files.length > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleUpload}
          disabled={uploading}
          className="w-full bg-[#0EA5E9] text-white py-3 rounded-xl font-medium transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Upload Files</span>
            </>
          )}
        </motion.button>
      )}
    </div>
  );
};

export default FileUpload;