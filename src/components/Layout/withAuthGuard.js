import React from 'react';
// import { useRootState } from '../../providers/RootStateProvider';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

export const withAuthGuard = (WrappedComponent) => {
//   return function WithAuthGuardComponent(props) {
    // const { readyStates } = useRootState();
    
    // if (!readyStates.auth) {
      return (
        <>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: '100vh'
        }}>
          <CircularProgress />
        </Box>
        </>
      );
    // }

//     return <WrappedComponent {...props} />;
//   };
};

export default withAuthGuard;