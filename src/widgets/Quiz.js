import React from 'react';
import { Card, CardContent, Typography, RadioGroup, FormControlLabel, Radio } from '@mui/material';

const Quiz = ({ quiz, onAnswer, answered, selectedAnswer }) => {

  //When user select an answer
  const handleAnswerChange = (event) => {
    onAnswer(Number(event.target.value));
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h5" component="h5">
          {quiz.question}
        </Typography>
        <RadioGroup value={selectedAnswer} onChange={handleAnswerChange}>
          {quiz.answers.map((answer, index) => {
            let labelStyle = {};
            if (answered) {
              //Uncomment will be able tell what is the right or wrong answer for the quiz
              // if (index === parseInt(quiz.correctAnswer)) {
              //   labelStyle = { color: 'green' };
              // } else if (index === selectedAnswer) {
              //   labelStyle = { color: 'red' };
              // }
            }
            return (
              <FormControlLabel
                key={index}
                value={index}
                control={<Radio />}
                label={<span style={labelStyle}>{answer}</span>}
              />
            );
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default Quiz;