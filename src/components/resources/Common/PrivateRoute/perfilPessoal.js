import React from 'react';
import { Card, Container, Row, Col, Image, Button } from 'react-bootstrap';
import GerenciarFotos from './gerenciarFotos'; // Ajuste o caminho conforme necessário
import { usePhotos } from './hooks/PhotosContext';
import { useAuth } from '../../AuthService';
import Profile from './profiles';

const PerfilPessoal = () => {
    const { currentUser } = useAuth();
    const { fotosPublicas = [] } = usePhotos();

    return (
        <Container>
            <Row>
               
                  <Profile />
                
            </Row>
            <Card className='m-3 profile-card'  >
                 
                   
                <GerenciarFotos />
                
              
            
            </Card>
        </Container>
    );
};

export default PerfilPessoal;
