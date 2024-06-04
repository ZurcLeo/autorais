//eloswebapp/src/components/resources/Common/PrivateRoute/hospedagens.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom'; // Correção aqui
import { db } from '../../../../firebase.config';
import { doc, getDoc, setDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { useAuth } from '../../AuthService';
import { Form, Button, Card, Col, Modal, Row, InputGroup, FormControl, DropdownButton, Dropdown, Container, FormText, Badge } from 'react-bootstrap';
import UploadCSVComponent from '../../UploadCSVFile';
import { toast } from 'react-toastify';

const paises = ["Brasil", "Estados Unidos", "Canadá", "França", "Alemanha"];

const initialFormData = {
  nomeCompleto: '',
  sobrenome: '',
  endereco: '',
  cidade: '',
  pais: '',
  documentoTipo: 'CPF',
  documentoNumero: '',
  documentoEmissor: '',
  documentoEmissao: '',
  telefone: '',
  dataChegada: '',
  dataPartida: '',
  checkInHora: '',
  checkOutHora: '',
  email: '',
  contatoEmergenciaNome: '',
  contatoEmergenciaTelefone: '',
};

const CheckInForm = () => {
  const navigate = useNavigate();
  const { reservaId } = useParams();  // Captura o reservaId da URL
  const { currentUser } = useAuth();
  const [reservaCodigo, setReservaCodigo] = useState('');
  const [reservaDados, setReservaDados] = useState(null);
  const [erro, setErro] = useState('');
  const [primeiroNome, setPrimeiroNome] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const location = useLocation();
  const isEditing = location.state?.editing;
  const [formData, setFormData] = useState(initialFormData);


  useEffect(() => {
    const fetchReserva = async () => {
      if (!reservaId && !(isEditing && location.state?.reservaId)) {
        return;
      }
  
      const idToUse = reservaId || location.state.reservaId; // Define qual ID usar.
      const docRef = doc(db, `usuario/${currentUser.uid}/hospedagens/${idToUse}`); // Referência do documento.
  
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setReservaDados(data);
          setFormData({ ...initialFormData, ...data }); // Atualiza o formulário com os dados carregados.
        } else {
          toast.error("Reserva não encontrada.");
          setFormData(initialFormData); // Reseta o formulário se a reserva não for encontrada.
        }
      } catch (error) {
        console.error("Erro ao buscar dados da reserva:", error);
        toast.error("Erro ao buscar dados da reserva.");
      }
    };
  
    fetchReserva(); // Chama a função se estiver editando ou se um ID de reserva estiver disponível.
  }, [reservaId, isEditing, currentUser.uid, location.state]); // Dependências do useEffect.
  
  
  

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === "reservaCodigo") {
      setReservaCodigo(value);
    } else if (name === "primeiroNome") {
      setPrimeiroNome(value);
    } else {
      setFormData({ ...formData, [name]: value });
      
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectPais = (pais) => {
    setFormData({ ...formData, pais });
  };

  const handleSelectDocumentoTipo = (tipo) => {
    setFormData({ ...formData, documentoTipo: tipo });
  };

  const verificarCodigoReserva = async () => {
    if (!reservaCodigo || !primeiroNome) {
      setErro('Por favor, insira um código de reserva válido e o primeiro nome.');
      toast.error('Por favor, insira um código de reserva válido e o primeiro nome.');
      return;
    }
  
    const reservaRef = doc(db, `reservasIndex/${reservaCodigo}/nomes/${primeiroNome}`);
    try {
      const docSnap = await getDoc(reservaRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setReservaDados(data);
        setFormData({
          ...formData,
          // Assegure-se que os campos aqui correspondam aos da sua base de dados
          nomeCompleto: data.nomeCompleto || '',
          sobrenome: data.sobrenome || '',
          endereco: data.endereco || '',
          cidade: data.cidade || '',
          pais: data.pais || '',
          documentoTipo: data.documentoTipo || 'CPF',
          documentoNumero: data.documentoNumero || '',
          documentoEmissor: data.documentoEmissor || '',
          documentoEmissao: data.documentoEmissao || '',
          telefone: data.telefone || '',
          dataChegada: data.dataChegada || '',
          dataPartida: data.dataPartida || '',
          checkInHora: data.checkInHora || '',
          checkOutHora: data.checkOutHora || '',
          email: data.email || '',
          contatoEmergenciaNome: data.contatoEmergenciaNome || '',
          contatoEmergenciaTelefone: data.contatoEmergenciaTelefone || '',
        });
        toast.success('Dados da reserva carregados com sucesso!');
      } else {
        setErro("Código de reserva não encontrado ou primeiro nome incorreto.");
        toast.error("Código de reserva não encontrado ou primeiro nome incorreto.");
      }
    } catch (error) {
      console.error("Erro ao buscar dados da reserva:", error);
      setErro("Erro ao buscar dados da reserva.");
      toast.error("Erro ao buscar dados da reserva.");
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    // Logic to update an existing document
    const docRef = doc(db, `usuario/${currentUser.uid}/hospedagens/${reservaId}`);
    await setDoc(docRef, { ...formData, timestamp: serverTimestamp() }, { merge: true });
    toast.success('Check-in atualizado com sucesso!');
    navigate('/HospedagensClientes');
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    // Logic to add a new document
    const colRef = collection(db, `usuario/${currentUser.uid}/hospedagens`);
    await addDoc(colRef, { ...formData, timestamp: serverTimestamp() });
    toast.success('Check-in concluído com sucesso!');
    navigate('/HospedagensClientes');
  };

  return (
    <Container>
      <Row>
        <Col>
        <Card style={{ margin: '20px' }}>
            <Card.Header>Check-In On-line</Card.Header>
            <Card.Body>
            <InputGroup className="mb-3">
            <FormControl
              placeholder="Código da reserva"
              aria-label="Código da reserva"
              name="reservaCodigo"
              value={reservaCodigo}
              onChange={handleInputChange}
            />
             <FormControl
              placeholder="Primeiro Nome"
              aria-label="Primeiro Nome"
              name="primeiroNome"
              value={primeiroNome}
              onChange={handleInputChange}
            />
            <Button variant="outline-secondary" onClick={verificarCodigoReserva}>
              Verificar
            </Button>
          </InputGroup>
          {erro && <p className="text-danger">{erro}</p>}
          
          <hr/>
                                    
                                    <FormText style={{ marginLeft: '10px' }}>Você deve incluir apenas o <Badge bg='success' ><strong>PRIMEIRO NOME</strong></Badge> do hóspede principal no campo "Nome do hóspede".</FormText>
                                    <br />
                                    <FormText style={{ marginLeft: '10px' }}>Se não conseguir localizar sua reserva lembre-se de verificar a <Badge bg='info' ><strong>DATA DA CHEGADA</strong></Badge> e a <Badge bg='warning' ><strong>DATA DA PARTIDA</strong></Badge>.</FormText>
                                    <br />
                                    <FormText style={{ marginLeft: '10px' }}>Se você não tiver um <Badge bg='dark' ><strong>CÓDIGO DE RESERVA</strong></Badge>, verifique-o no seu Airbnb ou com o proprietário.</FormText>
                                   <br />
                                    <FormText style={{ marginLeft: '10px' }}>O seu código de reserva deve se parecer com isso: <Badge bg='danger' ><strong>HB0MLS5DGB</strong></Badge></FormText>
                                    <br/>
                                   
      
          
          </Card.Body>
        </Card>
        
        

          {reservaDados && (
            <Form>
              {/* Campos do formulário aqui, cada um com um handleChange para atualizar o state */}
              <Form.Group controlId="formBasicEmail">
                <Form.Label>Nome Completo</Form.Label>
                <Form.Control
                  type="text"
                  name="nomeCompleto"
                  value={reservaDados ? reservaDados.primeiroNome : formData.primeiroNome}
                  onChange={handleChange}
                  required
                  disabled
                />
              </Form.Group>

              <Form.Group>
<Form.Label>Sobrenome</Form.Label>
<Form.Control
  required
  type="text"
  name="sobrenome"
  value={formData.sobrenome}
  onChange={handleChange}
/>
</Form.Group>

              <Form.Group>
<Form.Label>Endereço</Form.Label>
<Form.Control
  required
  type="text"
  name="endereco"
  value={formData.endereco}
  onChange={handleChange}
/>
</Form.Group>

<Form.Group>
<Form.Label>Cidade</Form.Label>
<Form.Control
  required
  type="text"
  name="cidade"
  value={formData.cidade}
  onChange={handleChange}
/>
</Form.Group>

<Form.Group>
<Form.Label>CPF ou Passaporte</Form.Label>
<InputGroup>
  <DropdownButton
    variant="outline-secondary"
    title={formData.documentoTipo}
    id="input-group-dropdown-1"
    onSelect={handleSelectDocumentoTipo}
  >
    <Dropdown.Item eventKey="CPF">CPF</Dropdown.Item>
    <Dropdown.Item eventKey="Passaporte">Passaporte</Dropdown.Item>
  </DropdownButton>
  <FormControl
    required
    name="documentoNumero"
    value={formData.documentoNumero}
    onChange={handleChange}
    aria-label="Número do documento"
  />
</InputGroup>
<Form.Group>
<Form.Label>{formData.documentoTipo}</Form.Label>
<FormControl
  required
  name="documentoNumero"
  placeholder={`Digite seu ${formData.documentoTipo}`}
  value={formData.documentoNumero}
  onChange={handleChange}
  aria-label="Número do documento"
/>
</Form.Group>
</Form.Group>
{formData.documentoTipo === "Passaporte" && (
<>
      <Form.Group>
    <Form.Label>Emitido por</Form.Label>
    <Form.Control
      type="text"
      name="documentoEmissor"
      value={formData.documentoEmissor}
      onChange={handleChange}
    />
  </Form.Group>

  <Form.Group>
    <Form.Label>Emitido em</Form.Label>
    <Form.Control
      type="date"
      name="documentoEmissao"
      value={formData.documentoEmissao}
      onChange={handleChange}
    />
  </Form.Group>
</>

)}

<Form.Group>
<Form.Label>Telefone</Form.Label>
<Form.Control
  required
  type="tel"
  name="telefone"
  value={reservaDados ? reservaDados.telefone : formData.telefone}
  onChange={handleChange}
  disabled
/>
</Form.Group>

<Form.Group>
<Form.Label>Email</Form.Label>
<Form.Control
  required
  type="email"
  name="email"
  value={formData.email}
  onChange={handleChange}
/>
</Form.Group>

<Form.Group>
<Form.Label>Data de Chegada</Form.Label>
<Form.Control
  required
  type="date"
  name="chegadaData"
  value={formData.dataChegada}
  onChange={handleChange}
  disabled
/>
</Form.Group>

<Form.Group>
<Form.Label>Data de Partida</Form.Label>
<Form.Control
  required
  type="date"
  name="partidaData"
  value={formData.dataPartida}
  onChange={handleChange}
  disabled
/>
</Form.Group>

<Form.Group>
<Form.Label>Hora do Check-In</Form.Label>
<Form.Control
  required
  type="time"
  name="checkInHora"
  value={formData.checkInHora}
  onChange={handleChange}
/>
</Form.Group>

<Form.Group>
<Form.Label>Hora do Check-Out</Form.Label>
<Form.Control
  required
  type="time"
  name="checkOutHora"
  value={formData.checkOutHora}
  onChange={handleChange}
/>
</Form.Group>

{/* Campos não obrigatórios */}
<Form.Group>
<Form.Label>Nome de Contato de Emergência</Form.Label>
<Form.Control
  type="text"
  name="contatoEmergenciaNome"
  value={formData.contatoEmergenciaNome}
  onChange={handleChange}
/>
</Form.Group>

<Form.Group>
<Form.Label>Telefone do Contato de Emergência</Form.Label>
<Form.Control
  type="tel"
  name="contatoEmergenciaTelefone"
  value={formData.contatoEmergenciaTelefone}
  onChange={handleChange}
/>
</Form.Group>
<Form.Group>
        <Form.Label>País</Form.Label>
        <DropdownButton
          title={formData.pais || "Selecionar País"}
          onSelect={handleSelectPais}
        >
          {paises.map((pais, index) => (
            <Dropdown.Item key={index} eventKey={pais}>{pais}</Dropdown.Item>
          ))}
        </DropdownButton>
      </Form.Group>
      <Container>
      {/* Form rendering and other UI elements */}
      {isEditing ? (
        <Button onClick={handleUpdateSubmit}>Atualizar Check-In</Button>
      ) : (
        <Button onClick={handleCreateSubmit}>Concluir Check-In</Button>
      )}
    </Container>
            </Form>
          )}

{showSuccessModal && (
  <Modal>
    <Modal.Header>Check-In Concluído</Modal.Header>
    <Modal.Body>Seu check-in foi concluído com sucesso!</Modal.Body>
    <Modal.Footer>
      <Button onClick={() => navigate('/HospedagensClientes')}>Voltar</Button>
    </Modal.Footer>
  </Modal>
)}

        </Col>
      </Row>
    </Container>
  );
};

export default CheckInForm;