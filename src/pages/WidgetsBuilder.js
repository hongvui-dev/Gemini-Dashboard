import React, { useRef } from 'react';
import { Button, Container, Box } from '@mui/material';
import { Visibility as PreviewIcon } from '@mui/icons-material';
import styles from '../styles/components.module.css';
import WidgetForm from '../components/WidgetForm';

const WidgetsBuilder = () => {

  //Use to call functions inside WidgetForm
  const formRef = useRef();

  return (
    <Container maxWidth="sm">
      <Box className={styles.widgetsBuilderWrapper}>
        <Box>
          <WidgetForm
            ref={formRef}
          ></WidgetForm>
          <Box className={styles.widgetsBuilderBtnWrapper} >
            <Button
              variant="outlined"
              onClick={() => formRef.current.preview()}
              startIcon={<PreviewIcon />}
            >
              Preview
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => formRef.current.submit()}
            >
              Submit
            </Button>

          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default WidgetsBuilder;