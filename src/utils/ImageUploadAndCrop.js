import React, { useState, useRef } from 'react';
import AvatarEditor from 'react-avatar-editor';
import { showPromiseToast } from '../utils/toastUtils';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Slider, IconButton, Box, Tooltip, Typography, Grid } from '@mui/material';
import { PhotoCamera as PhotoCameraIcon, Cancel as CancelIcon, ZoomIn as ZoomInIcon, ZoomOut as ZoomOutIcon, RotateLeft as RotateLeftIcon, RotateRight as RotateRightIcon, Brightness6 as BrightnessIcon, Contrast as ContrastIcon } from '@mui/icons-material';

const ImageUploadAndCrop = ({ image, open, onClose, onSave }) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const editorRef = useRef(null);

  const handleScaleChange = (newValue) => {
    setScale(newValue);
  };

  const handleRotationChange = (direction) => {
    setRotation((prev) => (prev + direction + 360) % 360);
  };

  const handleBrightnessChange = (event, newValue) => {
    setBrightness(newValue);
  };

  const handleContrastChange = (event, newValue) => {
    setContrast(newValue);
  };

  const handleSave = async () => {
    if (editorRef.current) {
      const canvas = editorRef.current.getImageScaledToCanvas();
      
      // Aplicar brilho e contraste
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = applyBrightnessContrast(imageData.data[i], brightness, contrast);
        imageData.data[i + 1] = applyBrightnessContrast(imageData.data[i + 1], brightness, contrast);
        imageData.data[i + 2] = applyBrightnessContrast(imageData.data[i + 2], brightness, contrast);
      }
      ctx.putImageData(imageData, 0, 0);

      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], 'edited-image.png', { type: 'image/png' });
          const uploadPromise = onSave(file);
          showPromiseToast(uploadPromise, {
            loading: 'Atualizando imagem de perfil...',
            success: 'Imagem de perfil atualizada com sucesso!',
            error: 'Erro ao atualizar a imagem de perfil.',
          });
          await uploadPromise;
          onClose();
        } else {
          console.error('Blob não foi gerado corretamente.');
        }
      }, 'image/png');
    }
  };

  const applyBrightnessContrast = (value, brightness, contrast) => {
    value = value * (brightness / 100);
    value = ((value - 128) * (contrast / 100)) + 128;
    return Math.max(0, Math.min(255, value));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar Imagem</DialogTitle>
      <DialogContent>
        <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column">
          <AvatarEditor
            ref={editorRef}
            image={image}
            width={250}
            height={250}
            border={50}
            borderRadius={125}
            scale={scale}
            rotate={rotation}
          />
          <Grid container spacing={2} marginTop={2}>
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>Zoom</Typography>
              <Box display="flex" alignItems="center">
                <IconButton onClick={() => handleScaleChange(Math.max(1, scale - 0.1))}>
                  <ZoomOutIcon />
                </IconButton>
                <Slider
                  value={scale}
                  onChange={(_, newValue) => handleScaleChange(newValue)}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="scale-slider"
                />
                <IconButton onClick={() => handleScaleChange(Math.min(3, scale + 0.1))}>
                  <ZoomInIcon />
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>Rotação</Typography>
              <Box display="flex" justifyContent="center">
                <IconButton onClick={() => handleRotationChange(-90)}>
                  <RotateLeftIcon />
                </IconButton>
                <IconButton onClick={() => handleRotationChange(90)}>
                  <RotateRightIcon />
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>Brilho</Typography>
              <Box display="flex" alignItems="center">
                <BrightnessIcon />
                <Slider
                  value={brightness}
                  onChange={handleBrightnessChange}
                  min={0}
                  max={200}
                  step={1}
                  aria-labelledby="brightness-slider"
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>Contraste</Typography>
              <Box display="flex" alignItems="center">
                <ContrastIcon />
                <Slider
                  value={contrast}
                  onChange={handleContrastChange}
                  min={0}
                  max={200}
                  step={1}
                  aria-labelledby="contrast-slider"
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Tooltip title="Cancelar">
          <IconButton onClick={onClose} color="secondary">
            <CancelIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Salvar">
          <IconButton onClick={handleSave} color="primary">
            <PhotoCameraIcon />
          </IconButton>
        </Tooltip>
      </DialogActions>
    </Dialog>
  );
};

export default ImageUploadAndCrop;