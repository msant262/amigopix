import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClienteDocumentUpload } from '@/components/ui/file-upload';
import { ModernButton } from '@/components/ui/modern-button';
import { ArrowLeft, Save, Upload, User } from 'lucide-react';
import { formatCPF, formatPhone, formatCEP, isValidCPF, isValidCNPJ, isValidEmail } from '@/lib/utils';
import { ClienteFormData } from '@/types';
import { createCliente, updateCliente, getCliente } from '@/lib/firebase/firestore';
import { uploadClienteDocuments, uploadClientePhoto } from '@/lib/firebase/storage';
import toast from 'react-hot-toast';

const clienteSchema = z.object({
  nomeCompleto: z.string().min(1, 'Nome completo é obrigatório'),
  documento: z.string().min(1, 'Documento é obrigatório'),
  rg: z.string().optional(),
  telefone: z.string().min(1, 'Telefone é obrigatório'),
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
  endereco: z.object({
    rua: z.string().min(1, 'Rua é obrigatória'),
    numero: z.string().min(1, 'Número é obrigatório'),
    complemento: z.string().optional(),
    bairro: z.string().min(1, 'Bairro é obrigatório'),
    cidade: z.string().min(1, 'Cidade é obrigatória'),
    estado: z.string().min(1, 'Estado é obrigatório'),
    cep: z.string().min(1, 'CEP é obrigatório'),
  }),
  dadosBancarios: z.object({
    chavePix: z.string().optional(),
    banco: z.string().optional(),
    agencia: z.string().optional(),
    conta: z.string().optional(),
  }).optional(),
  fotoPerfil: z.string().optional(),
  documentos: z.array(z.string()).optional(),
});

type ClienteFormValues = z.infer<typeof clienteSchema>;

export const ClienteForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [photoFile] = useState<File | null>(null);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nomeCompleto: '',
      documento: '',
      rg: '',
      telefone: '',
      email: '',
      fotoPerfil: '',
      documentos: [],
      endereco: {
        rua: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
      },
      dadosBancarios: {
        chavePix: '',
        banco: '',
        agencia: '',
        conta: '',
      },
    },
  });

  // Fetch cliente data if editing
  const { data: clienteData } = useQuery({
    queryKey: ['cliente', id],
    queryFn: () => getCliente(id!),
    enabled: isEditing && Boolean(id),
  });

  // Populate form when editing
  useEffect(() => {
    if (clienteData && isEditing) {
      reset({
        nomeCompleto: clienteData.nomeCompleto,
        documento: clienteData.documento,
        telefone: clienteData.telefone,
        email: clienteData.email,
        endereco: {
          rua: clienteData.endereco.rua,
          numero: clienteData.endereco.numero,
          complemento: clienteData.endereco.complemento || '',
          bairro: clienteData.endereco.bairro,
          cidade: clienteData.endereco.cidade,
          estado: clienteData.endereco.estado,
          cep: clienteData.endereco.cep,
        },
      });
    }
  }, [clienteData, isEditing, reset]);

  const createMutation = useMutation({
    mutationFn: createCliente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast.success('Cliente criado com sucesso!');
      navigate('/clientes');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao criar cliente');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ClienteFormData> }) =>
      updateCliente(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['cliente', id] });
      toast.success('Cliente atualizado com sucesso!');
      navigate('/clientes');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar cliente');
    },
  });

  // Funções para lidar com arquivos
  const handleDocumentFilesChange = (files: File[]) => {
    setDocumentFiles(files);
  };

  const uploadFiles = async (clienteId: string, clienteNome: string): Promise<{ photoUrl?: string; documentUrls: string[] }> => {
    setUploadingFiles(true);
    try {
      let photoUrl: string | undefined;
      let documentUrls: string[] = [];
      
      // Upload da foto de perfil
      if (photoFile) {
        photoUrl = await uploadClientePhoto(photoFile, clienteId, (progress) => {
          setUploadProgress(progress);
        }, clienteNome);
      }

      // Upload dos documentos
      if (documentFiles.length > 0) {
        documentUrls = await uploadClienteDocuments(documentFiles, clienteId, (_, progress) => {
          setUploadProgress(progress);
        }, clienteNome);
      }

      setUploadingFiles(false);
      return { photoUrl, documentUrls };
    } catch (error) {
      setUploadingFiles(false);
      throw error;
    }
  };

  const onSubmit = async (data: ClienteFormValues) => {
    try {
      setIsSubmitting(true);

      // Validate document
      const cleanDocument = data.documento.replace(/\D/g, '');
      if (cleanDocument.length === 11) {
        if (!isValidCPF(cleanDocument)) {
          toast.error('CPF inválido');
          return;
        }
      } else if (cleanDocument.length === 14) {
        if (!isValidCNPJ(cleanDocument)) {
          toast.error('CNPJ inválido');
          return;
        }
      } else {
        toast.error('Documento deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ)');
        return;
      }

      // Validate email
      if (!isValidEmail(data.email)) {
        toast.error('Email inválido');
        return;
      }

      let clienteId = id;
      
      if (isEditing && id) {
        await updateMutation.mutateAsync({ id, data });
      } else {
        clienteId = await createMutation.mutateAsync(data);
      }

      // Upload de arquivos se houver
      if ((photoFile || documentFiles.length > 0) && clienteId) {
        try {
          const { photoUrl, documentUrls } = await uploadFiles(clienteId, data.nomeCompleto);
          
          // Atualizar cliente com URLs dos arquivos
          const updateData: Partial<ClienteFormData> = {};
          
          if (photoUrl) {
            updateData.fotoPerfil = photoUrl;
          }
          
          if (documentUrls.length > 0) {
            updateData.documentos = documentUrls;
          }
          
          if (Object.keys(updateData).length > 0) {
            await updateCliente(clienteId, updateData);
          }
        } catch (error) {
          console.error('Erro ao fazer upload dos arquivos:', error);
          toast.error('Cliente salvo, mas houve erro no upload dos arquivos');
        }
      }
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDocumentChange = (value: string) => {
    const clean = value.replace(/\D/g, '');
    const formatted = clean.length <= 11 ? formatCPF(clean) : formatCPF(clean);
    setValue('documento', formatted);
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    setValue('telefone', formatted);
  };

  const handleCepChange = (value: string) => {
    const formatted = formatCEP(value);
    setValue('endereco.cep', formatted);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/clientes')}
          className="touch-target"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gradient">
            {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Atualize as informações do cliente' : 'Cadastre um novo cliente'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações Pessoais - Linha inteira com duas colunas */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>
              Dados básicos do cliente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Coluna 1 */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nomeCompleto">Nome Completo *</Label>
                  <Input
                    id="nomeCompleto"
                    {...register('nomeCompleto')}
                    className="touch-target"
                    placeholder="Nome completo do cliente"
                  />
                  {errors.nomeCompleto && (
                    <p className="text-sm text-destructive">{errors.nomeCompleto.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documento">CPF/CNPJ *</Label>
                  <Input
                    id="documento"
                    value={watch('documento')}
                    onChange={(e) => handleDocumentChange(e.target.value)}
                    className="touch-target"
                    placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  />
                  {errors.documento && (
                    <p className="text-sm text-destructive">{errors.documento.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    value={watch('telefone')}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="touch-target"
                    placeholder="(00) 00000-0000"
                  />
                  {errors.telefone && (
                    <p className="text-sm text-destructive">{errors.telefone.message}</p>
                  )}
                </div>
              </div>

              {/* Coluna 2 */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rg">RG</Label>
                  <Input
                    id="rg"
                    {...register('rg')}
                    className="touch-target"
                    placeholder="00.000.000-0"
                  />
                  {errors.rg && (
                    <p className="text-sm text-destructive">{errors.rg.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    className="touch-target"
                    placeholder="cliente@email.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Endereço e Dados Bancários lado a lado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Endereço */}
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle>Endereço</CardTitle>
              <CardDescription>
                Informações de localização
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cep">CEP *</Label>
                <Input
                  id="cep"
                  value={watch('endereco.cep')}
                  onChange={(e) => handleCepChange(e.target.value)}
                  className="touch-target"
                  placeholder="00000-000"
                />
                {errors.endereco?.cep && (
                  <p className="text-sm text-destructive">{errors.endereco.cep.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rua">Rua *</Label>
                  <Input
                    id="rua"
                    {...register('endereco.rua')}
                    className="touch-target"
                    placeholder="Nome da rua"
                  />
                  {errors.endereco?.rua && (
                    <p className="text-sm text-destructive">{errors.endereco.rua.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numero">Número *</Label>
                  <Input
                    id="numero"
                    {...register('endereco.numero')}
                    className="touch-target"
                    placeholder="123"
                  />
                  {errors.endereco?.numero && (
                    <p className="text-sm text-destructive">{errors.endereco.numero.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  {...register('endereco.complemento')}
                  className="touch-target"
                  placeholder="Apartamento, sala, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro *</Label>
                <Input
                  id="bairro"
                  {...register('endereco.bairro')}
                  className="touch-target"
                  placeholder="Nome do bairro"
                />
                {errors.endereco?.bairro && (
                  <p className="text-sm text-destructive">{errors.endereco.bairro.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade *</Label>
                  <Input
                    id="cidade"
                    {...register('endereco.cidade')}
                    className="touch-target"
                    placeholder="Nome da cidade"
                  />
                  {errors.endereco?.cidade && (
                    <p className="text-sm text-destructive">{errors.endereco.cidade.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado">Estado *</Label>
                  <Input
                    id="estado"
                    {...register('endereco.estado')}
                    className="touch-target"
                    placeholder="UF"
                    maxLength={2}
                  />
                  {errors.endereco?.estado && (
                    <p className="text-sm text-destructive">{errors.endereco.estado.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados Bancários */}
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle>Dados Bancários</CardTitle>
              <CardDescription>
                Informações bancárias para pagamentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="chavePix">Chave PIX</Label>
                <Input
                  id="chavePix"
                  {...register('dadosBancarios.chavePix')}
                  className="touch-target"
                  placeholder="Chave PIX (CPF, email, telefone ou chave aleatória)"
                />
                {errors.dadosBancarios?.chavePix && (
                  <p className="text-sm text-destructive">{errors.dadosBancarios.chavePix.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="banco">Banco</Label>
                  <Input
                    id="banco"
                    {...register('dadosBancarios.banco')}
                    className="touch-target"
                    placeholder="Nome do banco"
                  />
                  {errors.dadosBancarios?.banco && (
                    <p className="text-sm text-destructive">{errors.dadosBancarios.banco.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agencia">Agência</Label>
                  <Input
                    id="agencia"
                    {...register('dadosBancarios.agencia')}
                    className="touch-target"
                    placeholder="Número da agência"
                  />
                  {errors.dadosBancarios?.agencia && (
                    <p className="text-sm text-destructive">{errors.dadosBancarios.agencia.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="conta">Conta</Label>
                <Input
                  id="conta"
                  {...register('dadosBancarios.conta')}
                  className="touch-target"
                  placeholder="Número da conta"
                />
                {errors.dadosBancarios?.conta && (
                  <p className="text-sm text-destructive">{errors.dadosBancarios.conta.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload de Arquivos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5 text-primary" />
              <span>Documentos e Fotos</span>
            </CardTitle>
            <CardDescription>
              Adicione documentos e foto de perfil do cliente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Upload de Documentos */}
            <div>
              <Label className="text-base font-medium">Documentos</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Upload de documentos como RG, CPF, comprovantes, etc.
              </p>
              <ClienteDocumentUpload
                onDocumentsChange={handleDocumentFilesChange}
                documents={documentFiles}
                uploading={uploadingFiles}
                uploadProgress={uploadProgress}
              />
            </div>

            {/* Upload de Foto de Perfil */}
            <div>
              <Label className="text-base font-medium">Foto de Perfil</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Foto do cliente (opcional)
              </p>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Upload de foto de perfil em breve
                </p>
                <Button
                  type="button"
                  variant="outline"
                  disabled
                  className="touch-target"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Selecionar Foto
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <ModernButton
            type="button"
            variant="outline"
            onClick={() => navigate('/clientes')}
            className="mobile-btn"
          >
            Cancelar
          </ModernButton>
          <ModernButton
            type="submit"
            variant="gradient"
            loading={isSubmitting || uploadingFiles}
            glow={true}
            className="mobile-btn"
            icon={<Save className="h-4 w-4" />}
            iconPosition="left"
          >
            {isEditing ? 'Atualizar' : 'Criar'} Cliente
          </ModernButton>
        </div>
      </form>
    </div>
  );
};
