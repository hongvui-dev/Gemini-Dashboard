import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import styles from '../styles/components.module.css';
import Quiz from './Quiz';

const QuizContainer = ({ quizzes }) => {
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState(Array(quizzes.length).fill(null));
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    setAnswered(selectedAnswers[currentQuizIndex] !== null);
  }, [currentQuizIndex, selectedAnswers]);

  //Store user's answer and set score as the quiz progress
  const handleAnswer = (answer) => {
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[currentQuizIndex] = answer;
    setSelectedAnswers(newSelectedAnswers);

    if (answer === parseInt(quizzes[currentQuizIndex].correctAnswer)) {
      setScore((prevScore) => prevScore + 1);
    }

    setAnswered(true);
  };

  //Go to next quiz
  const handleNext = () => {
    if (currentQuizIndex <= quizzes.length - 1) {
      setCurrentQuizIndex((prevIndex) => prevIndex + 1);
    }
  };

  //Go to previous quiz
  const handlePrev = () => {
    if (currentQuizIndex > 0) {
      setCurrentQuizIndex((prevIndex) => prevIndex - 1);
    }
  };

  //Restart the quiz
  const handleRestart = () => {
    setCurrentQuizIndex(0);
    setScore(0);
    setSelectedAnswers(Array(quizzes.length).fill(null));
    setAnswered(false);
  };

  return (
    <Container className={styles.quizParentWrapper}>
      {currentQuizIndex <= quizzes.length - 1 ? (
        <>
          <Quiz
            quiz={quizzes[currentQuizIndex]}
            onAnswer={handleAnswer}
            answered={answered}
            selectedAnswer={selectedAnswers[currentQuizIndex]}
          />
          <Box className={styles.quizBtnWrapper} >
            <Button
              variant="contained"
              color="primary"
              onClick={handlePrev}
              disabled={currentQuizIndex === 0}
              style={{ backgroundColor: currentQuizIndex === 0 ? 'grey' : undefined }}
            >
              Previous
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              disabled={!answered}
            >
              Next
            </Button>
          </Box>
        </>
      ) : (
        <Box className={styles.textAlignCenter}>
          <Typography variant="h4" component="h4">
            Your score is {score} / {quizzes.length}
          </Typography>
          <Button className={styles.quizRestartButton} variant="contained" color="primary" onClick={handleRestart}>
            Restart Quiz
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default QuizContainer;