import React, { useState } from 'react';
import { Card, CardContent, Typography, TextField, Button, Box, CircularProgress } from '@mui/material';
import styles from '../styles/components.module.css';
import { updateData, getUserWidgetRef} from '../utils/databaseCRUD';
import { apiUrl } from '../utils/envConfig';
import axios from 'axios';
import { formatToHTML, escapeUnescapedQuotes, getValidToken } from '../utils/helper';

const Question = ({ widget, currentUser }) => {
  const [answer, setAnswer] = useState('');
  const [comment, setComment] = useState(widget?.questionAnswer ?? '');
  const [loading, setLoading] = useState(false);

  const userIdToken = sessionStorage.getItem('geminiDashboardIdToken');

  //Get first item value
  let firstItemContent = Array.isArray(widget.content) && widget.content.length > 0 ? widget.content[0]?.value : '';

  const hasMarkdown = /##|(\*\*)|(\*)/.test(firstItemContent);

  if (hasMarkdown) {
    firstItemContent = formatToHTML(firstItemContent);
  } 

  //Set user response
  const handleInputChange = (event) => {
    setAnswer(event.target.value);
  };

  //Call gemini api 
  const handleSubmit = async () => {
    setLoading(true);

    try {
        const response = await axios.post(`${apiUrl}/gemini-controlled-generation`, {

        data: {
          answer: answer,
          systemInstructions: widget.systemInstructions,
          type: 'answer',
          flashcardKey: widget.flashcardKey,
          flashcardValue: widget.flashcardValue,
          textWidgetValue: widget.textWidgetValue,
          quizKey: widget.quizKey,
          quizValue: widget.quizValue,
          prompt: widget.prompt,
          isQuickRefresh: widget.isQuickRefresh,
          customRefreshPrompt: widget.customRefreshPrompt,
          content: widget.content,
          questionKey: widget.questionKey,
          questionValue: widget.questionValue,
          title: widget.title
        }

      }, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userIdToken}`,
         }
      });


      const responseData = escapeUnescapedQuotes(response.data)
            
      let parsedData = {}; 
      try {

      
        parsedData = JSON.parse(responseData);

      } catch (error) {
        console.error("An error occurred:", error.message);
      
        parsedData = {};
      }





      //Set gemini response

      let firstItemComment = Array.isArray(parsedData.content) && parsedData.content.length > 0 ? parsedData.content[0]?.value : '';

      const hasMarkdown = /##|(\*\*)|(\*)/.test(firstItemComment);

      if (hasMarkdown) {
        firstItemComment = formatToHTML(firstItemComment);
      } 
      setComment(firstItemComment);

      //Update widget's content
      const widgetRef = getUserWidgetRef(currentUser.uid, widget.i);
      updateData(widgetRef, { questionAnswer: parsedData.content })

      setLoading(false);
    } catch (error) {
      setLoading(false);
      setComment('An error occurred. Please try again.');
    }
  };

  return (
    <Card variant="outlined" className={styles.questionParentWrapper}>
      <CardContent>
        <Typography variant="body1" component="p" dangerouslySetInnerHTML={{ __html: firstItemContent }} />
        <Box className={styles.marginTop20} >
          <TextField
            label="Your Answer"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            value={answer}
            onChange={handleInputChange}
            InputProps={{
              style: { overflow: 'auto' }
            }}
          />
        </Box>
        <Box className={styles.marginTop20}>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </Box>
        {comment && (
          <>
            <Typography className={styles.questionEvaluationHeading} variant="h4" component="h4">Gemini's Response:</Typography>
            <Box className={styles.marginTop20}>
              <Typography variant="body1" component="p" dangerouslySetInnerHTML={{ __html: comment }} />

            </Box>
          </>
        )}
      </CardContent>

      {loading && (
        <Box
        className={styles.loadingWrapper}
        >
          <CircularProgress />
        </Box>
      )}
    </Card>
  );
};

export default Question;