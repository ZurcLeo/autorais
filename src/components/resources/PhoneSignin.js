import React, { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import '../../components/PhoneSignin.css';
import { Button, Form, FormControl, InputGroup, Card } from "react-bootstrap";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../firebase.config";
import { toast } from 'react-toastify';

function PhoneSignin () {
    const [code, setCode] = useState(new Array(6).fill(''));
    const [user, setUser] = useState(null);
    const [otp, setOtp] = useState('');
    const [phone, setPhone] = useState('');
    
    const enviarOtp = async () => {
        try {
        const recaptcha = new RecaptchaVerifier(auth, 'recaptcha', {});
        const confirmation = signInWithPhoneNumber(auth, phone, recaptcha);
        toast.success('Código de verificação enviado', confirmation);

    } catch (err) {
console.log(err);
toast.error('Erro ao enviar código de verificação', err);
    }
    }

    const handleChange = (element, index) => {
        const newCode = [...code];
        newCode[index] = element.value;
        setCode(newCode);

        // Auto-focus to next input field if exist
        if (element.nextSibling) {
            element.nextSibling.focus();
        }
    };

const verificarOtp = async () => {
    try {
      const data = await user.confirm(otp)
      console.log(data);
    } catch (err) {
      console.log(err);
      toast.error('Erro ao verificar o código de verificação', err);}
}

    const handleSubmit = () => {
        toast.success('Código de verificação enviado', code.join('') );
        console.log(code.join(''));
        // Here you can handle the submission of the code to the server
    };

    return (
        <div className="phone-signin">
            <div className="phone-content">
                <Card style={{ width: '30rem', margin: 'auto', marginTop: '20px'}}>
                    <Card.Header>Entrar com Telefone</Card.Header>
                    <Card.Body style={{ alignItems: 'center' }}>
            <PhoneInput
           
                
                country={'br'}
                value={phone}
                onChange={(phone) => setPhone('+' + phone)}
            />
            <Button onClick={enviarOtp} style={{ marginTop: '10px' }} variant="primary">Enviar código de verificação</Button>
            <div className="recaptcha" id="recaptcha"></div>
            </Card.Body>
            </Card>
<br />
<Card style={{ width: '30rem', margin: 'auto', marginTop: '20px'}}>
<Card.Header>Verificar Código</Card.Header>
<Card.Body>
<Form onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
            }}>
                <InputGroup className="mt-3">
                    {code.map((_, index) => (
                        <FormControl
                            key={index}
                            type="text"
                            maxLength="1"
                            style={{ width: '40px', marginRight: '5px', textAlign: 'center' }}
                            onChange={(e) => handleChange(e.target, index)}
                            value={code[index]}
                        />
                    ))}
                </InputGroup>
                <Button onChange={verificarOtp} type="submit" className="mt-3">
                    Verificar Código
                </Button>
            </Form>
            </Card.Body>
</Card>
<br />
            </div>
          
        </div>
    )
}

export default PhoneSignin;