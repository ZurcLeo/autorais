const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
var serviceAccount = require("./serviceAccountKeys.json");
const { queries } = require('@testing-library/react');
const { QuerySnapshot } = require('firebase/firestore');
// Inicializa o Firebase Admin
admin.initializeApp({
  // sua configuração do Firebase
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore()
let customerRef = db.collection('connections');

customerRef.get().then((QuerySnapshot) => {
  QuerySnapshot.forEach(document => {
    console.log(document.data())
  });
})

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint para obter o token personalizado do Firebase
app.get('/getFirebaseToken', async (req, res) => {
    // O token JWT é enviado no cabeçalho de autorização
    const authHeader = req.headers.authorization;
    const jwtToken = authHeader && authHeader.split(' ')[1];

    // Valida o JWT e extrai o UID (este passo varia dependendo do seu sistema)
    const uid = validateAndExtractUID(jwtToken); // Implemente esta função conforme necessário

    try {
        const firebaseToken = await admin.auth().createCustomToken(uid);
        res.json({ firebaseToken });
    } catch (error) {
        console.error('Erro ao criar token personalizado do Firebase:', error);
        res.status(500).send('Erro ao criar token personalizado do Firebase');
    }
});



// Endpoint para criar um usuário no Firebase
app.post('/create-firebase-user', async (req, res) => {
  // A obtenção do uid e email do usuário precisará ser adaptada conforme seu sistema de autenticação
  const { uid, email } = req.body;

  try {
    const user = await admin.auth().createUser({
      uid,
      email,
    });
    return res.status(201).send(user);
  } catch (error) {
    console.error('Erro ao criar usuário no Firebase:', error);
    return res.status(500).send('Erro ao criar usuário no Firebase');
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));
