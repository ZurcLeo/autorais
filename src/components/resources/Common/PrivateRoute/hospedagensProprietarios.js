//eloswebapp/src/components/resources/Common/PrivateRoute/hospedagensProprietarios.js
import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Table } from 'react-bootstrap';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../../../firebase.config';
import { useAuth } from '../../AuthService';
import UploadCSVComponent from '../../UploadCSVFile';
import { toast } from 'react-toastify';

const HospedagensProprietarios = () => {
  const { currentUser } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [selectedReserva, setSelectedReserva] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchReservas = async () => {
    if (currentUser && currentUser.tipoDeConta === 'proprietario') {
      const reservasPath = `hospedagens/${currentUser.uid}/reservas`; // Corrigindo para refletir um caminho válido
      const q = query(collection(db, reservasPath));
      try {
        const querySnapshot = await getDocs(q);
        setReservas(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Erro ao buscar reservas:", error);
        toast.error("Não foi possível carregar as reservas.");
      }
    }
  };

  useEffect(() => {
    if (currentUser.tipoDeConta === 'proprietario') {
      fetchReservas();
    }
  }, [currentUser.uid]);

  const handleShowDetails = (reserva) => {
    setSelectedReserva(reserva);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedReserva(null);
  };

  return (
    <div>
        
      {reservas.map(reserva => (
        <Card key={reserva.id} style={{ margin: '1rem' }}>
          <Card.Body>
            <Card.Title>{reserva.nomePropriedade}</Card.Title>
            <Card.Text>
              Chegada: {new Date(reserva.dataChegada).toLocaleDateString()}
              <br />
              Partida: {new Date(reserva.dataPartida).toLocaleDateString()}
            </Card.Text>
            <Button variant="primary" onClick={() => handleShowDetails(reserva)}>
              Ver Detalhes
            </Button>
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
              <p>Nome: {selectedReserva.nomeCliente}</p>
              <p>Data de Chegada: {new Date(selectedReserva.dataChegada).toLocaleDateString()}</p>
              <p>Data de Partida: {new Date(selectedReserva.dataPartida).toLocaleDateString()}</p>
            </>
          )}
        </Modal.Body>
      </Modal>

      {(currentUser.tipoDeConta === 'suporte' || currentUser.tipoDeConta === 'proprietario') && <UploadCSVComponent />}

    </div>
  );
};

export default HospedagensProprietarios;
