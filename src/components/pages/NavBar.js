import React, { useEffect } from "react";
import { Container, Nav, Navbar, NavDropdown, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from "../resources/AuthService";
import logo from '../imgs/logo_rad.png';
import './NavBar.css';

function NavBar() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Este useEffect pode ser ajustado conforme necessário. 
        // Por exemplo, você pode querer fazer algo sempre que o estado de autenticação mudar.
    }, [currentUser]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/signin'); // Redireciona para a página de login após o logout
        } catch (error) {
            console.error('Erro ao tentar deslogar:', error);
            // Tratar o erro de logout aqui, se necessário
        }
    };

    return (
<Navbar className="bg-body-tertiary" collapseOnSelect expand="lg">
        <Container>
            <Navbar.Brand as={Link} to="/">
                <img src={logo} alt="Logo Elos Soluções Cloud" className="logo" />
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
                <Nav className="me-auto">
                    <Nav.Link as={Link} to="/">Home</Nav.Link>
                    <Nav.Link as={Link} to="/portfolio">Portfólio</Nav.Link>
                    <a className="nav-link" href="https://blog.eloscloud.com.br" target="_blank" rel="noopener noreferrer">Blog</a>
                    <Nav.Link as={Link} to="/services">Serviços</Nav.Link>
                    {/* Outras opções do NavBar aqui */}
                    
                    {/* Condiciona a exibição do dropdown de Área Restrita ao estado de login do usuário */}
                    {currentUser && (
                        <NavDropdown title="Área Restrita" id="collasible-nav-dropdown-dashboard">
                            <NavDropdown.Item as={Link} to="/homepage">Principal</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/Profile">Configurações</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/Connections">Conexões</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/goChat">Conversas</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/Hospedagens">Viagens</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/HospedagensClientes">Clientes</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/HospedagensProprietarios">Proprietários</NavDropdown.Item>

                            {/* Incluir outras opções do Dashboard conforme necessário */}
                        </NavDropdown>
                    )}
                </Nav>
                <Nav>
                    {!currentUser ? (
                        <Button variant="outline-success" as={Link} to="/signin">Entrar</Button>
                    ) : (
                        <Button variant="outline-danger" onClick={handleLogout}>Sair</Button>
                    )}
                </Nav>
            </Navbar.Collapse>
        </Container>
    </Navbar>
    
    );
}

export default NavBar;

