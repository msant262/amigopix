import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { formatDate } from '@/lib/utils';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  FileText,
  Image,
  Video,
  User,
  Calendar,
  Globe,
  Lock
} from 'lucide-react';
import { ConteudoFilters, TipoConteudo } from '@/types';
import { getConteudos } from '@/lib/firebase/firestore';
import { ConteudoForm } from './ConteudoForm';
import { ConteudoDetails } from './ConteudoDetails';

export const ConteudosPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ConteudoFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  const { data: conteudos, isLoading, error } = useQuery({
    queryKey: ['conteudos', filters, user?.role],
    queryFn: () => getConteudos(filters, user?.role),
  });

  const handleFilterChange = (field: keyof ConteudoFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value === 'all' ? undefined : value,
    }));
  };

  const filteredConteudos = conteudos?.filter(conteudo => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      conteudo.titulo.toLowerCase().includes(searchLower) ||
      conteudo.descricao.toLowerCase().includes(searchLower) ||
      conteudo.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }) || [];

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Erro ao carregar conteúdos</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gradient">Conteúdos</h1>
              <p className="text-muted-foreground">
                Gerencie vídeos, textos e imagens do sistema
              </p>
            </div>
            
            {user?.role === 'administrador' && (
              <Button
                onClick={() => navigate('/conteudos/novo')}
                className="touch-target"
              >
                <Plus className="mr-2 h-4 w-4" />
                Novo Conteúdo
              </Button>
            )}
          </div>

          {/* Filters */}
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Título, descrição, tags..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 touch-target"
                    />
                  </div>
                </div>

                {/* Tipo Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo</label>
                  <Select
                    value={filters.tipo || 'all'}
                    onValueChange={(value) => handleFilterChange('tipo', value)}
                  >
                    <SelectTrigger className="touch-target">
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="video">Vídeo</SelectItem>
                      <SelectItem value="texto">Texto</SelectItem>
                      <SelectItem value="imagem">Imagem</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Visibilidade Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Visibilidade</label>
                  <Select
                    value={filters.visibilidade || 'all'}
                    onValueChange={(value) => handleFilterChange('visibilidade', value)}
                  >
                    <SelectTrigger className="touch-target">
                      <SelectValue placeholder="Todas as visibilidades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as visibilidades</SelectItem>
                      <SelectItem value="publico">Público</SelectItem>
                      <SelectItem value="administradores">Administradores</SelectItem>
                      <SelectItem value="clientes">Clientes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conteudos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConteudos.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum conteúdo encontrado</p>
              </div>
            ) : (
              filteredConteudos.map((conteudo) => {
                const TipoIcon = getTipoIcon(conteudo.tipo);
                const VisibilidadeIcon = getVisibilidadeIcon(conteudo.visibilidade);
                
                return (
                  <Card key={conteudo.id} className="card-gradient hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <TipoIcon className={`h-5 w-5 ${getTipoColor(conteudo.tipo)}`} />
                          <Badge variant="outline" className="capitalize">
                            {conteudo.tipo}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <VisibilidadeIcon className="h-4 w-4 text-muted-foreground" />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/conteudos/${conteudo.id}`)}
                            className="touch-target"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {user?.role === 'administrador' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/conteudos/${conteudo.id}/editar`)}
                              className="touch-target"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div>
                        <h3 className="font-semibold line-clamp-2 mb-1">
                          {conteudo.titulo}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {conteudo.descricao}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(conteudo.publicadoEm)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{conteudo.autorNome || 'Autor'}</span>
                        </div>
                      </div>
                      
                      {conteudo.tags && conteudo.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {conteudo.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {conteudo.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{conteudo.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      } />
      
      <Route path="/novo" element={<ConteudoForm />} />
      <Route path="/:id" element={<ConteudoDetails />} />
      <Route path="/:id/editar" element={<ConteudoForm />} />
    </Routes>
  );
};
