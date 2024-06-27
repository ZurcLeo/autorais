import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Alert, Image, Container, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../resources/AuthService'; // Certifique-se do caminho correto
import Logo from '../imgs/logo_rad.png'; // Certifique-se do caminho correto

const SignIn = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    registerWithEmail,
    signInWithEmail,
    signInWithProvider,
    resendVerificationEmail
  } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (currentUser) {
      navigate('/homepage');
    }
  }, [currentUser, navigate]);

  const handleLoginOrRegister = async (event) => {
    event.preventDefault();
    setError('');
    setShowResendVerification(false);

    try {
      if (isLogin) {
        await signInWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, inviteCode);
        setShowResendVerification(true);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleExternalLogin = async (providerName) => {
    try {
      await signInWithProvider(providerName);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleResendEmailVerification = async () => {
    try {
      await resendVerificationEmail();
      alert('E-mail de verificação reenviado. Por favor, verifique sua caixa de entrada.');
    } catch (error) {
      setError('Falha ao reenviar o e-mail de verificação.');
    }
  };

  return (
    <div>
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <Card style={{ width: '24rem' }}>
          <Card.Body>
            <div className="text-center">
              <Image src={Logo} roundedCircle style={{ width: '100px', height: '100px' }} />
            </div>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleLoginOrRegister}>
              <Form.Group controlId="formBasicEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control 
                  type="email" 
                  placeholder="Digite seu email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </Form.Group>
              <Form.Group controlId="formBasicPassword">
                <Form.Label>Senha</Form.Label>
                <Form.Control 
                  type="password" 
                  placeholder="Digite sua senha" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </Form.Group>
              <Button variant="primary" type="submit" className="w-100 mt-3">
                {isLogin ? 'Entrar' : 'Entrar'}
              </Button>
              <Button variant="link" onClick={() => setIsLogin(!isLogin)} className="w-100 mt-3">
                {isLogin ? 'Como criar minha conta?' : 'Como criar minha conta?'}
              </Button>
            </Form>
            <hr />
            <Button variant='outline-dark' onClick={() => navigate('/phone-signin')} className="w-100 mt-2">Entrar com Telefone</Button>
            <Button variant="outline-danger" onClick={() => handleExternalLogin('google')} className="w-100 mt-2">Entrar com Google</Button>
            <Button variant="outline-primary" onClick={() => handleExternalLogin('microsoft')} className="w-100 mt-2">Entrar com Microsoft</Button>
            {showResendVerification && (
              <Button variant="link" onClick={handleResendEmailVerification} className="mt-3">
                Reenviar e-mail de verificação
              </Button>)}
          </Card.Body>
        </Card>
        <div itemID='container' className='container'></div>
      </Container>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Peça um Convite</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Para se registrar, você precisa de um convite de um usuário já registrado. Peça a um amigo que já esteja na comunidade para lhe enviar um convite.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Fechar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SignIn;
