import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { 
  ArrowLeft, 
  Edit, 
  FileText,
  Image,
  Video,
  User,
  Globe,
  Lock,
  ExternalLink
} from 'lucide-react';
import { getConteudo } from '@/lib/firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { TipoConteudo } from '@/types';

export const ConteudoDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: conteudo, isLoading, error } = useQuery({
    queryKey: ['conteudo', id],
    queryFn: () => getConteudo(id!),
    enabled: Boolean(id),
  });

  const getTipoIcon = (tipo: TipoConteudo) => {
    switch (tipo) {
      case 'video':
        return Video;
      case 'imagem':
        return Image;
      case 'texto':
        return FileText;
      default:
        return FileText;
    }
  };

  const getTipoColor = (tipo: TipoConteudo) => {
    switch (tipo) {
      case 'video':
        return 'text-red-500';
      case 'imagem':
        return 'text-green-500';
      case 'texto':
        return 'text-blue-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getVisibilidadeIcon = (visibilidade: string) => {
    switch (visibilidade) {
      case 'publico':
        return Globe;
      case 'administradores':
        return Lock;
      case 'clientes':
        return User;
      default:
        return Globe;
    }
  };

  const getVisibilidadeText = (visibilidade: string) => {
    switch (visibilidade) {
      case 'publico':
        return 'Público';
      case 'administradores':
        return 'Administradores';
      case 'clientes':
        return 'Clientes';
      default:
        return visibilidade;
    }
  };

  const renderContent = () => {
    if (!conteudo) return null;

    switch (conteudo.tipo) {
      case 'video':
        // Check if it's a YouTube URL
        if (conteudo.urlStorageOuEmbed.includes('youtube.com') || conteudo.urlStorageOuEmbed.includes('youtu.be')) {
          let videoId = '';
          if (conteudo.urlStorageOuEmbed.includes('youtube.com/watch')) {
            videoId = conteudo.urlStorageOuEmbed.split('v=')[1]?.split('&')[0];
          } else if (conteudo.urlStorageOuEmbed.includes('youtu.be/')) {
            videoId = conteudo.urlStorageOuEmbed.split('youtu.be/')[1]?.split('?')[0];
          }
          
          if (videoId) {
            return (
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={conteudo.titulo}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                />
              </div>
            );
          }
        }
        
        // Fallback to direct link
        return (
          <div className="text-center py-8">
            <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Vídeo não pode ser exibido inline</p>
            <Button
              onClick={() => window.open(conteudo.urlStorageOuEmbed, '_blank')}
              className="touch-target"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Abrir Vídeo
            </Button>
          </div>
        );

      case 'imagem':
        return (
          <div className="text-center">
            <img
              src={conteudo.urlStorageOuEmbed}
              alt={conteudo.titulo}
              className="max-w-full h-auto rounded-lg mx-auto"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden text-center py-8">
              <Image className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Imagem não pode ser exibida</p>
              <Button
                onClick={() => window.open(conteudo.urlStorageOuEmbed, '_blank')}
                className="touch-target"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Abrir Imagem
              </Button>
            </div>
          </div>
        );

      case 'texto':
        return (
          <div className="prose prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {conteudo.urlStorageOuEmbed}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Conteúdo não suportado</p>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !conteudo) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Conteúdo não encontrado</p>
        <Button
          variant="outline"
          onClick={() => navigate('/conteudos')}
          className="mt-4 touch-target"
        >
          Voltar para Conteúdos
        </Button>
      </div>
    );
  }

  const TipoIcon = getTipoIcon(conteudo.tipo);
  const VisibilidadeIcon = getVisibilidadeIcon(conteudo.visibilidade);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
              {conteudo.titulo}
            </h1>
            <div className="flex items-center space-x-2 mt-1">
              <TipoIcon className={`h-4 w-4 ${getTipoColor(conteudo.tipo)}`} />
              <Badge variant="outline" className="capitalize">
                {conteudo.tipo}
              </Badge>
              <VisibilidadeIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {getVisibilidadeText(conteudo.visibilidade)}
              </span>
            </div>
          </div>
        </div>

        {user?.role === 'administrador' && (
          <Button
            onClick={() => navigate(`/conteudos/${conteudo.id}/editar`)}
            className="touch-target"
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        )}
      </div>

      {/* Content */}
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle>Conteúdo</CardTitle>
          <CardDescription>{conteudo.descricao}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>

      {/* Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle>Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Autor:</span>
              <span className="font-medium">{conteudo.autorNome || 'Autor'}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Publicado em:</span>
              <span className="font-medium">{formatDate(conteudo.publicadoEm)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Visibilidade:</span>
              <span className="font-medium">{getVisibilidadeText(conteudo.visibilidade)}</span>
            </div>
            
            {conteudo.ordem !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ordem:</span>
                <span className="font-medium">{conteudo.ordem}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {conteudo.tags && conteudo.tags.length > 0 && (
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {conteudo.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
