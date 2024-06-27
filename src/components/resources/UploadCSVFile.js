//eloswebapp/src/components/resources/UploadCSVFile.js
import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Pagination, Card, FormText, Tooltip, OverlayTrigger, Modal, Spinner, Badge } from 'react-bootstrap';
import Papa from 'papaparse';
import { useAuth } from '../resources/AuthService';
import { db } from '../../firebase.config';
import { doc, writeBatch, Timestamp, serverTimestamp, query, getDocs, getDoc, setDoc, collection } from 'firebase/firestore';
import { format } from 'date-fns'; // Biblioteca para formatação de datas
import { toast } from 'react-toastify';

const UploadCSVComponent = () => {
  const { currentUser } = useAuth();
  const [file, setFile] = useState(null);
  const [csvData, setCsvData] = useState([]); // Estado para armazenar os dados do CSV
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const fetchUploadHistory = async () => {
      const historyPath = `usuario/${currentUser.uid}/uploadHistory`;
      const q = query(collection(db, historyPath));
      const querySnapshot = await getDocs(q);
      setUploadHistory(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    if (currentUser) {
      fetchUploadHistory();
    }
  }, [currentUser.uid]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleChange = (e) => {
    setFile(e.target.files[0]);
  };

  const renderTooltip = (props, message) => (
    <Tooltip id="button-tooltip" {...props}>
      {message}
    </Tooltip>
  );

  const handleUpload = async () => {
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: async (result) => {
          setShowConfirmModal(true);
          setCsvData(result.data);
          setIsLoading(false);
        }
      });
    };
    reader.readAsText(file);
  };
  
  const confirmUpload = async () => {
    setIsLoading(true);
    const batch = writeBatch(db); // Cria um novo batch
    let duplicates = 0;
  
    for (let row of csvData) {
      const codigoDeReserva = row['Código de confirmação'].trim();
      const primeiroNome = row['Nome do hóspede'].split(' ')[0].trim();

      const docPath = `reservasIndex/${codigoDeReserva}/nomes/${primeiroNome}`;
      const reservaRef = doc(db, docPath);
      const existingDoc = await getDoc(reservaRef);
  
      if (!existingDoc.exists()) {
        const formattedRow = {
          dataChegada: formatDateForFirestore(row['Data de início']),
          dataPartida: formatDateForFirestore(row['Data de término']),
          timestamp: serverTimestamp(),
          uidProprietario: currentUser.uid,
          codigoDeReserva,
          primeiroNome,
          status: row['Status'],
          telefone: row['Entrar em contato'],
          qtdHospedes: (parseInt(row['Nº de adultos'] || 0) + parseInt(row['Nº de crianças'] || 0) + parseInt(row['Nº de bebês'] || 0)).toString(),
          dataDaReserva: row['Reservado'],
          imovelAlugado: row['Anúncio'],
        };
  
        batch.set(reservaRef, formattedRow); // Adiciona a operação ao batch
      } else {
        duplicates++;
      }
    }

    if (csvData.length > duplicates) {
      await batch.commit(); // Compromete todas as operações no banco de dados de uma só vez
      toast.success(`${csvData.length - duplicates} registros processados com sucesso. ${duplicates} duplicatas ignoradas.`);
    } else {
      toast.info('Nenhuma nova reserva foi adicionada (todos os registros são duplicatas).');
    }
  
    setIsLoading(false);
    setCsvData([]); // Limpa os dados do CSV após o processamento
    setShowConfirmModal(false);
};

  

  const formatDateForFirestore = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return null;
  };
  const handleSendDataClick = () => {
    setShowConfirmModal(true);
  };

  const handleUploadClick = () => {
    if (!file) {
      toast.error("Por favor, selecione um arquivo CSV para carregar.");
      return;
    }
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      Papa.parse(event.target.result, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          setCsvData(result.data);
          setIsLoading(false);
        }
      });
    };
    reader.readAsText(file);
  };

  const fetchUploadHistory = async () => {
    const historyPath = `usuario/${currentUser.uid}/uploadHistory`;
    const q = query(collection(db, historyPath));
    const querySnapshot = await getDocs(q);
    setUploadHistory(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const rowsPerPage = 10; // Define o número de linhas por página
  const pageCount = totalRows > 0 ? Math.ceil(totalRows / rowsPerPage) : 0;

  return (
    <div>
      <Card>
        <Card.Header>Criando Novas Reservas</Card.Header>
        <Card.Body>
        <Form.Group style={{ padding: '20px' }} controlId="formFile" className="mb-3">
      <Form.Label>Reservas em Massa</Form.Label>
      <hr/>
      <FormText style={{ marginLeft: '10px' }}>
        Use este formulário para enviar <Badge bg='warning' ><strong>RESERVAS EM MASSA</strong></Badge>.
      </FormText>
      <br/>
      <FormText style={{ marginLeft: '10px' }}>
        Salve um <Badge bg='success' ><strong>ARQUIVO CSV</strong></Badge> com as informações de cada reserva.
      </FormText>
      <br/>
      <FormText style={{ marginLeft: '10px' }}>
        Seu arquivo deve conter as seguintes colunas:
      </FormText>
      <br/>

      {[
        { id: 'confirmationCode', text: 'Código de confirmação', tooltip: 'Este é o código único para cada reserva.' },
        { id: 'guestName', text: 'Nome do hóspede', tooltip: 'Este é o nome do hóspede que fez a reserva.' },
        { id: 'status', text: 'Status', tooltip: 'Este é o status atual da reserva.' },
        { id: 'contact', text: 'Entrar em contato', tooltip: 'Esta é a informação de contato do hóspede.' },
        { id: 'startDate', text: 'Data de início', tooltip: 'Esta é a data de início da reserva.' },
        { id: 'endDate', text: 'Data de término', tooltip: 'Esta é a data de término da reserva.' },
        { id: 'reservationDate', text: 'Reservado', tooltip: 'Esta é a data em que a reserva foi feita.' },
        { id: 'listing', text: 'Anúncio', tooltip: 'Este é o anúncio para o qual a reserva foi feita.' },
        { id: 'adults', text: 'Nº de adultos', tooltip: 'Este é o número de adultos na reserva.' },
        { id: 'children', text: 'Nº de crianças', tooltip: 'Este é o número de crianças na reserva.' },
        { id: 'babies', text: 'Nº de bebês', tooltip: 'Este é o número de bebês na reserva.' }
      ].map(item => (
        <OverlayTrigger
          key={item.id}
          placement="right"
          overlay={<Tooltip id={`tooltip-${item.id}`}>{item.tooltip}</Tooltip>}
        >
          <FormText style={{ marginLeft: '10px', cursor: 'help' }}><Badge bg='dark' ><strong>{item.text}</strong></Badge></FormText>
        </OverlayTrigger>
      ))}
<br/>
      <br />
      <Form.Control type="file" onChange={handleFileChange} accept=".csv" />
    </Form.Group>
    <Button variant="primary" onClick={handleUploadClick} disabled={isLoading}>
              {isLoading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Upload'}
            </Button>

    {csvData.length > 0 && (
      <>
        <Table striped bordered hover responsive className="mt-3">
          <tbody>
            {csvData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map((row, index) => (
              <tr key={index}>
                {Object.keys(row).map((key, cellIndex) => {
                  const val = row[key];
                  // Verifica se o valor é um Timestamp e o formata
                  if (val instanceof Timestamp) {
                    // Assume que o Timestamp deve ser convertido para data
                    return <td key={cellIndex}>{format(val.toDate(), "dd/MM/yyyy HH:mm:ss")}</td>;
                  }
                  return <td key={cellIndex}>{val.toString()}</td>;
                })}
              </tr>
            ))}
          </tbody>

        </Table>
        <Button variant="primary" onClick={handleSendDataClick} disabled={isLoading}>
              {isLoading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Enviar Dados'}
            </Button>
        {pageCount > 1 && (
                <Pagination>
                  {Array.from({ length: pageCount }, (_, i) => (
                    <Pagination.Item key={i + 1} active={i + 1 === currentPage} onClick={() => handlePageClick(i + 1)}>
                      {i + 1}
                    </Pagination.Item>
                  ))}
                </Pagination>
              )}
      </>
    )}
    </Card.Body>


  </Card>
  {/* Renderização da lista de histórico */}
  <Card className="mt-4">
        <Card.Header>Histórico de Uploads</Card.Header>
        <Card.Body>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Data e Hora</th>
                <th>Tamanho do Arquivo (bytes)</th>
                <th>Quantidade de Reservas</th>
              </tr>
            </thead>
            <tbody>
              {uploadHistory.map((historyItem, index) => (
                <tr key={index}>
                  <td>{format(historyItem.timestamp.toDate(), "dd/MM/yyyy HH:mm:ss")}</td>
                  <td>{historyItem.fileSize}</td>
                  <td>{historyItem.reservationCount}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Envio</Modal.Title>
        </Modal.Header>
        <Modal.Body>Tem certeza de que deseja enviar esses dados para o sistema?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={confirmUpload}>Confirmar</Button>
        </Modal.Footer>
      </Modal>
  </div>
  
  );
};

export default UploadCSVComponent;
