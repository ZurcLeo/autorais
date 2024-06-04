import React, { useState, useEffect, useRef } from "react";
import { Form, Button, FormGroup, FormControl, FormCheck, FloatingLabel, Card, Container } from 'react-bootstrap';
import { FaUpload } from 'react-icons/fa';
import AvatarEditor from 'react-avatar-editor';
import useImageUpload from './hooks/useImageUpload';
import useUserProfile from "./hooks/useUserProfile";
import { toast } from 'react-toastify';

const EditProfileForm = ({
    userData,
    setUserData,
    toggleEdit,
    currentUser
}) => {
    const {
        profileImage,
        isPhotoSelected,
        avatarEditorRef,
        handleImageChange,
        uploadSelectedImage
    } = useImageUpload(currentUser);
const { updateProfileData } = useUserProfile();
    const [isLoading, setIsLoading] = useState(true);
    const personalInterests = ["Relacionamentos", "Encontros Casuais", "Passeios Românticos", "Sem Compromisso"];
    const businessInterests = ["Venda de Produtos", "Oferta de Serviços"];
    const textAreaRef = useRef(null);

    const safeUserData = {
        ...userData,
        interessesPessoais: Array.isArray(userData?.interessesPessoais) ? userData.interessesPessoais : [],
        interessesNegocios: Array.isArray(userData?.interessesNegocios) ? userData.interessesNegocios : [],
    };

    const handleCheckboxChange = (field, value) => {
        setUserData(prevState => {
            const currentField = Array.isArray(prevState[field]) ? prevState[field] : [];
            const updatedInterests = currentField.includes(value) 
                ? currentField.filter(interest => interest !== value)
                : [...currentField, value];
            return { ...prevState, [field]: updatedInterests };
        });
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const updatedData = { ...userData };
            await updateProfileData(updatedData);
            toast.success("Dados do perfil atualizados com sucesso.");
        } catch (error) {
            console.error("Erro ao salvar o perfil:", error);
            toast.error("Erro ao atualizar o perfil.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDescriptionChange = (e) => {
        const value = e.target.value;
        if (value.length <= 500) {
            setUserData({ ...safeUserData, descricao: value });
        }
    };

    const adjustTextareaHeight = () => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = "auto";
            textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
        }
    };

    useEffect(() => {
        adjustTextareaHeight();
    }, [userData.descricao]);

    return (
        <Container>
            <Form onSubmit={(e) => e.preventDefault()}>
                <FormGroup controlId="profileImage" className="text-center">
                    <Card.Header>Editando Perfil de {safeUserData.nome}</Card.Header>
                    <div className="profile-image-preview">
                        {profileImage && (
                            <AvatarEditor
                                ref={avatarEditorRef}
                                image={profileImage}
                                width={200}
                                height={200}
                                border={50}
                                borderRadius={100}
                                scale={1.2}
                                rotate={0}
                            />
                        )}
                    </div>
                    <Form.Text className="text-muted">
                        A imagem deve ser no formato JPEG ou PNG e ter até 1MB.
                    </Form.Text>
                    <FormControl
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="my-3"
                    />
                    <Button variant="success" onClick={uploadSelectedImage} disabled={!isPhotoSelected}>
                        <FaUpload style={{ marginRight: '10px' }} /> Enviar Imagem
                    </Button>
                    <hr />
                </FormGroup>
                
                <FloatingLabel controlId="name" label="Nome" className="mb-3">
                    <FormControl
                        type="text"
                        placeholder="Digite seu nome"
                        defaultValue={safeUserData.nome}
                        onChange={e => setUserData({...safeUserData, nome: e.target.value})}
                    />
                </FloatingLabel>
                
                <FloatingLabel controlId="email" label="E-mail" className="mb-3">
                    <FormControl
                        type="email"
                        placeholder="Digite seu e-mail"
                        defaultValue={safeUserData.email}
                        onChange={e => setUserData({...safeUserData, email: e.target.value})}
                    />
                </FloatingLabel>
                
                <FloatingLabel controlId="description" label="Descrição" className="mb-3">
                <FormControl
                    as="textarea"
                    placeholder="Digite sua descrição"
                    value={safeUserData.descricao}
                    onChange={handleDescriptionChange}
                    ref={textAreaRef}
                    onInput={adjustTextareaHeight}
                />
                <Form.Text className="text-muted">
                    {safeUserData.descricao.length}/500 caracteres
                </Form.Text>
            </FloatingLabel>

                <FormGroup controlId="perfilPublico" style={{ textAlign: 'left' }}>
                    <FormCheck
                        type="checkbox"
                        label="Faça o meu perfil público"
                        checked={safeUserData.perfilPublico}
                        onChange={e => setUserData({...safeUserData, perfilPublico: e.target.checked})}
                    />
                    <Form.Text style={{ marginLeft: '10px' }}>
                        Para que outros usuários possam encontrar você, esta opção deve estar selecionada.
                    </Form.Text>
                    <Form.Text style={{ marginLeft: '10px' }}>
                        Ao selecionar a opção, você concorda em compartilhar seus dados com outros usuários registrados.
                    </Form.Text>
                    <Form.Text style={{ marginLeft: '10px' }}>
                        Você pode alterar isso depois.
                    </Form.Text>
                </FormGroup>

                <Card.Header>Selecione o tipo de conta</Card.Header>
                <FormGroup controlId="tipoDeConta" style={{ textAlign: 'left', padding: '10px' }}>
                    <Card.Body>
                        <FormCheck
                            name="cliente"
                            type="checkbox"
                            label="CLIENTE"
                            id="cliente"
                            checked={safeUserData.tipoDeConta === "cliente"}
                            onChange={e => setUserData({...safeUserData, tipoDeConta: e.target.checked ? "cliente" : ""})}
                        />
                        <Card.Text style={{ marginLeft: '10px', fontSize: '0.8rem' }}>
                            Use esta opção se você é um Cliente, este é o perfil padrão. Se você deseja realizar check-in em um AirBNB, use esta opção.
                        </Card.Text>
                        
                        <FormCheck
                            name="proprietario"
                            type="checkbox"
                            label="PROPRIETÁRIO"
                            id="proprietario"
                            checked={safeUserData.tipoDeConta === "proprietario"}
                            onChange={e => setUserData({...safeUserData, tipoDeConta: e.target.checked ? "proprietario" : ""})}
                        />
                        <Card.Text style={{ marginLeft: '10px', fontSize: '0.8rem' }}>
                            Use esta opção se você é um Proprietário, este é o perfil para quem deseja incluir reservas em seu imóvel para check-in.
                        </Card.Text>
                        
                        <FormCheck
                            name="suporte"
                            type="checkbox"
                            label="SUPORTE"
                            id="suporte"
                            checked={safeUserData.tipoDeConta === "suporte"}
                            onChange={e => setUserData({...safeUserData, tipoDeConta: e.target.checked ? "suporte" : ""})}
                        />
                        <Card.Text style={{ marginLeft: '10px', fontSize: '0.8rem' }}>
                            Use esta opção se você é um agente de SUPORTE.
                        </Card.Text>
                    </Card.Body>
                </FormGroup>

                <Card.Header>Interesses Pessoais</Card.Header>
                <FormGroup controlId="personalInterests" style={{ textAlign: 'left', padding: '10px' }}>
                    <Card.Body>
                        {personalInterests.map((interest, index) => (
                            <FormCheck
                                key={interest}
                                type="checkbox"
                                label={interest}
                                id={`personalInterest-${index}`}
                                checked={safeUserData.interessesPessoais.includes(interest)}
                                onChange={e => handleCheckboxChange('interessesPessoais', interest)}
                            />
                        ))}
                    </Card.Body>
                </FormGroup>

                <Card.Header>Interesses de Negócios</Card.Header>
                <FormGroup controlId="businessInterests" style={{ textAlign: 'left', padding: '10px' }}>
                    <Card.Body>
                        {businessInterests.map((interest, index) => (
                            <FormCheck
                                key={interest}
                                type="checkbox"
                                label={interest}
                                id={`businessInterest-${index}`}
                                checked={safeUserData.interessesNegocios.includes(interest)}
                                onChange={e => handleCheckboxChange('interessesNegocios', interest)}
                            />
                        ))}
                    </Card.Body>
                </FormGroup>

                <Button variant="primary" onClick={handleSave} style={{ marginRight: '10px' }}>
                    Salvar Alterações
                </Button>
                <Button variant="secondary" onClick={toggleEdit} style={{ marginLeft: '10px' }}>
                    Cancelar
                </Button>
            </Form>
        </Container>
    );
};

export default EditProfileForm;
