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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Loader2, Plus, X } from 'lucide-react';
import { ConteudoFormData, TipoConteudo } from '@/types';
import { createConteudo, updateConteudo, getConteudo } from '@/lib/firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const conteudoSchema = z.object({
  tipo: z.enum(['video', 'texto', 'imagem']),
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  urlStorageOuEmbed: z.string().min(1, 'URL é obrigatória'),
  visibilidade: z.enum(['publico', 'administradores', 'clientes']),
  tags: z.array(z.string()).optional(),
  ordem: z.number().optional(),
});

type ConteudoFormValues = z.infer<typeof conteudoSchema>;

export const ConteudoForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<ConteudoFormValues>({
    resolver: zodResolver(conteudoSchema),
    defaultValues: {
      tipo: 'texto',
      titulo: '',
      descricao: '',
      urlStorageOuEmbed: '',
      visibilidade: 'publico',
      tags: [],
      ordem: 0,
    },
  });

  // Fetch conteudo data if editing
  const { data: conteudoData } = useQuery({
    queryKey: ['conteudo', id],
    queryFn: () => getConteudo(id!),
    enabled: isEditing && Boolean(id),
  });

  // Populate form when editing
  useEffect(() => {
    if (conteudoData && isEditing) {
      reset({
        tipo: conteudoData.tipo,
        titulo: conteudoData.titulo,
        descricao: conteudoData.descricao,
        urlStorageOuEmbed: conteudoData.urlStorageOuEmbed,
        visibilidade: conteudoData.visibilidade,
        tags: conteudoData.tags || [],
        ordem: conteudoData.ordem || 0,
      });
      setTags(conteudoData.tags || []);
    }
  }, [conteudoData, isEditing, reset]);

  const createMutation = useMutation({
    mutationFn: (data: ConteudoFormData) => createConteudo(data, user!.uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conteudos'] });
      toast.success('Conteúdo criado com sucesso!');
      navigate('/conteudos');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao criar conteúdo');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ConteudoFormData> }) =>
      updateConteudo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conteudos'] });
      queryClient.invalidateQueries({ queryKey: ['conteudo', id] });
      toast.success('Conteúdo atualizado com sucesso!');
      navigate('/conteudos');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar conteúdo');
    },
  });

  const onSubmit = async (data: ConteudoFormValues) => {
    try {
      setIsSubmitting(true);

      const formData = {
        ...data,
        tags,
      };

      if (isEditing && id) {
        await updateMutation.mutateAsync({ id, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
    } catch (error) {
      console.error('Erro ao salvar conteúdo:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      setValue('tags', updatedTags);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
    setValue('tags', updatedTags);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const getTipoDescription = (tipo: TipoConteudo) => {
    switch (tipo) {
      case 'video':
        return 'URL do vídeo (YouTube, Vimeo, etc.) ou link direto';
      case 'imagem':
        return 'URL da imagem ou link para download';
      case 'texto':
        return 'Conteúdo em texto ou URL de documento';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/conteudos')}
          className="touch-target"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gradient">
            {isEditing ? 'Editar Conteúdo' : 'Novo Conteúdo'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Atualize as informações do conteúdo' : 'Crie um novo conteúdo'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>
                  Dados principais do conteúdo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Conteúdo *</Label>
                  <Select
                    value={watch('tipo')}
                    onValueChange={(value) => setValue('tipo', value as TipoConteudo)}
                  >
                    <SelectTrigger className="touch-target">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="texto">Texto</SelectItem>
                      <SelectItem value="video">Vídeo</SelectItem>
                      <SelectItem value="imagem">Imagem</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.tipo && (
                    <p className="text-sm text-destructive">{errors.tipo.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="titulo">Título *</Label>
                  <Input
                    id="titulo"
                    {...register('titulo')}
                    className="touch-target"
                    placeholder="Título do conteúdo"
                  />
                  {errors.titulo && (
                    <p className="text-sm text-destructive">{errors.titulo.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição *</Label>
                  <textarea
                    id="descricao"
                    {...register('descricao')}
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Descrição do conteúdo..."
                  />
                  {errors.descricao && (
                    <p className="text-sm text-destructive">{errors.descricao.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="urlStorageOuEmbed">URL ou Embed *</Label>
                  <Input
                    id="urlStorageOuEmbed"
                    {...register('urlStorageOuEmbed')}
                    className="touch-target"
                    placeholder={getTipoDescription(watch('tipo'))}
                  />
                  {errors.urlStorageOuEmbed && (
                    <p className="text-sm text-destructive">{errors.urlStorageOuEmbed.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle>Configurações</CardTitle>
                <CardDescription>
                  Visibilidade e organização
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="visibilidade">Visibilidade *</Label>
                  <Select
                    value={watch('visibilidade')}
                    onValueChange={(value) => setValue('visibilidade', value as any)}
                  >
                    <SelectTrigger className="touch-target">
                      <SelectValue placeholder="Selecione a visibilidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="publico">Público</SelectItem>
                      <SelectItem value="administradores">Administradores</SelectItem>
                      <SelectItem value="clientes">Clientes</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.visibilidade && (
                    <p className="text-sm text-destructive">{errors.visibilidade.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ordem">Ordem de Exibição</Label>
                  <Input
                    id="ordem"
                    type="number"
                    {...register('ordem', { valueAsNumber: true })}
                    className="touch-target"
                    placeholder="0"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle>Tags</CardTitle>
                <CardDescription>
                  Adicione tags para categorizar o conteúdo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite uma tag"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={addTag}
                    variant="outline"
                    className="touch-target"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-1 bg-secondary/20 text-secondary-foreground px-2 py-1 rounded-md text-sm"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/conteudos')}
            className="touch-target"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="touch-target"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? 'Atualizar' : 'Criar'} Conteúdo
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
