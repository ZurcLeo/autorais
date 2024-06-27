import React, { useState, useEffect } from 'react';
import { Table, Container, Row, Col, Card } from 'react-bootstrap';
import { db } from '../../../../firebase.config';
import { useAuth } from '../../AuthService';
import { collection, query, where, getDocs } from 'firebase/firestore';
import './elosCoinManager.css'

const ElosCoinManager = () => {
    const [transactions, setTransactions] = useState([]);
    const [receivedTransactions, setReceivedTransactions] = useState([]);
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchTransactions = async () => {
            if (!currentUser) return;

            const transactionsRef = collection(db, "usuario", currentUser.uid, "pagamentos");
            const q = query(transactionsRef, where("tipo", "==", "envio_presente"));
            const querySnapshot = await getDocs(q);

            const fetchedTransactions = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setTransactions(fetchedTransactions);
        };

        const fetchReceivedTransactions = async () => {
            if (!currentUser) return;

            const receivedRef = collection(db, "usuario", currentUser.uid, "pagamentos");
            const q = query(receivedRef, where("receiverId", "==", currentUser.uid));
            const querySnapshot = await getDocs(q);

            const fetchedReceivedTransactions = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setReceivedTransactions(fetchedReceivedTransactions);
        };

        fetchTransactions();
        fetchReceivedTransactions();
    }, [currentUser]);

    return (
        <Container>
            <Row>
                <Col>
                    <h2>Seus Gastos</h2>
                    <Card>
                        <Card.Body>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Valor</th>
                                        <th>Data</th>
                                        <th>Para</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map(tx => (
                                        <tr key={tx.id}>
                                            <td>{tx.giftName}</td>
                                            <td>{tx.valor}</td>
                                            <td>{new Date(tx.data.seconds * 1000).toLocaleDateString()}</td>
                                            <td>{tx.receiverName}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row>
                <Col>
                    <h2>Seus Recebimentos</h2>
                    <Card>
                        <Card.Body>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Valor</th>
                                        <th>Data</th>
                                        <th>De</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {receivedTransactions.map(tx => (
                                        <tr key={tx.id}>
                                            <td>{tx.giftName}</td>
                                            <td>{tx.valor}</td>
                                            <td>{new Date(tx.data.seconds * 1000).toLocaleDateString()}</td>
                                            <td>{tx.senderName}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ElosCoinManager;
