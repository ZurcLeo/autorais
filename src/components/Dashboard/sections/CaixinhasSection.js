import React from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';

const CaixinhaCard = ({ caixinha }) => (
  <Card className="h-full">
    <CardContent>
      <Typography variant="h6" className="mb-2">
        {caixinha.name}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        Contribuição Mensal: R$ {caixinha.contribuicaoMensal?.toFixed(2)}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        Dia de Vencimento: {caixinha.diaVencimento}
      </Typography>
      <Typography variant="h6" className="mt-2" color="primary">
        Saldo Total: R$ {caixinha.saldoTotal?.toFixed(2)}
      </Typography>
    </CardContent>
  </Card>
);

export const CaixinhasSection = ({ data }) => {
  // If there's no data, show a message
  if (!data || data.length === 0) {
    return (
      <Card className="w-full p-4">
        <Typography variant="h6">
          Você ainda não possui caixinhas
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Crie uma nova caixinha para começar a gerenciar seus recursos
        </Typography>
      </Card>
    );
  }

  return (
    <section className="space-y-4">
      <Typography variant="h5" className="mb-4">
        Suas Caixinhas
      </Typography>
      <Grid container spacing={3}>
        {data.map((caixinha) => (
          <Grid item xs={12} sm={6} md={4} key={caixinha.id}>
            <CaixinhaCard caixinha={caixinha} />
          </Grid>
        ))}
      </Grid>
    </section>
  );
};