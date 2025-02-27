import React from 'react';
import {
    Typography,
    Grid,
    Card,
    CardContent,
    CardActionArea,
    Box
} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {ProjectInfoPanel} from './ProjectInfoPanel.tsx';
import {Description} from '@mui/icons-material';

const DocHome: React.FC = () => {
    const navigate = useNavigate();

    const quickLinks = [
        {
            title: 'Inicialização',
            description: 'Fluxo de inicialização da aplicação e gestão de dependências.',
            path: '/docs/initialization'
        }, {
            title: 'Resiliência',
            description: 'Sistema de retry, circuit breaker e rate limiting.',
            path: '/docs/resilience'
        }, {
            title: 'Autenticação',
            description: 'Fluxo de autenticação e gestão de tokens.',
            path: '/docs/auth'
        }, {
            title: 'Estado',
            description: 'Fluxo de gerenciamento de estado e cache.',
            path: '/docs/state'
        }, {
            title: 'Tema',
            description: 'Fluxo de gerenciamento de tema e estilo.',
            path: '/docs/theme'
        }, {
            title: 'Logging',
            description: 'Fluxo de gerenciamento de logs e auditoria.',
            path: '/docs/logging'
        }, {
            title: 'Erros',
            description: 'Fluxo de gerenciamento de erros e exceções.',
            path: '/docs/errors'
        }
    ];

    const componentStatusData = [
        {
            status: "stable",
            label: "ErrorBoundaryProvider",
            description: "Garante a captura global de erros inesperados"
        }, {
            status: "stable",
            label: "CoreLoggerProvider",
            description: "Inicializa o sistema de logging centralizado"
        }, {
            status: "stable",
            label: "BootstrapProvider",
            description: "Arranque dos sistemas e serviços essenciais"
        }, {
            status: "attention",
            label: "AuthProvider",
            description: "[PROBLEMA CRÍTICO] Timing incorreto na inicialização!",
            subComponents: [
                {
                    status: "attention",
                    label: "TokenManager",
                    description: "Gerenciamento de tokens de autenticação (JWT)"
                }, {
                    status: "attention",
                    label: "AuthService",
                    description: "Serviço dedicado à autenticação de usuários"
                }
            ]
        },
        // ... outros status ...
    ];

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Documentação ElosCloud
            </Typography>

            <Typography variant="body1" paragraph>
                Bem-vindo à documentação técnica do ElosCloud. Esta documentação é destinada a
                desenvolvedores e arquitetos que trabalham no projeto.
            </Typography>
            <ProjectInfoPanel componentStatusData={componentStatusData} />
            <Box sx={{
                    my: 4
                }}>
                <Typography variant="h6" gutterBottom>
                    Acesso Rápido
                </Typography>

                <Grid container spacing={3}>
                    {
                        quickLinks.map((link) => (
                            <Grid item xs={12} sm={6} md={4} key={link.path}>
                                <Card>
                                    <CardActionArea onClick={() => navigate(link.path)}>
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                {link.title}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                {link.description}
                                            </Typography>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        ))
                    }
                </Grid>
            </Box>

            {/* Inserindo o ProjectInfoPanel e passando os dados de status */}
            <Box sx={{
                    mt: 4
                }}>
      </Box>

            <Box sx={{
                    mt: 4
                }}>
                <Typography variant="h6" gutterBottom>
                    Contribuição
                </Typography>

                <Typography variant="body1">
                    Para contribuir com a documentação, siga as diretrizes de estilo e formato
                    estabelecidas. Use os componentes existentes e mantenha a consistência na
                    estrutura dos documentos.
                </Typography>
            </Box>
        </Box>
    );
};

export default DocHome;