import React from 'react';
import { Skeleton, Card, CardContent, Grid, Box } from '@mui/material';

const NotificationSkeleton = () => (
  <Grid item xs={12}>
    <Card variant="outlined">
      <CardContent>
        <Box display="flex" alignItems="center" gap={2}>
          <Skeleton variant="circular" width={56} height={56} />
          <Box flex={1}>
            <Skeleton variant="text" width="80%" height={20} />
            <Skeleton variant="text" width="60%" height={15} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  </Grid>
);

export default NotificationSkeleton;