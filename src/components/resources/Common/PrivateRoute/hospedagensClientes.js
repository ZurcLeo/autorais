//eloswebapp/src/components/resources/Common/PrivateRoute/hospedagensClientes.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Modal, Table } from 'react-bootstrap';
import { db } from '../../../../firebase.config';
import { collection, query, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../AuthService';
import { toast } from 'react-toastify';
import { Eye, EyeSlash } from 'react-bootstrap-icons'; // Assumindo que você está usando react-bootstrap-icons

const HospedagensClientes = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState(null);
  const [showToken, setShowToken] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReservaId, setSelectedReservaId] = useState(null);

  const fetchReservas = async () => {
    const reservasPath = `usuario/${currentUser.uid}/hospedagens`;
    const q = query(collection(db, reservasPath));
    const querySnapshot = await getDocs(q);
    setReservas(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchReservas();
  }, [currentUser.uid]);

  const handleEdit = (reserva) => {
    if (new Date() < new Date(reserva.dataChegada)) {
      navigate(`/checkinform/${reserva.id}`, { state: { reservaId: reserva.id, editing: true } });
    } else {
      alert("Não é possível editar o check-in após a data de chegada.");
      toast.success("Check-in editado com sucesso.");
      fetchReservas(); // Fetch reservas again after successful check-in
    }
  };   
  
  const handleDelete = async (id) => {
    const reservaPath = `usuario/${currentUser.uid}/hospedagens/${id}`;
    if (window.confirm("Tem certeza que deseja apagar os dados do check-in?")) {
      await deleteDoc(doc(db, reservaPath));
      setReservas(reservas.filter(reserva => reserva.id !== id));
      alert("Check-in apagado com sucesso.");
      toast.success("Check-in apagado com sucesso.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedReservaId) {
      const reservaPath = `usuario/${currentUser.uid}/hospedagens/${selectedReservaId}`;
      await deleteDoc(doc(db, reservaPath));
      setReservas(reservas.filter(reserva => reserva.id !== selectedReservaId));
      toast.success("Check-in apagado com sucesso.");
      handleCloseModal(); // Fechar o modal após a deleção
    }
  };

  const handleOpenModal = (id) => {
    setSelectedReservaId(id);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowDeleteModal(false);
    setSelectedReservaId(null);
  };

  const toggleShowToken = () => {
    setShowToken(!showToken);
  }

  const handleShowDetails = (reserva) => {
    setSelectedReserva(reserva);
    setShowDetails(true);
  };

  const handleCloseDetails = () => setShowDetails(false);

  return (
    <div>
      {reservas.map(reserva => (
        <Card key={reserva.id} style={{ width: '18rem', margin: '1rem' }}>
            <Card.Header style={{ backgroundColor: '#b3cc57' }}>Check-in Realizado</Card.Header>
          <Card.Body>
            <Card.Title>Reserva em</Card.Title>
            <Table responsive>
    <tbody>
      <tr>
        <td><strong>Imóvel Alugado:</strong></td>
        <td>{reserva.imovelAlugado}</td>
      </tr>
      <tr>
        <td><strong>Token:</strong></td>
        <td>
          {showToken ? reserva.codigoDeReserva : '••••••••'}
          <Button variant="link" onClick={toggleShowToken} style={{ padding: 0, marginLeft: 5 }}>
            {showToken ? <EyeSlash /> : <Eye />}
          </Button>
        </td>
      </tr>
      <tr>
        <td><strong>Chegada:</strong></td>
        <td>{new Date(reserva.dataChegada).toLocaleDateString()}</td>
      </tr>
      <tr>
        <td><strong>Partida:</strong></td>
        <td>{new Date(reserva.dataPartida).toLocaleDateString()}</td>
      </tr>
    </tbody>
    
  </Table>
  <div style={{ display: 'block', alignContent: 'center', marginTop: '10px' }}>
    <Button style={{ display: 'block', width: '100%'}} variant="info" onClick={() => handleShowDetails(reserva)}>Consultar Detalhes</Button>
    <Button style={{ display: 'block', width: '100%', marginTop: '10px'}} variant="primary" onClick={() => handleEdit(reserva)}>Editar Check-In</Button>
    <Button style={{ display: 'block', width: '100%', marginTop: '10px'}} variant="danger" onClick={() => handleOpenModal(reserva.id)}>Apagar</Button>
    <Modal show={showDeleteModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Deleção</Modal.Title>
        </Modal.Header>
        <Modal.Body>Tem certeza que deseja apagar os dados do check-in?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Apagar
          </Button>
        </Modal.Footer>
      </Modal>
  </div>
          </Card.Body>
        </Card>
      ))}

      <Modal show={showDetails} onHide={handleCloseDetails}>
        <Modal.Header closeButton>
          <Modal.Title>Detalhes da Reserva</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReserva && (
            <>
              <p><strong>Local:</strong>{selectedReserva.imovelAlugado}</p>
              <p><strong>Data de Chegada:</strong> {new Date(selectedReserva.dataChegada).toLocaleDateString()}</p>
              <p><strong>Data de Partida:</strong> {new Date(selectedReserva.dataPartida).toLocaleDateString()}</p>
              <p><strong>Número de Hóspedes:</strong> {selectedReserva.qtdHospedes}</p>
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default HospedagensClientes;
