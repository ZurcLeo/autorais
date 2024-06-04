import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../../AuthService';
import { toast } from 'react-toastify';
import { Form, Button, Card, Spinner, Container, Row, Col } from 'react-bootstrap';

const GenerateAndSendInvite = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { currentUser } = useAuth();

    const handleInvite = async () => {
        if (!email || !currentUser) {
            toast.error('Por favor, insira um email.');
            return;
        }

        setIsLoading(true);

        const functions = getFunctions();
        const generateInvite = httpsCallable(functions, 'generateInvite');

        try {
            const result = await generateInvite({ email });
            setIsLoading(false);

            if (result.data.success) {
                toast.success('Convite enviado com sucesso!');
            } else {
                toast.error('Erro ao enviar convite.');
            }
        } catch (error) {
            console.error('Erro ao enviar convite:', error);
            setIsLoading(false);
            toast.error('Erro ao enviar convite.');
        }
    };

    return (
        <Container fluid>
            <Row className="justify-content-md-center">
                <Col >
                    <Card fluid>
                        <Card.Header>
                    <h3>Enviar Convite</h3>
                    </Card.Header>
                    <Card.Body>
                    <Form>
                        <Form.Group controlId="formEmail">
                            <Form.Label>Email do amigo</Form.Label>
                            <Form.Control 
                                type="email" 
                                placeholder="Digite o email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                            />
                        </Form.Group>
                       
                    </Form>
                    </Card.Body>
                    <Card.Footer>
                         
                    <Button variant="primary" onClick={handleInvite} disabled={isLoading} block>
                            {isLoading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Enviar Convite'}
                        </Button>
                    </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default GenerateAndSendInvite;
