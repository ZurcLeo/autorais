// src/components/Pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  AppBar,
  Toolbar,
  Box } from '@mui/material';
import { AccountCircle,
  MonetizationOn,
  ShoppingBag,
  Comment,
  Videocam,
  Mail } from '@mui/icons-material';
import TopNavBar from '../Layout/TopNavBar';
import Footer from './Footer';
import { useTranslation } from 'react-i18next';

const HomePage = () => {
  const {t} = useTranslation();

  return (
    <Container className="home-page">
      {/* <TopNavBar /> */}
      <main>
        <section className="hero" style={{ textAlign: 'center', margin: '2rem 0' }}>
          <Typography variant="h3" gutterBottom>{t('home.welcome_message')}</Typography>
          <Typography variant="h5">{t('home.intro_text')}</Typography>
          <Button variant="contained" color="primary" component={Link} to="/login" style={{ marginTop: '1rem' }}>{t('home.enter_now')}</Button>
        </section>
        
        <section className="features">
          <Typography variant="h4" gutterBottom>{t('home.features_title')}</Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent style={{ textAlign: 'center' }}>
                  <IconButton color="primary"><AccountCircle /></IconButton>
                  <Typography>{t('home.feature1_title')}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent style={{ textAlign: 'center' }}>
                  <IconButton color="primary"><MonetizationOn /></IconButton>
                  <Typography>{t('home.feature2_title')}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent style={{ textAlign: 'center' }}>
                  <IconButton color="primary"><ShoppingBag /></IconButton>
                  <Typography>{t('home.feature3_title')}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent style={{ textAlign: 'center' }}>
                  <IconButton color="primary"><Comment /></IconButton>
                  <Typography>{t('home.feature4_title')}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent style={{ textAlign: 'center' }}>
                  <IconButton color="primary"><Comment /></IconButton>
                  <Typography>{t('home.feature5_title')}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent style={{ textAlign: 'center' }}>
                  <IconButton color="primary"><Videocam /></IconButton>
                  <Typography>{t('home.feature6_title')}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent style={{ textAlign: 'center' }}>
                  <IconButton color="primary"><Mail /></IconButton>
                  <Typography>{t('home.feature7_title')}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent style={{ textAlign: 'center' }}>
                  <IconButton color="primary"><Mail /></IconButton>
                  <Typography>{t('home.feature8_title')}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </section>

        <section className="call-to-action" style={{ textAlign: 'center', margin: '2rem 0' }}>
          <Typography variant="h4">{t('home.call_to_action')}</Typography>
          <Button variant="contained" color="primary" component={Link} to="/login" style={{ marginTop: '1rem' }}>{t('home.enter_now')}</Button>
        </section>
      </main>
      
<Footer />
    </Container>
  );
};

export default HomePage;