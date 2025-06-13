import React from 'react';
import {
  Card,
  CardContent,
  Skeleton,
  Box,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography
} from '@mui/material';

// Skeleton para DashboardOverview
export const DashboardOverviewSkeleton = () => {
  return (
    <Box sx={{ mb: 4 }}>
      {/* Welcome Section Skeleton */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ flexGrow: 1 }}>
              <Skeleton variant="text" width="40%" height={40} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="80%" height={24} />
            </Box>
            <Skeleton variant="circular" width={80} height={80} />
          </Box>
        </CardContent>
      </Card>

      {/* Metrics Cards Skeleton */}
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Skeleton variant="circular" width={48} height={48} sx={{ mr: 2 }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Skeleton variant="text" width="60%" height={32} />
                    <Skeleton variant="text" width="40%" height={20} />
                  </Box>
                </Box>
                <Skeleton variant="text" width="80%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" width="100%" height={6} sx={{ borderRadius: 3 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// Skeleton para QuickActions
export const QuickActionsSkeleton = () => {
  return (
    <Card sx={{ mb: 4 }}>
      <CardContent sx={{ p: 3 }}>
        <Skeleton variant="text" width="30%" height={32} sx={{ mb: 3 }} />
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {[1, 2].map((item) => (
            <Skeleton key={item} variant="rectangular" width={140} height={36} sx={{ borderRadius: 2 }} />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

// Skeleton para CaixinhasSection
export const CaixinhasSectionSkeleton = () => {
  return (
    <Box component="section" sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Skeleton variant="text" width="30%" height={32} />
        <Skeleton variant="text" width="15%" height={24} />
      </Box>
      
      <Card>
        <List sx={{ p: 0 }}>
          {[1, 2, 3].map((item, index) => (
            <React.Fragment key={item}>
              <ListItem sx={{ py: 1.5, px: 2 }}>
                <ListItemAvatar>
                  <Skeleton variant="circular" width={48} height={48} />
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Skeleton variant="text" width="40%" height={24} />
                      <Skeleton variant="text" width="20%" height={24} />
                    </Box>
                  }
                  secondary={
                    <React.Fragment>
                      <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                        <Skeleton variant="text" width="25%" height={16} />
                        <Skeleton variant="text" width="30%" height={16} />
                      </Box>
                      
                      <Box sx={{ width: '100%', mt: 1 }}>
                        <Skeleton variant="rectangular" width="100%" height={4} sx={{ borderRadius: 2 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
                          <Skeleton variant="text" width="20%" height={16} />
                        </Box>
                      </Box>
                    </React.Fragment>
                  }
                />
              </ListItem>
              {index < 2 && <Box sx={{ mx: 2 }}><Skeleton variant="rectangular" height={1} /></Box>}
            </React.Fragment>
          ))}
        </List>
        
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Skeleton variant="rectangular" width={150} height={36} sx={{ margin: '0 auto', borderRadius: 20 }} />
        </Box>
      </Card>
    </Box>
  );
};

// Skeleton para MessagesSection
export const MessagesSectionSkeleton = () => {
  return (
    <Box component="section" sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Skeleton variant="text" width="25%" height={32} />
        <Skeleton variant="text" width="20%" height={24} />
      </Box>
      
      <Card>
        <List sx={{ p: 0 }}>
          {[1, 2, 3].map((item, index) => (
            <React.Fragment key={item}>
              <ListItem alignItems="flex-start" sx={{ px: 2, py: 1.5 }}>
                <ListItemAvatar>
                  <Skeleton variant="circular" width={48} height={48} />
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Skeleton variant="text" width="40%" height={20} />
                      <Skeleton variant="text" width="15%" height={16} />
                    </Box>
                  }
                  secondary={
                    <React.Fragment>
                      <Skeleton variant="circular" width={10} height={10} sx={{ mr: 0.5, display: 'inline-block' }} />
                      <Skeleton variant="text" width="60%" height={16} sx={{ display: 'inline-block' }} />
                    </React.Fragment>
                  }
                />
              </ListItem>
              {index < 2 && <Box sx={{ mx: 2 }}><Skeleton variant="rectangular" height={1} /></Box>}
            </React.Fragment>
          ))}
        </List>
        
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Skeleton variant="rectangular" width={120} height={36} sx={{ margin: '0 auto', borderRadius: 20 }} />
        </Box>
      </Card>
    </Box>
  );
};

// Skeleton para NotificationsSection
export const NotificationsSectionSkeleton = () => {
  return (
    <Box component="section" sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Skeleton variant="text" width="25%" height={32} />
        <Skeleton variant="text" width="25%" height={24} />
      </Box>

      <Card>
        <List sx={{ p: 0 }}>
          {[1, 2, 3].map((item, index) => (
            <React.Fragment key={item}>
              <ListItem alignItems="flex-start" sx={{ px: 2, py: 1.5 }}>
                <Box sx={{ mr: 2, mt: 0.5 }}>
                  <Skeleton variant="circular" width={24} height={24} />
                </Box>
                <ListItemText
                  primary={<Skeleton variant="text" width="70%" height={20} />}
                  secondary={<Skeleton variant="text" width="90%" height={16} sx={{ mt: 0.5 }} />}
                />
              </ListItem>
              {index < 2 && <Box sx={{ mx: 2 }}><Skeleton variant="rectangular" height={1} /></Box>}
            </React.Fragment>
          ))}
        </List>
      </Card>
    </Box>
  );
};

// Skeleton para ConnectionsSection
export const ConnectionsSectionSkeleton = () => {
  return (
    <Box component="section" sx={{ mb: 4 }}>
      {/* Best Friends Section */}
      <Box sx={{ mb: 6 }}>
        <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Card>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Skeleton variant="circular" width={64} height={64} />
                  <Box>
                    <Skeleton variant="text" width={120} height={24} />
                    <Skeleton variant="text" width={140} height={16} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Friends Section */}
      <Box>
        <Skeleton variant="text" width="20%" height={32} sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Card>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Skeleton variant="circular" width={64} height={64} />
                  <Box>
                    <Skeleton variant="text" width={100} height={24} />
                    <Skeleton variant="text" width={120} height={16} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

// Skeleton para Dashboard completo
export const DashboardSkeleton = () => {
  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <DashboardOverviewSkeleton />
      <QuickActionsSkeleton />
      <CaixinhasSectionSkeleton />
      <MessagesSectionSkeleton />
      <NotificationsSectionSkeleton />
      <ConnectionsSectionSkeleton />
    </Box>
  );
};

// Skeleton genérico para listas
export const ListSkeleton = ({ items = 3, showAvatar = true, lines = 2 }) => {
  return (
    <List>
      {Array.from({ length: items }).map((_, index) => (
        <ListItem key={index} sx={{ py: 1.5 }}>
          {showAvatar && (
            <ListItemAvatar>
              <Skeleton variant="circular" width={40} height={40} />
            </ListItemAvatar>
          )}
          <ListItemText
            primary={<Skeleton variant="text" width="60%" height={20} />}
            secondary={
              lines > 1 ? (
                <React.Fragment>
                  {Array.from({ length: lines - 1 }).map((_, lineIndex) => (
                    <Skeleton 
                      key={lineIndex} 
                      variant="text" 
                      width={`${Math.random() * 40 + 40}%`} 
                      height={16} 
                      sx={{ mt: 0.5, display: 'block' }}
                    />
                  ))}
                </React.Fragment>
              ) : null
            }
          />
        </ListItem>
      ))}
    </List>
  );
};

// Skeleton para Cards de métricas
export const MetricCardSkeleton = () => {
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Skeleton variant="circular" width={48} height={48} sx={{ mr: 2 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Skeleton variant="text" width="60%" height={32} />
            <Skeleton variant="text" width="40%" height={20} />
          </Box>
        </Box>
        <Skeleton variant="text" width="80%" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" width="100%" height={6} sx={{ borderRadius: 3 }} />
      </CardContent>
    </Card>
  );
};