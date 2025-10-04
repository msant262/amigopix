import { storage } from './config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

export interface UploadProgress {
  progress: number;
  url?: string;
  error?: string;
}

// Gerar nome de arquivo amigável
const generateFriendlyFileName = (originalName: string, clienteNome?: string): string => {
  try {
    // Remove extensão do arquivo original
    const nameWithoutExt = originalName.split('.').slice(0, -1).join('.');
    const extension = originalName.split('.').pop();
    
    // Limpa o nome removendo caracteres especiais
    const cleanName = nameWithoutExt
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '_') // Substitui espaços por underscore
      .toLowerCase();
    
    // Gera timestamp para evitar conflitos
    const timestamp = Date.now().toString().slice(-6); // Últimos 6 dígitos
    
    // Se temos nome do cliente, inclui no nome do arquivo
    if (clienteNome) {
      const cleanClienteNome = clienteNome
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .toLowerCase()
        .slice(0, 20); // Limita tamanho
      
      return `${cleanClienteNome}_${cleanName.slice(0, 30)}_${timestamp}.${extension}`;
    }
    
    return `${cleanName.slice(0, 40)}_${timestamp}.${extension}`;
  } catch (error) {
    console.warn('Erro ao gerar nome amigável, usando UUID:', error);
    // Fallback para UUID se houver erro
    const extension = originalName.split('.').pop();
    return `${uuidv4()}.${extension}`;
  }
};

// Upload de arquivo único
export const uploadFile = async (
  file: File,
  path: string,
  onProgress?: (progress: number) => void,
  clienteNome?: string
): Promise<string> => {
  try {
    const fileName = generateFriendlyFileName(file.name, clienteNome);
    const storageRef = ref(storage, `${path}/${fileName}`);
    
    const uploadTask = uploadBytes(storageRef, file);
    
    // Simular progresso (Firebase Storage não fornece progresso real para uploadBytes)
    if (onProgress) {
      const interval = setInterval(() => {
        onProgress(Math.random() * 90 + 10); // Simular progresso entre 10-100%
      }, 200);
      
      const result = await uploadTask;
      clearInterval(interval);
      onProgress(100);
      
      const downloadURL = await getDownloadURL(result.ref);
      return downloadURL;
    } else {
      const result = await uploadTask;
      const downloadURL = await getDownloadURL(result.ref);
      return downloadURL;
    }
  } catch (error) {
    console.error('Erro ao fazer upload do arquivo:', error);
    throw new Error('Falha no upload do arquivo');
  }
};

// Upload de múltiplos arquivos
export const uploadMultipleFiles = async (
  files: File[],
  path: string,
  onProgress?: (fileIndex: number, progress: number) => void,
  clienteNome?: string
): Promise<string[]> => {
  try {
    const uploadPromises = files.map(async (file, index) => {
      if (onProgress) {
        return uploadFile(file, path, (progress) => {
          onProgress(index, progress);
        }, clienteNome);
      } else {
        return uploadFile(file, path, undefined, clienteNome);
      }
    });

    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Erro ao fazer upload de múltiplos arquivos:', error);
    throw new Error('Falha no upload dos arquivos');
  }
};

// Deletar arquivo
export const deleteFile = async (url: string): Promise<void> => {
  try {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    throw new Error('Falha ao deletar arquivo');
  }
};

// Upload de documentos de cliente
export const uploadClienteDocuments = async (
  files: File[],
  clienteId: string,
  onProgress?: (fileIndex: number, progress: number) => void,
  clienteNome?: string
): Promise<string[]> => {
  const path = `clientes/${clienteId}/documentos`;
  return uploadMultipleFiles(files, path, onProgress, clienteNome);
};

// Upload de foto de perfil de cliente
export const uploadClientePhoto = async (
  file: File,
  clienteId: string,
  onProgress?: (progress: number) => void,
  clienteNome?: string
): Promise<string> => {
  const path = `clientes/${clienteId}`;
  return uploadFile(file, path, onProgress, clienteNome);
};

// Validações de arquivo
export const validateFile = (
  file: File,
  maxSize: number = 10 * 1024 * 1024, // 10MB
  allowedTypes: string[] = ['image/*', '.pdf', '.doc', '.docx']
): { valid: boolean; error?: string } => {
  // Verificar tamanho
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Arquivo muito grande. Tamanho máximo: ${maxSize / (1024 * 1024)}MB`
    };
  }

  // Verificar tipo
  const isValidType = allowedTypes.some(type => {
    if (type.startsWith('image/')) {
      return file.type.startsWith('image/');
    }
    if (type.includes('.')) {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      return type.toLowerCase().includes(extension);
    }
    return file.type === type;
  });

  if (!isValidType) {
    return {
      valid: false,
      error: `Tipo de arquivo não suportado. Tipos permitidos: ${allowedTypes.join(', ')}`
    };
  }

  return { valid: true };
};

// Utilitário para obter URL de preview de imagem
export const getImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Utilitário para redimensionar imagem
export const resizeImage = (
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 600,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calcular novas dimensões mantendo proporção
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Desenhar imagem redimensionada
      ctx?.drawImage(img, 0, 0, width, height);

      // Converter para blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(resizedFile);
          } else {
            reject(new Error('Falha ao redimensionar imagem'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};
