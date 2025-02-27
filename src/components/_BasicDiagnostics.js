// // src/components/BasicDiagnostics.js
// import React, { useState, useEffect } from 'react';
// import { coreLogger } from '../core/logging/CoreLogger';

// const BasicDiagnostics = () => {
//   const [logs, setLogs] = useState([]);
  
//   useEffect(() => {
//     coreLogger.logServiceState('BasicDiagnostics mounted', 'LIFECYCLE');
    
//     const unsubscribe = coreLogger.subscribe(setLogs);
    
//     return () => {
//       coreLogger.logServiceState('BasicDiagnostics unmounting', 'LIFECYCLE');
//       unsubscribe();
//     };
//   }, []);

//   if (logs.length === 0) return null;

//   return (
//     <div className="fixed bottom-4 right-4 w-96 max-h-96 bg-white border border-gray-200 shadow-lg rounded-lg overflow-auto p-4 z-50">
//       <h2 className="text-lg font-bold mb-4">Initialization Diagnostics</h2>
//       <div className="space-y-1">
//         {logs.map((log, index) => (
//           <div 
//             key={index} 
//             className={`text-xs font-mono ${
//               log.type === 'ERROR' ? 'text-red-600' :
//               log.type === 'WARN' ? 'text-yellow-600' :
//               'text-gray-600'
//             }`}
//           >
//             {log.timeSinceStart}ms - {log.type}: {log.message}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default BasicDiagnostics;