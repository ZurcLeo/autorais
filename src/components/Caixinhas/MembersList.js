import React, { useState, useMemo } from 'react';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Chip,
  Typography,
  Box,
  Tooltip,
  Badge,
  Divider,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  Paper,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  ListAltOutlined as ListItemIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  FilterList as FilterListIcon,
  PersonOff as PersonOffIcon,
  AdminPanelSettings as AdminIcon,
  CheckCircle as ActiveIcon,
  Refresh as RefreshIcon,
  Cancel as CancelIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { coreLogger } from '../../core/logging';
import { LOG_LEVELS } from '../../core/constants/config';

const MODULE_NAME = 'MembersList';
const imgMock = process.env.REACT_APP_PLACE_HOLDER_IMG;
/**
 * Componente de apresentação para exibir a lista de membros da caixinha
 * 
 * @param {Object} props
 * @param {Array} props.members - Lista de membros e convites combinados
 * @param {string} props.caixinhaId - ID da caixinha
 * @param {Function} props.onEdit - Handler para edição de membro
 * @param {Function} props.onRemove - Handler para remoção de membro
 * @param {Function} props.onPromote - Handler para promover a administrador
 * @param {Function} props.onSendReminder - Handler para reenviar convite
 * @param {Function} props.onCancelInvite - Handler para cancelar convite
 * @param {Boolean} props.isAdmin - Se o usuário atual é administrador da caixinha
 * @param {String} props.currentUserId - ID do usuário atual
 */
export const MembersList = ({
  members = [],
  caixinhaId,
  onEdit,
  onRemove,
  onPromote,
  onSendReminder,
  onCancelInvite,
  isAdmin = false,
  currentUserId,
  loading = false
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [actionMemberId, setActionMemberId] = useState(null);
  const [actionItemType, setActionItemType] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  // Log para debugging
  React.useEffect(() => {
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'MembersList initialized', {
      membersCount: members.length,
      caixinhaId,
      isAdmin,
      currentUserId
    });
  }, [members.length, caixinhaId, isAdmin, currentUserId]);

  // Ordenação e filtragem combinados
  const processedMembers = useMemo(() => {
    // Log para debugging da entrada de dados
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Processing members data', {
      count: members.length,
      searchTerm,
      filterStatus,
      sortField,
      sortDirection
    });

    // Aplicar filtragem
    const filtered = members.filter(item => {
      // Filtragem por termo de busca
      const matchesSearch = 
        searchTerm === '' || 
        item.nome?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtragem por status
      const matchesStatus = 
        filterStatus === 'all' || 
        (filterStatus === 'pending' && item.type === 'caixinha_invite') ||
        (filterStatus === 'active' && item.status === 'active') ||
        (filterStatus === 'inactive' && item.status === 'inactive');
      
      return matchesSearch && matchesStatus;
    });

    // Aplicar ordenação
    return filtered.sort((a, b) => {
      let compareResult = 0;
      
      switch (sortField) {
        case 'name':
          compareResult = (a.nome || '').localeCompare(b.nome || '');
          break;
        case 'email':
          compareResult = (a.email || '').localeCompare(b.email || '');
          break;
        case 'status':
          const statusA = a.type === 'caixinha_invite' ? 'pending' : a.status || '';
          const statusB = b.type === 'caixinha_invite' ? 'pending' : b.status || '';

          compareResult = statusA.localeCompare(statusB);
          break;
        case 'joinDate':
          const dateA = a.joinedAt || a.invitedAt || a.createdAt || 0;
          const dateB = b.joinedAt || b.invitedAt || b.createdAt || 0;
          compareResult = new Date(dateA) - new Date(dateB);
          break;
        default:
          compareResult = 0;
      }
      
      return sortDirection === 'asc' ? compareResult : -compareResult;
    });
  }, [members, searchTerm, sortField, sortDirection, filterStatus]);

  // Manipuladores de interação
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleOpenActionMenu = (event, id, type) => {
    setAnchorEl(event.currentTarget);
    setActionMemberId(id);
    
    // Determinar o tipo de item (membro ou convite)
    const actionItem = members.find(item => {
      if (type === 'caixinha_invite') {
        return item.caxinhaInviteId === id;
      }
      return item.id === id;
    });
    
    setActionItemType(actionItem?.type || 'member');
  };

  const handleCloseActionMenu = () => {
    setAnchorEl(null);
    setActionMemberId(null);
    setActionItemType(null);
  };

  // Função para converter timestamp do Firestore para objeto Date
const convertFirestoreTimestampToDate = (timestamp) => {
  // Verifica se o timestamp tem o formato Firestore (_seconds e _nanoseconds)
  if (timestamp && timestamp._seconds) {
    return new Date(timestamp._seconds * 1000);
  }
  // Fallback para outros formatos de data
  return new Date(timestamp);
};

  const handleAction = async (action) => {
    setActionInProgress(true);
    
    try {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, `Executing action: ${action}`, {
        memberId: actionMemberId,
        type: actionItemType,
        caixinhaId
      });
      
      switch (action) {
        case 'edit':
          onEdit && await onEdit(actionMemberId);
          break;
        case 'remove':
          onRemove && await onRemove(actionMemberId);
          break;
        case 'promote':
          onPromote && await onPromote(actionMemberId);
          break;
        case 'reminder':
          onSendReminder && await onSendReminder(actionMemberId, caixinhaId);
          break;
        case 'cancel':
          onCancelInvite && await onCancelInvite(actionMemberId, caixinhaId);
          break;
        default:
          break;
      }
    } catch (error) {
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, `Error executing action: ${action}`, {
        memberId: actionMemberId,
        error: error.message
      });
    } finally {
      setActionInProgress(false);
      handleCloseActionMenu();
    }
  };

  // Renderização do status do membro
  const renderMemberStatus = (memberItem) => {
    // Convite pendente via email
    if (memberItem.type === 'caixinha_invite') {
      return memberItem.email && !memberItem.targetId ? (
        <Chip
          size="small"
          icon={<EmailIcon />}
          label={t('membersList.invitedByEmail')}
          color="warning"
          variant="outlined"
        />
      ) : (
        <Chip
          size="small"
          label={t('membersList.invited')}
          color="warning"
          variant="outlined"
        />
      );
    }
    
    // Administrador
    if (memberItem.isAdmin) {
      return (
        <Chip
          size="small"
          icon={<StarIcon />}
          label={t('membersList.admin')}
          color="primary"
          variant="outlined"
        />
      );
    }
    
    // Membro ativo
    if (memberItem.status === 'active') {
      return (
        <Chip
          size="small"
          icon={<ActiveIcon />}
          label={t('membersList.active')}
          color="success"
          variant="outlined"
        />
      );
    }
    
    // Membro inativo por padrão
    return (
      <Chip
        size="small"
        icon={<PersonOffIcon />}
        label={t('membersList.inactive')}
        color="default"
        variant="outlined"
      />
    );
  };

  // Se estiver carregando, mostrar indicador de progresso
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Se não houver membros após filtragem
  if (processedMembers.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="textSecondary">
          {searchTerm || filterStatus !== 'all'
            ? t('membersList.noMembersMatchFilter')
            : t('membersList.noMembers')}
        </Typography>
      </Paper>
    );
  }

console.log('invitedOninvitedOninvitedOn:', processedMembers)

  return (
    <Box sx={{ width: '100%' }}>
      {/* Controles de busca, ordenação e filtragem */}
      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <TextField
          placeholder={t('membersList.searchMembers')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ flexGrow: 1, minWidth: '200px' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        
        <FormControl size="small" sx={{ minWidth: '120px' }}>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            displayEmpty
            startAdornment={
              <InputAdornment position="start">
                <FilterListIcon fontSize="small" />
              </InputAdornment>
            }
          >
            <MenuItem value="all">{t('membersList.allMembers')}</MenuItem>
            <MenuItem value="active">{t('membersList.activeOnly')}</MenuItem>
            <MenuItem value="inactive">{t('membersList.inactiveOnly')}</MenuItem>
            <MenuItem value="pending">{t('membersList.invitedOnly')}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Cabeçalho da lista com controles de ordenação */}
      <Box 
        sx={{ 
          display: 'flex', 
          p: 1, 
          bgcolor: 'background.paper',
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
          borderBottom: '1px solid',
          borderColor: 'divider',
          fontWeight: 'bold'
        }}
      >
        <Box sx={{ width: '50%', display: 'flex', alignItems: 'center' }}>
          <Typography 
            variant="body2" 
            sx={{ 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            onClick={() => handleSort('name')}
          >
            {t('membersList.name')}
            {sortField === 'name' && (
              sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
            )}
          </Typography>
        </Box>
        
        <Box sx={{ width: '30%', display: 'flex', alignItems: 'center' }}>
          <Typography 
            variant="body2"
            sx={{ 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            onClick={() => handleSort('status')}
          >
            {t('membersList.status')}
            {sortField === 'status' && (
              sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
            )}
          </Typography>
        </Box>
        
        <Box sx={{ width: '20%' }}>
          <Typography variant="body2" align="center">
            {t('membersList.actions')}
          </Typography>
        </Box>
      </Box>

      {/* Lista de membros */}
      <Paper elevation={1}>
        <List disablePadding>
          {processedMembers.map((memberItem, index) => {
            // Determinar se este item é um convite
            const isInvite = memberItem.type === 'caixinha_invite';
            // ID do item (convite ou membro)
            const itemId = isInvite ? memberItem.caxinhaInviteId : memberItem.id;
            // Destacar usuário atual na lista
            const isCurrentUser = !isInvite && memberItem.id === currentUserId;
            
            return (
              <React.Fragment key={itemId || `member-${index}`}>
                <ListItem
                  sx={{
                    bgcolor: isCurrentUser ? 'action.selected' : 'inherit',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={memberItem.isAdmin ? <AdminIcon color="primary" fontSize="small" /> : null}
                    >
                      <Avatar 
                        src={memberItem.fotoPerfil && memberItem.fotoPerfil.startsWith('http') ? memberItem.fotoPerfil : imgMock}
                        alt={memberItem.nome}
                        sx={{
                          bgcolor: isInvite ? 'warning.light' : 'primary.light',
                        }}
                      >
                        {memberItem.nome?.[0] || '?'}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={memberItem.nome || memberItem.email}
                    secondary={
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          {memberItem.email}
                        </Typography>
                        
                        {isInvite && memberItem.invitedAt && (
                        <Typography variant="caption" color="text.secondary">
                          {t('membersList.invitedOn', { 
                            date: convertFirestoreTimestampToDate(memberItem.invitedAt).toLocaleDateString('pt-BR') 
                          })}
                        </Typography>
                      )}
                      </Box>
                    }
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                    {renderMemberStatus(memberItem)}
                  </Box>
                  
                  <ListItemSecondaryAction>
                    {/* Exibir menu de ações apenas para admins ou para o próprio usuário */}
                    {(isAdmin || isCurrentUser || (isInvite && memberItem.senderId === currentUserId)) && (
                      <Tooltip 
                        title={
                          isInvite
                            ? t('membersList.inviteOptions')
                            : t('membersList.memberOptions')
                        }
                      >
                        <IconButton
                          edge="end"
                          onClick={(e) => handleOpenActionMenu(e, itemId, memberItem.type)}
                          size="small"
                          disabled={actionInProgress}
                        >
                          {actionInProgress && actionMemberId === itemId ? (
                            <CircularProgress size={20} />
                          ) : (
                            <MoreVertIcon />
                          )}
                        </IconButton>
                      </Tooltip>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
                
                {index < processedMembers.length - 1 && <Divider component="li" />}
              </React.Fragment>
            );
          })}
        </List>
      </Paper>

      {/* Menu de ações */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseActionMenu}
      >
        {/* Opções de menu com base no tipo de item (membro ou convite) */}
        {actionItemType === 'caixinha_invite' ? (
          <>
            <MenuItem onClick={() => handleAction('reminder')} disabled={actionInProgress}>
              <ListItemIcon>
                <RefreshIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{t('membersList.resendInvite')}</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleAction('cancel')} disabled={actionInProgress}>
              <ListItemIcon>
                <CancelIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{t('membersList.cancelInvite')}</ListItemText>
            </MenuItem>
          </>
        ) : (
          <>
            {isAdmin && (
              <MenuItem onClick={() => handleAction('edit')} disabled={actionInProgress}>
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>{t('membersList.editMember')}</ListItemText>
              </MenuItem>
            )}
            
            {isAdmin && !members.find(m => m.id === actionMemberId)?.isAdmin && actionMemberId !== currentUserId && (
              <MenuItem onClick={() => handleAction('promote')} disabled={actionInProgress}>
                <ListItemIcon>
                  <StarIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>{t('membersList.promoteToAdmin')}</ListItemText>
              </MenuItem>
            )}
            
            {(isAdmin || actionMemberId === currentUserId) && (
              <MenuItem onClick={() => handleAction('remove')} disabled={actionInProgress}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>{t('membersList.removeMember')}</ListItemText>
              </MenuItem>
            )}
          </>
        )}
      </Menu>
    </Box>
  );
};