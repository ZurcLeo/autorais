import React, { useState, useEffect } from 'react';
import { db } from '../../../../firebase.config';
import { doc, setDoc, arrayUnion, getDocs, collection } from 'firebase/firestore';
import { useAuth } from '../../AuthService';
import { Button, Image, Container, Row, Col, Modal, Tabs, Tab, ProgressBar, Tooltip, OverlayTrigger, Alert } from 'react-bootstrap';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import './gerenciarFotos.css';

const placeholderFoto = process.env.REACT_APP_PLACE_HOLDER_IMG;

const GridFotos = ({ fotos, onAdd, onFotoClick }) => {
  return (
    <Container>
      <Row>
        {fotos.map((foto, index) => (
          <Col key={index} className="mb-2">
            <Image src={foto.url} className="thumbnail" onClick={() => onFotoClick(foto.url)} />
          </Col>
        ))}
        <Col className="mb-2 d-flex justify-content-center align-items-center">
          <OverlayTrigger overlay={<Tooltip>Adicionar Nova Foto</Tooltip>}>
            <Button variant="outline-primary" size="lg" className="thumbnail" onClick={onAdd}>+</Button>
          </OverlayTrigger>
        </Col>
      </Row>
    </Container>
  );
};

const GerenciarFotos = () => {
  const { currentUser } = useAuth();
  const [fotos, setFotos] = useState([]);
  const [file, setFile] = useState(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedFoto, setSelectedFoto] = useState(null);
  const [activeTab, setActiveTab] = useState('publicas'); // 'publicas' ou 'privadas'
  const [showFoto, setShowFoto] = useState(false);
  const [fotosPublicas, setFotosPublicas] = useState([]);
  const [fotosPrivadas, setFotosPrivadas] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showAlert, setShowAlert] = useState({ show: false, variant: '', message: '' });

  useEffect(() => {
    // Carregar as fotos existentes e atualizar o state 'fotos'
    const fetchFotos = async () => {
      const fotosSnapshot = await getDocs(collection(db, `media/${currentUser.uid}/${isPrivate ? 'privado' : 'publico'}`));
      const fotosList = fotosSnapshot.docs.map(doc => doc.data().fotos).flat();
      setFotos(fotosList);
    };

    fetchFotos();
  }, [currentUser.uid, isPrivate]);

  useEffect(() => {
    // Carregar as fotos públicas
    const fetchFotosPublicas = async () => {
      const fotosSnapshot = await getDocs(collection(db, `media/${currentUser.uid}/publico`));
      const fotosList = fotosSnapshot.docs.map(doc => doc.data().fotos).flat();
      setFotosPublicas(fotosList);
    };
    // Carregar as fotos privadas
    const fetchFotosPrivadas = async () => {
      const fotosSnapshot = await getDocs(collection(db, `media/${currentUser.uid}/privado`));
      const fotosList = fotosSnapshot.docs.map(doc => doc.data().fotos).flat();
      setFotosPrivadas(fotosList);
    };

    fetchFotosPublicas();
    fetchFotosPrivadas();
  }, [currentUser.uid]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    const storage = getStorage();
    const documentId = uuidv4();
    const isPrivate = activeTab === 'privadas'; // Determina se é privado baseado na aba ativa
    const folderPath = `media/${currentUser.uid}/${isPrivate ? 'privado' : 'publico'}/${documentId}`; // Caminho incluindo documentId
    const fileRef = storageRef(storage, `${folderPath}/${file.name}`); // Caminho completo incluindo nome do arquivo

    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        // Atualiza a barra de progresso
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      }, 
      (error) => {
        // Tratamento de erro
        console.error("Erro ao enviar arquivo:", error);
        setShowAlert({ show: true, variant: 'danger', message: 'Erro ao enviar a foto!' });
      }, 
      async () => {
        // Upload completo, obtém a URL do arquivo
        const fileUrl = await getDownloadURL(fileRef);

        // Adiciona a URL da foto no Firestore
        await setDoc(doc(db, "media", currentUser.uid, isPrivate ? "privado" : "publico", documentId), {
          fotos: arrayUnion({
            url: fileUrl,
            data: new Date()
          })
        }, { merge: true });

        // Atualiza o estado local para refletir a nova foto
        if (isPrivate) {
          setFotosPrivadas([...fotosPrivadas, { url: fileUrl }]);
        } else {
          setFotosPublicas([...fotosPublicas, { url: fileUrl }]);
        }

        setFile(null); // Limpa o arquivo selecionado
        setShowAlert({ show: true, variant: 'success', message: 'Foto enviada com sucesso!' });
      }
    );
  };

  const handleFotoClick = (url) => {
    setSelectedFoto(url);
    setShowModal(true);
  };

  const fotosy = activeTab === 'publicas' ? fotosPublicas : fotosPrivadas;

  return (
    <Container>
      {showAlert.show && (
        <Alert variant={showAlert.variant} onClose={() => setShowAlert({ show: false, variant: '', message: '' })} dismissible>
          {showAlert.message}
        </Alert>
      )}
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
        <Tab eventKey="publicas" title="Públicas">
          <GridFotos fotos={fotosPublicas} onAdd={() => document.getElementById('file-upload').click()} onFotoClick={handleFotoClick} />
        </Tab>
        <Tab eventKey="privadas" title="Privadas">
          <GridFotos fotos={fotosPrivadas} onAdd={() => document.getElementById('file-upload').click()} onFotoClick={handleFotoClick} />
        </Tab>
      </Tabs>

      {file && (
        <>
          <ProgressBar now={uploadProgress} label={`${Math.round(uploadProgress)}%`} className="mb-3" />
          <Button onClick={handleUpload} disabled={!file} className="mb-3">
            Enviar Foto
          </Button>
        </>
      )}

      <input
        id="file-upload"
        type="file"
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Visualizar Foto</Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex justify-content-center">
          <Image src={selectedFoto} className="img-fluid" />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default GerenciarFotos;