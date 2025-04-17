import React, { useState } from 'react';
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
  Paper
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  FilterList as FilterListIcon,
  PersonOff as PersonOffIcon,
  AdminPanelSettings as AdminIcon,
  CheckCircle as ActiveIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

/**
 * Componente de apresentação para exibir a lista de membros da caixinha
 * 
 * @param {Object} props
 * @param {Array} props.members - Lista de membros da caixinha
 * @param {Array} props.pendingInvites - Lista de convites pendentes (opcional)
 * @param {Function} props.onEdit - Handler para edição de membro
 * @param {Function} props.onRemove - Handler para remoção de membro
 * @param {Function} props.onPromote - Handler para promover a administrador (opcional)
 * @param {Function} props.onSendReminder - Handler para reenviar convite (opcional)
 * @param {Function} props.onCancelInvite - Handler para cancelar convite (opcional)
 * @param {Boolean} props.isAdmin - Se o usuário atual é administrador da caixinha
 * @param {String} props.currentUserId - ID do usuário atual
 */
export const MembersList = ({
  members = [],
  pendingInvites = [],
  onEdit,
  onRemove,
  onPromote,
  onSendReminder,
  onCancelInvite,
  isAdmin = false,
  currentUserId
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [actionMemberId, setActionMemberId] = useState(null);

  // Ordenação e filtragem combinados
  const processedMembers = React.useMemo(() => {
    // Combinar membros e convites pendentes para exibição unificada
    const allMemberItems = [
      ...members.map(member => ({ 
        ...member, 
        type: 'member',
        status: member.active ? 'active' : 'inactive'
      })),
      ...pendingInvites.map(invite => ({ 
        id: invite.id,
        nome: invite.nome || invite.email, 
        email: invite.email,
        type: 'pending',
        status: 'pending',
        invitedAt: invite.createdAt, 
        inviteId: invite.id
      }))
    ];

    // Aplicar filtragem
    const filtered = allMemberItems.filter(item => {
      // Filtragem por termo de busca
      const matchesSearch = 
        searchTerm === '' || 
        item.nome?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtragem por status
      const matchesStatus = 
        filterStatus === 'all' || 
        item.status === filterStatus ||
        (filterStatus === 'invited' && item.type === 'pending');
      
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
          compareResult = (a.status || '').localeCompare(b.status || '');
          break;
        case 'joinDate':
          compareResult = new Date(a.joinedAt || 0) - new Date(b.joinedAt || 0);
          break;
        default:
          compareResult = 0;
      }
      
      return sortDirection === 'asc' ? compareResult : -compareResult;
    });
  }, [members, pendingInvites, searchTerm, sortField, sortDirection, filterStatus]);

  // Manipuladores de interação
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleOpenActionMenu = (event, memberId) => {
    setAnchorEl(event.currentTarget);
    setActionMemberId(memberId);
  };

  const handleCloseActionMenu = () => {
    setAnchorEl(null);
    setActionMemberId(null);
  };

  const handleAction = (action) => {
    switch (action) {
      case 'edit':
        onEdit && onEdit(actionMemberId);
        break;
      case 'remove':
        onRemove && onRemove(actionMemberId);
        break;
      case 'promote':
        onPromote && onPromote(actionMemberId);
        break;
      case 'reminder':
        onSendReminder && onSendReminder(actionMemberId);
        break;
      case 'cancel':
        onCancelInvite && onCancelInvite(actionMemberId);
        break;
      default:
        break;
    }
    
    handleCloseActionMenu();
  };

  // Renderização do status do membro
  const renderMemberStatus = (memberItem) => {
    if (memberItem.type === 'pending') {
      return (
        <Chip
          size="small"
          label={t('membersList.invited')}
          color="warning"
          variant="outlined"
        />
      );
    }
    
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
            <MenuItem value="invited">{t('membersList.invitedOnly')}</MenuItem>
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
          {processedMembers.map((memberItem, index) => (
            <React.Fragment key={memberItem.id || `pending-${memberItem.inviteId}`}>
              <ListItem
                sx={{
                  bgcolor: memberItem.id === currentUserId ? 'action.selected' : 'inherit',
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
                      src={memberItem.fotoPerfil}
                      alt={memberItem.nome}
                      sx={{
                        bgcolor: memberItem.type === 'pending' ? 'warning.light' : 'primary.light',
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
                      
                      {memberItem.type === 'pending' && (
                        <Typography variant="caption" color="text.secondary">
                          {t('membersList.invitedOn', { 
                            date: new Date(memberItem.invitedAt).toLocaleDateString() 
                          })}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                  {renderMemberStatus(memberItem)}
                </Box>
                
                <ListItemSecondaryAction>
                  {/* Exibir menu de ações apenas para admins ou para o próprio usuário */}
                  {(isAdmin || memberItem.id === currentUserId) && (
                    <>
                      <IconButton
                        edge="end"
                        onClick={(e) => handleOpenActionMenu(
                          e, 
                          memberItem.type === 'pending' ? memberItem.inviteId : memberItem.id
                        )}
                        size="small"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
              
              {index < processedMembers.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {/* Menu de ações */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseActionMenu}
      >
        {/* Buscar o membro ou convite atual para determinar as opções de menu */}
        {(() => {
          const currentItem = actionMemberId && (
            processedMembers.find(m => 
              (m.type === 'pending' && m.inviteId === actionMemberId) || 
              m.id === actionMemberId
            )
          );
          
          if (!currentItem) return null;
          
          // Menu para convites pendentes
          if (currentItem.type === 'pending') {
            return (
              <>
                <MenuItem onClick={() => handleAction('reminder')}>
                  {t('membersList.resendInvite')}
                </MenuItem>
                <MenuItem onClick={() => handleAction('cancel')}>
                  {t('membersList.cancelInvite')}
                </MenuItem>
              </>
            );
          }
          
          // Menu para membros regulares
          return (
            <>
              <MenuItem onClick={() => handleAction('edit')}>
                {t('membersList.editMember')}
              </MenuItem>
              
              {isAdmin && !currentItem.isAdmin && currentItem.id !== currentUserId && (
                <MenuItem onClick={() => handleAction('promote')}>
                  {t('membersList.promoteToAdmin')}
                </MenuItem>
              )}
              
              {(isAdmin || currentItem.id === currentUserId) && (
                <MenuItem onClick={() => handleAction('remove')}>
                  {t('membersList.removeMember')}
                </MenuItem>
              )}
            </>
          );
        })()}
      </Menu>
    </Box>
  );
};