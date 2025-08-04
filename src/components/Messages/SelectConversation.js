// src/components/Messages/SelectConversation.js
import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper,
  useMediaQuery,
  useTheme,
  Stack,
  Divider,
  alpha
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
        background: 'transparent'
      }}
    >
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          borderRadius: 3,
          maxWidth: 500,
          width: '100%',
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.background.paper, 0.9)} 0%, 
            ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.15)}`
          }
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