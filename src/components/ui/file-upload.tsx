import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Upload, X, File, Image, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  onFileRemove?: (fileIndex: number) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
  maxSize?: number; // in bytes
  className?: string;
  disabled?: boolean;
  files?: File[];
  uploading?: boolean;
  uploadProgress?: number;
}

interface FilePreviewProps {
  file: File;
  onRemove?: () => void;
  uploading?: boolean;
  uploadProgress?: number;
}

const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  onRemove,
  uploading = false,
  uploadProgress = 0
}) => {
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-8 w-8 text-blue-500" />;
    if (type.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />;
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative bg-card border border-border rounded-lg p-4 group"
    >
      <div className="flex items-center space-x-3">
        {getFileIcon(file.type)}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
          {uploading && (
            <div className="mt-2">
              <Progress value={uploadProgress} className="h-1" />
              <p className="text-xs text-muted-foreground mt-1">
                {uploadProgress.toFixed(0)}% enviado
              </p>
            </div>
          )}
        </div>
        {onRemove && !uploading && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {uploading && (
          <div className="flex items-center">
            {uploadProgress === 100 ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onFileRemove,
  acceptedTypes = ['image/*', '.pdf', '.doc', '.docx'],
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  className,
  disabled = false,
  files = [],
  uploading = false,
  uploadProgress = 0
}) => {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach((error: any) => {
          if (error.code === 'file-too-large') {
            toast.error(`Arquivo ${file.name} é muito grande. Tamanho máximo: ${maxSize / (1024 * 1024)}MB`);
          } else if (error.code === 'file-invalid-type') {
            toast.error(`Tipo de arquivo não suportado: ${file.name}`);
          } else {
            toast.error(`Erro no arquivo ${file.name}: ${error.message}`);
          }
        });
      });
    }

    if (acceptedFiles.length > 0) {
      const totalFiles = files.length + acceptedFiles.length;
      if (totalFiles > maxFiles) {
        toast.error(`Máximo de ${maxFiles} arquivos permitidos`);
        return;
      }
      onFileSelect(acceptedFiles);
    }
  }, [files.length, maxFiles, maxSize, onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize,
    multiple: true,
    disabled
  });

  const removeFile = (index: number) => {
    if (onFileRemove) {
      onFileRemove(index);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200",
          isDragActive || dragActive
            ? "border-primary bg-primary/5 scale-105"
            : "border-border hover:border-primary/50 hover:bg-muted/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onMouseEnter={() => setDragActive(true)}
        onMouseLeave={() => setDragActive(false)}
      >
        <input {...getInputProps()} />
        <motion.div 
          className="space-y-4"
          whileHover={{ scale: disabled ? 1 : 1.02 }}
          whileTap={{ scale: disabled ? 1 : 0.98 }}
        >
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className={cn(
              "h-8 w-8 transition-colors",
              isDragActive || dragActive ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          <div>
            <p className="text-lg font-medium">
              {isDragActive ? 'Solte os arquivos aqui' : 'Arraste arquivos aqui'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              ou clique para selecionar
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Tipos suportados: {acceptedTypes.join(', ')}
            </p>
            <p className="text-xs text-muted-foreground">
              Tamanho máximo: {maxSize / (1024 * 1024)}MB • Máximo: {maxFiles} arquivos
            </p>
          </div>
        </motion.div>
      </div>

      {/* File Previews */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <h4 className="text-sm font-medium text-muted-foreground">
              Arquivos selecionados ({files.length})
            </h4>
            <div className="space-y-2">
              {files.map((file, index) => (
                <FilePreview
                  key={`${file.name}-${index}`}
                  file={file}
                  onRemove={() => removeFile(index)}
                  uploading={uploading && index === files.length - 1}
                  uploadProgress={uploading && index === files.length - 1 ? uploadProgress : 100}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Componente específico para upload de documentos de cliente
interface ClienteDocumentUploadProps {
  onDocumentsChange: (documents: File[]) => void;
  documents?: File[];
  uploading?: boolean;
  uploadProgress?: number;
}

export const ClienteDocumentUpload: React.FC<ClienteDocumentUploadProps> = ({
  onDocumentsChange,
  documents = [],
  uploading = false,
  uploadProgress = 0
}) => {
  const [files, setFiles] = React.useState<File[]>(documents);

  React.useEffect(() => {
    setFiles(documents);
  }, [documents]);

  const handleFileSelect = (newFiles: File[]) => {
    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    onDocumentsChange(updatedFiles);
  };

  const handleFileRemove = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onDocumentsChange(updatedFiles);
  };

  return (
    <FileUpload
      onFileSelect={handleFileSelect}
      onFileRemove={handleFileRemove}
      acceptedTypes={['image/*', '.pdf']}
      maxFiles={10}
      maxSize={5 * 1024 * 1024} // 5MB
      files={files}
      uploading={uploading}
      uploadProgress={uploadProgress}
      className="mt-4"
    />
  );
};
