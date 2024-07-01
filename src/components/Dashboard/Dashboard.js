// src/components/Dashboard/Dashboard.js
import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Card, CardContent, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';
import { getDashboardData } from '../../services/dashboardService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const data = await getDashboardData();
        setDashboardData(data);
        toast.success('Dashboard data loaded successfully!');
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, navigate]);

  if (loading) {
    return (
      <Container>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h3" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        {dashboardData?.caixinhas?.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h5">Caixinha: {item.name}</Typography>
                <Typography>{item.description}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {dashboardData?.notifications?.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h5">Notification</Typography>
                <Typography>{item.message}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {dashboardData?.messages?.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h5">Message from {item.userId}</Typography>
                <Typography>{item.content}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Dashboard;