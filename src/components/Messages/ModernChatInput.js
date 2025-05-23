// src/components/Messages/ModernChatInput.js
import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Tooltip,
  ClickAwayListener,
  Chip,
  CircularProgress,
  Typography,
  alpha
} from '@mui/material';

// Icons
import SendIcon from '@mui/icons-material/Send';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import MicIcon from '@mui/icons-material/Mic';
import CancelIcon from '@mui/icons-material/Cancel';

// Emoji picker
import EmojiPicker from 'emoji-picker-react';

/**
 * Modern chat input component with emoji picker, file attachments, and audio recording
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onSendMessage - Callback when message is sent
 * @param {String} props.friendName - Name of the friend for placeholder text
 * @param {Boolean} props.isTyping - Whether the recipient is typing
 * @param {Boolean} props.disabled - Whether the input is disabled
 * @param {Function} props.onTyping - Callback when user is typing
 * @param {Array} props.mentions - Array of users that can be mentioned
 * @returns {React.ReactElement} Rendered component
 */
const ModernChatInput = ({
  onSendMessage,
  friendName,
  isTyping = false,
  disabled = false,
  onTyping = () => {},
  mentions = []
}) => {
  // States
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
  const typingTimeoutRef = useRef(null);

  // Quick replies that adapt to context
  const quickReplies = [
    'Olá!',
    'Tudo bem?',
    'Vamos marcar algo?',
    'Até mais tarde!',
    'Desculpe, estou ocupado agora'
  ];

  // Calculate optimal number of rows based on content
  useEffect(() => {
    const lineCount = (message.match(/\n/g) || []).length + 1;
    setRows(Math.min(lineCount, 4)); // Limit to 4 rows maximum
  }, [message]);

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!message.trim() && attachments.length === 0) return;

    try {
      setIsSending(true);

      // Prepare message data
      const messageData = {
        text: message.trim(),
        attachments: attachments.map(file => ({
          name: file.name,
          type: file.type,
          file: file
        })),
        timestamp: new Date().toISOString()
      };

      // Send message via callback
      await onSendMessage(messageData);

      // Clear after successful send
      setMessage('');
      setAttachments([]);
      setShowEmojiPicker(false);

      // Focus input again
      inputRef.current?.focus();
      
      // Clear typing status
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
        onTyping(false);
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // Handle emoji selection
  const handleEmojiSelect = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
    inputRef.current?.focus();
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setAttachments(prev => [...prev, ...files]);
    event.target.value = '';
  };

  // Handle photo capture
  const handlePhotoCapture = (event) => {
    const files = Array.from(event.target.files);
    setAttachments(prev => [...prev, ...files]);
    event.target.value = '';
  };

  // Remove attachment
  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Handle quick reply selection
  const handleQuickReply = (reply) => {
    setMessage(reply);
    inputRef.current?.focus();
  };

  // Toggle audio recording
  const toggleRecording = () => {
    setIsRecording(!isRecording);
    
    if (isRecording) {
      // Simulate finishing audio recording (in a real implementation)
      setTimeout(() => {
        // Add simulated audio file
        const audioBlob = new Blob(['dummy audio data'], { type: 'audio/mp3' });
        const audioFile = new File([audioBlob], 'recording.mp3', { type: 'audio/mp3' });
        setAttachments(prev => [...prev, audioFile]);
      }, 500);
    }
  };
  
  // Handle typing notification
  const handleTyping = () => {
    onTyping(true);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
      typingTimeoutRef.current = null;
    }, 2000);
  };

  // Close emoji picker when clicking outside
  const handleClickAway = () => {
    setShowEmojiPicker(false);
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ position: 'relative', width: '100%' }}>
        {/* Emoji Picker Overlay */}
        {showEmojiPicker && (
          <Box
            sx={{
              position: 'absolute',
              bottom: '100%',
              right: 0,
              mb: 1,
              zIndex: 10,
              boxShadow: 3,
              borderRadius: 1,
              overflow: 'hidden'
            }}
          >
            <EmojiPicker onEmojiClick={handleEmojiSelect} width={320} height={400} />
          </Box>
        )}

        {/* Quick Replies */}
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
                borderRadius: 4,
                transition: 'all 0.2s',
                bgcolor: 'background.paper',
                borderColor: 'divider',
                '&:hover': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText'
                }
              }}
            />
          ))}
        </Box>

        {/* Attachment Previews */}
        {attachments.length > 0 && (
          <Paper
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              p: 1,
              mb: 1,
              borderRadius: 1,
              bgcolor: 'background.paper'
            }}
            elevation={0}
            variant="outlined"
          >
            {attachments.map((file, index) => (
              <Box
                key={index}
                sx={{
                  position: 'relative',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  p: 0.5,
                  bgcolor: alpha('#000', 0.03)
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
                      bgcolor: 'background.default',
                      color: 'text.secondary',
                      borderRadius: 1,
                      flexDirection: 'column'
                    }}
                  >
                    {file.type.startsWith('audio/') ? (
                      <MicIcon color="primary" />
                    ) : (
                      <AttachFileIcon color="primary" />
                    )}
                    <Typography variant="caption" sx={{ mt: 0.5, fontSize: '0.6rem' }}>
                      {file.name.length > 10 ? file.name.substring(0, 7) + '...' : file.name}
                    </Typography>
                  </Box>
                )}
                <IconButton
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    width: 20,
                    height: 20,
                    '&:hover': {
                      bgcolor: 'error.main',
                      color: 'error.contrastText'
                    }
                  }}
                  onClick={() => removeAttachment(index)}
                >
                  <CancelIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            ))}
          </Paper>
        )}

        {/* Main Input Area */}
        <Paper
          variant="outlined"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            borderRadius: 3,
            boxShadow: showEmojiPicker ? 2 : 0,
            transition: 'box-shadow 0.2s ease',
            bgcolor: 'background.paper'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-end',
              p: 0.5
            }}
          >
            {/* Text Field */}
            <TextField
              fullWidth
              multiline
              rows={rows}
              placeholder={`Message to ${friendName || 'friend'}...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              onKeyDown={handleTyping}
              inputRef={inputRef}
              disabled={disabled || isSending}
              variant="standard"
              InputProps={{
                disableUnderline: true,
                sx: { 
                  px: 1,
                  color: 'text.primary',
                  '& ::placeholder': {
                    color: 'text.secondary',
                    opacity: 0.7
                  }
                }
              }}
              sx={{ flexGrow: 1 }}
            />

            {/* Emoji Button */}
            <Tooltip title="Emojis">
              <IconButton
                size="small"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                color={showEmojiPicker ? 'primary' : 'default'}
                disabled={disabled || isSending}
                sx={{
                  mx: 0.5,
                  color: showEmojiPicker ? 'primary.main' : 'action.active'
                }}
              >
                <EmojiEmotionsIcon />
              </IconButton>
            </Tooltip>

            {/* Attach File Button */}
            <Tooltip title="Attach file">
              <IconButton
                size="small"
                component="label"
                disabled={disabled || isSending}
                sx={{ 
                  mx: 0.5,
                  color: 'action.active'
                }}
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

            {/* Camera Button */}
            <Tooltip title="Take photo">
              <IconButton
                size="small"
                component="label"
                disabled={disabled || isSending}
                sx={{ 
                  mx: 0.5,
                  color: 'action.active'
                }}
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

            {/* Send Button / Record Button */}
            <Box sx={{ mx: 0.5 }}>
              {message.trim() || attachments.length > 0 ? (
                <Tooltip title="Send message">
                  <IconButton
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={disabled || isSending}
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': {
                        bgcolor: 'primary.dark'
                      },
                      '&.Mui-disabled': {
                        bgcolor: 'action.disabledBackground'
                      }
                    }}
                  >
                    {isSending ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      <SendIcon />
                    )}
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title={isRecording ? "Stop recording" : "Record audio"}>
                  <IconButton
                    color={isRecording ? "error" : "primary"}
                    onClick={toggleRecording}
                    disabled={disabled || isSending}
                    sx={{
                      bgcolor: isRecording ? 'error.main' : 'primary.main',
                      color: isRecording ? 'error.contrastText' : 'primary.contrastText',
                      '&:hover': {
                        bgcolor: isRecording ? 'error.dark' : 'primary.dark'
                      },
                      '&.Mui-disabled': {
                        bgcolor: 'action.disabledBackground'
                      },
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