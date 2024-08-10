import React, { useState } from 'react';
import { Box } from '@mui/material';
import styles from '../styles/components.module.css'
import Flashcard from './FlashCard';


const FlashcardContainer = ({ flashcards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  //When user tap on flashcard
  const handleCardClick = () => {
    //Loop back to 0 when we reach last card
    setCurrentIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
  };


  return (
    <Box className={styles.flashcardContainerWrapper}>

      { flashcards?.map((flashcard, index) => {

          //Change z index of flashcards
          const zIndex = flashcards.length - ((currentIndex + index) % flashcards.length);

          return (
            <Flashcard
              key={index}
              fkey={flashcard?.key}
              value={flashcard?.value}
              onClick={handleCardClick}
              className={styles.flashcardWrapper}
              sx={{
                zIndex: zIndex
              }}
            />
          );
        })}
    </Box>
  );
};

export default FlashcardContainer;