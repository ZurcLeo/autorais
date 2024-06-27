import { useEffect, useState } from 'react';
import { db } from '../../../../../firebase.config';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../../AuthService';

const useNotification = () => {
    const { currentUser } = useAuth();
    const [globalNotifications, setGlobalNotifications] = useState([]);
    const [privateNotifications, setPrivateNotifications] = useState([]);

    useEffect(() => {
        if (!currentUser) return;

        const privateNotificationsRef = collection(db, `notificacoes/${currentUser.uid}/notifications`);
        const globalNotificationsRef = collection(db, 'notificacoes/global/notifications');

        const privateQuery = query(privateNotificationsRef, where("lida", "==", false));
        const globalQuery = query(globalNotificationsRef);

        const unsubscribePrivate = onSnapshot(privateQuery, (snapshot) => {
            const loadedNotifications = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPrivateNotifications(loadedNotifications);
        });

        const unsubscribeGlobal = onSnapshot(globalQuery, (snapshot) => {
            const loadedNotifications = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    isRead: !!data.lida[currentUser.uid]
                };
            });
            setGlobalNotifications(loadedNotifications.filter(notification => !notification.isRead));
        });

        return () => {
            unsubscribePrivate();
            unsubscribeGlobal();
        };
    }, [currentUser]);

    const markAsRead = async (notificationId, type = 'private') => {
        const notificationDocRef = type === 'private'
            ? doc(db, `notificacoes/${currentUser.uid}/notifications`, notificationId)
            : doc(db, 'notificacoes/global/notifications', notificationId);

        if (type === 'private') {
            await updateDoc(notificationDocRef, { lida: true });
        } else {
            await updateDoc(notificationDocRef, {
                [`lida.${currentUser.uid}`]: new Date()
            });
        }
    };

    return { globalNotifications, privateNotifications, markAsRead };
};

export default useNotification;