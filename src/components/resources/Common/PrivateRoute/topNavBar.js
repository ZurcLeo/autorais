import React, { useState } from 'react';
import { useAuth } from '../../AuthService';
import { Navbar, Nav, Form, Dropdown, Image, Container, Badge, DropdownButton } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useNavigate } from 'react-router-dom';
import useUnreadConnections from './hooks/useUnreadConnections';
import useUnreadMessage from '../PrivateRoute/hooks/useUnreadMessage';
import useNotification from './hooks/useNotification';
import { IoChatbubblesOutline, IoNewspaperOutline, IoThumbsUp, IoGiftOutline, IoExtensionPuzzleOutline, IoPersonCircleOutline, IoNotificationsOutline, IoBasketOutline, IoPersonOutline, IoSettingsOutline, IoExitOutline } from "react-icons/io5";
import './topNavBar.css';

const placeholder = process.env.REACT_APP_PLACE_HOLDER_IMG

const NotificationDropdown = ({ globalNotifications, privateNotifications, markAsRead }) => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleNotificationClick = (notification, type) => {
        markAsRead(notification.id, type);
        if (type === 'global') {
            navigate(`/live/${notification.userId}`); // Ajuste o caminho conforme necessário
        }
    };

    return (
        <div className="notification-dropdown">
            <button onClick={handleToggle} className="notification-button">
                <IoNotificationsOutline size={20} />
                <p>{globalNotifications.length + privateNotifications.length}</p>
            </button>
            {isOpen && (
                <div className="notification-dropdown-menu">
                    <h3>Notificações Globais</h3>
                    {globalNotifications.length > 0 ? (
                        globalNotifications.map(notification => (
                            <div
                                key={notification.id}
                                className="notification-dropdown-item"
                                onClick={() => handleNotificationClick(notification, 'global')}
                            >
                                {notification.conteudo}
                            </div>
                        ))
                    ) : (
                        <div className="notification-dropdown-item">Nenhuma notificação nova</div>
                    )}

                    <h3>Notificações Privadas</h3>
                    {privateNotifications.length > 0 ? (
                        privateNotifications.map(notification => (
                            <div
                                key={notification.id}
                                className="notification-dropdown-item"
                                onClick={() => handleNotificationClick(notification, 'private')}
                            >
                                {notification.conteudo}
                            </div>
                        ))
                    ) : (
                        <div className="notification-dropdown-item">Nenhuma notificação nova</div>
                    )}
                </div>
            )}
        </div>
    );
};

const TopNavBar = () => {
    const { currentUser, logout } = useAuth();
    const unreadMessagesCount = useUnreadMessage();
    const { newRequests } = useUnreadConnections();
    const { globalNotifications, privateNotifications, markAsRead } = useNotification();

    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/Login'); // Redireciona para a página de login após o logout
        } catch (error) {
            console.error('Erro ao tentar deslogar:', error);
            // Tratar o erro de logout aqui, se necessário
        }
    };

    return (
        <Navbar className='nav_sup' expand="lg">
            <Container fluid className='d-flex'>
                <Navbar.Brand style={{ marginLeft: '30px' }} href="/">
                    <div className="rainbow-text">
                        el<span className="rainbow">o</span>s
                    </div>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Form className="busca-form d-flex"></Form>
                    </Nav>
                    <Nav>
                        {currentUser ? (
                            <>
                                <LinkContainer className='menu-icons' to="/connections">
                                    <Nav.Link>
                                        <IoExtensionPuzzleOutline className='icon' size={20} />
                                        <span className="d-lg-none">Buscar</span>
                                        {newRequests > 0 && <Badge pill bg="danger">{newRequests}</Badge>}
                                    </Nav.Link>
                                </LinkContainer>
                                <LinkContainer className='menu-icons' to="/Postagens">
                                    <Nav.Link>
                                        <IoNewspaperOutline className='icon' size={20} />
                                        <span className="d-lg-none">Postagens</span>
                                    </Nav.Link>
                                </LinkContainer>
                                <LinkContainer className='menu-icons' to="/goChat">
                                    <Nav.Link>
                                        <IoChatbubblesOutline className='icon' size={20} />
                                        <span className="d-lg-none">Conversas</span>
                                        {unreadMessagesCount > 0 && <Badge pill bg="danger">{unreadMessagesCount}</Badge>}
                                    </Nav.Link>
                                </LinkContainer>

                                <NotificationDropdown
                                    globalNotifications={globalNotifications}
                                    privateNotifications={privateNotifications}
                                    markAsRead={markAsRead}
                                />
                            <LinkContainer className='menu-icons' to="/Payments">
                                <Nav.Link>
                                    <IoBasketOutline className='icon' size={20} />
                                    <span className="d-lg-none">Loja</span>
                                </Nav.Link>
                            </LinkContainer>

                            <Dropdown className='dropdown'>
                                <Dropdown.Toggle variant="outline-success" id="dropdown-profile">
                                    <Image
                                        className="profile-image"
                                        src={currentUser.fotoDoPerfil || placeholder }
                                        roundedCircle
                                       
                                    />
                                    <Nav.Link className='email'>{currentUser.email}</Nav.Link>
                                </Dropdown.Toggle>
                                <Dropdown.Menu className='dropdown-menu-right'>
                                    <Dropdown.Item href={`/PerfilPessoal/${currentUser.uid}`}>
                                        <IoPersonOutline size={20} style={{ marginRight: '10px' }} />
                                        Meu perfil
                                    </Dropdown.Item>
                                    <Dropdown.Item href="#account">
                                        <IoPersonCircleOutline size={20} style={{ marginRight: '10px' }} />
                                        Conta
                                    </Dropdown.Item>
                                    <Dropdown.Item href="/UserProfileSettings">
                                        <IoSettingsOutline size={20} style={{ marginRight: '10px' }} />
                                        Configurações
                                    </Dropdown.Item>
                                    <hr />
                                    <Dropdown.Item onClick={handleLogout}>
                                        <IoExitOutline />
                                        Sair
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </>
                    ) : (
                        <>
                            <Nav.Link style={{ color: 'antiquewhite' }} className='menu-icons' href="/homepage">Home</Nav.Link>
                            <Nav.Link style={{ color: 'antiquewhite' }} className='menu-icons' href="/services">Serviços</Nav.Link>
                            <Nav.Link style={{ color: 'antiquewhite' }} className='menu-icons' href="/blog">Blog</Nav.Link>
                            <Nav.Link style={{ color: 'antiquewhite' }} className='menu-icons' href="/Sobre">Sobre</Nav.Link>
                            <Nav.Link style={{ color: 'antiquewhite' }} className='menu-icons' href="/Login">Entrar</Nav.Link>
                        </>
                    )}
                </Nav>
            </Navbar.Collapse>
        </Container>
    </Navbar>
);
};

export default TopNavBar;