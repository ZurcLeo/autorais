// components/Chat/ModernChatInput.js
import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Tooltip,
  ClickAwayListener,
  Chip,
  CircularProgress
} from '@mui/material';

// Ícones
import SendIcon from '@mui/icons-material/Send';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import MicIcon from '@mui/icons-material/Mic';
import CancelIcon from '@mui/icons-material/Cancel';

// Emoji picker
import EmojiPicker from 'emoji-picker-react';

// Componente principal simplificado
const ModernChatInput = ({
  onSendMessage,
  friendName,
  isTyping = false,
  disabled = false,
  onTyping = () => {}
}) => {
  // Estados
  const [message, setMessage] = useState('');
  const [rows, setRows] = useState(1);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Refs
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Lista de respostas rápidas contextuais
  const quickReplies = [
    'Olá!',
    'Tudo bem?',
    'Vamos marcar algo?',
    'Até mais tarde!',
    'Desculpe, estou ocupado agora'
  ];

  // Calcular número de linhas com base no conteúdo
  useEffect(() => {
    const lineCount = (message.match(/\n/g) || []).length + 1;
    setRows(Math.min(lineCount, 4)); // Limitar a 4 linhas
  }, [message]);

  // Funções de manipulação
  const handleSendMessage = async () => {
    if (!message.trim() && attachments.length === 0) return;

    try {
      setIsSending(true);

      // Preparar dados da mensagem
      const messageData = {
        text: message.trim(),
        attachments: attachments.map(file => ({
          name: file.name,
          type: file.type,
          file: file // Enviar o objeto de arquivo
        })),
        timestamp: new Date().toISOString()
      };

      // Enviar mensagem via callback
      await onSendMessage(messageData);

      // Limpar após envio bem-sucedido
      setMessage('');
      setAttachments([]);
      setShowEmojiPicker(false);

      // Focar o input novamente
      inputRef.current?.focus();
      
      // Limpar status de digitação
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
        onTyping(false);
      }
      
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiSelect = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
    inputRef.current?.focus();
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setAttachments(prev => [...prev, ...files]);
    event.target.value = '';
  };

  const handlePhotoCapture = (event) => {
    const files = Array.from(event.target.files);
    setAttachments(prev => [...prev, ...files]);
    event.target.value = '';
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleQuickReply = (reply) => {
    setMessage(reply);
    // Opcional: Focar o input após selecionar resposta rápida
    inputRef.current?.focus();
  };

  const toggleRecording = () => {
    // Implementação real usaria a Web Audio API para gravação
    setIsRecording(!isRecording);
    
    if (isRecording) {
      // Simular finalização de gravação de áudio (em uma implementação real)
      // Aqui você adicionaria a lógica para processar o áudio gravado
      setTimeout(() => {
        // Adicionar arquivo de áudio simulado
        const audioBlob = new Blob(['dummy audio data'], { type: 'audio/mp3' });
        const audioFile = new File([audioBlob], 'gravacao.mp3', { type: 'audio/mp3' });
        setAttachments(prev => [...prev, audioFile]);
      }, 500);
    }
  };
  
  // Manipulação do estado de digitação
  const handleTyping = () => {
    // Notificar que o usuário está digitando
    onTyping(true);
    
    // Se já estiver com um timeout de digitação, limpar e criar um novo
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Configurar novo timeout para desativar o estado de digitação
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
      typingTimeoutRef.current = null;
    }, 2000);
  };

  // Fechar emoji picker ao clicar fora
  const handleClickAway = () => {
    setShowEmojiPicker(false);
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ position: 'relative', width: '100%' }}>
        {/* Emoji Picker */}
        {showEmojiPicker && (
          <Box
            ref={emojiPickerRef}
            sx={{
              position: 'absolute',
              bottom: '100%',
              right: 0,
              mb: 1,
              zIndex: 10
            }}
          >
            <EmojiPicker onEmojiClick={handleEmojiSelect} width={320} height={400} />
          </Box>
        )}

        {/* Respostas rápidas */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.5,
            mb: 1,
            mx: 1
          }}
        >
          {quickReplies.map(reply => (
            <Chip
              key={reply}
              label={reply}
              variant="outlined"
              size="small"
              onClick={() => handleQuickReply(reply)}
              sx={{
                borderRadius: '16px',
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'white'
                }
              }}
            />
          ))}
        </Box>

        {/* Área de preview de arquivos */}
        {attachments.length > 0 && (
          <Paper
            elevation={1}
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0.5,
              p: 1,
              mb: 1,
              borderRadius: 1
            }}
          >
            {attachments.map((file, index) => (
              <Box
                key={index}
                sx={{
                  position: 'relative',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  p: 0.5
                }}
              >
                {file.type.startsWith('image/') ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    style={{ height: 64, borderRadius: 4 }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 64,
                      width: 64,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'grey.100',
                      color: 'text.secondary',
                      borderRadius: 1
                    }}
                  >
                    {file.type.startsWith('audio/') ? (
                      <MicIcon color="primary" />
                    ) : (
                      <AttachFileIcon color="primary" />
                    )}
                  </Box>
                )}
                <IconButton
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      backgroundColor: 'error.light',
                      color: 'white'
                    }
                  }}
                  onClick={() => removeAttachment(index)}
                >
                  <CancelIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Paper>
        )}

        {/* Input principal */}
        <Paper
          variant="outlined"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            borderRadius: 2,
            boxShadow: showEmojiPicker ? 2 : 0,
            transition: (theme) => theme.transitions.create(['box-shadow']),
            backgroundColor: (theme) => 
              theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.background.default
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-end',
              p: 0.5
            }}
          >
            {/* Campo de texto */}
            <TextField
              fullWidth
              multiline
              rows={rows}
              placeholder={`Mensagem para ${friendName || 'amigo'}...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              onKeyDown={handleTyping}
              inputRef={inputRef}
              disabled={disabled || isSending}
              variant="standard" // Sem bordas adicionais
              InputProps={{
                disableUnderline: true, // Remove a linha inferior
                sx: { px: 1 } // Padding horizontal
              }}
              sx={{ flexGrow: 1 }}
            />

            {/* Botão de emoji */}
            <Tooltip title="Emojis">
              <IconButton
                size="small"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                color={showEmojiPicker ? 'primary' : 'default'}
                disabled={disabled || isSending}
              >
                <EmojiEmotionsIcon />
              </IconButton>
            </Tooltip>

            {/* Botão para anexar arquivos */}
            <Tooltip title="Anexar arquivo">
              <IconButton
                size="small"
                component="label"
                disabled={disabled || isSending}
              >
                <AttachFileIcon />
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                />
              </IconButton>
            </Tooltip>

            {/* Botão de câmera */}
            <Tooltip title="Tirar foto">
              <IconButton
                size="small"
                component="label"
                disabled={disabled || isSending}
              >
                <PhotoCameraIcon />
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoCapture}
                  style={{ display: 'none' }}
                  ref={photoInputRef}
                />
              </IconButton>
            </Tooltip>

            {/* Botão de envio ou gravação */}
            <Box sx={{ ml: 0.5 }}>
              {message.trim() || attachments.length > 0 ? (
                <Tooltip title="Enviar mensagem">
                  <IconButton
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={disabled || isSending}
                  >
                    {isSending ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      <SendIcon />
                    )}
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title={isRecording ? "Parar gravação" : "Gravar áudio"}>
                  <IconButton
                    color={isRecording ? "error" : "primary"}
                    onClick={toggleRecording}
                    disabled={disabled || isSending}
                    sx={{
                      animation: isRecording ? 'pulse 1.5s infinite' : 'none',
                      '@keyframes pulse': {
                        '0%': {
                          boxShadow: '0 0 0 0 rgba(244, 67, 54, 0.7)'
                        },
                        '70%': {
                          boxShadow: '0 0 0 10px rgba(244, 67, 54, 0)'
                        },
                        '100%': {
                          boxShadow: '0 0 0 0 rgba(244, 67, 54, 0)'
                        }
                      }
                    }}
                  >
                    <MicIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
        </Paper>
      </Box>
    </ClickAwayListener>
  );
};

export default ModernChatInput;