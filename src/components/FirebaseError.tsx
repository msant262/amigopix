import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ExternalLink, Settings } from 'lucide-react';

export const FirebaseError: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl card-gradient">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl text-destructive">
            Firebase Não Configurado
          </CardTitle>
          <CardDescription className="text-lg">
            Configure o Firebase para usar o sistema
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">📋 Passos para Configurar:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Crie um projeto no <strong>Firebase Console</strong></li>
              <li>Habilite <strong>Authentication</strong> (Email/Password)</li>
              <li>Crie um banco <strong>Firestore Database</strong></li>
              <li>Habilite <strong>Storage</strong></li>
              <li>Copie as credenciais para o arquivo <code>.env.local</code></li>
            </ol>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Arquivo de configuração:</span>
              </div>
              <code className="text-xs bg-muted px-2 py-1 rounded">.env.local</code>
            </div>

            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-sm">Exemplo de configuração:</h4>
              <pre className="text-xs overflow-x-auto">
{`VITE_FIREBASE_API_KEY=sua_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto_id
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
VITE_FIREBASE_MEASUREMENT_ID=seu_measurement_id`}
              </pre>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => window.open('https://console.firebase.google.com', '_blank')}
              className="flex-1 touch-target"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Abrir Firebase Console
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex-1 touch-target"
            >
              Recarregar Página
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Após configurar o Firebase, recarregue a página</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
