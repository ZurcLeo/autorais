// src/components/Messages/SelectConversation.js
import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper,
  useMediaQuery,
  Stack,
  Divider
} from '@mui/material';
import { 
  ChatBubbleOutlineRounded, 
  PeopleAltOutlined,
  ChevronLeft
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * Component shown when no conversation is selected in the messages area
 * Provides guidance and navigation options for the user
 * 
 * @returns {React.ReactElement} Empty state for message selection
 */
const SelectConversation = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        p: 3,
        bgcolor: 'background.default'
      }}
    >
      <Paper
        elevation={1}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          borderRadius: 2,
          maxWidth: 500,
          width: '100%',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <ChatBubbleOutlineRounded
          sx={{ 
            fontSize: 64, 
            mb: 3, 
            color: 'primary.main',
            opacity: 0.8
          }} 
        />
        
        <Typography 
          variant="h5" 
          gutterBottom 
          align="center"
          fontWeight="medium"
          color="text.primary"
        >
          {t('messages.select_conversation')}
        </Typography>
        
        <Typography 
          variant="body1" 
          align="center" 
          color="text.secondary"
          sx={{ 
            mb: 4,
            mx: 2
          }}
        >
          {isMobile 
            ? t('messages.select_conversation_mobile_text')
            : t('messages.select_conversation_desktop_text')
          }
        </Typography>
        
        <Divider sx={{ width: '80%', mb: 4 }} />
        
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          sx={{ width: '100%', justifyContent: 'center' }}
        >
          {isMobile && (
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={() => navigate('/messages')}
              startIcon={<ChevronLeft />}
              sx={{ borderRadius: 4 }}
            >
              {t('messages.back_to_conversations')}
            </Button>
          )}
          
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<PeopleAltOutlined />}
            onClick={() => navigate('/connections')}
            sx={{ 
              borderRadius: 4,
              px: 3,
              py: 1
            }}
          >
            {t('messages.manage_contacts')}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default SelectConversation;