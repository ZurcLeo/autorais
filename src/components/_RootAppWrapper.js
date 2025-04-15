// import React, { useEffect } from 'react';
// import { CoreStateProvider } from '../core/states/CoreStateManager';
// import AppProviders from '../providers/Providers';
// import { coreLogger } from '../core/logging';
// import { LOG_LEVELS } from '../core/logging';

// const MODULE_NAME = 'RootAppWrapper';
// const isDevelopment = process.env.NODE_ENV === 'development';

// export const RootAppWrapper = ({ children }) => {
//   useEffect(() => {
//     coreLogger.logServiceInitStart('RootAppWrapper', {
//       environment: process.env.NODE_ENV,
//       isDevelopment
//     });

//     return () => {
//       coreLogger.logServiceInitComplete('RootAppWrapper');
//     };
//   }, []);

//   return (
//     <CoreStateProvider>
//       <AppProviders>
//         {children}
//       </AppProviders>
//     </CoreStateProvider>
//   );
// };