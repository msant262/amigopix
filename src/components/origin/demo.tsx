import React from "react"
import { 
  OriginButton, 
  OriginCard, 
  OriginCardHeader, 
  OriginCardTitle, 
  OriginCardContent,
  OriginInput,
  OriginModal,
  OriginModalHeader,
  OriginModalTitle,
  OriginModalContent,
  OriginModalFooter,
  OriginBadge 
} from "./index"
import { Eye, Download, Edit, Trash2, CheckCircle, Plus } from "lucide-react"

export function OriginComponentsDemo() {
  const [modalOpen, setModalOpen] = React.useState(false)

  return (
    <div className="p-8 space-y-8 bg-background min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
          Origin UI Components Demo
        </h1>

        {/* Buttons Section */}
        <OriginCard variant="elevated" padding="lg" hover="lift">
          <OriginCardHeader>
            <OriginCardTitle>Buttons</OriginCardTitle>
          </OriginCardHeader>
          <OriginCardContent>
            <div className="flex flex-wrap gap-4">
              <OriginButton>Default</OriginButton>
              <OriginButton variant="secondary">Secondary</OriginButton>
              <OriginButton variant="destructive">Destructive</OriginButton>
              <OriginButton variant="outline">Outline</OriginButton>
              <OriginButton variant="ghost">Ghost</OriginButton>
              <OriginButton variant="success">Success</OriginButton>
              <OriginButton variant="warning">Warning</OriginButton>
              <OriginButton variant="info">Info</OriginButton>
              <OriginButton loading>Loading</OriginButton>
              <OriginButton size="sm">Small</OriginButton>
              <OriginButton size="lg">Large</OriginButton>
              <OriginButton size="icon">
                <Plus className="h-4 w-4" />
              </OriginButton>
            </div>
          </OriginCardContent>
        </OriginCard>

        {/* Cards Section */}
        <OriginCard variant="glass" padding="lg" hover="glow">
          <OriginCardHeader>
            <OriginCardTitle>Cards</OriginCardTitle>
          </OriginCardHeader>
          <OriginCardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <OriginCard variant="default" padding="default" hover="lift">
                <OriginCardHeader>
                  <OriginCardTitle>Default Card</OriginCardTitle>
                </OriginCardHeader>
                <OriginCardContent>
                  <p className="text-muted-foreground">This is a default card with hover effects.</p>
                </OriginCardContent>
              </OriginCard>

              <OriginCard variant="elevated" padding="default" hover="scale">
                <OriginCardHeader>
                  <OriginCardTitle>Elevated Card</OriginCardTitle>
                </OriginCardHeader>
                <OriginCardContent>
                  <p className="text-muted-foreground">This card has elevation and scale effects.</p>
                </OriginCardContent>
              </OriginCard>

              <OriginCard variant="filled" padding="default" hover="glow">
                <OriginCardHeader>
                  <OriginCardTitle>Filled Card</OriginCardTitle>
                </OriginCardHeader>
                <OriginCardContent>
                  <p className="text-muted-foreground">This card has a gradient background.</p>
                </OriginCardContent>
              </OriginCard>
            </div>
          </OriginCardContent>
        </OriginCard>

        {/* Inputs Section */}
        <OriginCard variant="outlined" padding="lg">
          <OriginCardHeader>
            <OriginCardTitle>Inputs</OriginCardTitle>
          </OriginCardHeader>
          <OriginCardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <OriginInput
                label="Default Input"
                placeholder="Enter your text"
                helper="This is a helper text"
              />
              
              <OriginInput
                label="Filled Input"
                variant="filled"
                placeholder="Filled variant"
                leftIcon={<Eye className="h-4 w-4" />}
              />
              
              <OriginInput
                label="Password Input"
                type="password"
                placeholder="Enter password"
                variant="outlined"
              />
              
              <OriginInput
                label="Input with Error"
                placeholder="This has an error"
                error="This field is required"
              />
            </div>
          </OriginCardContent>
        </OriginCard>

        {/* Badges Section */}
        <OriginCard variant="default" padding="lg">
          <OriginCardHeader>
            <OriginCardTitle>Badges</OriginCardTitle>
          </OriginCardHeader>
          <OriginCardContent>
            <div className="flex flex-wrap gap-3">
              <OriginBadge>Default</OriginBadge>
              <OriginBadge variant="secondary">Secondary</OriginBadge>
              <OriginBadge variant="destructive">Destructive</OriginBadge>
              <OriginBadge variant="success">Success</OriginBadge>
              <OriginBadge variant="warning">Warning</OriginBadge>
              <OriginBadge variant="info">Info</OriginBadge>
              <OriginBadge variant="gradient">Gradient</OriginBadge>
              <OriginBadge variant="outline">Outline</OriginBadge>
              <OriginBadge icon={<CheckCircle className="h-3 w-3" />}>
                With Icon
              </OriginBadge>
              <OriginBadge removable>
                Removable
              </OriginBadge>
            </div>
          </OriginCardContent>
        </OriginCard>

        {/* Modal Section */}
        <OriginCard variant="elevated" padding="lg">
          <OriginCardHeader>
            <OriginCardTitle>Modal</OriginCardTitle>
          </OriginCardHeader>
          <OriginCardContent>
            <div className="flex gap-4">
              <OriginButton onClick={() => setModalOpen(true)}>
                Open Modal
              </OriginButton>
            </div>
          </OriginCardContent>
        </OriginCard>

        {/* Action Buttons Demo */}
        <OriginCard variant="filled" padding="lg">
          <OriginCardHeader>
            <OriginCardTitle>Action Buttons (Empréstimos)</OriginCardTitle>
          </OriginCardHeader>
          <OriginCardContent>
            <div className="flex flex-wrap gap-3">
              <OriginButton variant="info" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Visualizar
              </OriginButton>
              
              <OriginButton variant="success" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Baixar
              </OriginButton>
              
              <OriginButton variant="warning" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Editar Parcela
              </OriginButton>
              
              <OriginButton variant="success" size="sm">
                <CheckCircle className="h-4 w-4 mr-2" />
                Marcar como Pago
              </OriginButton>
              
              <OriginButton variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Deletar Parcela
              </OriginButton>
              
              <OriginButton variant="primary" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Pagamento
              </OriginButton>
            </div>
          </OriginCardContent>
        </OriginCard>
      </div>

      {/* Modal */}
      <OriginModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Example Modal"
        description="This is a modern modal component"
        size="lg"
      >
        <OriginModalContent>
          <p className="text-muted-foreground mb-4">
            This modal demonstrates the modern design with smooth animations and backdrop blur.
          </p>
          
          <div className="space-y-4">
            <OriginInput
              label="Sample Input"
              placeholder="Type something here"
            />
            
            <div className="flex gap-2">
              <OriginBadge variant="success">Active</OriginBadge>
              <OriginBadge variant="info">New</OriginBadge>
            </div>
          </div>
        </OriginModalContent>
        
        <OriginModalFooter>
          <OriginButton variant="outline" onClick={() => setModalOpen(false)}>
            Cancel
          </OriginButton>
          <OriginButton onClick={() => setModalOpen(false)}>
            Confirm
          </OriginButton>
        </OriginModalFooter>
      </OriginModal>
    </div>
  )
}
