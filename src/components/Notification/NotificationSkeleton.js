import React from 'react';
import { Skeleton, Card, CardContent, Grid, Box, Fade } from '@mui/material';

/**
 * Componente de skeleton loading para notificações
 * Exibe um placeholder animado enquanto as notificações estão carregando
 * @param {Object} props
 * @param {boolean} props.visible - Controla se o skeleton é visível
 * @param {number} props.count - Número de skeletons a serem renderizados
 */
const NotificationSkeleton = ({ visible = true, count = 3 }) => (
  <Fade in={visible} timeout={300}>
    <div>
      {Array.from({ length: count }).map((_, index) => (
        <Grid item xs={12} key={index} sx={{ mb: 2 }}>
          <Card variant="outlined">
            <CardContent>
              <Box display="flex" alignItems="flex-start" gap={2}>
                {/* Avatar placeholder */}
                <Skeleton variant="circular" width={56} height={56} animation="wave" />
                
                <Box flex={1}>
                  {/* Título e hora */}
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Skeleton variant="text" width="60%" height={24} animation="wave" />
                    <Skeleton variant="text" width="20%" height={20} animation="wave" />
                  </Box>
                  
                  {/* Tag de tipo */}
                  <Skeleton variant="rounded" width="30%" height={24} animation="wave" sx={{ mb: 1 }} />
                  
                  {/* Conteúdo */}
                  <Skeleton variant="text" width="100%" height={20} animation="wave" />
                  <Skeleton variant="text" width="90%" height={20} animation="wave" />
                  <Skeleton variant="text" width="95%" height={20} animation="wave" />
                  
                  {/* Botões */}
                  <Box display="flex" justifyContent="flex-end" mt={2}>
                    <Skeleton variant="rounded" width={100} height={36} animation="wave" sx={{ mr: 1 }} />
                    <Skeleton variant="rounded" width={100} height={36} animation="wave" />
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </div>
  </Fade>
);

export default NotificationSkeleton;