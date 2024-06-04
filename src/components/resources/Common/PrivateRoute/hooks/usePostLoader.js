import { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

const usePostLoader = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPosts = async () => {
            const functions = getFunctions();
            const getPosts = httpsCallable(functions, 'getPosts');
            setLoading(true);
            setError(null);
            try {
                const result = await getPosts();
                setPosts(result.data);
            } catch (error) {
                console.error('Error fetching posts:', error);
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    return { posts, loading, error };
};

export default usePostLoader;
