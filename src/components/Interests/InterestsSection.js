import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useInterests } from '../../providers/InterestsProvider';
import { DebounceInput } from 'react-debounce-input';
import { useToast } from '../../providers/ToastProvider';
import {
    Box,
    TextField,
    Typography,
    Button,
    Checkbox,
    CircularProgress,
    ListItem,
    ListItemIcon,
    ListItemText,
    List,
    Divider,
    Collapse,
    Paper,
    Chip,
    InputAdornment,
    Tooltip,
    Badge,
    IconButton,
    alpha
} from '@mui/material';
import {
    Search as SearchIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    FilterList as FilterListIcon,
    CheckCircle as CheckCircleIcon,
    Save as SaveIcon
} from '@mui/icons-material';
import BusinessIcon from '@mui/icons-material/Business';
import NaturePeopleIcon from '@mui/icons-material/NaturePeople';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeveloperModeIcon from '@mui/icons-material/DeveloperMode';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import CampaignIcon from '@mui/icons-material/Campaign';
import GroupIcon from '@mui/icons-material/Group';
import SchoolIcon from '@mui/icons-material/School';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CategoryIcon from '@mui/icons-material/Category'; // Ícone genérico para categorias não mapeadas
import { serviceLocator } from '../../core/services/BaseService';

const categoryIcons = {
    negocios: <BusinessIcon />,
    sustentabilidade: <NaturePeopleIcon />,
    marketplace: <ShoppingCartIcon />,
    tecnologia: <DeveloperModeIcon />,
    lazer: <BeachAccessIcon />,
    marketing: <CampaignIcon />,
    social: <GroupIcon />,
    educacao: <SchoolIcon />,
    bemestar: <FitnessCenterIcon />,
};

/**
 * Componente melhorado para seleção de interesses do usuário
 */
const InterestsSection = () => {
    const serviceStore = serviceLocator.get('store').getState()?.auth;
    const serviceInterests = serviceLocator.get('store').getState()?.interests;
    const { availableInterests, loading } = serviceInterests;
    const { loadUserInterests, selectedInterests, updateUserInterests } = useInterests();
    const { currentUser } = serviceStore;    
    const [searchTerm, setSearchTerm] = useState('');
    const [localSelectedInterests, setLocalSelectedInterests] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState({});
    const { showToast } = useToast();
    
    // Estado para acompanhar alterações não salvas
    const [hasChanges, setHasChanges] = useState(false);
    
    useEffect(() => {
        if (currentUser?.uid) {
            loadUserInterests();
        }
    }, [currentUser?.uid, loadUserInterests]);

    useEffect(() => {
        setLocalSelectedInterests(selectedInterests || []);
    }, [selectedInterests]);

    // Definir quais categorias estão inicialmente expandidas
    useEffect(() => {
        if (availableInterests && availableInterests.length > 0) {
            const initialStates = {};
            availableInterests.slice(0, 2).forEach(category => {
                initialStates[category.id] = true;
            });
            setExpandedCategories(initialStates);
        }
    }, [availableInterests]);

    // Filtrar interesses com base na pesquisa
    const filteredInterests = useMemo(() => {
        if (!availableInterests || !Array.isArray(availableInterests)) {
            return [];
        }

        if (!searchTerm.trim()) {
            return availableInterests;
        }

        const lowerSearchTerm = searchTerm.toLowerCase().trim();
        
        return availableInterests.map(category => {
            if (!category.interests || !Array.isArray(category.interests)) {
                return null;
            }
            
            const filteredCategoryInterests = category.interests.filter(interest =>
                interest.label.toLowerCase().includes(lowerSearchTerm)
            );
            
            if (filteredCategoryInterests.length === 0) {
                return null;
            }
            
            return {
                ...category,
                interests: filteredCategoryInterests
            };
        }).filter(Boolean);
    }, [availableInterests, searchTerm]);

    // Manipulador para alternar a seleção de um interesse
    const handleInterestToggle = useCallback((interestId) => {
        setLocalSelectedInterests(prev => {
            const isSelected = prev.includes(interestId);
            const newSelection = isSelected
                ? prev.filter(id => id !== interestId)
                : [...prev, interestId];
            
            setHasChanges(true);
            return newSelection;
        });
    }, []);

    // Manipulador para salvar as alterações
    const handleSaveInterests = useCallback(async () => {
        if (!currentUser?.uid) {
            showToast("Usuário não autenticado.", {type: 'error'});
            return;
        }
        
        setIsSaving(true);
        try {
            await updateUserInterests(localSelectedInterests);
            showToast("Interesses atualizados com sucesso!", {type: 'success'});
            setHasChanges(false);
        } catch (err) {
            showToast("Erro ao atualizar os interesses.", {type: 'error'});
            console.error("Erro ao atualizar interesses:", err);
        } finally {
            setIsSaving(false);
        }
    }, [currentUser?.uid, localSelectedInterests, updateUserInterests, showToast]);

    // Manipulador para expandir/colapsar uma categoria
    const handleCategoryToggle = useCallback((categoryId) => {
        setExpandedCategories(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }));
    }, []);

    // Manipulador para selecionar/desselecionar todos os interesses de uma categoria
    const handleToggleAllInCategory = useCallback((categoryId, interests) => {
        setLocalSelectedInterests(prev => {
            const categoryInterestIds = interests.map(i => i.id);
            const otherInterests = prev.filter(id => !categoryInterestIds.includes(id));
            
            // Verificar se todos os interesses da categoria já estão selecionados
            const allSelected = categoryInterestIds.every(id => prev.includes(id));
            
            const newSelection = allSelected
                ? otherInterests
                : [...otherInterests, ...categoryInterestIds];
            
            setHasChanges(true);
            return newSelection;
        });
    }, []);

    // Verificar se todos os interesses de uma categoria estão selecionados
    const areAllCategoryInterestsSelected = useCallback((interests) => {
        if (!interests || interests.length === 0) return false;
        return interests.every(interest => localSelectedInterests.includes(interest.id));
    }, [localSelectedInterests]);

    // Verificar se alguns interesses da categoria estão selecionados
    const areSomeCategoryInterestsSelected = useCallback((interests) => {
        if (!interests || interests.length === 0) return false;
        return interests.some(interest => localSelectedInterests.includes(interest.id));
    }, [localSelectedInterests]);

    // Mostrar indicador de carregamento durante a inicialização
    if (loading.userInterests && !localSelectedInterests.length) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <CircularProgress />
            </Box>
        );
    }

    // Contagens e estatísticas para mostrar no resumo
    const selectedCount = localSelectedInterests.length;
    const totalAvailableCount = availableInterests?.reduce(
        (sum, category) => sum + (category.interests?.length || 0), 0
    ) || 0;

    return (
        <Box sx={{ maxWidth: 600, margin: 'auto', mt: 3 }}>
            {/* Barra de pesquisa */}
            <Paper 
                sx={{ 
                    p: 2, 
                    mb: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                }}
                elevation={2}
            >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                        fullWidth
                        placeholder="Buscar por interesse..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                            endAdornment: searchTerm && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                                        <ExpandMoreIcon />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        variant="outlined"
                        size="small"
                    />
                </Box>
                
                {/* Resumo de seleção */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Badge 
                            badgeContent={selectedCount} 
                            color="primary"
                            sx={{ mr: 2 }}
                        >
                            <CheckCircleIcon color={selectedCount > 0 ? "primary" : "disabled"} />
                        </Badge>
                        <Typography variant="body2">
                            {selectedCount} de {totalAvailableCount} interesses selecionados
                        </Typography>
                    </Box>
                    
                    {hasChanges && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSaveInterests}
                            disabled={isSaving}
                            startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
                            size="small"
                        >
                            Salvar
                        </Button>
                    )}
                </Box>
            </Paper>

            {/* Lista de categorias e interesses */}
            <Paper sx={{ p: 1 }} elevation={3}>
                <List sx={{ width: '100%' }}>
                    {filteredInterests.map(category => (
                        <React.Fragment key={category.id}>
                            <ListItem 
                                button 
                                onClick={() => handleCategoryToggle(category.id)}
                                sx={{ 
                                    bgcolor: areSomeCategoryInterestsSelected(category.interests) 
                                        ? alpha('#2196f3', 0.08)
                                        : 'transparent'
                                }}
                            >
                                <ListItemIcon>
                                    {categoryIcons[category.id] || <CategoryIcon />}
                                </ListItemIcon>
                                <ListItemText 
                                    primary={
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="subtitle1">
                                                {category.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {category.interests.filter(i => 
                                                    localSelectedInterests.includes(i.id)
                                                ).length} / {category.interests.length}
                                            </Typography>
                                        </Box>
                                    } 
                                />
                                {expandedCategories[category.id] 
                                    ? <ExpandLessIcon /> 
                                    : <ExpandMoreIcon />}
                            </ListItem>
                            
                            <Collapse in={expandedCategories[category.id]} timeout="auto" unmountOnExit>
                                <Box 
                                    sx={{ 
                                        display: 'flex', 
                                        justifyContent: 'flex-end', 
                                        pr: 2, 
                                        pb: 1 
                                    }}
                                >
                                    <Button
                                        size="small"
                                        onClick={() => handleToggleAllInCategory(category.id, category.interests)}
                                    >
                                        {areAllCategoryInterestsSelected(category.interests)
                                            ? "Desmarcar Todos"
                                            : "Selecionar Todos"
                                        }
                                    </Button>
                                </Box>
                                
                                <Box 
                                    sx={{ 
                                        display: 'flex', 
                                        flexWrap: 'wrap', 
                                        gap: 1,
                                        p: 2,
                                        pt: 0
                                    }}
                                >
                                    {category.interests.map(interest => (
                                        <Chip
                                            key={interest.id}
                                            label={interest.label}
                                            onClick={() => handleInterestToggle(interest.id)}
                                            color={localSelectedInterests.includes(interest.id) ? "primary" : "default"}
                                            variant={localSelectedInterests.includes(interest.id) ? "filled" : "outlined"}
                                            sx={{ 
                                                transition: 'all 0.2s ease-in-out',
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                                }
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Collapse>
                            <Divider />
                        </React.Fragment>
                    ))}
                </List>

                {filteredInterests.length === 0 && (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="body1" color="text.secondary">
                            {searchTerm ? 
                                `Nenhum interesse encontrado com o termo "${searchTerm}"` : 
                                "Nenhuma categoria de interesse disponível."}
                        </Typography>
                    </Box>
                )}
            </Paper>

            {/* Botão de salvar fixo na parte inferior para facilitar o uso */}
            {hasChanges && (
                <Box 
                    sx={{ 
                        position: 'sticky', 
                        bottom: 16, 
                        display: 'flex', 
                        justifyContent: 'center',
                        mt: 2
                    }}
                >
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSaveInterests}
                        disabled={isSaving}
                        startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
                        sx={{ 
                            px: 4, 
                            py: 1, 
                            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                            '&:hover': {
                                boxShadow: '0 6px 12px rgba(0,0,0,0.3)'
                            }
                        }}
                    >
                        Salvar alterações
                    </Button>
                </Box>
            )}

            {/* Informações adicionais sobre interesses */}
            <Paper sx={{ p: 2, mt: 2 }} elevation={1}>
                <Typography variant="body2" color="text.secondary">
                    Selecione seus interesses para personalizar sua experiência. 
                    Você receberá conteúdo e recomendações mais relevantes com base nas suas escolhas.
                </Typography>
            </Paper>
        </Box>
    );
};

export default InterestsSection;