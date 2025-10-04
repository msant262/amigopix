import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ModernButton } from '@/components/ui/modern-button';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

type AuthMode = 'login' | 'register' | 'forgot';

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nome: '',
  });

  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      toast.error('Email e senha são obrigatórios');
      return false;
    }

    if (mode === 'register') {
      if (!formData.nome) {
        toast.error('Nome é obrigatório');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error('Senhas não coincidem');
        return false;
      }
      if (formData.password.length < 6) {
        toast.error('Senha deve ter pelo menos 6 caracteres');
        return false;
      }
    }

    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      await signIn(formData.email, formData.password);
      toast.success('Login realizado com sucesso!');
      navigate(from, { replace: true });
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      // Sempre cria como cliente - administradores devem ser criados manualmente
      await signUp(formData.email, formData.password, formData.nome, 'cliente');
      toast.success('Conta criada com sucesso!');
      navigate(from, { replace: true });
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      toast.error('Email é obrigatório');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(formData.email);
      toast.success('Email de recuperação enviado!');
      setMode('login');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar email de recuperação');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      nome: '',
    });
    setShowPassword(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Title */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="text-white font-bold text-2xl">CF</span>
          </div>
          <h1 className="text-2xl font-bold text-gradient">
            CyberFlix Empréstimos
          </h1>
          <p className="text-muted-foreground">
            Sistema de controle de empréstimos
          </p>
        </div>

        {/* Auth Tabs */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {mode === 'login' && 'Entrar'}
              {mode === 'register' && 'Criar Conta'}
              {mode === 'forgot' && 'Recuperar Senha'}
            </CardTitle>
            <CardDescription className="text-center">
              {mode === 'login' && 'Entre com suas credenciais'}
              {mode === 'register' && 'Crie sua conta de cliente para começar'}
              {mode === 'forgot' && 'Digite seu email para recuperar a senha'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={
              mode === 'login' ? handleLogin :
              mode === 'register' ? handleRegister :
              handleForgotPassword
            } className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10 touch-target"
                    required
                  />
                </div>
              </div>

              {/* Nome (Register only) */}
              {mode === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="nome"
                      type="text"
                      placeholder="Seu nome completo"
                      value={formData.nome}
                      onChange={(e) => handleInputChange('nome', e.target.value)}
                      className="pl-10 touch-target"
                      required
                    />
                  </div>
                </div>
              )}


              {/* Password */}
              {(mode === 'login' || mode === 'register') && (
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Sua senha"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="pl-10 pr-10 touch-target"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground touch-target"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Confirm Password (Register only) */}
              {mode === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirme sua senha"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="pl-10 touch-target"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <ModernButton
                type="submit"
                variant="gradient"
                className="w-full mobile-btn"
                loading={loading}
                glow={true}
              >
                {mode === 'login' && 'Entrar'}
                {mode === 'register' && 'Criar Conta'}
                {mode === 'forgot' && 'Enviar Email'}
              </ModernButton>
            </form>

            {/* Mode Switcher */}
            <div className="mt-6 text-center space-y-2">
              {mode === 'login' && (
                <>
                  <button
                    onClick={() => setMode('forgot')}
                    className="text-sm text-primary hover:underline"
                  >
                    Esqueceu sua senha?
                  </button>
                  <div className="text-sm text-muted-foreground">
                    Não tem uma conta?{' '}
                    <button
                      onClick={() => {
                        setMode('register');
                        resetForm();
                      }}
                      className="text-primary hover:underline"
                    >
                      Criar conta
                    </button>
                  </div>
                </>
              )}

              {mode === 'register' && (
                <div className="text-sm text-muted-foreground">
                  Já tem uma conta?{' '}
                  <button
                    onClick={() => {
                      setMode('login');
                      resetForm();
                    }}
                    className="text-primary hover:underline"
                  >
                    Fazer login
                  </button>
                </div>
              )}

              {mode === 'forgot' && (
                <button
                  onClick={() => {
                    setMode('login');
                    resetForm();
                  }}
                  className="text-sm text-primary hover:underline flex items-center space-x-1 mx-auto"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Voltar ao login</span>
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
