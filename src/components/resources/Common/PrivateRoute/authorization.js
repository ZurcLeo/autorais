import React from 'react';
import { Button } from 'react-bootstrap';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../../../firebase.config';
import { IoLockOpenOutline, IoLockClosedOutline } from 'react-icons/io5';
import { useAuth } from '../../AuthService';

const Authorization = ({ userId, friendUid, isAuthorized, onStatusChange }) => {
const { currentUser } = useAuth();

        const handleAuthorizeFriend = async (friendUid) => {
            const userDocRef = doc(db, "usuario", currentUser.uid);
            await updateDoc(userDocRef, {
                amigosAutorizados: arrayUnion(friendUid)
            });

            try {
                const userDocRef = doc(db, "usuario", userId);
                await updateDoc(userDocRef, { amigosAutorizados: arrayUnion(friendUid) });
                onStatusChange(friendUid, true);
            } catch (error) {
                console.error("Erro ao autorizar amigo:", error);
            }
        };
    
        const handleDeauthorizeFriend = async (friendUid) => {
            const userDocRef = doc(db, "usuario", currentUser.uid);
            await updateDoc(userDocRef, {
                amigosAutorizados: arrayRemove(friendUid)
            });
            try {
                const userDocRef = doc(db, "usuario", userId);
                await updateDoc(userDocRef, { amigosAutorizados: arrayRemove(friendUid) });
                onStatusChange(friendUid, false);
            } catch (error) {
                console.error("Erro ao desautorizar amigo:", error);
            }
        };

    return (
        isAuthorized ? (
            <Button style={{ marginBottom: '10px', width: '90%' }} variant="outline-danger" onClick={() =>handleDeauthorizeFriend(friendUid)}>
                <IoLockClosedOutline /> Desautorizar
            </Button>
        ) : (
            <Button style={{ marginBottom: '10px', width: '90%' }} variant="outline-success" onClick={() => handleAuthorizeFriend(friendUid)}>
                <IoLockOpenOutline /> Autorizar
            </Button>
        )
    );
};

export default Authorization;
