import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Save,
  Loader2,
  Shield,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react';
import { UserProfile } from '@/types';
import { updateUserProfile } from '@/lib/firebase/auth';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  documento: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export const PerfilPage: React.FC = () => {
  const { user, userProfile, signOut, resetPassword } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nome: userProfile?.nome || '',
      telefone: userProfile?.telefone || '',
      endereco: userProfile?.endereco || '',
      documento: userProfile?.documento || '',
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Perfil atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar perfil');
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsSubmitting(true);
      await updateMutation.mutateAsync(user!.uid, data);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    try {
      await resetPassword(user!.email);
      toast.success('Email de recuperação enviado!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar email de recuperação');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer logout');
    }
  };

  if (!user || !userProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gradient">Meu Perfil</h1>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais e configurações
        </p>
      </div>

      {/* Profile Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-gradient">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {userProfile.nome.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold">{userProfile.nome}</h2>
                <p className="text-sm text-muted-foreground">{userProfile.email}</p>
                <Badge variant={user.role === 'administrador' ? 'default' : 'secondary'}>
                  {user.role}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-accent/10">
                <Calendar className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Membro desde</p>
                <p className="text-lg font-semibold">{formatDate(userProfile.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-secondary/10">
                <Shield className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Última atualização</p>
                <p className="text-lg font-semibold">{formatDate(userProfile.updatedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile" className="touch-target">Perfil</TabsTrigger>
          <TabsTrigger value="security" className="touch-target">Segurança</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Atualize suas informações pessoais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="nome"
                        {...register('nome')}
                        className="pl-10 touch-target"
                        placeholder="Seu nome completo"
                      />
                    </div>
                    {errors.nome && (
                      <p className="text-sm text-destructive">{errors.nome.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        value={userProfile.email}
                        disabled
                        className="pl-10 touch-target bg-muted"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      O email não pode ser alterado
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="telefone"
                        {...register('telefone')}
                        className="pl-10 touch-target"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="documento">Documento</Label>
                    <Input
                      id="documento"
                      {...register('documento')}
                      className="touch-target"
                      placeholder="CPF ou CNPJ"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="endereco"
                      {...register('endereco')}
                      className="pl-10 touch-target"
                      placeholder="Seu endereço completo"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
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
                        Salvar Alterações
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle>Segurança da Conta</CardTitle>
              <CardDescription>
                Gerencie a segurança da sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Password Reset */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Redefinir Senha</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Enviaremos um email para redefinir sua senha
                  </p>
                  <Button
                    onClick={handlePasswordReset}
                    variant="outline"
                    className="touch-target"
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    Enviar Email de Recuperação
                  </Button>
                </div>
              </div>

              <hr className="border-border" />

              {/* Sign Out */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Sair da Conta</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Terminar sessão em todos os dispositivos
                  </p>
                  <Button
                    onClick={handleSignOut}
                    variant="destructive"
                    className="touch-target"
                  >
                    Sair da Conta
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle>Informações da Conta</CardTitle>
              <CardDescription>
                Detalhes sobre sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID do Usuário:</span>
                <span className="font-mono text-sm">{user.uid}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Função:</span>
                <Badge variant={user.role === 'administrador' ? 'default' : 'secondary'}>
                  {user.role}
                </Badge>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Conta criada em:</span>
                <span className="font-medium">{formatDate(userProfile.createdAt)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Última atualização:</span>
                <span className="font-medium">{formatDate(userProfile.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
