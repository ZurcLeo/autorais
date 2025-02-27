import React from 'react';
import { Alert, AlertTitle, Divider } from '@mui/material';
import { Card, CardHeader, Typography, CardContent } from '@mui/material';

/**
 * **Sistema de Tema ElosCloud**
 *
 * Este documento detalha a implementação do sistema de temas,
 * incluindo tokens, componentes, padrões e diretrizes de uso.
 */
const ThemeDoc: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">
          Sistema de Tema ElosCloud
        </h1>
      </div>

      <div>
        <Alert className="warning">
          <AlertTitle>Atenção: Inconsistências no Sistema de Tema</AlertTitle>
          <p>
            Durante a análise foram identificadas questões que requerem atenção.
            A padronização e documentação dos temas precisa ser aprimorada.
          </p>
        </Alert>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Arquitetura do Sistema</h2>
        <Card>
          <CardContent>
            <pre className="p-4 bg-muted rounded-md overflow-x-auto">
{`// Estrutura do Sistema de Temas
ThemeContextProvider/              # Provider principal de temas
├── createDynamicTheme()          # Factory de temas dinâmicos 
│   ├── createComponents()        # Customização de componentes
│   ├── createTypography()        # Sistema tipográfico
│   └── semanticTokens            # Tokens semânticos (cores, etc)
├── useTheme()                    # Hook de acesso ao tema
└── ThemeControls                 # Controles de tema (dark/light)`}
            </pre>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Problemas Identificados e Impactos</h2>
        
        <div className="space-y-4">
          <Card className="bg-destructive/10">
            <CardHeader>
              <Typography>🎨 Sistema de Cores Incompleto</Typography>
            </CardHeader>
            <CardContent>
              <p>O sistema atual de cores não cobre todos os estados necessários dos componentes.</p>
              <pre className="p-4 bg-muted rounded-md mt-2">
{`// ❌ Definição atual incompleta
const semanticColors = {
  primary: colors.ocean[500],
  // Faltam variações para estados
  // hover, active, disabled, etc.
}`}
              </pre>
            </CardContent>
          </Card>

          <Card className="bg-destructive/10">
            <CardHeader>
              <Typography>📏 Inconsistência em Grid System</Typography>
            </CardHeader>
            <CardContent>
              <p>O sistema de grid e spacing não segue uma escala consistente.</p>
              <pre className="p-4 bg-muted rounded-md mt-2">
{`// ❌ Valores arbitrários
spacing: (factor) => \`\${0.25 * factor}rem\`,
// Sem definição clara de colunas e gutters`}
              </pre>
            </CardContent>
          </Card>

          <Card className="bg-destructive/10">
            <CardHeader>
              <Typography>📱 Breakpoints Mal Definidos</Typography>
            </CardHeader>
            <CardContent>
              <p>Falta padronização nos breakpoints para responsividade.</p>
              <pre className="p-4 bg-muted rounded-md mt-2">
{`// ❌ Breakpoints inconsistentes
xs: 320,   // Mobile?
sm: 600,   // Tablet?
md: 960    // ???`}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>

      <Divider />

      <div>
        <h2 className="text-2xl font-bold mb-4">Soluções Propostas</h2>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <Typography>1. Sistema de Cores Robusto</Typography>
            </CardHeader>
            <CardContent>
              <pre className="p-4 bg-muted rounded-md">
{`// ✅ Sistema de cores completo
const semanticColors = {
  primary: {
    main: colors.ocean[500],
    light: colors.ocean[300],
    dark: colors.ocean[700],
    hover: colors.ocean[400],
    active: colors.ocean[600],
    disabled: colors.ocean[200],
  },
  // Repetir para secondary, error, warning, etc.
}`}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Typography>2. Grid System Padronizado</Typography>
            </CardHeader>
            <CardContent>
              <pre className="p-4 bg-muted rounded-md">
{`// ✅ Sistema de grid consistente
const grid = {
  columns: 12,
  gutter: 16,
  margin: 24,
  container: {
    sm: 540,
    md: 720,
    lg: 960,
    xl: 1140
  }
}`}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Typography>3. Breakpoints Definidos</Typography>
            </CardHeader>
            <CardContent>
              <pre className="p-4 bg-muted rounded-md">
{`// ✅ Breakpoints claros
const breakpoints = {
  xs: 320,  // Mobile pequeno
  sm: 576,  // Mobile grande
  md: 768,  // Tablet
  lg: 992,  // Desktop pequeno
  xl: 1200, // Desktop médio
  xxl: 1400 // Desktop grande
}`}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>

      <Divider />

      <div>
        <h2 className="text-2xl font-bold mb-4">Próximos Passos</h2>
        
        <ul className="space-y-2 list-disc list-inside">
          <li>Implementar sistema completo de tokens semânticos</li>
          <li>Criar Storybook para documentação viva dos componentes</li>
          <li>Desenvolver testes visuais com Chromatic</li>
          <li>Estabelecer padrões de acessibilidade (WCAG 2.1)</li>
          <li>Criar guia de migração para novos padrões</li>
        </ul>
      </div>

      <Divider />

      <div>
        <h2 className="text-2xl font-bold mb-4">Guia de Implementação</h2>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <Typography>Utilizando Tokens Semânticos</Typography>
            </CardHeader>
            <CardContent>
              <pre className="p-4 bg-muted rounded-md">
{`// Exemplo de uso de tokens semânticos
const MyComponent = styled.div\`
  // ✅ Uso correto de tokens
  background: \${({ theme }) => theme.colors.background.primary};
  padding: \${({ theme }) => theme.spacing(4)};
  border-radius: \${({ theme }) => theme.borderRadius.md};

  // ❌ Não usar valores arbitrários
  // margin: 15px;
  // color: #333;
\`;`}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Typography>Customização de Temas</Typography>
            </CardHeader>
            <CardContent>
              <pre className="p-4 bg-muted rounded-md">
{`// Exemplo de customização de tema
const customTheme = createDynamicTheme('light', {
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: tokens.borderRadius.lg,
          transition: \`all \${tokens.transitions.duration.base}\`
        }
      }
    }
  }
});`}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Typography>Responsividade</Typography>
            </CardHeader>
            <CardContent>
              <pre className="p-4 bg-muted rounded-md">
{`// Uso correto de breakpoints
const ResponsiveComponent = styled.div\`
  // Mobile first
  padding: \${({ theme }) => theme.spacing(2)};

  // Tablet
  @media (min-width: \${({ theme }) => theme.breakpoints.md}) {
    padding: \${({ theme }) => theme.spacing(4)};
  }

  // Desktop
  @media (min-width: \${({ theme }) => theme.breakpoints.lg}) {
    padding: \${({ theme }) => theme.spacing(6)};
  }
\`;`}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>

      <Divider />

      <div>
        <h2 className="text-2xl font-bold mb-4">Acessibilidade</h2>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <Typography>Contraste e Cores</Typography>
            </CardHeader>
            <CardContent>
              <p>Todas as combinações de cores devem seguir os padrões WCAG 2.1:</p>
              <ul className="list-disc list-inside mt-2">
                <li>Texto normal: Contraste mínimo 4.5:1</li>
                <li>Texto grande: Contraste mínimo 3:1</li>
                <li>Elementos interativos: Contraste mínimo 3:1</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Typography>Modo de Alto Contraste</Typography>
            </CardHeader>
            <CardContent>
              <pre className="p-4 bg-muted rounded-md">
{`// Suporte a modo de alto contraste
const highContrastColors = {
  text: {
    primary: '#000000',
    secondary: '#FFFFFF'
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#000000'
  }
};`}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>

      <Divider />

      <div>
        <h2 className="text-2xl font-bold mb-4">Documentação e Recursos</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <Typography>Recursos Úteis</Typography>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside">
                <li>Storybook: Documentação de componentes</li>
                <li>Chromatic: Testes visuais</li>
                <li>Figma: Design tokens e especificações</li>
                <li>Zeroheight: Documentação do design system</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Typography>Links Importantes</Typography>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside">
                <li>Guia de Contribuição</li>
                <li>Padrões de Código</li>
                <li>Changelog</li>
                <li>Roadmap</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ThemeDoc;