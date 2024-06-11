import React, { useState, useEffect } from 'react';
import { Card, Container, Col, Row, Tab, ListGroup, Badge, Button } from 'react-bootstrap';
import { useNavigate, Outlet } from 'react-router-dom';
import Profile from './profiles';
import { useAuth } from '../../AuthService';
import useUnreadMessage from '../PrivateRoute/hooks/useUnreadMessage';
import useUnreadConnections from './hooks/useUnreadConnections';
import Connections from './connections';
import useUnreadComments from './hooks/useUnreadComments';
import { BsPersonVcard } from "react-icons/bs";
import CustomLinkContainer from '../../../customLinkContainer';
import { IoSettingsOutline, IoGiftOutline, IoHomeOutline, IoExtensionPuzzleOutline, IoChatbubblesOutline, IoTrailSignOutline, IoPersonOutline, IoIdCardOutline, IoNewspaperOutline, IoAirplaneOutline, IoPeopleOutline, IoPaperPlane, IoAddCircleOutline, IoExitOutline, IoHelpCircleOutline, IoVideocamOutline } from "react-icons/io5";
import { GiPartyHat } from 'react-icons/gi';
import './index.css';

const DashboardMenu = () => {
    const { currentUser, logout } = useAuth();
    const [isFooterMenuOpen, setIsFooterMenuOpen] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const unreadMessagesCount = useUnreadMessage();
    const { newRequests } = useUnreadConnections();
    const unreadCommentsCount = useUnreadComments();

    const navigate = useNavigate();

    const ELO_EVENT = process.env.REACT_APP_ELO_EVENT_IMAGE_URL;
    const ELO_COIN = process.env.REACT_APP_ELO_COIN_IMAGE_URL;

    const handleLogout = async () => {
        if (!currentUser) {
            return;
        }

        try {
            await logout();
            navigate('/Login'); // Redireciona para a página de login após o logout
        } catch (error) {
            console.error('Erro ao tentar deslogar:', error);
            // Tratar o erro de logout aqui, se necessário
        }
    };

    return (
        <Container fluid>
            <Row>
                <Col xs={12} style={{ backgroundColor: '#FEEAD0' }}>
                    <Tab.Container id="dashboard-tabs" defaultActiveKey="/homepage">
                        <Row>
                            <Col lg={3} className="menu-lateral">
                                <ListGroup variant="flush">
                                    <Card className="menu-card">
                                        <Card.Header className="menu-header">SideMenu</Card.Header>
                                        <Card.Body>
                                            <CustomLinkContainer to="/homepage">
                                                <ListGroup.Item action className="d-flex align-items-center">
                                                    <IoHomeOutline className="icon" /> <span> Principal</span>
                                                </ListGroup.Item>
                                            </CustomLinkContainer>
                                            <CustomLinkContainer to="/LivesOnline">
                                                <ListGroup.Item action className="d-flex align-items-center">
                                                    <IoVideocamOutline className="icon" /> <span> Ao Vivo</span>
                                                </ListGroup.Item>
                                            </CustomLinkContainer>
                                            <CustomLinkContainer to='/UserProfileSettings'>
                                                <ListGroup.Item action className="d-flex align-items-center">
                                                    <IoSettingsOutline className="icon" /> <span> Configurações</span>
                                                </ListGroup.Item>
                                            </CustomLinkContainer>
                                            <CustomLinkContainer to='/Postagens'>
                                                <ListGroup.Item action className="d-flex align-items-center">
                                                    <IoNewspaperOutline className='icon' />
                                                    <span> Postagens</span>
                                                    {unreadCommentsCount > 0 && <Badge pill bg="danger">{unreadCommentsCount}</Badge>}
                                                </ListGroup.Item>
                                            </CustomLinkContainer>
                                            <CustomLinkContainer to="/Connections">
                                                <ListGroup.Item action className="d-flex align-items-center">
                                                    <IoExtensionPuzzleOutline className='icon' />
                                                    <span> Amigos</span>
                                                    {newRequests > 0 && <Badge pill bg="danger">{newRequests}</Badge>}
                                                </ListGroup.Item>
                                            </CustomLinkContainer>
                                            <CustomLinkContainer to="/ConvidarAmigos">
                                                <ListGroup.Item action className="d-flex align-items-center">
                                                    <BsPersonVcard className='icon' />
                                                    <span> Convidar</span>
                                                </ListGroup.Item>
                                            </CustomLinkContainer>
                                            <CustomLinkContainer to="/goChat">
                                                <ListGroup.Item action className="d-flex align-items-center">
                                                    <IoChatbubblesOutline className='icon' />
                                                    <span> Conversas</span>
                                                    {unreadMessagesCount > 0 && <Badge pill bg="danger">{unreadMessagesCount}</Badge>}
                                                </ListGroup.Item>
                                            </CustomLinkContainer>
                                            <CustomLinkContainer to="/Hospedagens">
                                                <ListGroup.Item action className="d-flex align-items-center">
                                                    <IoTrailSignOutline className='icon' /><span> Viagens</span>
                                                </ListGroup.Item>
                                            </CustomLinkContainer>
                                            <CustomLinkContainer to="/HospedagensClientes">
                                                <ListGroup.Item action className="d-flex align-items-center" disabled>
                                                    <IoPersonOutline className='icon' /><span> Clientes</span>
                                                </ListGroup.Item>
                                            </CustomLinkContainer>

                                            <CustomLinkContainer to="/HospedagensProprietarios">
                                                <ListGroup.Item action className="d-flex align-items-center">
                                                    <IoIdCardOutline className='icon' /><span> Proprietários</span>
                                                </ListGroup.Item>
                                            </CustomLinkContainer>

                                            <CustomLinkContainer to="/RegistrarPresente">
                                                <ListGroup.Item action className="d-flex align-items-center">
                                                    <IoGiftOutline className='icon' /><span> Presentes</span>
                                                </ListGroup.Item>
                                            </CustomLinkContainer>

                                            <CustomLinkContainer to="/faq">
                                                <ListGroup.Item action className="d-flex align-items-center">
                                                    <IoHelpCircleOutline className='icon' /><span> F.A.Q.</span>
                                                </ListGroup.Item>
                                            </CustomLinkContainer>
                                            <hr />
                                            <CustomLinkContainer to="/">
                                                <ListGroup.Item onClick={handleLogout} action className="d-flex align-items-center">
                                                    <IoExitOutline className='icon' /><span> Sair</span>
                                                </ListGroup.Item>
                                            </CustomLinkContainer>
                                        </Card.Body>
                                    </Card>
                                </ListGroup>
                            </Col>

                            <Col xs={12} lg={6}>
                                <Tab.Content>
                                    <Tab.Pane eventKey="/homepage">
                                        <Outlet />
                                    </Tab.Pane>
                                    <Tab.Pane eventKey="/Profile">
                                        <Profile />
                                    </Tab.Pane>
                                    <Tab.Pane eventKey="/Connections">
                                        <Connections />
                                    </Tab.Pane>
                                </Tab.Content>
                            </Col>

                            <Col lg={3} className="menu-lateral d-none d-lg-block">
                                <Card className="menu-card">
                                    <Card.Img variant="top" src={ELO_COIN} alt="Elos Moeda Virtual" />
                                    <Card.Body>
                                        <Card.Title>Compre ElosCoin ℰ</Card.Title>
                                        <Card.Text>
                                            Junte-se à comunidade ElosCloud e obtenha elos para aproveitar todos os recursos exclusivos.
                                            Torne sua experiência ainda mais rica e conectada!
                                        </Card.Text>
                                        <Button to="/Payments" variant="outline-warning">Veja <GiPartyHat /></Button>
                                    </Card.Body>
                                </Card>
                                <Card className="menu-card">
                                    <Card.Img variant="top" src={ELO_EVENT} alt="Elos Moeda Virtual" />
                                    <Card.Body>
                                        <Card.Title><GiPartyHat /> Eventos </Card.Title>
                                        <Card.Text>
                                            Veja os eventos acontecendo na sua regiao e interaja com seus amigos de diversas formas!
                                        </Card.Text>
                                        <Button variant="outline-warning">Veja <GiPartyHat /></Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Tab.Container>
                </Col>
            </Row>

            {/* Menu de rodapé para dispositivos menores */}
            <div className={`footer-menu ${isFooterMenuOpen ? 'opened' : ''}`} onClick={() => setIsFooterMenuOpen(!isFooterMenuOpen)}>
                <IoAddCircleOutline className="footer-menu-icon" />
                {/* Seu menu de rodapé com outros ícones aqui */}
            </div>

            {isFooterMenuOpen && (
                <Row className="fixed-bottom footer-menu-content bg-dark text-white">
                    <Col xs={3} className="text-center">
                        <IoPaperPlane />
                        <p>Postar</p>
                    </Col>
                    <Col xs={3} className="text-center">
                        <IoChatbubblesOutline />
                        <p>Mensagens</p>
                    </Col>
                    <Col xs={3} className="text-center">
                        <IoPeopleOutline />
                        <p>Amigos</p>
                    </Col>
                    <Col xs={3} className="text-center">
                        <IoAirplaneOutline />
                        <p>Viagens</p>
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default DashboardMenu;
