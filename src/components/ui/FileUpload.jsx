import React, { useCallback, useState, useRef } from 'react';
import { Upload, X, Image, File, AlertCircle } from 'lucide-react';
import { cn } from '../../utils';
import Button from './Button';

const FileUpload = ({
  onFileSelect,
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB default
  maxFiles = 1,
  className,
  multiple = false,
  disabled = false,
  children,
  ...props
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (file.size > maxSize) {
      return `File size must be less than ${(maxSize / 1024 / 1024).toFixed(1)}MB`;
    }

    if (accept !== '*' && !file.type.match(accept.replace('*', '.*'))) {
      return 'File type not supported';
    }

    return null;
  };

  const handleFiles = (newFiles) => {
    const validFiles = [];
    let errorMessage = '';

    for (
      let i = 0;
      i < Math.min(newFiles.length, maxFiles - files.length);
      i++
    ) {
      const file = newFiles[i];
      const validation = validateFile(file);

      if (validation) {
        errorMessage = validation;
        break;
      }

      validFiles.push(file);
    }

    if (errorMessage) {
      setError(errorMessage);
      return;
    }

    const updatedFiles = multiple ? [...files, ...validFiles] : validFiles;
    setFiles(updatedFiles);
    setError('');

    if (onFileSelect) {
      onFileSelect(multiple ? updatedFiles : validFiles[0]);
    }
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (disabled) return;

      const droppedFiles = Array.from(e.dataTransfer.files);
      handleFiles(droppedFiles);
    },
    [disabled, files.length, maxFiles]
  );

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const removeFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);

    if (onFileSelect) {
      onFileSelect(multiple ? updatedFiles : null);
    }
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={cn('space-y-4', className)} {...props}>
      {/* Main Upload Area */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-300 cursor-pointer min-h-[200px] flex flex-col items-center justify-center',
          dragActive && 'border-bottle-green bg-bottle-green/5 scale-[1.02]',
          !dragActive &&
            'border-gray-300 hover:border-bottle-green hover:bg-bottle-green/5',
          disabled && 'opacity-50 cursor-not-allowed',
          error && 'border-tomato-red/50 bg-tomato-red/5'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />

        {children || (
          <>
            <div
              className={cn(
                'w-16 h-16 mb-4 rounded-2xl flex items-center justify-center transition-colors duration-300',
                dragActive
                  ? 'bg-bottle-green text-white'
                  : 'bg-earthy-beige/30 text-text-muted'
              )}
            >
              <Upload className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-medium text-text-dark mb-2">
              {dragActive ? 'Drop files here' : 'Upload Files'}
            </h3>

            <p className="text-text-muted mb-4">
              Drag and drop files here, or click to select files
            </p>

            <div className="text-xs text-text-muted/80 space-y-1">
              <p>Maximum file size: {(maxSize / 1024 / 1024).toFixed(1)}MB</p>
              {multiple && <p>Maximum files: {maxFiles}</p>}
              <p>Supported formats: {accept}</p>
            </div>
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-tomato-red/80 text-sm flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-text-dark">Selected Files</h4>

          <div className="space-y-2">
            {files.map((file, index) => (
              <FilePreview
                key={`${file.name}-${index}`}
                file={file}
                onRemove={() => removeFile(index)}
                disabled={disabled}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// File Preview Component
const FilePreview = ({ file, onRemove, disabled }) => {
  const [preview, setPreview] = useState(null);

  // Generate preview for images
  React.useEffect(() => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }

    return () => setPreview(null);
  }, [file]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-earthy-beige/20 border border-gray-200">
      {/* File Icon/Preview */}
      <div className="flex-shrink-0">
        {preview ? (
          <img
            src={preview}
            alt={file.name}
            className="w-12 h-12 rounded-xl object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-earthy-beige/50 flex items-center justify-center">
            {file.type.startsWith('image/') ? (
              <Image className="w-6 h-6 text-text-muted" />
            ) : (
              <File className="w-6 h-6 text-text-muted" />
            )}
          </div>
        )}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-dark truncate">
          {file.name}
        </p>
        <p className="text-xs text-text-muted">{formatFileSize(file.size)}</p>
      </div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        disabled={disabled}
        className="text-tomato-red hover:text-tomato-red hover:bg-tomato-red/10 min-h-[36px] min-w-[36px] h-9 w-9"
        aria-label={`Remove ${file.name}`}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};

// Compact File Upload for forms
export const CompactFileUpload = ({
  onFileSelect,
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024,
  className,
  placeholder = 'Choose file...',
  disabled = false,
  ...props
}) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (file.size > maxSize) {
      return `File size must be less than ${(maxSize / 1024 / 1024).toFixed(1)}MB`;
    }

    if (accept !== '*' && !file.type.match(accept.replace('*', '.*'))) {
      return 'File type not supported';
    }

    return null;
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const validation = validateFile(selectedFile);
    if (validation) {
      setError(validation);
      return;
    }

    setFile(selectedFile);
    setError('');

    if (onFileSelect) {
      onFileSelect(selectedFile);
    }
  };

  const clearFile = () => {
    setFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onFileSelect) {
      onFileSelect(null);
    }
  };

  return (
    <div className={cn('space-y-2', className)} {...props}>
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="min-h-[44px]"
        >
          <Upload className="w-4 h-4 mr-2" />
          {file ? 'Change File' : 'Choose File'}
        </Button>

        <span className="text-sm text-text-muted flex-1 truncate">
          {file ? file.name : placeholder}
        </span>

        {file && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFile}
            disabled={disabled}
            className="text-tomato-red hover:bg-tomato-red/10 min-h-[36px]"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {error && (
        <div className="text-tomato-red/80 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
