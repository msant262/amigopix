import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Database } from 'lucide-react';
import { seedData } from '@/lib/seedData';
import toast from 'react-hot-toast';

export const SeedButton: React.FC = () => {
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeed = async () => {
    try {
      setIsSeeding(true);
      await seedData();
      toast.success('Dados de exemplo criados com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar dados de exemplo');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Button
      onClick={handleSeed}
      disabled={isSeeding}
      variant="outline"
      className="touch-target"
    >
      {isSeeding ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Criando dados...
        </>
      ) : (
        <>
          <Database className="mr-2 h-4 w-4" />
          Criar Dados de Exemplo
        </>
      )}
    </Button>
  );
};
