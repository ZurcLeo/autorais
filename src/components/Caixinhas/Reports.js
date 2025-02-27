import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Stack,
  TextField,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Constants for report types
const REPORT_TYPES = {
  GENERAL: 'geral',
  CONTRIBUTIONS: 'contribuicoes',
  PARTICIPATION: 'participacao',
  TRANSACTIONS: 'transacoes',
};

// Helper function to format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Helper function to format dates
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('pt-BR');
};

const Reports = ({ caixinha }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const fetchReportData = async (type) => {
    setLoading(true);
    try {
      // Here we would normally call the API service
      // For now, we'll use mock data based on the caixinha prop
      const mockData = generateMockData(type);
      setReportData(mockData);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate mock data for demonstration
  const generateMockData = (type) => {
    switch (type) {
      case REPORT_TYPES.GENERAL:
        return {
          balanceHistory: Array.from({ length: 6 }, (_, i) => ({
            month: new Date(2024, i).toLocaleDateString('pt-BR', { month: 'short' }),
            balance: Math.random() * 10000,
          })),
          totalContributions: caixinha.contribuicao?.length || 0,
          averageContribution: caixinha.contribuicaoMensal || 0,
        };
      case REPORT_TYPES.CONTRIBUTIONS:
        return {
          contributions: (caixinha.contribuicao || []).map(c => ({
            date: new Date().toISOString(),
            member: 'Member Name',
            amount: caixinha.contribuicaoMensal,
          })),
        };
      // Add other cases as needed
      default:
        return null;
    }
  };

  useEffect(() => {
    const reportType = Object.values(REPORT_TYPES)[activeTab];
    fetchReportData(reportType);
  }, [activeTab, dateRange]);

  const handleExport = () => {
    // Implement export functionality
    console.log('Exporting report...');
  };

  const renderGeneralReport = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('reports.balanceOverTime')}
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={reportData?.balanceHistory}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value) => formatCurrency(value)} />
          <Legend />
          <Line
            type="monotone"
            dataKey="balance"
            stroke="#8884d8"
            name={t('reports.balance')}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );

  const renderContributionsReport = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('reports.date')}</TableCell>
            <TableCell>{t('reports.member')}</TableCell>
            <TableCell align="right">{t('reports.amount')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reportData?.contributions.map((contribution, index) => (
            <TableRow key={index}>
              <TableCell>{formatDate(contribution.date)}</TableCell>
              <TableCell>{contribution.member}</TableCell>
              <TableCell align="right">{formatCurrency(contribution.amount)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderActiveReport = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      );
    }

    if (!reportData) {
      return (
        <Typography color="text.secondary" align="center">
          {t('reports.noData')}
        </Typography>
      );
    }

    switch (activeTab) {
      case 0:
        return renderGeneralReport();
      case 1:
        return renderContributionsReport();
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">{t('reports.title')}</Typography>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleExport}
          >
            {t('reports.export')}
          </Button>
        </Box>

        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <TextField
            type="date"
            label={t('reports.startDate')}
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            type="date"
            label={t('reports.endDate')}
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </Stack>

        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab label={t('reports.general')} />
          <Tab label={t('reports.contributions')} />
          <Tab label={t('reports.participation')} />
          <Tab label={t('reports.transactions')} />
        </Tabs>

        {renderActiveReport()}
      </CardContent>
    </Card>
  );
};

export default Reports;