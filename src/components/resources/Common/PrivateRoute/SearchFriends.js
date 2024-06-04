import React, { useState } from 'react';
import { Card, Form, FormControl, Button, Image } from "react-bootstrap";
import { useConnections } from './hooks/useConnections';

const SearchFriends = () => {
    const { searchResults, handleSearch } = useConnections();
    const [searchTerm, setSearchTerm] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form submitted with searchTerm:", searchTerm); // Adicione este log

        handleSearch(searchTerm);
    };

    return (
        <Card>
            <Card.Header>Buscar Conexões</Card.Header>
            <Card.Body>
                <Form className="d-flex mb-4" onSubmit={handleSubmit}>
                    <FormControl
                        type="search"
                        placeholder="Buscar por nome ou email"
                        className="me-2"
                        aria-label="Buscar"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)} />
                    <Button variant="outline-success" type="submit">Buscar</Button>
                </Form>
                {searchResults.length > 0 && (
                    <Card>
                        <Card.Body>
                            {searchResults.map((result) => (
                                <Card key={result.user} className="mb-2">
                                    <Card.Body className="d-flex align-items-center">
                                        <Image src={result.fotoDoPerfil} roundedCircle width="50" height="50" className="me-3" />
                                        <div>
                                            <Card.Title>
                                                <a href={`/perfil/${result.user}`} className="text-decoration-none">
                                                    {result.nome}
                                                </a>
                                            </Card.Title>
                                            <Card.Text>{result.email}</Card.Text>
                                        </div>
                                        <Button variant="primary" className="ms-auto">Enviar Solicitação</Button>
                                    </Card.Body>
                                </Card>
                            ))}
                        </Card.Body>
                    </Card>
                )}
            </Card.Body>
        </Card>
    );
};

export default SearchFriends;