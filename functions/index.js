const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const stripe = require('stripe')(functions.config().stripe.secret_key);
const { RecaptchaEnterpriseServiceClient } = require('@google-cloud/recaptcha-enterprise');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const { addNotification, addGlobalNotification } = require('./notificationUtil');

admin.initializeApp();

const { createHash } = require('crypto');

// Configurar o transporte do nodemailer
const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: functions.config().smtp.user, // Use variável de ambiente
        pass: functions.config().smtp.pass  // Use variável de ambiente
    },
    tls: {
      ciphers: 'SSLv3'
    }
});


exports.getTurnCredentials = functions.https.onCall((data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Obtenha as variáveis de ambiente
    const turnUser = functions.config().turn.user;
    const turnPass = functions.config().turn.pass;
    const turnUrls = functions.config().turn.urls.split(',');

    const turnServer = {
        urls: turnUrls,
        username: turnUser,
        credential: turnPass
    };

    return {
        turnServer
    };
});

function getEmailTemplate(subject, content) {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${subject}</title>
            <style>
                @media screen and (max-width: 600px) {
                    .content {
                        width: 100% !important;
                        display: block !important;
                        padding: 10px !important;
                    }
                    .header, .body, .footer {
                        padding: 20px !important;
                    }
                }
            </style>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap" rel="stylesheet">
        </head>
        <body style="font-family: 'Poppins', Arial, sans-serif;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                    <td align="center" style="padding: 20px;">
                        <table class="content" width="600" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border: 1px solid #cccccc;">
                            <tr>
                                <td class="header" style="background-color: #345C72; padding: 40px; text-align: center; color: white; font-size: 24px;">
                                    ${subject}
                                </td>
                            </tr>
                            <tr>
                                <td class="body" style="padding: 40px; text-align: left; font-size: 16px; line-height: 1.6;">
                                    ${content}
                                </td>
                            </tr>
                            <tr>
                                <td class="footer" style="background-color: #333333; padding: 40px; text-align: center; color: white; font-size: 14px;">
                                    Copyright &copy; 2024 | ElosCloud
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
}

async function sendEmail(to, subject, content) {
    const htmlContent = getEmailTemplate(subject, content);
    const mailOptions = {
        from: 'suporte@eloscloud.com.br.br',
        to: to,
        subject: subject,
        html: htmlContent,
        text: content.replace(/<[^>]*>?/gm, '') // Remove HTML tags for plain text version
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

exports.generateInvite = functions.https.onCall(async (data, context) => {
    const { email } = data;

    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }

    const senderId = context.auth.uid;
    const inviteId = uuidv4();
    const createdAt = admin.firestore.FieldValue.serverTimestamp();

    const inviteData = {
        email,
        senderId,
        inviteId,
        createdAt,
        status: 'pending'
    };

    try {
        await admin.firestore().collection('convites').doc(inviteId).set(inviteData);

        const content = `
            Olá! <br>
            Você recebeu um convite. <br><br>
            Clique no botão abaixo para aceitar o convite:
            <br><br>
            <a href="https://eloscloud.com.br.br/invite?inviteId=${inviteId}" style="background-color: #345C72; color: #ffffff; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Aceitar Convite</a>
            <br><br>
            Obrigado, <br>
            Equipe ElosCloud
        `;

        await sendEmail(email, 'ElosCloud - Seu convite chegou!', content);

        const mailData = {
            to: [{ email: email }],
            subject: 'Seu convite chegou!',
            createdAt: createdAt,
            status: 'pending',
            data: {
                inviteId: inviteId,
                senderId: senderId,
                url: `https://eloscloud.com.br.br/invite?inviteId=${inviteId}`
            }
        };

        await admin.firestore().collection('mail').add(mailData);

        return { success: true };
    } catch (error) {
        console.error('Erro ao gerar convite:', error);
        throw new functions.https.HttpsError('internal', 'Erro ao gerar convite.');
    }
});

exports.validateInvite = functions.https.onCall(async (data, context) => {
    const { inviteId, userEmail } = data;
    
    // Checar se os parâmetros foram passados
    if (!inviteId || !userEmail) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing inviteId or userEmail');
    }
    
    const inviteRef = admin.firestore().collection('convites').doc(inviteId);
    const inviteDoc = await inviteRef.get();
    
    // Checar se o convite existe e não foi usado
    if (!inviteDoc.exists || inviteDoc.data().status !== 'pending' || inviteDoc.data().email !== userEmail) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid or already used invite.');
    }
    
    // Atualizar o convite para registrar o email do usuário
    await inviteRef.update({ validatedBy: userEmail });
    
    return { success: true };
  });
  
exports.invalidateInvite = functions.https.onCall(async (data, context) => {
    const { inviteId } = data;
    if (!inviteId) {
      throw new functions.https.HttpsError('invalid-argument', 'InviteId is required.');
    }
  
    const inviteRef = admin.firestore().collection('convites').doc(inviteId);
    const inviteDoc = await inviteRef.get();
  
    if (!inviteDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Invite not found.');
    }
  
    const inviteData = inviteDoc.data();
  
    if (inviteData.status === 'used') {
      throw new functions.https.HttpsError('failed-precondition', 'Invite already used.');
    }
  
    await inviteRef.update({ status: 'used' });

    const welcomeContent = `
        Olá! <br>
        Sua conta foi criada com sucesso. <br><br>
        Bem-vindo à ElosCloud! <br><br>
        Próximos passos: <br>
        -> Complete seu Perfil <br>
        -> Encontre Amigos <br>
        -> Converse em Chats Privados <br>
        -> Crie sua primeira Postagem <br>
        -> Envie e Receba Presentes <br>
        -> Realize check-in on-line no Airbnb <br>
        -> Convide seus amigos <br><br>
        Aproveite! Seus ElosCoins já estão disponíveis na sua conta<br>
        Obrigado, <br>
        Equipe ElosCloud.
    `;

    await sendEmail(inviteData.email, 'ElosCloud - Bem-vindo!', welcomeContent);
    
       // Registra a compra inicial de ElosCoins
       const userRef = admin.firestore().collection('usuario').doc(userId);
       const comprasRef = userRef.collection('compras');
       await comprasRef.add({
           quantidade: 5000,
           valorPago: 0,
           dataCompra: admin.firestore.FieldValue.serverTimestamp(),
           meioPagamento: 'oferta-boas-vindas'
       });
   

    await admin.firestore().collection('mail').add({
        to: [{ email: inviteData.email }],
        subject: 'ElosCloud - Bem-vindo!',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'sent',
        data: {
            inviteId: inviteId,
            userId: inviteData.usedBy,
            email: inviteData.email
        }
    });

    return { success: true };
});


exports.calculateJA3 = functions.region('us-central1').https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method === 'OPTIONS') {
            res.set('Access-Control-Allow-Origin', '*');
            res.set('Access-Control-Allow-Methods', 'GET, POST');
            res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            res.set('Access-Control-Max-Age', '3600');
            return res.status(204).send('');
        }

        try {
            const { version, cipherSuites, extensions, ellipticCurves, ellipticCurvePointFormats, userId } = req.body;

            // Verificar se já existe um JA3 para o usuário
            const userRef = admin.firestore().collection('usuario').doc(userId);
            const userDoc = await userRef.get();

            if (userDoc.exists && userDoc.data().ja3Hash) {
                return res.status(200).json({ ja3Hash: userDoc.data().ja3Hash });
            }

            // Calcular o JA3 se não existir
            const ja3String = `${version},${cipherSuites.join('-')},${extensions.join('-')},${ellipticCurves.join('-')},${ellipticCurvePointFormats.join('-')}`;
            const ja3Hash = createHash('md5').update(ja3String).digest('hex');

            // Armazenar no Firestore
            await userRef.set({ ja3Hash }, { merge: true });

            res.set('Access-Control-Allow-Origin', '*');
            res.status(200).json({ ja3Hash });
        } catch (error) {
            res.set('Access-Control-Allow-Origin', '*');
            res.status(500).json({ error: 'Failed to calculate JA3 hash', details: error.message });
        }
    });
});

async function createAssessment({
    projectID = "elossolucoescloud-1804e",
    recaptchaKey = "6LeOHeopAAAAANKidFB-GP_qqirmNYb9oF-87UZz",
    token,
    recaptchaAction = "purchase",
    userAgent,
    userIpAddress
}) {
    const client = new RecaptchaEnterpriseServiceClient();
    const projectPath = client.projectPath(projectID);

    const request = {
        assessment: {
            event: {
                token: token,
                siteKey: recaptchaKey,
                userAgent: userAgent,
                userIpAddress: userIpAddress,
                expectedAction: recaptchaAction,
            },
        },
        parent: projectPath,
    };

    const [response] = await client.createAssessment(request);

    if (!response.tokenProperties.valid) {
        console.log(`The CreateAssessment call failed because the token was: ${response.tokenProperties.invalidReason}`);
        return null;
    }

    if (response.tokenProperties.action === recaptchaAction) {
        console.log(`The reCAPTCHA score is: ${response.riskAnalysis.score}`);
        response.riskAnalysis.reasons.forEach((reason) => {
            console.log(reason);
        });
        return response.riskAnalysis.score;
    } else {
        console.log("The action attribute in your reCAPTCHA tag does not match the action you are expecting to score");
        return null;
    }
}

exports.createPaymentIntent = functions.region('us-central1').https.onRequest(async (req, res) => {
    cors(req, res, async () => {
        if (req.method === 'OPTIONS') {
            res.set('Access-Control-Allow-Origin', '*');
            res.set('Access-Control-Allow-Methods', 'GET, POST');
            res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            res.set('Access-Control-Max-Age', '3600');
            return res.status(204).send('');
        }

        res.set('Access-Control-Allow-Origin', '*');

        if (req.method !== 'POST') {
            return res.status(405).send('Method Not Allowed');
        }

        const { quantidade, valor, userId, description, recaptchaToken } = req.body;

        if (!quantidade || typeof quantidade !== 'number') {
            return res.status(400).send('Quantidade é obrigatória e deve ser um número.');
        }

        if (!valor || typeof valor !== 'number') {
            return res.status(400).send('Valor é obrigatório e deve ser um número.');
        }

        if (!userId || typeof userId !== 'string') {
            return res.status(400).send('UserId é obrigatório e deve ser uma string.');
        }

        if (!description || typeof description !== 'string') {
            return res.status(400).send('Description é obrigatória e deve ser uma string.');
        }

        if (!recaptchaToken || typeof recaptchaToken !== 'string') {
            return res.status(400).send('reCAPTCHA token é obrigatório e deve ser uma string.');
        }

        if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
            return res.status(403).send('Unauthorized');
        }

        const idToken = req.headers.authorization.split('Bearer ')[1];

        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            const email = decodedToken.email;

            const recaptchaScore = await createAssessment({
                projectID: 'elossolucoescloud-1804e',
                recaptchaKey: '6LeOHeopAAAAANKidFB-GP_qqirmNYb9oF-87UZz',
                token: recaptchaToken,
                recaptchaAction: 'purchase',
                userAgent: req.get('User-Agent'),
                userIpAddress: req.ip,
            });

            if (recaptchaScore === null || recaptchaScore < 0.5) {
                return res.status(400).send('Falha na verificação do reCAPTCHA.');
            }

            try {
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: Math.round(valor * 100),
                    currency: 'BRL',
                    description: description,
                    metadata: { userId, quantidade },
                    receipt_email: email,
                });

                // Registra a compra no Firestore
                const userRef = admin.firestore().collection('usuario').doc(userId);
                const comprasRef = userRef.collection('compras');
                await comprasRef.add({
                    quantidade: quantidade,
                    valorPago: valor,
                    dataCompra: admin.firestore.FieldValue.serverTimestamp(),
                    meioPagamento: 'stripe'
                });

                // Atualiza o saldo de ElosCoins do usuário
                await userRef.update({
                    saldoElosCoins: admin.firestore.FieldValue.increment(quantidade)
                });

                return res.status(200).send({ clientSecret: paymentIntent.client_secret });
            } catch (error) {
                return res.status(500).send({ error: 'Erro ao criar a intenção de pagamento', details: error.message });
            }
        } catch (error) {
            return res.status(403).send({ error: 'Unauthorized', details: error });
        }
    });
});

exports.registrarPagamento = functions.region('us-central1').https.onRequest(async (req, res) => {
    cors(req, res, async () => {
        if (req.method === 'OPTIONS') {
            res.set('Access-Control-Allow-Origin', '*');
            res.set('Access-Control-Allow-Methods', 'GET, POST');
            res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            res.set('Access-Control-Max-Age', '3600');
            return res.status(204).send('');
        }

        res.set('Access-Control-Allow-Origin', '*');

        if (req.method !== 'POST') {
            return res.status(405).send('Method Not Allowed');
        }

        const { quantidade, userId, descricao } = req.body;

        if (!quantidade || typeof quantidade !== 'number') {
            return res.status(400).send('Quantidade é obrigatória e deve ser um número.');
        }

        if (!userId || typeof userId !== 'string') {
            return res.status(400).send('UserId é obrigatório e deve ser uma string.');
        }

        if (!descricao || typeof descricao !== 'string') {
            return res.status(400).send('Descrição é obrigatória e deve ser uma string.');
        }

        if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
            return res.status(403).send('Unauthorized');
        }

        const idToken = req.headers.authorization.split('Bearer ')[1];

        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);

            const userRef = admin.firestore().collection('usuario').doc(userId);
            const pagamentosRef = userRef.collection('pagamentos');

            const userDoc = await userRef.get();
            if (!userDoc.exists || userDoc.data().saldoElosCoins < quantidade) {
                return res.status(400).send('Saldo insuficiente de ElosCoins.');
            }

            await pagamentosRef.add({
                quantidade: quantidade,
                descricao: descricao,
                dataPagamento: admin.firestore.FieldValue.serverTimestamp()
            });

            // Atualiza o saldo de ElosCoins do usuário
            await userRef.update({
                saldoElosCoins: admin.firestore.FieldValue.increment(-quantidade)
            });

            return res.status(200).send('Pagamento registrado com sucesso.');
        } catch (error) {
            return res.status(403).send({ error: 'Unauthorized', details: error });
        }
    });
});

exports.notifyStreamStarted = functions.https.onCall(async (data, context) => {
    const { userId, userName } = data;

    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const liveStreamLink = `https://eloscloud.com.br/LiveStreamViewer/${userId}`;

    const notificationRef = admin.firestore().collection('notificacoes').doc('global').collection('notifications');
    const liveStreamsRef = admin.firestore().collection('liveStreams');

    await notificationRef.add({
        userId,
        userName,
        conteudo: `${userName} iniciou uma transmissão ao vivo.`,
        link: liveStreamLink,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        lida: {}
    });

    await liveStreamsRef.doc(userId).set({
        userId,
        userName,
        link: liveStreamLink,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        isActive: true
    });

    return { success: true };
});

exports.checkTurnServer = functions.https.onCall((data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const turnServerConfig = {
        urls: functions.config().turn.urls.split(','),
        username: functions.config().turn.user,
        credential: functions.config().turn.pass
    };

    try {
        const iceServers = [{ urls: turnServerConfig.urls, username: turnServerConfig.username, credential: turnServerConfig.credential }];
        const pc = new RTCPeerConnection({ iceServers });

        pc.createDataChannel('test');
        pc.createOffer()
            .then(offer => pc.setLocalDescription(offer))
            .catch(error => {
                throw new functions.https.HttpsError('internal', 'Failed to connect to TURN server: ' + error.message);
            });

        return { success: true, message: 'TURN server is accessible' };
    } catch (error) {
        throw new functions.https.HttpsError('internal', 'Failed to connect to TURN server: ' + error.message);
    }
});



exports.checkVideoStream = functions.https.onCall((data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { userId } = data;
    const userRef = admin.firestore().collection('liveStreams').doc(userId);

    return userRef.get()
        .then(doc => {
            if (!doc.exists) {
                throw new functions.https.HttpsError('not-found', 'Live stream not found');
            }

            const streamData = doc.data();
            if (streamData.isActive) {
                return { success: true, message: 'Stream is active' };
            } else {
                throw new functions.https.HttpsError('internal', 'Stream is inactive or not sending data');
            }
        })
        .catch(error => {
            throw new functions.https.HttpsError('internal', 'Error checking video stream: ' + error.message);
        });
});


exports.notifyStreamStopped = functions.https.onCall(async (data, context) => {
    const { userId } = data;

    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const liveStreamsRef = admin.firestore().collection('liveStreams').doc(userId);

    await liveStreamsRef.update({
        isActive: false
    });

    return { success: true };
});

exports.sendOffer = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { offer, userId } = data;

    if (!offer || !offer.sdp || !offer.type) {
        throw new functions.https.HttpsError('invalid-argument', 'Offer is missing required fields');
    }

    const offerId = admin.firestore().collection('offers').doc().id;

    try {
        await admin.firestore().collection('offers').doc(offerId).set({
            from: context.auth.uid,
            to: userId,
            sdp: offer.sdp,
            type: offer.type,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`Offer ${offerId} successfully created`);
        return { success: true, offerId };
    } catch (error) {
        console.error('Error creating offer:', error);
        throw new functions.https.HttpsError('internal', 'Unable to create offer');
    }
});


exports.sendAnswer = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { answer, userId, from } = data;

    if (!answer || !answer.sdp || !answer.type) {
        throw new functions.https.HttpsError('invalid-argument', 'Answer is missing required fields');
    }

    const answerId = admin.firestore().collection('answers').doc().id;

    try {
        await admin.firestore().collection('answers').doc(answerId).set({
            from: context.auth.uid,
            to: from,
            sdp: answer.sdp,
            type: answer.type,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`Answer ${answerId} successfully created`);
        return { success: true, answerId };
    } catch (error) {
        console.error('Error creating answer:', error);
        throw new functions.https.HttpsError('internal', 'Unable to create answer');
    }
});

exports.sendCandidate = functions.https.onCall(async (data, context) => {
    const { candidate, to } = data;

    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const from = context.auth.uid;
    const candidateId = admin.firestore().collection('candidates').doc().id;

    try {
        await admin.firestore().collection('candidates').doc(candidateId).set({
            from,
            to,
            candidate,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`Candidate ${candidateId} successfully created`);
        return { success: true, candidateId };
    } catch (error) {
        console.error('Error creating candidate:', error);
        throw new functions.https.HttpsError('internal', 'Unable to create candidate');
    }
});

exports.addUser = functions.https.onCall(async (data, context) => {
    // Verifica autenticação
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Apenas usuários autenticados podem adicionar usuários.');
    }
    // Adiciona usuário no Firestore
    return db.collection('usuario').add(data)
      .then(docRef => {
        return { id: docRef.id };
      })
      .catch(error => {
        throw new functions.https.HttpsError('internal', error.message);
      });
  });
  
// Busca um usuário pelo ID
exports.getUser = functions.https.onCall(async (data, context) => {
    // Verifica autenticação
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Apenas usuários autenticados podem buscar usuários.');
    }
    
    try {
      const doc = await db.collection('usuario').doc(data.id).get();
      
      if (!doc.exists) {
        throw new functions.https.HttpsError('not-found', 'Usuário não encontrado.');
      }
  
      return doc.data();
    } catch (error) {
      throw new functions.https.HttpsError('internal', error.message);
    }
  });
  
exports.updateUser = functions.https.onCall(async (data, context) => {
    // Verifica se o usuário está autenticado
    if (!context.auth || context.auth.uid !== data.id) {
        throw new functions.https.HttpsError('permission-denied', 'Os usuários só podem atualizar seus próprios dados.');
    }
    
    // Verifica se o ID do usuário foi fornecido
    if (!data.id) {
        throw new functions.https.HttpsError('invalid-argument', 'O ID do usuário é necessário para atualizar.');
    }

    const userRef = db.collection('usuario').doc(data.id);

    return userRef.get()
        .then(doc => {
            if (!doc.exists) {
                throw new functions.https.HttpsError('not-found', 'Usuário não encontrado.');
            }

            // Atualiza o usuário com os dados fornecidos
            return userRef.update(data.updateFields);
        })
        .then(() => {
            return { result: `Usuário com ID: ${data.id} atualizado com sucesso.` };
        })
        .catch(error => {
            throw new functions.https.HttpsError('internal', error.message);
        });
});

exports.notifyAcceptance = functions.firestore
    .document("conexoes/{userId}/solicitadas/{solicitanteId}")
    .onUpdate(async (change, context) => {
        const beforeData = change.before.data();
        const afterData = change.after.data();

        if (beforeData.status !== "aprovada" && afterData.status === "aprovada") {
            const userId = context.params.userId;
            const solicitanteId = context.params.solicitanteId;

            const userRef = admin.firestore().doc(`usuario/${userId}`);
            const solicitanteRef = admin.firestore().doc(`usuario/${solicitanteId}`);

            try {
                await admin.firestore().runTransaction(async (transaction) => {
                    const userDoc = await transaction.get(userRef);
                    const solicitanteDoc = await transaction.get(solicitanteRef);

                    if (!userDoc.exists || !solicitanteDoc.exists) {
                        console.error("Documentos dos usuários não encontrados");
                        return;
                    }

                    const userData = userDoc.data();
                    const solicitanteData = solicitanteDoc.data();

                    const userAmigos = userData.amigos || [];
                    const solicitanteAmigos = solicitanteData.amigos || [];

                    if (!userAmigos.includes(solicitanteId)) {
                        userAmigos.push(solicitanteId);
                        transaction.update(userRef, { amigos: userAmigos });
                    }

                    if (!solicitanteAmigos.includes(userId)) {
                        solicitanteAmigos.push(userId);
                        transaction.update(solicitanteRef, { amigos: solicitanteAmigos });
                    }

                    // Adiciona o usuário que aceitou a solicitação à coleção 'ativas' do solicitante
                    const ativaSolicitanteRef = admin.firestore().doc(`conexoes/${solicitanteId}/ativas/${userId}`);
                    transaction.set(ativaSolicitanteRef, {
                        dataDoAceite: admin.firestore.FieldValue.serverTimestamp(),
                        status: 'aceita',
                        ...userData
                    });

                    // Adiciona o solicitante à coleção 'ativas' do usuário que aceitou a solicitação
                    const ativaUserRef = admin.firestore().doc(`conexoes/${userId}/ativas/${solicitanteId}`);
                    transaction.set(ativaUserRef, {
                        dataDoAceite: admin.firestore.FieldValue.serverTimestamp(),
                        status: 'aceita',
                        ...solicitanteData
                    });

                    // Atualiza o registro em 'solicitadas' para o solicitante, refletindo que a amizade foi aceita
                    const solicitadaSolicitanteRef = admin.firestore().doc(`conexoes/${solicitanteId}/solicitadas/${userId}`);
                    transaction.set(solicitadaSolicitanteRef, {
                        status: "aprovada",
                        dataDoAceite: admin.firestore.FieldValue.serverTimestamp(),
                        ...userData
                    }, { merge: true });
                });
                console.log("Amizade confirmada e registrada nos perfis dos usuários.");
            } catch (error) {
                console.error("Erro ao processar aceitação de amizade:", error);
                throw new functions.https.HttpsError('internal', 'Falha na transação de atualização de amizade.');
            }
        }

        return null;
    });
    
    exports.handleFriendshipChanges = functions.firestore
        .document("conexoes/{userId}/solicitadas/{solicitanteId}")
        .onUpdate(async (change, context) => {
            const beforeData = change.before.data();
            const afterData = change.after.data();
            const userId = context.params.userId;
            const solicitanteId = context.params.solicitanteId;
    
            // Caso a amizade seja desfeita
            if (beforeData.status !== "desfeita" && afterData.status === "desfeita") {
                await admin.firestore().runTransaction(async (transaction) => {
                    const userRef = admin.firestore().doc(`usuario/${userId}`);
                    const solicitanteRef = admin.firestore().doc(`usuario/${solicitanteId}`);
    
                    const userDoc = await transaction.get(userRef);
                    const solicitanteDoc = await transaction.get(solicitanteRef);
    
                    if (!userDoc.exists || !solicitanteDoc.exists) {
                        console.error("Documentos dos usuários não foram encontrados");
                        return;
                    }
    
                    // Remove o ID do solicitante do array de amigos do usuário
                    const userData = userDoc.data();
                    const solicitanteData = solicitanteDoc.data();
    
                    const userAmigos = userData.amigos || [];
                    const indexUser = userAmigos.indexOf(solicitanteId);
                    if (indexUser > -1) {
                        userAmigos.splice(indexUser, 1);
                        transaction.update(userRef, { amigos: userAmigos });
                    }
    
                    // Remove o ID do usuário do array de amigos do solicitante
                    const solicitanteAmigos = solicitanteData.amigos || [];
                    const indexSolicitante = solicitanteAmigos.indexOf(userId);
                    if (indexSolicitante > -1) {
                        solicitanteAmigos.splice(indexSolicitante, 1);
                        transaction.update(solicitanteRef, { amigos: solicitanteAmigos });
                    }
    
                    // Move o registro de amizade para a subcoleção 'inativas'
                    const inativaUserRef = admin.firestore().doc(`conexoes/${userId}/inativas/${solicitanteId}`);
                    const inativaSolicitanteRef = admin.firestore().doc(`conexoes/${solicitanteId}/inativas/${userId}`);
    
                    transaction.set(inativaUserRef, {
                        ...afterData,
                        dataAmizadeDesfeita: admin.firestore.FieldValue.serverTimestamp(),
                    });
    
                    transaction.set(inativaSolicitanteRef, {
                        ...afterData,
                        dataAmizadeDesfeita: admin.firestore.FieldValue.serverTimestamp(),
                    });
    
                    // Deleta o registro da amizade das 'ativas'
                    const ativaUserRef = admin.firestore().doc(`conexoes/${userId}/ativas/${solicitanteId}`);
                    const ativaSolicitanteRef = admin.firestore().doc(`conexoes/${solicitanteId}/ativas/${userId}`);
    
                    transaction.delete(ativaUserRef);
                    transaction.delete(ativaSolicitanteRef);
                });
                console.log("Amizade desfeita e registros movidos para 'inativas' para ambos os usuários, amigos removidos dos arrays.");
            }
    
            return null;
        });

        exports.handleFriendshipChangesNotification = functions.firestore
    .document("conexoes/{userId}/solicitadas/{solicitanteId}")
    .onUpdate(async (change, context) => {
        const beforeData = change.before.data();
        const afterData = change.after.data();
        const userId = context.params.userId;
        const solicitanteId = context.params.solicitanteId;

        // Verifica se a amizade foi desfeita
        if (beforeData.status !== "desfeita" && afterData.status === "desfeita") {
            try {
                const userRef = admin.firestore().doc(`usuario/${userId}`);
                const solicitanteRef = admin.firestore().doc(`usuario/${solicitanteId}`);

                const userData = (await userRef.get()).data();
                const solicitanteData = (await solicitanteRef.get()).data();

                if (!userData || !solicitanteData) {
                    console.error("Documentos dos usuários não foram encontrados");
                    return;
                }

                // Notificação para o usuário que teve a amizade desfeita
                const notificationRefUser = admin.firestore().collection(`notificacoes/${userId}/notifications`);
                await notificationRefUser.add({
                    tipo: "amizadeDesfeita",
                    conteudo: `${solicitanteData.nome} desfez a amizade com você.`,
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                    lida: false,
                    link: `/perfil/${solicitanteId}`
                });

                // Notificação para o usuário que desfez a amizade
                const notificationRefSolicitante = admin.firestore().collection(`notificacoes/${solicitanteId}/notifications`);
                await notificationRefSolicitante.add({
                    tipo: "amizadeDesfeita",
                    conteudo: `Você desfez a amizade com ${userData.nome}.`,
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                    lida: false,
                    link: `/perfil/${userId}`
                });

                console.log("Notificações de término de amizade criadas para ambos os usuários.");
            } catch (error) {
                console.error("Erro ao processar término de amizade:", error);
                throw new functions.https.HttpsError('internal', 'Falha ao processar término de amizade.');
            }
        }

        return null;
    });
    
        exports.notifyAcceptanceNotification = functions.firestore
        .document("conexoes/{userId}/solicitadas/{solicitanteId}")
        .onUpdate(async (change, context) => {
            const beforeData = change.before.data();
            const afterData = change.after.data();
            const userId = context.params.userId;
            const solicitanteId = context.params.solicitanteId;
    
            // Verifica se o status da solicitação mudou para 'aprovada'
            if (beforeData.status !== "aprovada" && afterData.status === "aprovada") {
                try {
                    const userRef = admin.firestore().doc(`usuario/${userId}`);
                    const solicitanteRef = admin.firestore().doc(`usuario/${solicitanteId}`);
    
                    const userData = (await userRef.get()).data();
                    const solicitanteData = (await solicitanteRef.get()).data();
    
                    if (!userData || !solicitanteData) {
                        console.error("Documentos dos usuários não encontrados");
                        return;
                    }
    
                    // Cria a notificação para o usuário que aceitou a solicitação
                    const notificationRefUser = admin.firestore().collection(`notificacoes/${userId}/notifications`);
                    await notificationRefUser.add({
                        tipo: "amizadeAceita",
                        conteudo: `Você e ${solicitanteData.nome} agora são amigos.`,
                        timestamp: admin.firestore.FieldValue.serverTimestamp(),
                        lida: false,
                        link: `/perfilAmigo/${solicitanteId}`
                    });
    
                    // Cria a notificação para o usuário que solicitou a amizade
                    const notificationRefSolicitante = admin.firestore().collection(`notificacoes/${solicitanteId}/notifications`);
                    await notificationRefSolicitante.add({
                        tipo: "amizadeAceita",
                        conteudo: `Sua solicitação de amizade foi aceita por ${userData.nome}.`,
                        timestamp: admin.firestore.FieldValue.serverTimestamp(),
                        lida: false,
                        link: `/perfil/${userId}`
                    });
                } catch (error) {
                    console.error("Erro ao criar notificações de amizade aceita:", error);
                    throw new functions.https.HttpsError('internal', 'Falha ao criar notificações.');
                }
            }
    
            return null;
        });
    

    
        exports.updateUserProfileInConnections = functions.firestore
        .document('usuario/{userId}')
        .onUpdate(async (change, context) => {
            const beforeData = change.before.data();
            const afterData = change.after.data();
    
            // Identifique as mudanças nos campos que são relevantes para as conexões ativas
            const updates = {};
            if (beforeData.fotoDoPerfil !== afterData.fotoDoPerfil) {
                updates.fotoDoPerfil = afterData.fotoDoPerfil;
            }
            if (beforeData.nome !== afterData.nome) {
                updates.nome = afterData.nome;
            }
            if (beforeData.email !== afterData.email) {
                updates.email = afterData.email;
            }
    
            // Só proceda se houver algo para atualizar
            if (Object.keys(updates).length > 0) {
                const userId = context.params.userId;
                const amigos = afterData.amigos || []; // Array de UIDs dos amigos
    
                const batch = admin.firestore().batch();
    
                amigos.forEach(amigoId => {
                    const friendActiveRef = admin.firestore().doc(`conexoes/${amigoId}/ativas/${userId}`);
                    batch.update(friendActiveRef, updates);
                });
    
                try {
                    await batch.commit();
                    console.log('Perfil atualizado nas conexões ativas com sucesso.');
                } catch (error) {
                    console.error("Erro ao atualizar conexões:", error);
                    return null;
                }
            }
    
            return null;
        });
    
    exports.onMessageSent = functions.firestore
  .document('mensagens/{conversaId}/msgs/{messageId}')
  .onCreate(async (snapshot, context) => {
    const messageData = snapshot.data();
    const { conversaId } = context.params;
    const destinatarioId = messageData.uidDestinatario;

    // Pega o documento do usuário destinatário
    const destinatarioDocRef = admin.firestore().doc(`usuario/${destinatarioId}`);
    const destinatarioDoc = await destinatarioDocRef.get();

    if (!destinatarioDoc.exists) {
      console.log('Documento do destinatário não encontrado');
      return null;
    }

    const destinatarioData = destinatarioDoc.data();
    const conversasComMensagensNaoLidas = destinatarioData.conversasComMensagensNaoLidas || [];

    // Se a conversa ainda não está marcada como tendo mensagens não lidas, atualize-a
    if (!conversasComMensagensNaoLidas.includes(conversaId)) {
      await destinatarioDocRef.update({
        conversasComMensagensNaoLidas: [...conversasComMensagensNaoLidas, conversaId]
      });
    }

    return null;
  });

  exports.onMessageRead = functions.firestore
  .document('mensagens/{conversaId}/msgs/{messageId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const { conversaId, messageId } = context.params;
    const destinatarioId = newData.uidDestinatario;

    if (newData.lido) {
      // Verifica se existem outras mensagens não lidas nesta conversa
      const msgsQuerySnapshot = await admin.firestore()
        .collection(`mensagens/${conversaId}/msgs`)
        .where('uidDestinatario', '==', destinatarioId)
        .where('lido', '==', false)
        .get();

      if (msgsQuerySnapshot.empty) {
        // Se todas as mensagens foram lidas, remova a conversa do campo de mensagens não lidas
        const destinatarioDocRef = admin.firestore().doc(`usuario/${destinatarioId}`);
        await destinatarioDocRef.update({
          conversasComMensagensNaoLidas: admin.firestore.FieldValue.arrayRemove(conversaId)
        });
      }
    }

    return null;
  });
  
  exports.createGlobalNotification = functions.https.onCall(async (data, context) => {
    const { message, userId, userName } = data;

    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }

    const notificationRef = admin.firestore().collection('notificacoes').doc('global').collection('notifications');
    await notificationRef.add({
        conteudo: message,
        userId,
        userName,
        link: '',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        tipo: 'global',
        lida: {}
    });

    return { success: true };
});

exports.createPrivateNotification = functions.https.onCall(async (data, context) => {
    const { userId, message } = data;

    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }

    const notificationRef = admin.firestore().collection('notificacoes').doc(userId).collection('notifications');
    await notificationRef.add({
        conteudo: message,
        link: '',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        tipo: 'private',
        lida: false
    });

    return { success: true };
});

exports.createCommentNotification = functions.firestore
  .document('postagens/{postId}/comentarios/{commentId}')
  .onCreate(async (snapshot, context) => {
      const postId = context.params.postId;
      const commentData = snapshot.data();

      const postRef = admin.firestore().doc(`postagens/${postId}`);
      const postSnapshot = await postRef.get();
      const postData = postSnapshot.data();

      if (!postData) return null; // Postagem não encontrada

      if (postData.usuarioId === commentData.usuarioId) return null; // Não enviar notificação se o comentário for do próprio usuário

      const notificationData = {
          tipo: "comentario",
          conteudo: `${commentData.usuarioNome} comentou '${commentData.texto}' na sua postagem.`,
          lida: false,
          link: `/postagens/${postId}`
      };
      await addNotification(postData.usuarioId, notificationData);
      return null;
  });

exports.createReactionNotification = functions.firestore
    .document('postagens/{postId}/reacoes/{reactionId}')
    .onCreate(async (snapshot, context) => {
        const postId = context.params.postId;
        const reactionData = snapshot.data();

        const postRef = admin.firestore().doc(`postagens/${postId}`);
        const postSnapshot = await postRef.get();
        const postData = postSnapshot.data();

        if (!postData) return null; // Postagem não encontrada

        if (postData.usuarioId === reactionData.docId) return null; // Ignorar auto-reações

        const notificationData = {
            tipo: "reacao",
            conteudo: `${reactionData.senderName} reagiu com ${reactionData.tipoDeReacao} à sua postagem.`,
            lida: false,
            link: `/postagens/${postId}`
        };
        await addNotification(postData.usuarioId, notificationData);
        return null;
    });

exports.createGiftsNotification = functions.firestore
    .document('postagens/{postId}/gifts/{giftId}')
    .onCreate(async (snapshot, context) => {
        const postId = context.params.postId;
        const giftsData = snapshot.data();

        const postRef = admin.firestore().doc(`postagens/${postId}`);
        const postSnapshot = await postRef.get();
        const postData = postSnapshot.data();

        if (!postData) return null; // Postagem não encontrada

        if (postData.usuarioId === giftsData.usuarioId) return null; // Ignorar auto-reações

        const notificationData = {
            tipo: "presente",
            conteudo: `${giftsData.senderName} te enviou ${giftsData.nome} (ℰ$${giftsData.valor}).`,
            lida: false,
            link: `/postagens/${postId}`
        };
        await addNotification(postData.usuarioId, notificationData);
        return null;
    });

    exports.getPosts = functions.https.onCall(async (data, context) => {
        // Verificar autenticação
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
        }
    
        const userId = context.auth.uid;
        const db = admin.firestore();
        const userRef = db.collection('usuario').doc(userId);
        const userDoc = await userRef.get();
        const userData = userDoc.data();
        const { amigosAutorizados = [], perfilPublico } = userData;
    
        // Buscar IDs de usuários com perfil público
        const publicUserIdsDoc = await db.doc("publico/userIds").get();
        const publicUserIds = publicUserIdsDoc.exists ? publicUserIdsDoc.data().userIds : [];
    
        // Query para buscar postagens visíveis para o usuário
        let visiblePosts = [];
        const postsRef = db.collection('postagens');
        const snapshot = await postsRef.get();
    
        snapshot.forEach(doc => {
            let post = doc.data();
            const isPublicUser = publicUserIds.includes(post.usuarioId);
    
            if ((isPublicUser && post.visibilidade === 'publico') || post.usuarioId === userId || amigosAutorizados.includes(post.usuarioId)) {
                visiblePosts.push({ ...post, id: doc.id });
            } else if (post.visibilidade === 'Privado' && (amigosAutorizados.includes(post.usuarioId) || post.usuarioId === userId)) {
                visiblePosts.push({ ...post, id: doc.id });
            }
        });
    
        return visiblePosts;
    });    

    exports.updatePublicUserList = functions.firestore
    .document('usuario/{userId}')
    .onUpdate((change, context) => {
        const before = change.before.data();
        const after = change.after.data();
        const userId = context.params.userId;

        if (before.perfilPublico === after.perfilPublico) {
            console.log('Perfil público não alterado, nenhuma ação necessária.');
            return null;
        }

        const publicUserIdsRef = admin.firestore().doc('publico/userIds');
        return admin.firestore().runTransaction(async transaction => {
            const publicUserIdsDoc = await transaction.get(publicUserIdsRef);

            if (!publicUserIdsDoc.exists) {
                console.error('Documento de IDs públicos não existe, inicializando documento...');
                const initData = {
                    users: []  // Inicialize com um array vazio para armazenar objetos de usuário
                };
                transaction.set(publicUserIdsRef, initData);
                return initData;
            }

            let users = publicUserIdsDoc.data().users || [];
            if (after.perfilPublico) {
                // Adiciona userId e foto ao array se o perfil for público agora
                if (!users.some(user => user.userId === userId)) {
                    users.push({ userId: userId, photoURL: after.fotoDoPerfil });  // Supondo que a URL da foto seja armazenada como 'photoURL'
                    console.log(`Adicionando ${userId} à lista de usuários públicos com foto ${after.photoURL}.`);
                }
            } else {
                // Remove userId do array se o perfil não for mais público
                users = users.filter(user => user.userId !== userId);
                console.log(`Removendo ${userId} da lista de usuários públicos.`);
            }

            transaction.update(publicUserIdsRef, { users });
        });
    });

