import React, {useLayoutEffect} from 'react';
import FoodServiceMockUp from '../imgs/portfolio/foodservice/FoodServiceMockUp.png'
import FoodServiceMenu from '../imgs/portfolio/foodservice/telas/FoodServiceTelaMenu.png'
import FoodServiceTelaPrincipal from '../imgs/portfolio/foodservice/telas/FoodServiceTelaPrincipal.png'
import FoodServiceReview from '../imgs/portfolio/foodservice/telas/FoodServiceTelaReview.png'
import FoodServiceTelaPayments from '../imgs/portfolio/foodservice/telas/FoodServiceTelaPayments.png'
import FoodServiceTelaCurrentOrder from '../imgs/portfolio/foodservice/telas/FoodServiceTelaCurrentOrder.png'
import FoodServiceTestAddItem from '../imgs/portfolio/foodservice/FoodServiceTestAddItem.jpg'
import FoodServiceTestMainScreen from '../imgs/portfolio/foodservice/FoodServiceTestMainScreen.jpg'
import FoodServiceTestSearch from '../imgs/portfolio/foodservice/FoodServiceTestSearch.jpg'
import FoodServicePrototypeLow from '../imgs/portfolio/foodservice/FoodServicePrototypeHighFidelity.png'
// import BasePDF from '../attc/base-estudo-de-caso-detalhado.pdf'
import Hero from "./Hero";

import FoodServiceMockUpTwo from '../imgs/portfolio/foodservice/FoodServiceMockUpTwo.png'

const ProjectStyle = {
    margin: '50px auto',
    width: '70%',
    display: 'block',
    opacity: '0.9',
    justifyContent: 'center',
    alignItems: 'center'
}

const ListStyle = {
    width: '100%',
    margin: '20px auto',
    backgroundColor: '#eae0d0',
    // padding: '25px',
    borderRadius: '10px',
    textAlign: 'left',
    display: 'block',
    listDecoration: 'none'
}

const BlockStyle = {
    backgroundColor: '#f7f3ea',
    borderRadius: '10px',
    padding: '25px',
    margin: '20px auto',
    width: '100%'
}

const ImgStyle = {
    maxWidth: '100%',
    height: 'auto'
}

const ImgFtStyle = {
    // width: '600px', /* Defina a largura desejada para o quadrado perfeito */
    // height: '600px', /* Defina a altura desejada para o quadrado perfeito */
    // overflow: 'hidden',
    borderRadius: '10px',
    padding: '0'
}

const ScreenStyle = {
    margin: 'auto',
    maxWidth: '70%',
    height: 'auto'
}

const Titulo = {
    padding: '10px 10px 0 10px',
    textAlign: 'center'
}

const Conteudo = {
    padding: '10px',
    width: '100%',
    textAlign: 'center'
}

const FtStyle = {
    width: '100%',
    height: 'auto',
    objectFit: 'contain',
    objectPosition: 'center'
}

// const Interactive = {   border: '1px solid rgba(0, 0, 0, 0.1)' }

function FoodService() {
    useLayoutEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    return (

        <div>
            <Hero title='FoodServiceApp'/>
            <div style={ProjectStyle}>
                <h5>Apresentação do Projeto "FoodServiceApp"</h5>

                <p>O objetivo principal era cumprir o desafio de criar um aplicativo que
                    recebesse avaliações de restaurantes, inclusive os de rua, utilizando o
                    mecanismo do Google para indicar e permitir avaliações de clientes que tiveram a
                    experiência naquele estabelecimento.
                </p>
                <p>Durante o desenvolvimento do projeto, vários desafios foram apresentados,
                    criando novas possibilidades e novos rumos para o aplicativo que inicialmente
                    serviria apenas para avaliar restaurantes de rua.
                </p>
                <p>Todo o projeto foi desenvolvido em 60 dias, entre os meses de Maio e Julho de
                    2021.
                </p>
                <div className='visao-geral' style={BlockStyle}>
                    <figure>
                        <img
                            src={FoodServiceMockUp}
                            style={ImgStyle}
                            alt='Dois celulares empilhados apresentando duas telas do aplicativo FoodService em uso'></img>
                        <figcaption>MockUp do Aplicativo FoodServiceApp</figcaption>
                    </figure>
                    <h6>Visão Geral</h6>
                    <p>
                        O público-alvo do aplicativo FoodService são os usuários consumidores de
                        restaurantes de rua e delivery de comida.
                        <br/>O projeto principal é permitir que o usuário faça avaliações de
                            restaurantes em que tenha consumido, seja presencialmente ou por delivery.
                        <br/>Os resturantes poderão validar suas contas, criar um perfil e
                            disponibilizar um menu, cada restaurante paga 5% sobre o pedido realizado pelo
                            cliente na plataforma.
                        <br/>A entrega será sempre realizada por parceiros especializados em delivery,
                            permitindo que o dono de restaurante mantenha o foco em seu estabelecimento e
                            trazendo comodidade.
                    </p>
                    <div className='list'>

                        <figure>
                            <img
                                src={FoodServiceTelaPrincipal}
                                style={ScreenStyle}
                                alt='Tela Principal do FoodService na Visão do Cliente, a tela é mostrada em um celular que está sendo segurado por uma mão de madeira'></img>
                            <figcaption>Tela - Principal do FoodService App</figcaption>
                        </figure>
                        <div style={ListStyle}>
                            <div style={Titulo}>
                                <strong>Busca nas Proximidades</strong>
                            </div>
                            <p style={Conteudo}>Utilizando dados públicos disponíveis no Google, o
                                FoodService usa a localização do GPS para oferecer os restsurantes de rua mais
                                próximos do cliente.
                                <br/>O usuário será capaz de selecionar entre diferentes filtros e buscar por
                                    restaurantes, pratos ou locais.
                            </p>
                        </div>

                        <figure>
                            <img
                                src={FoodServiceMenu}
                                style={ScreenStyle}
                                alt='Tela de cardápio do resturante na visão do cliente, a tela é mostrada em um celular que está sendo segurado por uma mão de madeira'></img>
                            <figcaption>Tela - Cardápio Restaurante</figcaption>
                        </figure>
                        <div style={ListStyle}>
                            <div style={Titulo}>
                                <strong>Cardápios Personalizados</strong>
                            </div>
                            <p style={Conteudo}>O Restaurante que validar sua identidade de acordo com as regras do app
                            poderão incluir seus cardápios, selecionar mecanismos de pagamento próprio ou usar os do app
                            e manter contato com clientes e fornecedores.
                                <br/>O cliente terá acesso ao cardápido, valor de taxa de entrega e perfil dos restaurantes
                                onde poderá selecionar os itens de seu pedido. Só é possível pedir em um restaurante por vez.
                                <br/>Durante o pedido o cliente poderá escolher se deseja realizar o cadastro na plataforma
                                ou pedir sem cadastrar. O usuário que decide seguir sem criar uma conta terá seus pedidos associados
                                ao telefone de contato informado no primeiro pedido bem sucedido.
                            </p>
                        </div>

                        <figure>
                            <img
                                src={FoodServiceReview}
                                style={ScreenStyle}
                                alt='Tela de avaliação do resturante na visão do cliente, a tela é mostrada em um celular que está sendo segurado por uma mão de madeira'></img>
                            <figcaption>Tela - Avaliações de Restaurantes</figcaption>
                        </figure>
                        <div style={ListStyle}>
                            <div style={Titulo}>
                                <strong>Avaliações</strong>
                            </div>
                            <p style={Conteudo}>Os pedidos finalizados com sucesso ficam disponíveis para avaliação.
                            Uma vez que o pedido é finalizado, o usuário terá 30 dias para avaliar. O restaurante poderá
                            enviar mensagens pelo chat do cliente até que ele avalie o pedido ou 30 dias após o pedido, o que
                            acontecer primeiro.
                                <br/>O cliente deve selecionar a quantidade de estrelas para 5 categorias: sabor, qualidade, temperatura, quantidade e valor.
                                A nota final será a média simples das 5 notas, sendo assim, a quantidade de estrelas terá, pelo menos,
                                uma casa decimal. 
                                <br/>O usuário pode escolher entre avaliar publicamente ou de forma anônima. A avaliação pública 
                                permitirá ao usuário exibir ou não os itens que foram pedidos - os pratos avaliados terão sua
                                média calculada a partir de avaliações.
                            </p>
                        </div>

                        <figure>
                            <img
                                src={FoodServiceTelaCurrentOrder}
                                style={ScreenStyle}
                                alt='Tela de acompanhamento do pedido na visão do cliente, a tela é mostrada em um celular que está sendo segurado por uma mão de madeira'></img>
                            <figcaption>Tela - Acompanhamento do Pedido</figcaption>
                        </figure>
                        <div style={ListStyle}>
                            <div style={Titulo}>
                                <strong>Acompanhamento do Pedido</strong>
                            </div>
                            <p style={Conteudo}>Quando confirmado, o pedido deve mostrar o entregador e sua localização relativa.
                                <br/>Por medida de segurança, o entregador só tem acesso ao seu endereço completo quando retira o pedido,
                                o app mostrará apenas a região/bairro em que deve ser entregue.
                                <br/>O entregador poderá entrar em contato com você, ligando ou enviando mensagem pelo chat. As informações
                                do entregador só estarão disponíveis depois que o pedido mudar para a situação "Pronto".
                            </p>
                        </div>

                        <figure>
                            <img
                                src={FoodServiceTelaPayments}
                                style={ScreenStyle}
                                alt='Tela de Pagamentos na visão do cliente, a tela é mostrada em um celular que está sendo segurado por uma mão de madeira'></img>
                            <figcaption>Tela - Pagamentos</figcaption>
                        </figure>
                        <div style={ListStyle}>
                            <div style={Titulo}>
                                <strong>Pagamentos</strong>
                            </div>
                            <p style={Conteudo}>O usuário pode cadastrar sua forma de pagamento preferida antes de
                            realizar o pedido, clicando em Menu e depois em Pagamentos.
                                <br/>O usuário só poderá selecionar Dinheiro como forma de pagamento quando já tiver
                                uma ordem bem sucedida. O restaurante escolhe quais formas de pagamento devem ser
                                aceitas por seu estabelecimento.
                            </p>
                        </div>
                    </div>

                </div>
                <div className='analise-e-pesquisa' style={BlockStyle}>

                    <h6>Análise e Pesquisa</h6>
                    <p>
                        Entrevistar usuários e realizar os testes de usabilidade foram fatores determinantes
                        para construir um aplicativo mais inclusivo e que atendesse as expectativas dos usuários.
                        <br/>Incialmente foram realizadas 10 entrevistas com usuários pré-selecionados a partir de
                        um filtro que buscava pessoas acima dos 20 anos de idade, consumidora de restaurantes de rua ou 
                        foodtrucks e que usa o Google como ferramenta de avaliação.
                        <br/>Analisando as pesquisas, ficou claro que o objetivo inicial poderia ser mantido, 
                        mas que as necessidades dos usuários iam além de uma proposta de desenvolvimento de um app
                        para avaliar restaurantes: os usuários também queriam poder pedir para esses restaurantes
                        fazerem entregas.
                        <br/>A sugestão então foi criar um sistema que capture as informações dos negócios registrados 
                        no Google e gerar uma notificação automática para o restaurante validar seu cadastro sempre que 
                        um cliente clicar em seu estabelecimento no app.
                        <br/>O cliente só pode avaliar um restaurante de rua que não está validado no FoodService enviando
                        uma foto do prato avaliado, esse foi o mecanismo inicial para evitar avaliações falsas, além da verificação
                        da conta de usuário.
                    </p>
                    <div className='list' style={ImgFtStyle}>
                        <figure>
                            <img
                                src={FoodServiceTestSearch}
                                style={FtStyle}
                                alt='Celular mostrando um protótipo de aplicativo de pedido de comida para entrega sendo segurado por uma mão com unhas pintadas.'></img>
                            <figcaption>Foto - Usuário testando o protótipo em baixa fidelidade do aplicativo FoodServiceApp.</figcaption>
                        </figure>
                        <div style={ListStyle}>
                            <div style={Titulo}>
                                <strong>Testes de Usabilidade</strong>
                            </div>
                            <div>
                                <div style={Titulo}>
                                    <strong>Navegação Deficiente</strong>
                                </div>
                                <p style={Conteudo}>Alguns usuários tiveram dificuldade em encontrar as
                                    funcionalidades desejadas devido à organização do menu e à falta de destaque
                                    visual para as principais seções.
                                    <br/>Foi proposta uma reestruturação do menu, agrupando as funcionalidades de
                                        forma mais intuitiva e destacando visualmente as seções mais relevantes (como o
                                        botão voltar e o botão de áudio dentro das atividades).</p>
                                <div style={Titulo}>
                                    <strong>Idioma Incorreto</strong>
                                </div>
                                <p style={Conteudo}>Toda a construção do aplicativo estava sendo realizada em inglês (idioma 
                                do curso), mas ao testar o protótipo em baixa fidelidade ficou claro que os usuários não 
                                sabiam falar inglês. A solução foi traduzir todo o protótipo em baixa fidelidade e construir a
                                versão final já em português.
                                    </p>
                                <div style={Titulo}>
                                    <strong>OneClick ficou para a próxima</strong>
                                </div>
                                <p style={Conteudo}>
                                    O recurso de fazer o pedido em um clique será desenvolvido apenas nas próximas versões do app.
                                    <br/>Para funcionar corretamente, o OneClick precisará de pedidos já realizados e bem sucedidos.
                                    Isso porque, para garantir que o OneClick funcione é necessário: ter uma forma de pagamento confirmada,
                                    ter um endereço confirmado e ter um ou mais itens salvos para um clique. 
                                    <br/>Para confirmar uma forma de pagamento ou endereço é necessário que o usuário realize um pedido
                                    usando a forma de pagamento no endereço que deseja confirmar. Os itens em um pedido bem sucedido podem
                                    ser marcados para "pedir com um clique".
                                    <br/>O usuário não pode usar o OneClick com o pagamento em dinheiro.
                                    </p>

                            </div>
                            <div style={Titulo}>
                                <strong>Avaliação Decomposta</strong>
                                <p style={Conteudo}>
                                    Ao usar a avaliação decomposta, será mais fácil buscar avaliações mais refinadas
                                    e ter filtros mais elaborados para diversos tipos de avaliações e soluções.
                                    <br/>A avaliação decomposta leva em consideração 5 avaliações em cada pedido e a partir
                                    dessas avaliações, a nota é lançada (a nota será uma média simples das 5 notas).
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className='list' style={ImgFtStyle}>

                        <figure>
                            <img
                                src={FoodServiceTestAddItem}
                                style={FtStyle}
                                alt='Usuário testando o protótipo em baixa fidelidade do aplicativo FoodServiceApp.'></img>
                            <figcaption>Foto - Usuário testando o protótipo em baixa fidelidade do aplicativo FoodServiceApp.</figcaption>
                        </figure>
                        <div style={ListStyle}>
                            <div style={Titulo}>
                                <strong>Pesquisas com Usuários</strong>
                            </div>
                            <div>
                                <div style={Titulo}>
                                    <strong>Desconto na entrega</strong>
                                </div>
                                <p style={Conteudo}>Muitos usuários expressaram o desejo de não pagar ou
                                pagar uma taxa de entrega menor, o que é dificil de solucionar sem baixar os
                                recebimentos do entregador ou aumentar os custos do restaurante.
                                <br/>A solução pensada para este tópico foi a criação de um Clube de Entregas.
                                O clube funciona apenas para usuários-entregadores que habilitarem o benefício, aceitando 
                                a oferta do usuário-cliente. O clube tem cestas com quantidades diversas de vouchers
                                e o pagamento pode ser mensal, semestral ou anual.
                                <br/>O Clube oferece entrega grátis para cada voucher utilizado, no caso do usuário-cliente.
                                Para o usuário-entregador o valor pago é proporcional a Cesta que o cliente pagou (valor 
                                recebido = valor da cesta / numero de vouchers na cesta).
                                </p>
                            </div>
                            <div>
                                <div style={Titulo}>
                                    <strong>Integração com Google</strong>
                                </div>
                                <p style={Conteudo}>
                                    O processo de integração com o google é um passo fundamental para a construção da lógica
                                    que compõe o aplicativo: será através das avaliações disponibilizadas no Google e dos negócios
                                    registrados publicamente na ferramenta que o FoodService mostrará restaurantes de rua próximos 
                                    ao cliente e permitirá avaliações que podem ou não serem compartilhadas com o Google, o cliente
                                    pode decidir sobre isso nas configurações.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className='list' style={ImgFtStyle}>

                        <figure>
                            <img
                                src={FoodServiceTestMainScreen}
                                style={FtStyle}
                                alt='Teste remoto sendo realizado através do Meet.'></img>
                            <figcaption>Foto - Tela do teste de usabilidade remoto realizado através do Google Meet.</figcaption>
                        </figure>
                        <div style={ListStyle}>
                            <div style={Titulo}>
                                <strong>Observações de Comportamento</strong>
                            </div>
                            <div>
                                <div style={Titulo}>
                                    <strong>Tempo de Resposta</strong>
                                </div>
                                <p style={Conteudo}>
                                    Alguns usuários expressaram frustração com o tempo de resposta do aplicativo,
                                    especialmente em atividades que envolvem carregamento de recursos pesados. Com
                                    base nesse feedback, foram feitas otimizações de desempenho para melhorar a
                                    velocidade e responsividade do aplicativo.
                                </p>
                                <div style={Titulo}>
                                    <strong>Incentivo à Participação</strong>
                                </div>
                                <p style={Conteudo}>
                                    Foi observado que os usuários se engajam mais quando são recompensados por seus
                                    esforços. Com base nisso, foram introduzidos sistemas de recompensas, como
                                    emblemas e conquistas, que motivam os usuários a interagirem mais, investindo 
                                    também mais dinheiro em produtos associados.
                                </p>
                            </div>

                        </div>
                    </div>
                </div>
                <div className='design-de-interface' style={BlockStyle}>
                    <h6>Design de Interfaces</h6>
                    <p>
                        Durante o processo de design de interface do aplicativo, foram realizadas pesquisas,
                         entrevistas e testes de usabilidade em diversas fases do projeto.
                        <br/>As pesquisas foram feitas inicialmente para entender o comportamento de consumo
                        do público-alvo previamente definido. Durante as pesquisas várias informações importantes
                        foram descobertas e analisadas com mais profundidade, como a possibilidade de pacotes de
                        entrega com valores mais acessíveis ou maneiras diferentes de cobrar o delivery.
                        <br/>Também ficaram evidentes alguns problemas de layout durante os testes de usabilidade
                        iniciais, como o idioma, por exemplo. O aplicativo estava sendo construído em Inglês, mas
                        nem todos os usuários compreendiam o idioma. Foi necessário algum trabalho extra para traduzir
                        todos os elementos para o idioma Português do Brasil.
                        <br/>As últimas implementações de layout foram fundamentais para que o aplicativo oferecesse
                        a experiência intuitiva, como a barra de pesquisa no topo e os filtros com mais categorias
                        permitem ao usuário uma busca mais objetiva.
                        <br/>Já na versão final, o aplicativo foi avaliado nos testes e obteve uma pontução acima de 8 de 10
                        no KPI de NPS (Network Promoter Score). A nota representa a aceitação pelos usuários que tiveram 
                        contato com o app.
                    </p>
                    <div className='list'>
                        <figure>
                            <img
                                src={FoodServicePrototypeLow}
                                style={ScreenStyle}
                                alt='Tela de Login com uma imagem no topo, possui dois inputs para e-mail e senha e também dois botões, entrar ou cadastrar. A tela é mostrada em um celular que está sendo segurado por uma mão de madeira'></img>
                            <figcaption>Tela - Protótipo em baixa fidelidade de uma tela do FoodServiceApp.</figcaption>
                        </figure>
                        <div style={ListStyle}>
                            <div style={Titulo}>
                                <strong>Wireframes</strong>
                            </div>
                            <div>
                                <div style={Titulo}>
                                    <strong>Organização Intuitiva</strong>
                                </div>
                                <p style={Conteudo}>
                                    Os elementos foram dispostos de forma lógica e coerente, seguindo padrões de
                                    design familiares aos usuários. Isso facilita a navegação e a compreensão das
                                    funcionalidades do aplicativo.
                                </p>
                                <div style={Titulo}>
                                    <strong>Ênfase na Usabilidade</strong>
                                </div>
                                <p style={Conteudo}>
                                    Os wireframes foram projetados levando em consideração a usabilidade, com
                                    destaque para a clareza das ações a serem realizadas e a facilidade de encontrar
                                    informações relevantes.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className='list'>
                        <figure>
                            <img
                                src={FoodServiceMockUpTwo}
                                style={ScreenStyle}
                                alt='Tela de sucesso do fim da liga, mostra uma mensagem de parabéns, as recompensas que o usuário recebeu, um botão continuar e outro voltar ao início. A tela é mostrada em um celular que está sendo segurado por uma mão de madeira'></img>
                            <figcaption>Tela - MockUp do aplicativo FoodServiceApp com duas telas.</figcaption>
                        </figure>
                        <div style={ListStyle}>
                            <div style={Titulo}>
                                <strong>Protótipos Interativos</strong>
                            </div>
                            <div>
                                <div style={Titulo}>
                                    <strong>Fluxo de Navegação Simplificado</strong>
                                </div>
                                <p style={Conteudo}>
                                    Os protótipos foram projetados para ter um fluxo de navegação simples e
                                    intuitivo, evitando a complexidade excessiva e garantindo que os usuários
                                    pudessem encontrar as funcionalidades de forma fácil e rápida.
                                </p>
                                <div style={Titulo}>
                                    <strong>Consistência Visual</strong>
                                </div>
                                <p style={Conteudo}>
                                    Foi aplicada uma identidade visual coerente em todas as telas, incluindo o uso
                                    consistente de cores, tipografia e ícones. Isso ajuda os usuários a reconhecerem
                                    elementos familiares e cria uma experiência de uso fluida.
                                </p>
                            </div>
                        </div>
                        <div>
                            <div style={Titulo}>
                                Experimente:
                            </div>

                        </div>
                    </div>
                    <div className='list'>
                        <div style={ListStyle}>
                            <div style={Titulo}>
                                <strong>Design Final das Telas</strong>
                            </div>
                            <div>
                                <div style={Titulo}>
                                    <strong>Elementos visuais atrativos</strong>
                                </div>
                                <p style={Conteudo}>
                                    Os designs finais foram projetados para serem visualmente atraentes e
                                    envolventes, utilizando uma paleta de cores agradável, imagens relevantes e
                                    elementos gráficos adequados.
                                </p>
                                <div style={Titulo}>
                                    <strong>Priorização do conteúdo</strong>
                                </div>
                                <p style={Conteudo}>
                                    Os designs foram organizados de forma a priorizar o conteúdo relevante,
                                    garantindo que as informações mais importantes fossem destacadas e de fácil
                                    acesso para os usuários.
                                </p>
                                <div style={Titulo}>
                                    <strong>Responsividade</strong>
                                </div>
                                <p style={Conteudo}>
                                    Os designs foram adaptados para diferentes dispositivos e tamanhos de tela,
                                    garantindo uma experiência consistente e eficiente tanto em smartphones quanto
                                    em tablets ou desktops.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
                <h5>
                    Quer conhecer mais desse projeto?
                </h5>
                <p>
                    Interaja com o protótipo em alta fidelidade:
                </p>
                <a href="https://www.figma.com/proto/WMoLPMOFIU6SjC4eE7akNW/low-fidelity-prototype?type=design&node-id=596-1921&t=FWtzJ1uXtEZRgQhb-1&scaling=scale-down&page-id=21%3A3&starting-point-node-id=573%3A1018&show-proto-sidebar=1&mode=design">FoodServiceApp</a>
                {/* <figure>
                    <embed src={BasePDF} width="100%" height="600" type="application/pdf"/>
                    <figcaption>Documento - Estudo de Caso
                    </figcaption>
                </figure> */
                }
            </div>
        </div>
    );
}

export default FoodService;
