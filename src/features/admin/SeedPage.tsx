import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase/config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ModernButton } from '@/components/ui/modern-button';
import { Loading } from '@/components/ui/loading';
import { Badge } from '@/components/ui/badge';
import { seedData } from '@/lib/seedData';
import { 
  Database, 
  Users, 
  CreditCard, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Play,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const SeedPage: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [lastSeedTime, setLastSeedTime] = useState<string | null>(null);
  const [seedResults, setSeedResults] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  // Verificar se o usuário é administrador
  if (user?.role !== 'administrador') {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
              <h3 className="text-lg font-semibold">Acesso Restrito</h3>
              <p className="text-sm text-muted-foreground">
                Apenas administradores podem executar o seed de dados.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSeedData = async () => {
    setIsLoading(true);
    setSeedResults(null);
    
    try {
      console.log('🚀 Iniciando seed de dados...');
      await seedData();
      
      setLastSeedTime(new Date().toLocaleString('pt-BR'));
      setSeedResults({
        success: true,
        message: 'Dados de exemplo criados com sucesso!',
        details: {
          adminEmail: 'admin@cyberflix.com',
          adminPassword: 'admin123',
          clientsCreated: 3,
          loansCreated: 5,
          paymentsCreated: 4,
          contentCreated: 4
        }
      });
      
      toast.success('Seed executado com sucesso!');
      console.log('✅ Seed concluído com sucesso');
      
    } catch (error: any) {
      console.error('❌ Erro no seed:', error);
      setSeedResults({
        success: false,
        message: error.message || 'Erro ao executar seed de dados',
        details: error
      });
      
      toast.error('Erro ao executar seed de dados');
    } finally {
      setIsLoading(false);
    }
  };

  const seedFeatures = [
    {
      icon: Users,
      title: 'Usuários',
      description: '1 administrador + 3 clientes',
      color: 'text-blue-500'
    },
    {
      icon: CreditCard,
      title: 'Empréstimos',
      description: '5 empréstimos com diferentes status',
      color: 'text-green-500'
    },
    {
      icon: Database,
      title: 'Pagamentos',
      description: '8 pagamentos históricos',
      color: 'text-purple-500'
    },
    {
      icon: FileText,
      title: 'Conteúdos',
      description: '4 conteúdos de exemplo',
      color: 'text-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gradient">Seed de Dados</h1>
        <p className="text-muted-foreground">
          Execute o seed para criar dados de exemplo e testar o sistema
        </p>
      </div>

      {/* Warning Card */}
      <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-orange-800 dark:text-orange-200">
            <AlertCircle className="h-5 w-5" />
            <span>Atenção</span>
          </CardTitle>
          <CardDescription className="text-orange-700 dark:text-orange-300">
            O seed criará dados de exemplo no banco de dados. Use apenas em ambiente de desenvolvimento.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Seed Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {seedFeatures.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-muted/50`}>
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Seed Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Executar Seed</span>
          </CardTitle>
          <CardDescription>
            Clique no botão abaixo para criar todos os dados de exemplo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <ModernButton
              onClick={handleSeedData}
              disabled={isLoading}
              variant="gradient"
              size="lg"
              icon={<Play className="h-5 w-5" />}
              iconPosition="left"
              glow={true}
              className="min-w-[200px]"
            >
              {isLoading ? (
                <>
                  <Loading size="sm" className="mr-2" />
                  Executando...
                </>
              ) : (
                'Executar Seed'
              )}
            </ModernButton>

            {lastSeedTime && (
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>Última execução: {lastSeedTime}</span>
                </Badge>
              </div>
            )}
          </div>

          {/* Results */}
          {seedResults && (
            <Card className={seedResults.success ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950" : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"}>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  {seedResults.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div className="space-y-2">
                    <h4 className={`font-semibold ${seedResults.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                      {seedResults.success ? 'Seed Executado com Sucesso!' : 'Erro na Execução'}
                    </h4>
                    <p className={`text-sm ${seedResults.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                      {seedResults.message}
                    </p>
                    
                    {seedResults.success && seedResults.details && (
                      <div className="mt-3 space-y-2">
                        <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3 space-y-1">
                          <h5 className="font-medium text-sm">Credenciais do Administrador:</h5>
                          <div className="space-y-1 text-xs font-mono">
                            <div>Email: <span className="font-semibold">{seedResults.details.adminEmail}</span></div>
                            <div>Senha: <span className="font-semibold">{seedResults.details.adminPassword}</span></div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-white/50 dark:bg-black/20 rounded p-2">
                            <span className="font-medium">Clientes:</span> {seedResults.details.clientsCreated}
                          </div>
                          <div className="bg-white/50 dark:bg-black/20 rounded p-2">
                            <span className="font-medium">Empréstimos:</span> {seedResults.details.loansCreated}
                          </div>
                          <div className="bg-white/50 dark:bg-black/20 rounded p-2">
                            <span className="font-medium">Pagamentos:</span> {seedResults.details.paymentsCreated}
                          </div>
                          <div className="bg-white/50 dark:bg-black/20 rounded p-2">
                            <span className="font-medium">Conteúdos:</span> {seedResults.details.contentCreated}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Debug Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Informações de Debug</span>
          </CardTitle>
          <CardDescription>
            Informações sobre o estado atual da autenticação e Firebase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Usuário Autenticado:</strong>
              <p className="text-muted-foreground">
                {auth.currentUser?.email || 'Nenhum usuário logado'}
              </p>
            </div>
            <div>
              <strong>Role:</strong>
              <p className="text-muted-foreground">
                {user?.role || 'Não definido'}
              </p>
            </div>
            <div>
              <strong>UID:</strong>
              <p className="text-muted-foreground font-mono text-xs">
                {auth.currentUser?.uid || 'N/A'}
              </p>
            </div>
            <div>
              <strong>Status Auth:</strong>
              <p className="text-muted-foreground">
                {auth.currentUser ? '✅ Logado' : '❌ Não logado'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Como Usar</CardTitle>
          <CardDescription>
            Instruções para testar o sistema após executar o seed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Badge variant="secondary" className="mt-1">1</Badge>
              <div>
                <h4 className="font-medium">Execute o Seed</h4>
                <p className="text-sm text-muted-foreground">
                  Clique em "Executar Seed" para criar todos os dados de exemplo
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Badge variant="secondary" className="mt-1">2</Badge>
              <div>
                <h4 className="font-medium">Faça Login como Administrador</h4>
                <p className="text-sm text-muted-foreground">
                  Use as credenciais: admin@cyberflix.com / admin123
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Badge variant="secondary" className="mt-1">3</Badge>
              <div>
                <h4 className="font-medium">Explore o Sistema</h4>
                <p className="text-sm text-muted-foreground">
                  Navegue pelo dashboard, empréstimos, clientes e conteúdos
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Badge variant="secondary" className="mt-1">4</Badge>
              <div>
                <h4 className="font-medium">Teste os Filtros</h4>
                <p className="text-sm text-muted-foreground">
                  Experimente os filtros de tempo no dashboard (1 dia, 7 dias, etc.)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
