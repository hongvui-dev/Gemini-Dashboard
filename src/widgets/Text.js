import React from 'react';
import { Card, CardContent, Box } from '@mui/material';
import styles from '../styles/components.module.css';
import { formatToHTML } from '../utils/helper';

const Text = ({ value, sx }) => {

  const hasMarkdown = /##|(\*\*)|(\*)/.test(value);
  if (hasMarkdown) {
    value = formatToHTML(value);
  }
  return (
    <Card variant="outlined" sx={sx}>
      <CardContent className={styles.textCardInnerWrapper}>
        <Box className={styles.textBoxWrapper} dangerouslySetInnerHTML={{ __html: value }} />
      </CardContent>
    </Card>
  );
};

export default Text;