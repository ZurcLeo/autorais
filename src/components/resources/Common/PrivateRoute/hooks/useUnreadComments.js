import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../../../../../firebase.config';
import { useAuth } from '../../../AuthService'; // Caminho fictício, atualize conforme necessário

const useUnreadComments = () => {
    const { currentUser } = useAuth();
    const [unreadCommentsCount, setUnreadCommentsCount] = useState(0);

    useEffect(() => {
        if (!currentUser || !currentUser.uid || !currentUser.lastLogin) return;
    
        const lastLoginDate = new Date(currentUser.lastLogin);
        
        if (isNaN(lastLoginDate)) {
            console.error("Invalid last login date:", currentUser.lastLogin);
            return;
        }
    
        const userPostsRef = collection(db, "postagens");
        const userPostsQuery = query(userPostsRef, where("usuarioId", "==", currentUser.uid));
    
        const unsubscribeFromPosts = onSnapshot(userPostsQuery, (postSnapshot) => {
            let totalUnread = 0;
            postSnapshot.docs.forEach((doc) => {
                const postId = doc.id;
                const commentsRef = collection(db, "postagens", postId, "comentarios");
                const commentsQuery = query(commentsRef, where("timestamp", ">", Timestamp.fromDate(lastLoginDate)));
    
                const unsubscribeFromComments = onSnapshot(commentsQuery, (commentSnapshot) => {
                    totalUnread += commentSnapshot.size;
                    setUnreadCommentsCount(totalUnread);
                });
            });
        });
    
        return () => {
            unsubscribeFromPosts();
        };
    }, [currentUser]);
    

    return unreadCommentsCount;
};

export default useUnreadComments;
