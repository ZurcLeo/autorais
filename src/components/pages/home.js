import React from "react";
import CTA from "./cta";
import { Link } from "react-router-dom";
import ComoFunciona from "./howitwork";
import GridPublicUsers from "./gridPublicUsers";
import Hero from "./Hero";
import Background from '../imgs/background.webp';  // Correção ortográfica
import { Navbar, Container, Button, Row, Col, Card } from 'react-bootstrap';

const HomePage = () => {

    const containerStyle = {
        position: 'relative',
        width: "100vw",
        height: '85vh',
        overflow: 'hidden'
    };

    const imageStyle = {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        opacity: '0.3'
    };

    const textStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: '#343A3F',
        textAlign: 'center'
    };

    const buttonStyle = {
        marginTop: '20px',
        backgroundColor: '#007bff',
        borderColor: '#007bff'
    };

    const navbarStyle = {
        height: '5vh',
        backgroundColor: '#343A3F',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#fff'
    };

    return (
        <div>
            <Hero />
            <CTA />
            <ComoFunciona />
        </div>
    );
}

export default HomePage;