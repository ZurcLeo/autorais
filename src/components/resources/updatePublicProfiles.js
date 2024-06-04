import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";

/**
 * Atualiza a lista de IDs de usuários públicos baseado no estado do perfilPublico do usuário.
 * @param {string} userId ID do usuário.
 * @param {boolean} makePublic Define se o perfil deve ser público ou privado.
 */
const updatePublicUserIds = async (userId, makePublic) => {
    const publicUserIdsDocRef = doc(db, "publico", "userIds");

    try {
        const publicUserIdsDoc = await getDoc(publicUserIdsDocRef);
        
        if (publicUserIdsDoc.exists()) {
            if (makePublic) {
                // Adiciona o userId ao array de userIds se o perfil for definido como público
                await updateDoc(publicUserIdsDocRef, {
                    userIds: arrayUnion(userId)
                });
                toast.success("Perfil definido como público.");
            } else {
                // Remove o userId do array de userIds se o perfil for definido como privado
                await updateDoc(publicUserIdsDocRef, {
                    userIds: arrayRemove(userId)
                });
                toast.success("Perfil definido como privado.");
            }
        } else {
            // Caso o documento não exista, ele deve ser criado. Este caso é mais administrativo e raro.
            await updateDoc(publicUserIdsDocRef, {
                userIds: makePublic ? [userId] : []
            });
            toast.info("Registro de usuários públicos inicializado.");
        }
    } catch (error) {
        console.error("Erro ao atualizar os IDs de usuários públicos:", error);
        toast.error("Erro ao atualizar a visibilidade do perfil.");
    }
};


export default updatePublicUserIds;