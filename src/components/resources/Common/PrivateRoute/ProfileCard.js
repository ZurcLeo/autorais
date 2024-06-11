// src/components/ProfileCard.jsx
import React from "react";
import { Container, Card, Button, Row, Col, Accordion, Tooltip, OverlayTrigger, Badge, ListGroup } from 'react-bootstrap';
import { FaFacebook, FaTwitter, FaInstagram, FaHeart, FaBriefcase } from 'react-icons/fa';
import './ProfileCard.css';

const colorMapping = {
    "sem compromisso": "warning",
    "relacionamentos": "danger",
    "passeios românticos": "success",
    "encontros casuais": "primary",
    "venda de produtos": "dark",
    "oferta de serviços": "info"
};

const getBadgeColor = (interesse) => {
    return colorMapping[interesse.toLowerCase()] || "primary";
};

const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
        Clique para mais informações
    </Tooltip>
);

const ProfileCard = ({ userData, toggleEdit }) => {
    const placeholder = process.env.REACT_APP_PLACE_HOLDER_IMG;

    return (
        <Container>
            <Card className="main-card">
                <Row>
                    <Col md={4} className="profile-card-left">
                        <Card.Body className="text-center">
                            <img
                                src={userData.fotoDoPerfil || placeholder}
                                alt="Profile"
                                className="profile-image-bg"
                            />
                            <h5 className="mt-3">{userData.nome}</h5>
                            <p className="mt-3">{userData.tipoDeConta}</p>
                            <Button variant="outline-warning" onClick={toggleEdit}>
                                Editar Perfil
                            </Button>
                        </Card.Body>
                    </Col>
                    <Col md={8}>
                        <Card.Body className="sub-card">
                            <h6 className="card-title">Resumo</h6>
                            <ListGroup variant="flush">
                               
                                <ListGroup.Item className="profile-description">
                                    <Row>
                                        <Col>
                                        <pre >{userData.descricao}</pre>
                                        </Col>
                                    </Row>
                                </ListGroup.Item>
                            </ListGroup>
                            <h6 className="card-title mt-4">Interesses</h6>
                            <Accordion defaultActiveKey="0">
                                <Accordion.Item className="profile-description"  eventKey="0">
                                    <Accordion.Header  >
                                        <FaHeart className="me-2" />Pessoais
                                    </Accordion.Header>
                                    <Accordion.Body>
                                        {userData.interessesPessoais && userData.interessesPessoais.length > 0 ? (
                                            userData.interessesPessoais.map((interesse, index) => (
                                                <OverlayTrigger
                                                    key={index}
                                                    placement="top"
                                                    delay={{ show: 250, hide: 400 }}
                                                    overlay={renderTooltip}
                                                >
                                                    <Badge bg={getBadgeColor(interesse)} className="m-1">{interesse}</Badge>
                                                </OverlayTrigger>
                                            ))
                                        ) : (
                                            <div>Sem interesses pessoais</div>
                                        )}
                                    </Accordion.Body>
                                </Accordion.Item>
                                <Accordion.Item className="profile-description"  eventKey="1">
                                    <Accordion.Header  >
                                        <FaBriefcase className="me-2" />Negócios
                                    </Accordion.Header>
                                    <Accordion.Body>
                                    <p className="text-alert"><strong>IMPORTANTE:</strong> Para se habilitar a negociar na plataforma, valide seu cadastro comercial.</p>

                                        {userData.interessesNegocios && userData.interessesNegocios.length > 0 ? (
                                            userData.interessesNegocios.map((interesse, index) => (
                                                <OverlayTrigger
                                                    key={index}
                                                    placement="top"
                                                    delay={{ show: 250, hide: 400 }}
                                                    overlay={renderTooltip}
                                                >
                                                    <Badge bg={getBadgeColor(interesse)} className="m-1">{interesse}</Badge>
                                                </OverlayTrigger>
                                            ))
                                        ) : (
                                            <div>Sem interesses de negócios</div>
                                        )}
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                            <div className="mt-4 text-center-social">
                                <FaFacebook className="mx-2" />
                                <FaTwitter className="mx-2" />
                                <FaInstagram className="mx-2" />
                            </div>
                        </Card.Body>
                    </Col>
                </Row>
            </Card>
        </Container>
    );
};

export default ProfileCard;
