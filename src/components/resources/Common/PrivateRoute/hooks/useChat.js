import { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, updateDoc, limit, startAfter } from 'firebase/firestore';
import { db, storage } from '../../../../../firebase.config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { formatDistanceToNow, format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

const placeholderProfileFoto = process.env.REACT_APP_PLACE_HOLDER_IMG;

export const useChat = (uidRemetente, uidDestinatario, shouldDisplay) => {
  const [mensagens, setMensagens] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [imagemParaEnviar, setImagemParaEnviar] = useState({ preview: '', file: null });
  const mensagensEndRef = useRef(null);
  const [temMensagemNaoLida, setTemMensagemNaoLida] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [allMessagesLoaded, setAllMessagesLoaded] = useState(false);
  const fileInputRef = useRef(null);
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
    fetchAndUpdateMessages();  
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
      preview: URL.createObjectURL(file),
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
      await enviarMensagemComArquivo(arquivoParaEnviar.file, arquivoParaEnviar.type);
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
      setUploadProgress(null);
    }, () => {
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        enviarMensagem(uidRemetente, uidDestinatario, downloadURL, type);
        setArquivoParaEnviar({ preview: '', file: null, type: '' });
        setUploadProgress(null);
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
    } catch (error) {
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
      const audioChunks = [];

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
          },
          (error) => {
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

      mediaRecorder.ondataavailable = e => {
        audioChunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' });
        const previewUrl = URL.createObjectURL(audioBlob);

        setArquivoParaEnviar({
          preview: previewUrl,
          file: audioBlob,
          type: 'audio'
        });
      };
    }
  };

  return {
    mensagens,
    mensagem,
    setMensagem,
    imagemParaEnviar,
    setImagemParaEnviar,
    mensagensEndRef,
    temMensagemNaoLida,
    lastVisible,
    placeholderProfileFoto,
    allMessagesLoaded,
    fileInputRef,
    isRecording,
    setIsRecording,
    mediaRecorder,
    setMediaRecorder,
    audioChunks,
    setAudioChunks,
    uploadProgress,
    setUploadProgress,
    arquivoParaEnviar,
    setArquivoParaEnviar,
    fetchAndUpdateMessages,
    loadMoreMessages,
    handleFileChange,
    handleSubmit,
    enviarMensagemComArquivo,
    enviarMensagem,
    marcarComoLida,
    fetchUserInfo,
    startRecording,
    stopRecording
  };
};
