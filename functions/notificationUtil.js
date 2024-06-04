const admin = require('firebase-admin');

const addNotification = async (userId, notificationData) => {
    const notificationRef = admin.firestore().collection(`notificacoes`).doc(userId).collection('notifications');
    await notificationRef.add({
        ...notificationData,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
};

const addGlobalNotification = async (notificationData) => {
    const notificationRef = admin.firestore().collection('notificacoes').doc('global').collection('notifications');
    await notificationRef.add({
        ...notificationData,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        lida: {},
    });
};

module.exports = {
    addNotification,
    addGlobalNotification,
};