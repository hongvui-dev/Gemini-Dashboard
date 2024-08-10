import React from 'react';
import { Typography, Card, CardContent } from '@mui/material';
import styles from '../styles/components.module.css'

const Flashcard = ({ fkey, value, onClick, sx }) => {
  // Flashcard that will be used by flashcard container
  return (
    <Card
      variant="outlined"
      className={styles.flashcard}
      onClick={onClick}
      sx={sx}
    >
      <CardContent>
        <Typography variant="h5" component="h5">
          {fkey}
        </Typography>
        <Typography variant="p" component="p" dangerouslySetInnerHTML={{ __html: value }}>
        </Typography>
      </CardContent>

    </Card>
  );
};

export default Flashcard;