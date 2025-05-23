import React, { useState, useEffect } from 'react';
import { 
  CircularProgress, Box, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, Typography, 
  TextField, InputAdornment, LinearProgress, Tabs, Tab, 
  MenuItem, Select, FormControl, InputLabel, Tooltip, 
  IconButton, Chip, Card, CardContent, Grid, useTheme
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  GetApp as DownloadIcon,
  Info as InfoIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  TableChart as TableChartIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { Bar, Pie } from 'react-chartjs-2';
import { CSVLink } from 'react-csv';

const InterestStats = ({ stats, onRefresh, findCategoryById }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('table');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme()

  useEffect(() => {
    if (stats) {
      setLastUpdated(new Date());
    }
  }, [stats]);

  const handleRefresh = async () => {
    setIsLoading(true);
    await onRefresh();
    setIsLoading(false);
    setLastUpdated(new Date());
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleCategoryChange = (event) => {
    setCategoryFilter(event.target.value);
    setPage(0);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  const handleSortOrderToggle = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleViewModeChange = (event, newValue) => {
    setViewMode(newValue);
  };

  // Prepare data for export
  const exportData = stats?.interestDetails?.map(stat => {
    const category = findCategoryById(stat.categoryId);
    const percentage = stats.totalUsers
      ? ((stat.count / stats.totalUsers) * 100).toFixed(1)
      : '0';
    
    return {
      Nome: stat.label,
      Categoria: category ? category.name : stat.categoryId,
      'Número de Usuários': stat.count,
      'Porcentagem': `${percentage}%`
    };
  }) || [];

  // Filter, sort, and paginate data
  const prepareData = () => {
    if (!stats || !stats.interestDetails) return [];
    
    let filteredData = [...stats.interestDetails];
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredData = filteredData.filter(stat => 
        stat.label.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by category
    if (categoryFilter !== 'all') {
      filteredData = filteredData.filter(stat => 
        stat.categoryId === categoryFilter
      );
    }
    
    // Sort data
    filteredData.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'popularity':
          comparison = b.count - a.count;
          break;
        case 'name':
          comparison = a.label.localeCompare(b.label);
          break;
        case 'category':
          const catA = findCategoryById(a.categoryId)?.name || '';
          const catB = findCategoryById(b.categoryId)?.name || '';
          comparison = catA.localeCompare(catB);
          break;
        default:
          comparison = b.count - a.count;
      }
      
      return sortOrder === 'asc' ? comparison * -1 : comparison;
    });
    
    return filteredData;
  };
  
  const preparedData = prepareData();
  
  // Pagination
  const paginatedData = preparedData.slice(
    page * rowsPerPage, 
    page * rowsPerPage + rowsPerPage
  );
  
  // Generate categories list for filter
  const categories = stats?.interestDetails?.reduce((acc, stat) => {
    const category = findCategoryById(stat.categoryId);
    if (category && !acc.find(c => c.id === category.id)) {
      acc.push(category);
    }
    return acc;
  }, []) || [];

  // Prepare chart data
  const chartData = {
    labels: paginatedData.map(stat => stat.label),
    datasets: [
      {
        label: 'Número de Usuários',
        data: paginatedData.map(stat => stat.count),
        backgroundColor: paginatedData.map(() => 
          `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`
        ),
        borderWidth: 1,
      },
    ],
  };

  if (!stats) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>Carregando estatísticas...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      {/* Status Bar */}
      <Card sx={{ mb: 3, bgcolor: theme.palette.primary.main }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <Typography variant="h6" component="div">
                Estatísticas de Interesses
              </Typography>
              <Typography variant="body2" color={theme.palette.text.primary}>
                Total de usuários: <strong>{stats.totalUsers || 0}</strong>
              </Typography>
              <Typography variant="body2" color={theme.palette.text.primary}>
                Última atualização: {lastUpdated.toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={12} md={8} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button 
                onClick={handleRefresh} 
                variant="outlined" 
                startIcon={<RefreshIcon />}
                disabled={isLoading}
              >
                {isLoading ? 'Atualizando...' : 'Atualizar'}
              </Button>
              
              <CSVLink 
                data={exportData} 
                filename={`estatisticas-interesses-${new Date().toISOString().slice(0,10)}.csv`}
                style={{ textDecoration: 'none' }}
              >
                <Button variant="outlined" startIcon={<DownloadIcon />}>
                  Exportar
                </Button>
              </CSVLink>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Filters and Controls */}
      <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        <TextField
          label="Buscar interesse"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Categoria</InputLabel>
          <Select
            value={categoryFilter}
            onChange={handleCategoryChange}
            label="Categoria"
          >
            <MenuItem value="all">Todas as categorias</MenuItem>
            {categories.map(category => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Ordenar por</InputLabel>
          <Select
            value={sortBy}
            onChange={handleSortChange}
            label="Ordenar por"
          >
            <MenuItem value="popularity">Popularidade</MenuItem>
            <MenuItem value="name">Nome</MenuItem>
            <MenuItem value="category">Categoria</MenuItem>
          </Select>
        </FormControl>
        
        <IconButton onClick={handleSortOrderToggle} title={`Ordem ${sortOrder === 'asc' ? 'crescente' : 'decrescente'}`}>
          <FilterIcon sx={{ transform: sortOrder === 'asc' ? 'rotate(180deg)' : 'none' }} />
        </IconButton>
      </Box>
      
      {/* Visualization Mode Selector */}
      <Tabs
        value={viewMode}
        onChange={handleViewModeChange}
        variant="fullWidth"
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab value="table" icon={<TableChartIcon />} label="Tabela" />
        <Tab value="bar" icon={<BarChartIcon />} label="Gráfico de Barras" />
        <Tab value="pie" icon={<PieChartIcon />} label="Gráfico de Pizza" />
        <Tab value="timeline" icon={<TimelineIcon />} label="Tendências" disabled />
      </Tabs>

      {/* Results Status */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color={theme.palette.text.primary}>
          Exibindo {paginatedData.length} de {preparedData.length} interesses
          {searchTerm && ` (filtro: "${searchTerm}")`}
          {categoryFilter !== 'all' && ` na categoria: ${findCategoryById(categoryFilter)?.name || categoryFilter}`}
        </Typography>
        
        {preparedData.length === 0 && (
          <Chip 
            label="Nenhum resultado encontrado com os filtros atuais" 
            color="warning" 
            variant="outlined" 
          />
        )}
      </Box>
      
      {/* Loading Indicator */}
      {isLoading && <LinearProgress sx={{ mb: 2 }} />}
      
      {/* Table View */}
      {viewMode === 'table' && paginatedData.length > 0 && (
        <TableContainer component={Paper} sx={{ mt: 1 }}>
          <Table aria-label="interest statistics table">
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.primary.main }}>
                <TableCell>Nome</TableCell>
                <TableCell>Categoria</TableCell>
                <TableCell>Usuários</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Porcentagem
                    <Tooltip title="Porcentagem de usuários que selecionaram este interesse">
                      <IconButton size="small">
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map(stat => {
                const category = findCategoryById(stat.categoryId);
                const percentage = stats.totalUsers
                  ? ((stat.count / stats.totalUsers) * 100).toFixed(1)
                  : '0';
                const isHighPopularity = parseFloat(percentage) > 50;

                return (
                  <TableRow 
                    key={stat.id}
                    sx={{ 
                      '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                      ...(isHighPopularity && { bgcolor: 'success.light' })
                    }}
                  >
                    <TableCell>
                      <Tooltip title={`ID: ${stat.id}`}>
                        <span>{stat.label}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{category ? category.name : stat.categoryId}</TableCell>
                    <TableCell>{stat.count}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={parseFloat(percentage)} 
                            color={isHighPopularity ? "success" : "primary"}
                          />
                        </Box>
                        <Box sx={{ minWidth: 35 }}>
                          {percentage}%
                        </Box>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Bar Chart View */}
      {viewMode === 'bar' && paginatedData.length > 0 && (
        <Box sx={{ height: 400, mt: 2 }}>
          <Bar 
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Número de Usuários'
                  }
                }
              },
              plugins: {
                legend: {
                  display: false
                },
                tooltip: {
                  callbacks: {
                    afterLabel: function(context) {
                      const percentage = stats.totalUsers
                        ? ((context.raw / stats.totalUsers) * 100).toFixed(1)
                        : '0';
                      return `${percentage}% dos usuários`;
                    }
                  }
                }
              }
            }}
          />
        </Box>
      )}
      
      {/* Pie Chart View */}
      {viewMode === 'pie' && paginatedData.length > 0 && (
        <Box sx={{ height: 400, mt: 2 }}>
          <Pie 
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                tooltip: {
                  callbacks: {
                    afterLabel: function(context) {
                      const percentage = stats.totalUsers
                        ? ((context.raw / stats.totalUsers) * 100).toFixed(1)
                        : '0';
                      return `${percentage}% dos usuários`;
                    }
                  }
                }
              }
            }}
          />
        </Box>
      )}
      
      {/* No Data Message */}
      {preparedData.length === 0 && !isLoading && (
        <Box sx={{ textAlign: 'center', p: 4, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="h6">Nenhum dado encontrado</Typography>
          <Typography variant="body2" color={theme.palette.text.primary}>
            Tente ajustar seus filtros ou atualizar os dados.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default InterestStats;