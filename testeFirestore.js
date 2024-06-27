const { getFirestore } = require('firebase-admin/firestore');
const admin = require('../eloswebapp/src/firebase.config');
const fs = require('fs');



admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

const db = getFirestore();

async function exportData() {
  const snapshot = await db.collection('usuario').get();
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  fs.writeFileSync('output.json', JSON.stringify(data, null, 2));
}

exportData();
