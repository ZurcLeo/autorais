import React, { useEffect, useState, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, updateDoc, limit, startAfter } from 'firebase/firestore';
import { db, storage } from '../../firebase.config';
import { Button, Card, Form, InputGroup, FormControl, Container, ProgressBar, Col, Row } from 'react-bootstrap';
import { IoPaperPlaneOutline, IoAttachOutline, IoMicOutline, IoStopCircleOutline } from "react-icons/io5";
import { formatDistanceToNow, format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import './chats.css';
import { useStatus } from './StatusContext';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const placeholderProfileFoto = process.env.REACT_APP_PLACE_HOLDER_IMG;

const FormularioDeMensagem = ({ uidRemetente, uidDestinatario, shouldDisplay }) => {
    const [mensagens, setMensagens] = useState([]);
    const [mensagem, setMensagem] = useState('');
    const [imagemParaEnviar, setImagemParaEnviar] = useState({ preview: '', file: null });
    const mensagensEndRef = useRef(null);
    const [temMensagemNaoLida, setTemMensagemNaoLida] = useState(false);
    const [lastVisible, setLastVisible] = useState(null);
    const [allMessagesLoaded, setAllMessagesLoaded] = useState(false);
    const fileInputRef = useRef(null);
    const { updateStatus } = useStatus();
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(null);
    const [arquivoParaEnviar, setArquivoParaEnviar] = useState({ preview: '', file: null, type: '' });


    const fetchAndUpdateMessages = async (loadMore = false) => {
        if (shouldDisplay && uidRemetente && uidDestinatario) {
            const idsOrdenados = [uidRemetente, uidDestinatario].sort();
            const conversaId = `${idsOrdenados[0]}_${idsOrdenados[1]}`;
            let queryRef = query(
                collection(db, `mensagens/${conversaId}/msgs`),
                orderBy("timestamp", "desc"),
                limit(5)
            );
    
            if (loadMore && lastVisible) {
                queryRef = query(
                    collection(db, `mensagens/${conversaId}/msgs`),
                    orderBy("timestamp", "desc"),
                    startAfter(lastVisible),
                    limit(5)
                );
            }
    
            const unsubscribe = onSnapshot(queryRef, async (querySnapshot) => {
                if (!querySnapshot.empty) {
                    const userInfosPromises = querySnapshot.docs.map(async doc => {
                        const data = doc.data();
                        const userInfo = await fetchUserInfo(data.uidRemetente);
                        return {
                            id: doc.id,
                            ...data,
                            nome: userInfo?.nome || 'Usuário Anônimo',
                            fotoDoPerfil: userInfo?.fotoDoPerfil || placeholderProfileFoto,
                        };
                    });
    
                    const messagesWithUserInfo = await Promise.all(userInfosPromises);
                    setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
    
                    if (loadMore) {
                        setMensagens(prevMessages => [...messagesWithUserInfo.reverse(), ...prevMessages]);
                    } else {
                        setMensagens(messagesWithUserInfo.reverse());
                    }
                } else {
                    setAllMessagesLoaded(true);
                }
            });
    
            return () => unsubscribe();
        }
    };
    

    useEffect(() => {
        fetchAndUpdateMessages();  // Chama a função para buscar mensagens inicialmente
    }, [uidRemetente, uidDestinatario, shouldDisplay]); 

    useEffect(() => {
        mensagens.forEach(msg => {
            if (msg.tipo === 'texto' && msg.uidRemetente !== uidRemetente && !msg.lido) {
                marcarComoLida(msg.uidRemetente, msg.uidDestinatario, msg.id);
            }
        });
    }, [mensagens]); 

    useEffect(() => {
        const verificaMensagensNaoLidas = mensagens.some(msg => !msg.lido && msg.uidDestinatario === uidRemetente);
        setTemMensagemNaoLida(verificaMensagensNaoLidas);
      }, [mensagens, uidRemetente]);
      

    useEffect(() => {
        // Quando o componente for desmontado, limpa as URLs de objetos criadas
        return () => {
          if (arquivoParaEnviar.preview) {
            URL.revokeObjectURL(arquivoParaEnviar.preview);
          }
        };
      }, [arquivoParaEnviar.preview]);

      const loadMoreMessages = () => {
        fetchAndUpdateMessages(true);
    };

      const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;
    
        const fileType = file.type.startsWith('image') ? 'imagem' :
                         file.type.startsWith('audio') ? 'audio' :
                         file.type.startsWith('video') ? 'video' : null;
    
        setArquivoParaEnviar({
            preview: URL.createObjectURL(file), // Gera uma URL para qualquer tipo de arquivo
            file: file,
            type: fileType
        });
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (mensagem.trim()) {
            await enviarMensagem(uidRemetente, uidDestinatario, mensagem, 'texto');
            setMensagem('');
        } else if (arquivoParaEnviar.file) {
            await enviarMensagemComArquivo(arquivoParaEnviar.file, arquivoParaEnviar.type); // Passe 'arquivoParaEnviar.type' aqui
            setArquivoParaEnviar({ preview: '', file: null, type: '' });
        }
    };
    

    const enviarMensagemComArquivo = async () => {
        if (!arquivoParaEnviar.file) return;
    
        const { file, type } = arquivoParaEnviar;
        const idsOrdenados = [uidRemetente, uidDestinatario].sort();
        const conversaId = `${idsOrdenados[0]}_${idsOrdenados[1]}`;
        const storageRef = ref(storage, `uploads/mensagens/${conversaId}/${Date.now()}_${file.name}`);
    
        const uploadTask = uploadBytesResumable(storageRef, file);
    
        uploadTask.on("state_changed", (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
        }, error => {
            console.error("Upload failed:", error);
            setUploadProgress(null); // Reiniciar o progresso em caso de erro
        }, () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                enviarMensagem(uidRemetente, uidDestinatario, downloadURL, type);
                setArquivoParaEnviar({ preview: '', file: null, type: '' });
                setUploadProgress(null); // Reiniciar o progresso após o upload ser concluído
            });
        });
    };
    
    
    
    const enviarMensagem = async (uidRemetente, uidDestinatario, conteudo, tipo) => {
        const idsOrdenados = [uidRemetente, uidDestinatario].sort();
        const conversaId = `${idsOrdenados[0]}_${idsOrdenados[1]}`;
        try {
            await addDoc(collection(db, `mensagens/${conversaId}/msgs`), {
                uidRemetente,
                uidDestinatario,
                conteudo,   
                tipo,
                timestamp: serverTimestamp(),
                lido: false,
            });
            updateStatus({ color: 'verde', message: 'Mensagem enviada com sucesso.' });
        } catch (error) {
            updateStatus({ color: 'vermelho', message: `Erro ao enviar mensagem: ${error.message}` });
        }
    };

    const marcarComoLida = async (uidRemetente, uidDestinatario, msgId) => {
        const idsOrdenados = [uidRemetente, uidDestinatario].sort();
        const conversaId = `${idsOrdenados[0]}_${idsOrdenados[1]}`;
        const msgRef = doc(db, `mensagens/${conversaId}/msgs`, msgId);
        const msgDoc = await getDoc(msgRef);
        if (msgDoc.exists() && !msgDoc.data().lido) {
            await updateDoc(msgRef, {
                lido: true,
                dataLeitura: serverTimestamp(),
            });
        }
    };
    

    const fetchUserInfo = async (userId) => {
        const userRef = doc(db, `usuario/${userId}`);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            return userSnap.data();
        } else {
            return null;
        }
    };

    const startRecording = async () => {
        setIsRecording(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const audioChunks = [];  // Inicialize os chunks aqui para garantir um escopo limpo a cada gravação
    
            recorder.ondataavailable = e => {
                audioChunks.push(e.data);
            };
    
            recorder.onstop = async () => {
                const idsOrdenados = [uidRemetente, uidDestinatario].sort();
                const conversaId = `${idsOrdenados[0]}_${idsOrdenados[1]}`;
                const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' });
                const storageRef = ref(storage, `uploads/mensagens/${conversaId}/${uidRemetente}_${Date.now()}_audio.mp3`);
                const uploadTask = uploadBytesResumable(storageRef, audioBlob);
    
                uploadTask.on('state_changed',
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        updateStatus({ color: 'azul', message: `Upload de áudio ${progress.toFixed(0)}% concluído.` });
                    },
                    (error) => {
                        updateStatus({ color: 'vermelho', message: `Erro ao enviar áudio: ${error.message}` });
                    },
                    () => {
                        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                            enviarMensagem(uidRemetente, uidDestinatario, downloadURL, 'audio');
                        });
                    }
                );
            };
    
            recorder.start();
            setMediaRecorder(recorder);
        } catch (error) {
            console.error("Erro ao acessar o microfone:", error);
        }
    };
    
    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop();
            setIsRecording(false);
    
            // Acumulando dados e preparando para a pré-visualização
            mediaRecorder.ondataavailable = e => {
                audioChunks.push(e.data);
            };
    
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' });
                const previewUrl = URL.createObjectURL(audioBlob);
    
                // Atualiza o estado para permitir a pré-visualização
                setArquivoParaEnviar({
                    preview: previewUrl,
                    file: audioBlob,
                    type: 'audio'
                });
            };
        }
    };
    
    
    

    return (
        <Container className={shouldDisplay ? '' : 'd-none'}>
            <Card className="mensagem-card">
                <Card.Header>Mensagens</Card.Header>
                <div className="lista-de-mensagens">
                {mensagens.map((msg) => (
  <div key={msg.id} className={`mensagem ${msg.uidRemetente === uidRemetente ? 'mensagem-enviada' : 'mensagem-recebida'}`}>
    <Card>
      <Card.Header>
        <div className="mensagem-cabecalho">
          <img src={msg.fotoDoPerfil || placeholderProfileFoto} alt="Foto do perfil" className="mensagem-foto" />
          {!msg.lido && <div className="mensagem-nova-indicador"></div>}
                <div className="mensagem-info">
                  <span className="mensagem-nome">{msg.nome}</span> 
            <small>
              {msg.timestamp?.toDate ? formatDistanceToNow(msg.timestamp.toDate(), { addSuffix: true, locale: ptBR }) : ''}
            </small>
          </div>
        </div>
      </Card.Header>
      <Card.Body>
  {msg.tipo === 'texto' && (
                                    <div>
                                        {msg.conteudo}
                                    </div>
                                )}
                                <small style={{ fontSize: '0.8rem', color: msg.lido ? '#3366FF' : '#33CCFF' }}>
                                    {msg.uidRemetente === uidRemetente && !msg.lido ? `Enviado em ${msg.timestamp?.toDate ? format(msg.timestamp.toDate(), 'dd/MM/yyyy HH:mm') : 'Data não disponível'}` : ''}
                                </small>
    {msg.tipo === 'imagem' && (
        <img src={msg.conteudo} alt="Enviado" style={{ maxWidth: '100%' }}
        onLoad={() => marcarComoLida(msg.uidRemetente, msg.uidDestinatario, msg.id)}
        />
    )}
    {msg.tipo === 'video' && (
        <video controls style={{ maxWidth: '100%' }}
        onCanPlay={() => marcarComoLida(msg.uidRemetente, msg.uidDestinatario, msg.id)}>
        <source src={msg.conteudo} type="video/mp4" />
            Seu navegador não suporta vídeos.
        </video>
    )}
    {msg.tipo === 'audio' && (
    <audio style={{ borderRadius: '50px', width: '100%' }} controls onCanPlay={() => marcarComoLida(msg.uidRemetente, msg.uidDestinatario, msg.id)}>
    <source src={msg.conteudo} type="audio/mpeg" />
            Seu navegador não suporta áudios.
        </audio>
    )}
    <p>
    {msg.uidRemetente === uidRemetente && msg.lido && (
          <small className="text-muted" style={{ fontSize: '0.8rem', color: msg.lido ? '#3366FF' : '#33CCFF' }}>
         Lido em {msg.dataLeitura?.toDate ? format(msg.dataLeitura.toDate(), 'dd/MM/yyyy HH:mm') : '...'}
          </small>
        )}    </p>
    <p style={{ fontSize: '0.5rem' }}>

    </p>
</Card.Body>

    </Card>
  </div>
))}
 {!allMessagesLoaded && (
                <Button onClick={loadMoreMessages}>Ver mais mensagens</Button>
            )}
                    <div ref={mensagensEndRef} />
                </div>

                <div>
                    <Form onSubmit={handleSubmit} className="mensagem-form">
                    <div>
                    {arquivoParaEnviar.preview && (
    <>
        {arquivoParaEnviar.type === 'audio' && (
            <Card className='audio-preview'>
                <Card.Header>Você está enviando um áudio</Card.Header>
                <Card.Body>
                    <audio controls src={arquivoParaEnviar.preview}>
                        Seu navegador não suporta o elemento de áudio.
                    </audio>
                    <hr/>
                    <Button variant="danger" onClick={() => setArquivoParaEnviar({ preview: '', file: null, type: '' })}>
                        Cancelar Envio
                    </Button>
                </Card.Body>
            </Card>
        )}
        {arquivoParaEnviar.type === 'imagem' && (
            <Card className="image-preview">
                <Card.Header>Você está enviando uma imagem</Card.Header>
                <Card.Body>
                    <img src={arquivoParaEnviar.preview} alt="Preview" style={{ maxWidth: '100%', marginBottom: '10px' }} />
                    <hr/>
                    <Button variant="danger" onClick={() => setArquivoParaEnviar({ preview: '', file: null, type: '' })}>
                        Cancelar Envio
                    </Button>
                </Card.Body>
            </Card>
        )}
        {arquivoParaEnviar.type === 'video' && (
            <Card className="video-preview">
                <Card.Header>Você está enviando um vídeo</Card.Header>
                <Card.Body>
                    <video controls style={{ maxWidth: '100%' }}>
                        <source src={arquivoParaEnviar.preview} type="video/mp4" />
                    </video>
                    <hr/>
                    <Button variant="danger" onClick={() => setArquivoParaEnviar({ preview: '', file: null, type: '' })}>
                        Cancelar Envio
                    </Button>
                </Card.Body>
            </Card>
        )}
    </>
)}

</div>
    <div>
                    <InputGroup  style={{ margin: '-5px 10px 10px 10px' }} >
                    <FormControl
                        placeholder="Digite uma mensagem..."
                        value={mensagem}
                        onChange={(e) => setMensagem(e.target.value)}
                        style={{ borderRadius: '50px 0 0 50px'}}
                    />
                   
                    <Button variant={isRecording ? "danger" : "success"} onClick={isRecording ? stopRecording : startRecording}>
                        {isRecording ? <IoStopCircleOutline /> : <IoMicOutline />}
                    </Button>
                    <Button variant="outline-secondary" onClick={() => fileInputRef.current.click()}>
                        <IoAttachOutline />
                    </Button>
                    <input
                        type="file"
                        hidden
                        ref={fileInputRef}  // Assegure-se de que esta linha está corretamente colocada como mostrado
                        onChange={handleFileChange}
                        multiple={false}
                        accept="image/*,video/*,audio/*"
                    />
                    <Button style={{ borderRadius: '0 50px 50px 0', marginRight: '20px'}} variant="primary" type="submit" onClick={handleSubmit}>
                        <IoPaperPlaneOutline />
                    </Button>
                </InputGroup>
                </div>
                    </Form>
                </div>
                <div>
                {uploadProgress !== null && (
                <ProgressBar now={uploadProgress} label={`${uploadProgress.toFixed(2)}%`} />
            )}
            </div>
            </Card>
        </Container>
    );
};

export default FormularioDeMensagem;