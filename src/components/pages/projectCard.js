import React from 'react';
import { Card, ListGroup, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const ProjectCard = ({ project, href }) => {
  return (
    <Card className="shadow" style={{ width: '18rem' }}>
      <Card.Img variant="top" src={project.image} />
      <Card.Body>
        <Card.Title>{project.title}</Card.Title>
        <Card.Text>
          <p>{project.description}</p>
          {/* Adiciona `key` para cada `Badge` baseado em um identificador único da tag, como o texto da tag se for único */}
          {project.tags.map((tag, index) => (
            <Badge key={index} className="tag" bg={tag.color} text={tag.textColor}>{tag.text}</Badge>
          ))}
        </Card.Text>
      </Card.Body>
      <ListGroup className="list-group-flush">
        {/* Adiciona `key` para cada item da lista, pode ser o próprio texto se for único ou um índice */}
        {project.features.map((feature, index) => (
          <ListGroup.Item key={index}>
            <img src={feature.icon} alt={feature.altText} width="20" />
            <p>{feature.text}</p>
          </ListGroup.Item>
        ))}
      </ListGroup>
      <Card.Body>
        <Button as={Link} to={href} variant="dark" size="sm" block>Conheça o Projeto</Button>
      </Card.Body>
    </Card>
  );
};

export default ProjectCard;
