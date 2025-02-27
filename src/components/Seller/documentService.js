export const uploadDocument = async (file) => {
    // Simulated document upload
    console.log(`Uploading document: ${file.name}`);
    return Promise.resolve({ success: true });
  };
  
  export const verifyDocument = async (documentNumber) => {
    // Simulated document verification
    console.log(`Verifying document number: ${documentNumber}`);
    return Promise.resolve({ verified: true });
  };
  