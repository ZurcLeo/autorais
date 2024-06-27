import React, { useEffect, useState } from 'react';
import { db } from '../../firebase.config';
import { doc, getDoc } from 'firebase/firestore';
import './gridPublicUsers.css';

const GridPublicUsers = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchPublicUsers = async () => {
            try {
                const publicUserIdsRef = doc(db, 'publico', 'userIds');
                const docSnap = await getDoc(publicUserIdsRef);

                if (docSnap.exists()) {
                    setUsers(docSnap.data().users || []);
                } else {
                    console.error('No public user data found!');
                }
            } catch (error) {
                console.error('Error fetching public users:', error);
            }
        };

        fetchPublicUsers();
    }, []);

    return (
        <div className="grid-public">
            <h3>Nossos Elos</h3>
            <div className="grid">
                {users.length > 0 ? (
                    users.map((user, index) => (
                        <div key={index} className="card">
                            <img className="img-card" src={user.photoURL} alt="User Photo" />
                            <p>{user.displayName}</p>
                        </div>
                    ))
                ) : (
                    <p>No public users available.</p>
                )}
            </div>
        </div>
    );
};

export default GridPublicUsers;
