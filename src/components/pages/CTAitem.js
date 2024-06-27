import React from 'react';
import { Card } from 'react-bootstrap';

const CTAItem = ({ title, text, icon }) => {
  return (
    <Card>
      <Card.Body>
        {icon}
        <Card.Title>{title}</Card.Title>
        <Card.Text>{text}</Card.Text>
      </Card.Body>
    </Card>
  );
};

export default CTAItem;
