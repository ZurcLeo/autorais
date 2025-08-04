// Script de debug para o sistema de suporte
// Execute no console do navegador

console.log("=== DEBUG DO SISTEMA DE SUPORTE ===");

// 1. Verificar se o serviço está registrado
const supportService = window.serviceLocator?.get('support');
console.log("1. SupportService:", supportService);

// 2. Verificar usuário atual e permissões
const authService = window.serviceLocator?.get('auth');
const currentUser = authService?.getCurrentUser();
console.log("2. Current User:", currentUser);
console.log("3. User Roles:", currentUser?.roles);

// 3. Verificar se o provider está funcionando
const supportProvider = document.querySelector('[data-testid="support-provider"]');
console.log("4. Support Provider Element:", supportProvider);

// 4. Testar chamada manual ao endpoint
if (supportService) {
    console.log("5. Testando fetchPendingTickets...");
    supportService.fetchPendingTickets(5)
        .then(tickets => {
            console.log("6. Tickets retornados:", tickets);
            console.log("7. Primeiro ticket:", tickets[0]);
            if (tickets[0]) {
                console.log("8. Campos disponíveis:", Object.keys(tickets[0]));
            }
        })
        .catch(error => {
            console.error("9. Erro ao buscar tickets:", error);
        });
}

// 5. Verificar estado do redux/context
setTimeout(() => {
    const storeState = window.__REDUX_DEVTOOLS_EXTENSION__ ? 
        window.__REDUX_DEVTOOLS_EXTENSION__.store?.getState() : 
        "Redux DevTools não disponível";
    console.log("10. Estado do store (support):", storeState?.support);
}, 2000);