import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col } from 'react-bootstrap';


import './footer.css'; // Supondo que este seja o caminho do seu arquivo CSS.

function Footer() {
  return (
    <Container className="footer-container" fluid>
      <Row className="footer-bottom-row">
        <Col className="text-center text-white mt-3">
      © 2024 Elos Soluções Cloud  🏳️‍🌈 Todos os Direitos Reservados
        </Col>
      </Row>
    </Container>
  );
}

export default Footer;
