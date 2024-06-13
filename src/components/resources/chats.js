import React from 'react';
import {
  Button,
  Typography,
  Container,
  IconButton,
  TextField,
  Box,
  LinearProgress,
  Avatar,
} from '@mui/material';
import { IoPaperPlaneOutline, IoAttachOutline, IoMicOutline, IoStopCircleOutline } from "react-icons/io5";
import { formatDistanceToNow, format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useChat } from './Common/PrivateRoute/hooks/useChat';


const FormularioDeMensagem = ({ uidRemetente, uidDestinatario, shouldDisplay }) => {
  const {
    mensagens,
    mensagem,
    setMensagem,
    imagemParaEnviar,
    setImagemParaEnviar,
    mensagensEndRef,
    temMensagemNaoLida,
    lastVisible,
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
    stopRecording,
    placeholderProfileFoto
  } = useChat(uidRemetente, uidDestinatario, shouldDisplay);

  return (
    <Container sx={{ display: shouldDisplay ? 'block' : 'none', mt: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Mensagens
      </Typography>
      <Box className="lista-de-mensagens" sx={{ mb: 2 }}>
        {mensagens.map((msg) => (
          <Box key={msg.id} className={`mensagem ${msg.uidRemetente === uidRemetente ? 'mensagem-enviada' : 'mensagem-recebida'}`} sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
            <Box display="flex" alignItems="center">
              <Avatar src={msg.fotoDoPerfil || placeholderProfileFoto} sx={{ mr: 2 }} />
              <Box>
                <Typography variant="body1" component="span">{msg.nome}</Typography>
                <Typography variant="caption" component="div">
                  {msg.timestamp?.toDate ? formatDistanceToNow(msg.timestamp.toDate(), { addSuffix: true, locale: ptBR }) : ''}
                </Typography>
                {!msg.lido && <Box className="mensagem-nova-indicador" />}
              </Box>
            </Box>
            <Box mt={2}>
              {msg.tipo === 'texto' && <Typography>{msg.conteudo}</Typography>}
              {msg.tipo === 'imagem' && (
                <img
                  src={msg.conteudo}
                  alt="Enviado"
                  style={{ maxWidth: '100%' }}
                  onLoad={() => marcarComoLida(msg.uidRemetente, msg.uidDestinatario, msg.id)}
                />
              )}
              {msg.tipo === 'video' && (
                <video controls style={{ maxWidth: '100%' }} onCanPlay={() => marcarComoLida(msg.uidRemetente, msg.uidDestinatario, msg.id)}>
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
              {msg.uidRemetente === uidRemetente && msg.lido && (
                <Typography variant="caption" color="primary">
                  Lido em {msg.dataLeitura?.toDate ? format(msg.dataLeitura.toDate(), 'dd/MM/yyyy HH:mm') : '...'}
                </Typography>
              )}
            </Box>
          </Box>
        ))}
        {!allMessagesLoaded && (
          <Button onClick={loadMoreMessages}>Ver mais mensagens</Button>
        )}
        <div ref={mensagensEndRef} />
      </Box>

      <Box component="form" onSubmit={handleSubmit} className="mensagem-form" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {arquivoParaEnviar.preview && (
          <>
            {arquivoParaEnviar.type === 'audio' && (
              <Box className="audio-preview" sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                <Typography variant="h6">Você está enviando um áudio</Typography>
                <audio controls src={arquivoParaEnviar.preview}>
                  Seu navegador não suporta o elemento de áudio.
                </audio>
                <Button variant="contained" color="error" onClick={() => setArquivoParaEnviar({ preview: '', file: null, type: '' })}>
                  Cancelar Envio
                </Button>
              </Box>
            )}
            {arquivoParaEnviar.type === 'imagem' && (
              <Box className="image-preview" sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                <Typography variant="h6">Você está enviando uma imagem</Typography>
                <img src={arquivoParaEnviar.preview} alt="Preview" style={{ maxWidth: '100%', marginBottom: '10px' }} />
                <Button variant="contained" color="error" onClick={() => setArquivoParaEnviar({ preview: '', file: null, type: '' })}>
                  Cancelar Envio
                </Button>
              </Box>
            )}
            {arquivoParaEnviar.type === 'video' && (
              <Box className="video-preview" sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                <Typography variant="h6">Você está enviando um vídeo</Typography>
                <video controls style={{ maxWidth: '100%' }}>
                  <source src={arquivoParaEnviar.preview} type="video/mp4" />
                </video>
                <Button variant="contained" color="error" onClick={() => setArquivoParaEnviar({ preview: '', file: null, type: '' })}>
                  Cancelar Envio
                </Button>
              </Box>
            )}
          </>
        )}
        <TextField
          variant="outlined"
          fullWidth
          placeholder="Digite uma mensagem..."
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          sx={{ borderRadius: '50px 0 0 50px' }}
        />
        <IconButton color={isRecording ? "error" : "primary"} onClick={isRecording ? stopRecording : startRecording}>
          {isRecording ? <IoStopCircleOutline /> : <IoMicOutline />}
        </IconButton>
        <IconButton color="default" onClick={() => fileInputRef.current.click()}>
          <IoAttachOutline />
        </IconButton>
        <input
          type="file"
          hidden
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple={false}
          accept="image/*,video/*,audio/*"
        />
        <IconButton color="primary" type="submit" onClick={handleSubmit}>
          <IoPaperPlaneOutline />
        </IconButton>
      </Box>
      {uploadProgress !== null && (
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Typography variant="body2" color="textSecondary">{`${uploadProgress.toFixed(2)}%`}</Typography>
        </Box>
      )}
    </Container>
  );
};

export default FormularioDeMensagem;
