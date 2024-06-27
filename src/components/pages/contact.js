// import React, {useState, useLayoutEffect} from "react";
// import axios from 'axios';
// import ReCAPTCHA from "react-google-recaptcha";
// import Col from 'react-bootstrap/Col';
// import Form from 'react-bootstrap/Form';
// import Row from 'react-bootstrap/Row';
// import Hero from "./Hero";
// import Button from 'react-bootstrap/Button';
// import Dropdown from 'react-bootstrap/Dropdown';

// function Contato() {
//     useLayoutEffect (() => {
//         window.scrollTo(0, 0);
//       }, []);
//     const [email, setEmail] = useState('');
//     const [emailValid, setEmailValid] = useState(true);
//     const [firstName, setFirstName] = useState('');
//     const [lastName, setLastName] = useState('');
//     const [message, setMessage] = useState('');
//     // const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
//     const siteKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY;
//     const [selectedSubject, setSelectedSubject] = useState('Assunto');
//     const [captchaValue, setCaptchaValue] = useState(null);
//     const [captchaError, setCaptchaError] = useState(null)
//     const [firstNameValid, setFirstNameValid] = useState(true);
//     const [lastNameValid, setLastNameValid] = useState(true);
//     const [messageValid, setMessageValid] = useState(true);

//     const handleCaptchaChange = (value) => {
//         setCaptchaValue(value);
//     };

//     const validateEmail = (value) => {
//         const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         return regex.test(value);
//     };

//     const handleEmailChange = (e) => {
//         const value = e.target.value;
//         setEmail(value);
//         setEmailValid(validateEmail(value));
//     };

//     const validateNotEmpty = (value) => value.trim() !== '';
//     const validateMessage = (value) => value
//         .trim()
//         .length >= 20; // Aqui assumimos que a mensagem deve ter pelo menos 20 caracteres.

//     const handleFirstNameChange = (e) => {
//         const value = e.target.value;
//         setFirstName(value);
//         setFirstNameValid(validateNotEmpty(value));
//     };

//     const handleLastNameChange = (e) => {
//         const value = e.target.value;
//         setLastName(value);
//         setLastNameValid(validateNotEmpty(value));
//     };

//     const handleMessageChange = (e) => {
//         const value = e.target.value;
//         setMessage(value);
//         setMessageValid(validateMessage(value));
//     };

//     const handleSubjectChange = (subject) => {
//         setSelectedSubject(subject);
//     };

//     const handleSubmit = (e) => {
//         e.preventDefault();

//         // Agora verifique o recaptcha no servidor antes de prosseguir com a submissão.
//         if (captchaValue) {
//             (async () => {
//                 try {
//                     const response = await axios.post(
//                         '/api/verify_recaptcha',
//                         {captcha: captchaValue}
//                     );
//                     if (!response.data.success) {
//                         console.log("Falha na verificação do reCAPTCHA");
//                         setCaptchaError('Falha na verificação do reCAPTCHA');
//                         // A verificação do reCAPTCHA falhou; pare aqui e informe ao usuário.
//                         return;
//                     }
//                 } catch (err) {
//                     console.log("Erro na verificação do reCAPTCHA", err);
//                     // Ocorreu um erro na verificação do reCAPTCHA; pare aqui e informe ao usuário.
//                     return;
//                 }
//             })();
//         } else {
//             console.log("reCAPTCHA não preenchido");
//             // O reCAPTCHA não foi preenchido; pare aqui e informe ao usuário.
//             return;
//         }

//         // Agora você sabe que o reCAPTCHA foi preenchido e verificado corretamente.
//         // Você pode prosseguir com a submissão.

//         if (!emailValid || !firstNameValid || !lastNameValid || !messageValid) {
//             // Exibir uma mensagem de erro ou tomar uma ação apropriada
//             return;
//         }

//         // Lógica para enviar o formulário
//         const emailContent = {
//             subject: selectedSubject,
//             email: email,
//             name: firstName,
//             lastName: lastName,
//             message: message
//             // Mais informações do formulário podem ser adicionadas aqui
//         };
//         const emailJson = JSON.stringify(emailContent);
//         window.location.href = `mailto:oi@eloscloud.com.br?body=${encodeURIComponent(
//             emailJson
//         )}`;
//     };

//     const ContatoStyle = {
//         width: '70%',
//         margin: '50px auto'
//     }

//     const Space = {
//         margin: '15px auto'
//     }

//     return (
//         <div >
//             <Hero title="Contato"/>
//             <Form style={ContatoStyle} className="w-50" onSubmit={handleSubmit}>
//                 <Row>
//                     <h4>Entre em Contato</h4>
//                     <p>Envie sua mensagem e em breve nós responderemos.</p>
//                     <Dropdown>
//                         <Dropdown.Toggle className="w-100" id="dropdown-autoclose-true">
//                             {selectedSubject}
//                         </Dropdown.Toggle>
//                         <Dropdown.Menu>
//                             <Dropdown.Item
//                                 className="dropdown-item-input"
//                                 onClick={() => handleSubjectChange('Falar com Especialista')}>
//                                 Falar com Especialista
//                             </Dropdown.Item>
//                             <Dropdown.Item
//                                 className="dropdown-item-input"
//                                 onClick={() => handleSubjectChange('Suporte')}>
//                                 Suporte
//                             </Dropdown.Item>
//                             <Dropdown.Item
//                                 className="dropdown-item-input"
//                                 onClick={() => handleSubjectChange('Outros')}>
//                                 Outros
//                             </Dropdown.Item>
//                         </Dropdown.Menu>
//                     </Dropdown>
//                     <Col className="m-1 p-1">
//                         <Form.Control
//                             type="text"
//                             placeholder="Seu e-mail"
//                             aria-label="Seu e-mail"
//                             value={email}
//                             style={Space}
//                             onChange={handleEmailChange}
//                             isInvalid={!emailValid}/> {
//                             !emailValid && (
//                                 <Form.Control.Feedback type="invalid">
//                                     Insira um e-mail válido.
//                                 </Form.Control.Feedback>
//                             )
//                         }
//                         <Form.Control
//                             placeholder="Nome"
//                             aria-label="Seu Nome"
//                             value={firstName}
//                             style={Space}
//                             onChange={handleFirstNameChange}
//                             isInvalid={!firstNameValid}/> {
//                             !firstNameValid && (
//                                 <Form.Control.Feedback type="invalid">
//                                     Insira um nome válido.
//                                 </Form.Control.Feedback>
//                             )
//                         }

//                         <Form.Control
//                             placeholder="Sobrenome"
//                             aria-label="Seu sobrenome"
//                             value={lastName}
//                             style={Space}
//                             onChange={handleLastNameChange}
//                             isInvalid={!lastNameValid}/> {
//                             !lastNameValid && (
//                                 <Form.Control.Feedback type="invalid">
//                                     Insira um sobrenome válido.
//                                 </Form.Control.Feedback>
//                             )
//                         }

//                         <Form.Control
//                             as="textarea"
//                             placeholder="Insira sua mensagem"
//                             aria-label="Sua mensagem"
//                             style={Space}
//                             rows={3}
//                             value={message}
//                             onChange={handleMessageChange}
//                             isInvalid={!messageValid}/> {
//                             !messageValid && (
//                                 <Form.Control.Feedback type="invalid">
//                                     Insira uma mensagem com pelo menos 20 caracteres.
//                                 </Form.Control.Feedback>
//                             )
//                         }
//                     </Col>
//                 </Row>
//                 <div>
//                     <ReCAPTCHA
//                         style={Space}
//                         sitekey={siteKey}
//                         onChange={handleCaptchaChange}
//                         aria-label="reCaptcha"/> {
//                         captchaError && (<div className="error">
//                             {captchaError}
//                         </div>)
//                     }
//                 </div>
//                 <Button
//                     style={Space}
//                     variant="dark"
//                     size="sm"
//                     type="submit"
//                     aria-label="Botão enviar">
//                     Enviar
//                 </Button>

//                 <p>
//                     <small>Ao enviar o formulário você concorda
//                         <br/>
//                         com nossa 
//                         <a href="https://eloscloud.com.br/sobre/privacy"> Política de Privacidade</a>
//                         <br/> e os nossos 
//                         <a href="https://eloscloud.com.br/sobre/terms"> Termos de Uso</a>.</small>
//                 </p>
//             </Form>
//         </div>
//     );
// }

// export default Contato;
