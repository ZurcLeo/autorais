// import React, { useEffect } from 'react';
// // import { CoreStateProvider } from '../core/states/CoreStateManager';
// // import { AuthProvider } from '../providers/AuthProvider';
// import { UserProvider } from '../providers/UserProvider';
// // import { NotificationProvider } from '../context/NotificationContext';
// // import { ConnectionProvider } from '../context/ConnectionContext';
// // import { MessageProvider } from '../context/MessageContext';
// // import { ValidationProvider } from '../context/ValidationContext';
// // import { InterestsProvider } from '../context/InterestsContext';
// // import { CaixinhaProvider } from '../context/CaixinhaContext';
// // import { BankingProvider } from '../context/BankingContext';
// // import { PaymentProvider } from '../context/PaymentContext';
// // import { DashboardProvider } from '../context/DashboardContext';
// import {RootAppWrapper} from '../components/RootAppWrapper';
// import { coreLogger } from '../core/logging/CoreLogger';
// import { LOG_LEVELS } from '../reducers/metadata/metadataReducer';
// import DocViewer from './coreDocs/DocViewer/index.tsx';

// const MODULE_NAME = 'AppProviders';

// const AppProviders = ({ children }) => {
//   useEffect(() => {
//     coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.LIFECYCLE, 'Providers mounting', {
//       environment: process.env.NODE_ENV
//     });

//     return () => {
//       coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.LIFECYCLE, 'Providers unmounting');
//     };
//   }, []);

//   return (
//           <UserProvider>
//             {/* <NotificationProvider>
//               <MessageProvider>
//                 <ConnectionProvider>
//                   <InterestsProvider>
//                     <CaixinhaProvider>
//                       <BankingProvider>
//                         <PaymentProvider>
//                           <DashboardProvider> */}
//                             {children}
//                             <DocViewer />
//                           {/* </DashboardProvider>
//                         </PaymentProvider>
//                       </BankingProvider>
//                     </CaixinhaProvider>
//                   </InterestsProvider>
//                 </ConnectionProvider>
//               </MessageProvider>
//             </NotificationProvider> */}
//           </UserProvider>

//   );
// };

// export default AppProviders;