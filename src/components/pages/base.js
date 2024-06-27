import React, { useLayoutEffect } from 'react';
import BaseMockUp from '../imgs/BaseMockUp.png'
import TesteUsabilidadeTurma from '../imgs/portfolio/base/teste-de-usabilidade-paulo-freire.jpg'
import TelaPrincipal from '../imgs/portfolio/base/telas/tela-principal.png'
import TelaEntradaLiga from '../imgs/portfolio/base/telas/tela-entrada-liga.png'
import FeedbackPositivo from '../imgs/portfolio/base/telas/feedback-positivo.png'
import SalaDeTrofeus from '../imgs/portfolio/base/telas/tela-trofeus.png'
import TelaAtividade from '../imgs/portfolio/base/telas/tela-atividade.png'
import MeninaApp from '../imgs/portfolio/base/IMG_4512.jpg'
// import BasePDF from '../attc/base-estudo-de-caso-detalhado.pdf'
import Hero from "./Hero";
import TurmaApp from '../imgs/portfolio/base/usuarios-respondem-e-interagem.jpg'
import ProtB from '../imgs/portfolio/base/telas/Base-prototipo-baixa-fidelidade.png'
import ProtI from '../imgs/portfolio/base/telas/tela-sucesso-fim-liga.png'
import Slider from 'react-slick';

// const ProjectStyle = {
//     margin: '50px auto',
//     width: '70%',
//     display: 'block',
//     opacity: '0.9',
//     justifyContent: 'center',
//     alignItems: 'center'
// }

const ListStyle = {
    width: '100%',
    margin: '20px auto',
    backgroundColor: '#ead0e8',
    // padding: '25px',
    borderRadius: '10px',
    textAlign: 'left',
    display: 'block',
    listDecoration: 'none'
}

const BlockStyle = {
    backgroundColor: '#f7eaf6',
    borderRadius: '10px',
    padding: '25px',
    margin: '20px auto',
    width: '100%'
}

const ImgStyle = {
    maxWidth: '30%',
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

function Base() {

    const settings = {
        dots: true, // Mostrar indicadores de pontos na parte inferior
        infinite: true, // Loop infinito do carrossel
        speed: 500, // Velocidade da transição
        slidesToShow: 1, // Mostrar um slide de cada vez
        slidesToScroll: 1, // Rolar um slide por vez
        adaptiveHeight: true, // Ajustar a altura automaticamente ao conteúdo do slide
    };

    useLayoutEffect (() => {
        window.scrollTo(0, 0);
      }, []);

    return (
        
        <div>
            <Hero title='BASEApp'/>
            <div>
                <h5>Apresentação do Projeto "Base"</h5>
                <p>O projeto do aplicativo Base tem como objetivo oferecer uma plataforma
                    interativa e educacional para alunos e professores do ensino básico. Nossa
                    proposta é complementar o ensino em sala de aula por meio de uma ferramenta
                    digital.</p>
                <p>A proposta: entregar o produto mínimo viável (MVP) e foi desenvolvido com
                    muito carinho e dedicaçao por uma equipe multidisciplinar e focada em fomentar o
                    esporte e vinculá-lo a tecnologia.</p>
                <p>Minha contribuição ao projeto ocorreu entre os anos de 2020 e 2022.
                </p>

                <Slider {...settings}>
                {/* SLIDE 1 */}
                <div className='visao-geral' style={BlockStyle}>
                    <figure>
                        <img
                            src={BaseMockUp}
                            style={ImgStyle}
                            alt='Dois celulares empilhados apresentando duas telas do aplicativo Base em uso'></img>
                        <figcaption>MockUp do Aplicativo Base</figcaption>
                    </figure>
                    <h6>Visão Geral</h6>
                    <p>
                        O aplicativo Base tem como público-alvo estudantes do ensino básico e
                        professores.
                        <br/>Ele deve oferecer, no futuro, uma variedade de funcionalidades para
                            promover uma experiência de aprendizado divertida e envolvente, estimulando a
                            assimilação de conteúdos educacionais de forma lúdica e interativa.
                        <br/>Tanto alunos quanto professores poderão se beneficiar com o aplicativo,
                            pois o objetivo é que ele forneça recursos e métricas para auxiliar o
                            desenvolvimento acadêmico dos alunos e a prática pedagógica dos professores,
                            apontando áreas de melhoria e acompanhamento do progresso dos alunos de forma
                            eficaz.
                        <br/>O objetivo é que o aplicativo evolua a partir do MVP para alcançar todos
                            estes objetivos.
                    </p>
                    </div>

                    {/* SLIDE 2 */}
                    <div className='list'>
                        <figure>
                            <img
                                src={TelaPrincipal}
                                style={ScreenStyle}
                                alt='Tela Principal do Base na Visão do Aluno, a tela é mostrada em um celular que está sendo segurado por uma mão de madeira'></img>
                            <figcaption>Tela - Principal do BASE</figcaption>
                        </figure>
                        <div style={ListStyle}>
                            <div style={Titulo}>
                                <strong>Acesso Individualizado</strong>
                            </div>
                            <p style={Conteudo}>Os responsáveis são os únicos capazes de registrar uma
                                criança no aplicativo Base.
                                <br/>Uma vez registrada, a criança será alocada em uma escola e turma
                                    específicas, ficando disponível também para o Professor em uma de suas Turmas.
                            </p>
                        </div>
                       </div>

                        <div style={ListStyle}>
                        <figure>
                            <img
                                src={TelaEntradaLiga}
                                style={ScreenStyle}
                                alt='Tela de entrada da Liga Regional do Base na Visão do Aluno, a tela é mostrada em um celular que está sendo segurado por uma mão de madeira'></img>
                            <figcaption>Tela - Entrada da Liga Regional</figcaption>
                        </figure>
                            <div style={Titulo}>
                                <strong>Ligas e Temporadas</strong>
                            </div>
                            <p style={Conteudo}>O conteúdo pedagógico foi dividido em temporadas, apesar de
                                o primeiro e o segundo ano dividirem a Temporada 1 e o terceiro e o quarto, a
                                Temporada 2.
                                <br/>Hoje cada Temporada reflete o conteúdo da BNCC (Base Nacional Comum
                                    Curricular), como alertado durante os primeiros testes de usabilidade realizados
                                    na escola Piloto.
                                <br/>A separação desta maneira permite defnições mais claras e assertivas de
                                    planos de aprendizagem dedicados a um conteúdo específico.
                            </p>
                        </div>

<div style={ListStyle}>
                        <figure>
                            <img
                                src={TelaAtividade}
                                style={ScreenStyle}
                                alt='Tela de uma partida da Temporada 3, a tela é mostrada em um celular que está sendo segurado por uma mão de madeira'></img>
                            <figcaption>Tela - Atividade na Temporada 3</figcaption>
                        </figure>
                        
                            <div style={Titulo}>
                                <strong>Treinos e Atividades</strong>
                            </div>
                            <p style={Conteudo}>O objetivo inicial dos treinos, era que o usuário pudesse
                                ter contato com o conteúdo a ser apresentado da Temporada atual.
                                <br/>Inicialmente os passos seguidos pela seção de Treino era oferecer conteúdo
                                    de Temas Contemporâneos Tranversais (TCT), de acordo com a BNCC.
                                <br/>Foi identificado durante os testes de usabilidade que esta também era uma
                                    área a ser melhor explorada, já que os usuários pouco a identificavam.
                            </p>
                        </div>
<div style={ListStyle}>
                        <figure>
                            <img
                                src={FeedbackPositivo}
                                style={ScreenStyle}
                                alt='Tela de resultado positivo ao acertar, a tela é mostrada em um celular que está sendo segurado por uma mão de madeira'></img>
                            <figcaption>Tela - Feedback Positivo</figcaption>
                        </figure>
                        
                            <div style={Titulo}>
                                <strong>Acompanhamento do Progresso</strong>
                            </div>
                            <p style={Conteudo}>O feedback, positivo ou negativo, não oferecia a resposta
                                correta, um dos possíveis fatores que nos fizeram entender a evolução lenta nas
                                atividades propostas.
                                <br/>Com o feedback também foi possível entendermos o grau de dificuldade das
                                    atividades para cada série e em conjunto com a pedagoga envolvida, movimentar e
                                    adequar as atividades.
                            </p>
                        </div>
<div style={ListStyle}>
                        <figure>
                            <img
                                src={SalaDeTrofeus}
                                style={ScreenStyle}
                                alt='Tela da Sala de Troféus e Medalhas, a tela é mostrada em um celular que está sendo segurado por uma mão de madeira'></img>
                            <figcaption>Tela - Sala de Troféus</figcaption>
                        </figure>
                        
                            <div style={Titulo}>
                                <strong>Sala de Troféus</strong>
                            </div>
                            <p style={Conteudo}>Era na Sala de Troféus onde o usuário conseguia ter acesso a
                                quantidade de Medalhas e Troféus conquistados.
                                <br/>Um dos insights durante os testes de usabilidade, nos levaram a sugerir que
                                    também as moedas e os pontos recebidos por cada atividade também estivessem
                                    nesta tela, desta forma reunindo todas as recompensas recebidas pelo usuário
                                    durante dua experiência.
                            </p>
                        </div>
                    

                
                <div className='analise-e-pesquisa' style={BlockStyle}>

                    <h6>Análise e Pesquisa</h6>
                    <p>
                        Durante o desenvolvimento do aplicativo Base, realizamos análises, testes de
                        usabilidade, pesquisas com usuários e observações de comportamento. Essas
                        atividades nos permitiram detectar a necessidade de personalização e integração
                        com a sala de aula, levando à implementação de opções personalizáveis e
                        funcionalidades de integração entre jogadores, professores e escola.
                    </p>

                    </div>

                    <div style={ImgFtStyle}>
                        <figure>
                            <img
                                src={MeninaApp}
                                style={FtStyle}
                                alt='Estudante de um colégio público em São Gonçalo sentada de frente a uma mesa amarela e tocando a tela de um celular, que mostra uma atividade sendo respondida.'></img>
                            <figcaption>Foto - Estudante em escola pública de São Gonçalo/RJ testando o aplicativo Base</figcaption>
                        </figure>
                        </div>

                        <div className='list' style={ListStyle}>
                            <div style={Titulo}>
                                <strong>Testes de Usabilidade</strong>
                            </div>
                            <div>
                                <div style={Titulo}>
                                    <strong>Dificuldade na navegação</strong>
                                </div>
                                <p style={Conteudo}>Alguns usuários tiveram dificuldade em encontrar as
                                    funcionalidades desejadas devido à organização do menu e à falta de destaque
                                    visual para as principais seções.
                                    <br/>Foi proposta uma reestruturação do menu, agrupando as funcionalidades de
                                        forma mais intuitiva e destacando visualmente as seções mais relevantes (como o
                                        botão voltar e o botão de áudio dentro das atividades).</p>
                                <div style={Titulo}>
                                    <strong>Complexidade das Atividades</strong>
                                </div>
                                <p style={Conteudo}>Alguns usuários tiveram dificuldade em compreender certos enunciados e
                                     os objetivos propostos. Com base nesse feedback, foram feitas
                                    melhorias no design instrucional das atividades (como alteração do tamanho de alguns dos 
                                    objetos interativos, a cor de alguns elementos, o background de algumas imagens, a criação de 
                                    novos objetos interativos e o nivelamento de atividades por Temporada/Série escolar), 
                                    simplificando as instruções e fornecendo orientações mais precisas.</p>
                                <div style={Titulo}>
                                    <strong>Descobertas Observadas</strong>
                                </div>
                                <p style={Conteudo}>
                                    A escola piloto não possuía recursos básicos de informática para receber a testagem do aplicativo
                                    e, ainda assim, contamos com a colaboração de toda a comunidade escolar durante o processo de testes e implementação.
                                    <br/>com um número de dispositivos celulares 
                                    Alguns usuários tiveram dificuldade em compartilhar o dispositivo celular em
                                    turmas onde o aparelho foi utilizado em grupo.
                                    <br/>Uma das soluções propostas foi a de criar partidas em grupo, em que cada
                                        usuário acessa seu perfil e vincula a sessão em grupo.</p>

                            </div>
                            <div style={Titulo}>
                                <strong>Plataforma para Professores</strong>
                                <p style={Conteudo}>
                                    O maior desafio esteve em esbelecer métricas voltadas a questão pedagógica, já que os 
                                    dados gerados pelos alunos não alimentavam, a príncipio, nenhuma base de dados que pudesse
                                    ser acessada pelos professores.
                                    <br />Uma das soluções propostas, foi a criação de uma plataforma onde professores pudessem 
                                    ter acesso a gráficos e relatórios mais precisos sobre desempenho de alunos, podendo direcionar
                                    suas energias para conteúdos mais abrangentes e com foco no aprendizado de cada aluno.
                                </p>
                            </div>
                        </div>
                   



                    
                    <div className='list' style={ImgFtStyle}>

                        <figure>
                            <img
                                src={TurmaApp}
                                style={FtStyle}
                                alt='Estudante de um colégio público em São Gonçalo sentada de frente a uma mesa amarela e tocando a tela de um celular, que mostra uma atividade sendo respondida.'></img>
                            <figcaption>Foto - Estudantes testando o aplicativo Base em escola pública de São Gonçalo/RJ</figcaption>
                        </figure>
                        </div>

                        <div style={ListStyle}>
                            <div style={Titulo}>
                                <strong>Pesquisas com Usuários</strong>
                            </div>
                            <div>
                                <div style={Titulo}>
                                    <strong>Necessidade de Personalização</strong>
                                </div>
                                <p style={Conteudo}>Muitos usuários expressaram o desejo de poder personalizar o
                                    aplicativo de acordo com suas preferências e necessidades individuais. Com base
                                    nisso, foram implementadas opções de personalização, como temas visuais,
                                    configurações de idioma e preferências de conteúdo.</p>
                            </div>
                            <div>
                                <div style={Titulo}>
                                    <strong>Integração com a Sala de Aula</strong>
                                </div>
                                <p style={Conteudo}>Professores destacaram a importância de integrar o
                                    aplicativo com as atividades realizadas em sala de aula. Com base nesse
                                    feedback, foram adicionadas funcionalidades que permitem aos professores criar
                                    partidas amistosas em sala de aula e incluir alunos presentes/online.</p>
                            </div>
                        </div>
                    
                    <div className='list' style={ImgFtStyle}>

                        <figure>
                            <img
                                src={TesteUsabilidadeTurma}
                                style={FtStyle}
                                alt='Uma sala de aula com varios grupos de alunos e uma professora enquanto usam o aplicativo Base'></img>
                            <figcaption>Foto - Estudantes testam o aplicativo Base em dupla, com suporte da
                                professora - São Gonçalo/RJ.</figcaption>
                        </figure>
                        </div>

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
                                    emblemas e conquistas, que motivam os usuários a avançarem nas ligas e
                                    temporadas.
                                </p>
                            </div>

                        </div>
                    
               
                <div className='design-de-interface' style={BlockStyle}>
                    <h6>Design de Interfaces</h6>
                    <p>
                        Durante o processo de design de interface do aplicativo Base, adotamos uma
                        abordagem cuidadosa para criar uma experiência atraente e intuitiva. Nossas
                        decisões de design foram fundamentadas em princípios de usabilidade,
                        acessibilidade e estética visual.
                        <br/>Utilizamos wireframes de baixa fidelidade para definir a estrutura e o
                            fluxo de navegação, garantindo uma organização intuitiva dos elementos e uma
                            ênfase na usabilidade.
                        <br/>Além disso, desenvolvemos protótipos interativos de média fidelidade para
                            simular a experiência de uso, garantindo um fluxo de navegação simplificado e
                            consistência visual em todas as telas.
                        <br/>Por fim, criamos os designs finais das telas, priorizando elementos visuais
                            atrativos, a organização do conteúdo e a responsividade em diferentes
                            dispositivos.
                        <br/>Essas decisões de design contribuíram para melhorar a experiência do
                            usuário, tornando o aplicativo Base visualmente atraente, fácil de usar e
                            adaptável às necessidades individuais dos usuários.
                    </p>
                    </div>

                    <div className='list'>
                        <figure>
                            <img
                                src={ProtB}
                                style={ScreenStyle}
                                alt='Tela de Login com uma imagem no topo, possui dois inputs para e-mail e senha e também dois botões, entrar ou cadastrar. A tela é mostrada em um celular que está sendo segurado por uma mão de madeira'></img>
                            <figcaption>Tela - Protótipo em baixa fidelidade de uma tela do fluxo de login do Base.</figcaption>
                        </figure>
                        </div>

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
                    
                    <div className='list'>
                        <figure>
                            <img
                                src={ProtI}
                                style={ScreenStyle}
                                alt='Tela de sucesso do fim da liga, mostra uma mensagem de parabéns, as recompensas que o usuário recebeu, um botão continuar e outro voltar ao início. A tela é mostrada em um celular que está sendo segurado por uma mão de madeira'></img>
                            <figcaption>Tela - Protótipo em alta fidelidade da tela de feedback do fim de um
                                liga bem sucedida.</figcaption>
                        </figure>
                        </div>

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

                
                <div>
                <h5>
                    Quer conhecer mais desse projeto?
                </h5>
                <p>
                    veja mais informações na página do nosso cliente:
                </p>
                <a href="https://institutovinijr.org.br">Instituto Vini Jr</a>
                {/* <figure>
                    <embed src={BasePDF} width="100%" height="600" type="application/pdf"/>
                    <figcaption>Documento - Estudo de Caso
                    </figcaption>
                </figure> */
                }
                </div>
                            </Slider>

            </div>
        </div>
    );
}

export default Base;
