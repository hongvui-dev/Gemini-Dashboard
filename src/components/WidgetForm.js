import React, { useState, forwardRef, useImperativeHandle } from 'react';
import styles from '../styles/components.module.css'
import { TextField, Button, Select, MenuItem, InputLabel, FormControl, Typography, Container, Box, Slider, Checkbox, FormControlLabel, FormHelperText, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { getUserWidgetsRef, getUserWidgetRef, updateData, getData, pushOnly, setData } from '../utils/databaseCRUD';
import { useAuth } from '../utils/authProvider';
import { useNavigate } from 'react-router-dom';

const WidgetForm = forwardRef((props, formRef) => {

  const { selectedWidget, handleClose, setSelectedWidget, setOpen, isDialog, open, getUserWidgets } = props;

  const [title, setTitle] = useState('');
  const [systemInstructions, setSystemInstructions] = useState('');
  const [creativityLevel, setCreativityLevel] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState('flashcard');
  //Widget Type
  const [flashcardKey, setFlashcardKey] = useState('The key information on a flashcard');
  const [flashcardValue, setFlashcardValue] = useState('The explanation of the key on a flashcard');
  const [textWidgetValue, setTextWidgetValue] = useState('Strategy in bullet points.');
  const [quizKey, setQuizKey] = useState('Describe the quiz');
  const [quizValue, setQuizValue] = useState('Describe the quiz answer');
  const [questionKey, setQuestionKey] = useState('Describe the question');
  const [questionValue, setQuestionValue] = useState('Describe how you want the answer to be checked');

  const [isTranslucent, setIsTranslucent] = useState(false);
  const [customRefreshPrompt, setCustomRefreshPrompt] = useState('');
  const [isQuickRefresh, setIsQuickRefresh] = useState(false);

  //Validation
  const [titleError, setTitleError] = useState('');
  const [isTitleTouched, setIsTitleTouched] = useState(false);

  const [systemInstructionsError, setSystemInstructionsError] = useState('');
  const [isSystemInstructionsTouched, setIsSystemInstructionsTouched] = useState(false);

  const [customRefreshPromptError, setCustomRefreshPromptError] = useState('');
  const [isCustomRefreshPromptTouched, setIsCustomRefreshPromptTouched] = useState(false);

  const [promptError, setPromptError] = useState('');
  const [isPromptTouched, setIsPromptTouched] = useState(false);

  const [flashcardKeyError, setFlashcardKeyError] = useState('');
  const [isFlashcardKeyTouched, setIsFlashcardKeyTouched] = useState(false);

  const [flashcardValueError, setFlashcardValueError] = useState('');
  const [isFlashcardValueTouched, setIsFlashcardValueTouched] = useState(false);

  const [textWidgetValueError, setTextWidgetValueError] = useState('');
  const [isTextWidgetValueTouched, setIsTextWidgetValueTouched] = useState(false);

  const [quizKeyError, setQuizKeyError] = useState('');
  const [isQuizKeyTouched, setIsQuizKeyTouched] = useState(false);

  const [quizValueError, setQuizValueError] = useState('');
  const [isQuizValueTouched, setIsQuizValueTouched] = useState(false);

  const [questionKeyError, setQuestionKeyError] = useState('');
  const [isQuestionKeyTouched, setIsQuestionKeyTouched] = useState(false);

  const [questionValueError, setQuestionValueError] = useState('');
  const [isQuestionValueTouched, setIsQuestionValueTouched] = useState(false);

  const [isTypeTouched, setIsTypeTouched] = useState(false);

  const [typeError, setTypeError] = useState('');

  const user = useAuth();
  const navigate = useNavigate();
  const userId = user.currentUser.uid;

  //Validation Rules
  const titleValidationRules = {
    required: true,
    minLength: 3,
    maxLength: 50,
    fieldName: 'Widget title'
  };
  
  const systemInstructionsValidationRules = {
    required: true,
    minLength: 3,
    maxLength: 500,
    fieldName: 'System instructions'
  };

  const promptValidationRules = {
    required: true,
    minLength: 3,
    maxLength: 500,
    fieldName: 'Prompt'
  };

  const customRefreshPromptValidationRules = {
    required: false,
    minLength: 3,
    maxLength: 500,
    fieldName: 'Refresh prompt'
  };
  const typeValidationRules = {
    required: true,
    minLength: 3,
    maxLength: 200,
    fieldName: 'Type'
  };
  const flashcardKeyValidationRules = {
    required: true,
    minLength: 3,
    maxLength: 500,
    fieldName: 'Flashcard key'
  };

  const flashcardValueValidationRules = {
    required: true,
    minLength: 3,
    maxLength: 500,
    fieldName: 'Flashcard value'
  };

  const questionKeyValidationRules = {
    required: true,
    minLength: 3,
    maxLength: 500,
    fieldName: 'Question key'
  };

  const questionValueValidationRules = {
    required: true,
    minLength: 3,
    maxLength: 500,
    fieldName: 'Question value'
  };

  const quizKeyValidationRules = {
    required: true,
    minLength: 3,
    maxLength: 500,
    fieldName: 'Quiz key'
  };

  const quizValueValidationRules = {
    required: true,
    minLength: 3,
    maxLength: 500,
    fieldName: 'Quiz value'
  };

  const textWidgetValueValidationRules = {
    required: true,
    minLength: 3,
    maxLength: 500,
    fieldName: 'Text value'
  };
  const creativityLevelValidationRules = {
    required: true,
    minLength: 0,
    maxLength: 1,
    fieldName: 'Creativity level'
  };
  

  //Validate function for string fields
  const validateField = (value, { required, minLength, maxLength, fieldName }) => {
    if (required && !value) {
      return `${fieldName} is required`;
    }
    if (value) {
      if (minLength && value.length < minLength) {
        return `${fieldName} must be at least ${minLength} characters long`;
      }
      if (maxLength && value.length > maxLength) {
        return `${fieldName} must be less than ${maxLength} characters long`;
      }
    }
    return '';
  };

  //Validate function for number fields
  const validateNumberField = (value, { required, minValue, maxValue, fieldName }) => {
    if (required && value === undefined) {
      return `${fieldName} is required`;
    }
    if (value !== undefined) {
      if (minValue !== undefined && value < minValue) {
        return `${fieldName} must be at least ${minValue}`;
      }
      if (maxValue !== undefined && value > maxValue) {
        return `${fieldName} must be less than ${maxValue}`;
      }
    }
    return '';
  };


  //Validate all fields
  const validateAllFields = () => {
    const titleError = validateField(title, titleValidationRules);
    const systemInstructionsError = validateField(systemInstructions, systemInstructionsValidationRules);
    const promptError = validateField(prompt, promptValidationRules);
    const typeError = validateField(type, typeValidationRules);
    const creativityLevelError = validateNumberField(creativityLevel, creativityLevelValidationRules);
    
    
    if (titleError || typeError || systemInstructionsError || promptError || creativityLevelError) {
      setTitleError(titleError);
      setSystemInstructionsError(systemInstructionsError)
      setPromptError(promptError)
      setTypeError(typeError);
      setCreativityLevel(creativityLevelError);

      return false;
    }

    switch (type) {
      case 'flashcard':


        const flashcardKeyError = validateField(flashcardKey, flashcardKeyValidationRules);
        const flashcardValueError = validateField(flashcardValue, flashcardValueValidationRules);
      

        if (flashcardKeyError || flashcardValueError) {
          setFlashcardKeyError(flashcardKeyError)
          setFlashcardValueError(flashcardValueError)
          return false;
        }
        break;
      case 'quiz':

        const quizKeyError = validateField(quizKey, quizKeyValidationRules);
        const quizValueError = validateField(quizValue, quizValueValidationRules);
        
        if (quizKeyError || quizKeyError) {
          setQuizKeyError(quizKeyError)
          setQuizValueError(quizValueError)
          return false;
        }
        break;

      case 'text':
        const textWidgetValueError = validateField(textWidgetValue, textWidgetValueValidationRules);
        if (textWidgetValueError) {
          setTextWidgetValueError(textWidgetValueError)
          return false;
        }
        break;
      case 'question':

        const questionKeyError = validateField(questionKey, questionKeyValidationRules);
        const questionValueError = validateField(questionValue, questionValueValidationRules);
        if (questionKeyError || questionValueError) {
          setQuestionKeyError(questionKeyError)
          setQuestionValueError(questionValueError)
          return false;
        }
        break;
      default:
        break;
    }

    return true;
  }


  //On change functions

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (isTitleTouched) {
      const error = validateField(newTitle, titleValidationRules);
      setTitleError(error);
    }
  };

  const handleSystemInstructionsChange = (e) => {
    const newSystemInstructions = e.target.value;
    setSystemInstructions(newSystemInstructions);
    if (isSystemInstructionsTouched) {
      const error = validateField(newSystemInstructions, systemInstructionsValidationRules);
      setSystemInstructionsError(error);
    }
  };
  const handlePromptChange = (e) => {
    const newPrompt = e.target.value;
    setPrompt(newPrompt);
    if (isPromptTouched) {
      const error = validateField(newPrompt, promptValidationRules);
      setPromptError(error);
    }
  };

  const handleCustomRefreshPromptChange = (e) => {
    const newCustomRefreshPrompt = e.target.value;
    setCustomRefreshPrompt(newCustomRefreshPrompt);
    if (isCustomRefreshPromptTouched) {
      const error = validateField(newCustomRefreshPrompt, customRefreshPromptValidationRules);
      setCustomRefreshPromptError(error);
    }
  };


  const handleFlashcardKeyChange = (e) => {
    const newFlashcardKey = e.target.value;
    setFlashcardKey(newFlashcardKey);
    if (isFlashcardKeyTouched) {
      const error = validateField(newFlashcardKey, flashcardKeyValidationRules);
      setFlashcardKeyError(error);
    }
  };

const handleTypeChange = (e) => {
  const newType = e.target.value;
  setType(newType);
  if (isTypeTouched) {
    const error = validateField(newType, typeValidationRules);
    setTypeError(error);
  }
};

const handleCheckboxChange = (event) => {
  setIsTranslucent(event.target.checked);
};
const handleSliderChange = (event, newValue) => {
  setCreativityLevel(Number(newValue));
};


  //Flashcard

  const handleFlashcardValueChange = (e) => {
    const newFlashcardValue = e.target.value;
    setFlashcardValue(newFlashcardValue);
    if (isFlashcardValueTouched) {
      const error = validateField(newFlashcardValue, flashcardKeyValidationRules);
      setFlashcardValueError(error);
    }
  };

  const handleFlashcardValueBlur = () => {
    setIsFlashcardValueTouched(true);
    const flashcardValueError = validateField(flashcardValue, flashcardValueValidationRules);
    setFlashcardValueError(flashcardValueError);

  };



  //Text

  const handleTextWidgetValueChange = (e) => {
    const newTextWidgetValue = e.target.value;
    setTextWidgetValue(newTextWidgetValue);
    if (isTextWidgetValueTouched) {
      const error = validateField(newTextWidgetValue, textWidgetValueValidationRules);
      setTextWidgetValueError(error);
    }
  };


  //Quiz



  const handleQuizKeyChange = (e) => {
    const newQuizKey = e.target.value;
    setQuizKey(newQuizKey);
    if (isQuizKeyTouched) {
      const error =  validateField(newQuizKey, quizKeyValidationRules);
      setQuizKeyError(error);
    }
  };

  

  const handleQuizValueChange = (e) => {
    const newQuizValue = e.target.value;
    setQuizValue(newQuizValue);
    if (isQuizValueTouched) {
      const error = validateField(newQuizValue, quizValueValidationRules);
      setQuizValueError(error);
    }
  };

  
  const handleQuickRefresh = (event) => {
    setIsQuickRefresh(event.target.checked);
  };

  //On blur functions

  const handleFlashcardKeyBlur = () => {
    setIsFlashcardKeyTouched(true);
    const flashcardKeyError = validateField(flashcardKey, flashcardKeyValidationRules);
    setFlashcardKeyError(flashcardKeyError);

  };

  const handleTitleBlur = () => {
    setIsTitleTouched(true);
    const titleError = validateField(title, titleValidationRules);
    setTitleError(titleError);

  };

  const handleSystemInstructionsBlur = () => {

    setIsSystemInstructionsTouched(true);
    const systemInstructionsError = validateField(systemInstructions, systemInstructionsValidationRules);
    setSystemInstructionsError(systemInstructionsError);

  };

  const handlePromptBlur = () => {
    setIsPromptTouched(true);
    const promptError = validateField(prompt, promptValidationRules);
    setPromptError(promptError);
  };


  const handleTypeBlur = () => {
    setIsTypeTouched(true);
    const typeError = validateField(type, typeValidationRules);
    setTypeError(typeError);
  };





  useImperativeHandle(formRef, () => ({
    submit: handleSubmit,
    update: handleUpdate,
    cusOpen: handleClickOpen,
    preview: handlePreview
  }));


  const handleQuizKeyBlur = () => {
    setIsQuizKeyTouched(true);
    const quizKeyError = validateField(quizKey, quizKeyValidationRules);
    setQuizKeyError(quizKeyError);

  };



  const handleQuizValueBlur = () => {
    setIsQuizValueTouched(true);
    const quizValueError = validateField(quizValue, quizValueValidationRules);
    setQuizValueError(quizValueError);

  };


  const handleTextWidgetValueBlur = () => {
    setIsTextWidgetValueTouched(true);
    const textWidgetValueError = validateField(textWidgetValue, textWidgetValueValidationRules);
    setTextWidgetValueError(textWidgetValueError);

  };


  //Question


  const handleQuestionKeyChange = (e) => {
    const newQuestionKey = e.target.value;
    setQuestionKey(newQuestionKey);
    if (isQuestionKeyTouched) {
      const error = validateField(newQuestionKey, questionKeyValidationRules);
      setQuestionKeyError(error);
    }
  };

  const handleQuestionKeyBlur = () => {
    setIsQuestionKeyTouched(true);
    const questionKeyError = validateField(questionKey, questionKeyValidationRules);
    setQuestionKeyError(questionKeyError);

  };

  const handleQuestionValueChange = (e) => {
    const newQuestionValue = e.target.value;
    setQuestionValue(newQuestionValue);
    if (isQuestionValueTouched) {
      const error = validateField(newQuestionValue, questionValueValidationRules);
      setQuestionValueError(error);
    }
  };

  const handleQuestionValueBlur = () => {
    setIsQuestionValueTouched(true);
    const questionValueError = validateField(questionValue, questionValueValidationRules);
    setQuestionValueError(questionValueError);

  };



  const handleUpdate = async () => {
    if (!selectedWidget) return;

    const hasError = validateAllFields();
    if (!hasError) {
      return;
    }


    const widgetRef = getUserWidgetRef(userId, selectedWidget.id);
   

    try {
      const currentDataSnapshot = await getData(widgetRef);
      const currentData = currentDataSnapshot || null;
    
      const updatePayload = {
        title,
        systemInstructions,
        creativityLevel,
        prompt,
        type,
        flashcardKey,
        flashcardValue,
        questionKey,
        questionValue,
        quizKey,
        quizValue,
        textWidgetValue,
        isTranslucent,
        isQuickRefresh,
        customRefreshPrompt,
        ...(currentData && currentData.type !== type && { content: '' })
      };
    
      await updateData(widgetRef, updatePayload);

      getUserWidgets();
    } catch (error) {
      //This code will run if db security rules are triggered e.g. someone bypass the UI to make submission
      console.error('Error saving data:', error.message);
      return;
    }

    handleClose();
  };

  const handleSubmit = async () => {

    
    const hasError = validateAllFields();
    if (!hasError) {
      return;
    }

    const widgetData = {
      title,
      systemInstructions,
      creativityLevel,
      prompt,
      type,
      flashcardKey,
      flashcardValue,
      textWidgetValue,
      quizKey,
      quizValue,
      customRefreshPrompt,
      isQuickRefresh,
      isTranslucent,
      questionKey,
      questionValue,
      x: 0,
      y: 0,
      w: 4,
      h: 2
    };

    
    const userWidgetsRef = getUserWidgetsRef(userId);

    
    try {
      const snapshot = await getData(userWidgetsRef);

      if (snapshot === null) {
        const newWidgetRef = await pushOnly(userWidgetsRef);
        await setData(newWidgetRef, widgetData);


      } else {
        if (snapshot.exists() && Object.keys(snapshot.val()).length >= 6) {
          alert('You can only create up to 6 widgets.');
          return;
        }

        const newWidgetRef = await pushOnly(userWidgetsRef);


        try {
          await setData(newWidgetRef, {
            ...widgetData,
          });
      
        } catch (error) {
         
          console.error('Error saving data to database:', error.message);
          return;
        }
      }


      //redirect user back to widgets storage
      navigate('/widgets');

      // Reset form
      setTitle('');
      setSystemInstructions('');
      setPrompt('');
      setCustomRefreshPrompt('');
      setIsQuickRefresh(false);
      setType('');
      setIsTranslucent(false);
      setFlashcardKey('The key information on a flashcard')
      setFlashcardValue('The explanation of the key on a flashcard')
      setQuizKey('Describe the quiz')
      setQuizValue('Describe the quiz answer')
      setQuestionKey('Describe the question')
      setQuestionValue('Describe how you want the answer to be checked')
      setTextWidgetValue('Strategy in bullet points')

      setIsTitleTouched(false);
      setIsSystemInstructionsTouched(false);
      setIsPromptTouched(false);
      setIsTypeTouched(false);
      setIsFlashcardKeyTouched(false);
      setIsFlashcardValueTouched(false);
      setIsQuizKeyTouched(false);
      setIsQuizValueTouched(false);
      setIsQuestionKeyTouched(false);
      setIsQuestionValueTouched(false);
      setIsTextWidgetValueTouched(false);
    } catch (error) {
      console.error('Error creating widget:', error);
    }

  };

  const handleClickOpen = async (currWidget) => {

    const updatedWidgetRef = getUserWidgetRef(userId, currWidget.id);
    const widgetSnapshot = await getData(updatedWidgetRef);
    const widget = widgetSnapshot.val();
    setSelectedWidget({ ...widget, id: widgetSnapshot.key});
    
    setTitle(widget.title);
    setSystemInstructions(widget.systemInstructions);
    setCustomRefreshPrompt(widget.customRefreshPrompt);
    setIsQuickRefresh(widget.isQuickRefresh || false);
    setIsTranslucent(widget.isTranslucent || false);




    setCreativityLevel(widget.creativityLevel || 0);
    setPrompt(widget.prompt);
    setType(widget.type);
    if (widget.type === 'flashcard') {
      setFlashcardKey(widget.flashcardKey || '');
      setFlashcardValue(widget.flashcardValue || '');
    } else if (widget.type === 'question') {
      setQuestionKey(widget.questionKey || '');
      setQuestionValue(widget.questionValue || '');
    } else if (widget.type === 'quiz') {
      setQuizKey(widget.quizKey || '');
      setQuizValue(widget.quizValue || '');
    } else if (widget.type === 'text') {
      setTextWidgetValue(widget.textWidgetValue || '');
    }
    setOpen(true);
  };


  
  const handlePreview = () => {

    const hasError = validateAllFields();
    if (!hasError) {
      return;
    }

    const widgetData = {
      title,
      systemInstructions,
      creativityLevel,
      prompt,
      type,
      flashcardKey,
      flashcardValue,
      textWidgetValue,
      quizKey,
      quizValue,
      customRefreshPrompt,
      isQuickRefresh,
      isTranslucent,
      questionKey,
      questionValue,
      x: 0,
      y: 0,
      w: 4,
      h: 2
    };


    localStorage.setItem('geminiDashboardPreviewWidget', JSON.stringify(widgetData));
    window.open(`/dashboard-preview?type=user-preview`, '_blank');
    //navigate(`/dashboard-preview?type=user-preview`);
  };


  const formContent = (

    <Box className={styles.widgetFormWrapper} >
      <Box className={styles.widgetFormInnerWrapper} >
        <form noValidate autoComplete="off">
          <TextField
            fullWidth
            label="Widget title e.g. Word of the Day"
            variant="outlined"
            margin="normal"
            value={title}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            error={!!titleError}
            helperText={titleError}
          />
          <TextField
            fullWidth
            label="Define the role you want Gemini to adopt e.g. You are a English language teacher"
            variant="outlined"
            margin="normal"
            value={systemInstructions}
            onChange={handleSystemInstructionsChange}
            onBlur={handleSystemInstructionsBlur}
            error={!!systemInstructionsError}
            helperText={systemInstructionsError}
          />
          <Typography id="creativity-level-slider" gutterBottom>
            Creativity Level
          </Typography>
          <Slider
            value={creativityLevel}
            defaultValue={0}
            onChange={handleSliderChange}
            valueLabelDisplay="auto"
            step={0.1}
            marks
            min={0}
            max={1}
          />
          <TextField
            fullWidth
            label="Specify the desired output e.g. Give me 10 flashcards containing English words and their meaning"
            variant="outlined"
            margin="normal"
            multiline
            rows={4}
            value={prompt}
            onChange={handlePromptChange}
            onBlur={handlePromptBlur}
            error={!!promptError}
            helperText={promptError}
          />


          <TextField
            fullWidth
            label="Custom refresh prompt"
            variant="outlined"
            margin="normal"
            value={customRefreshPrompt}
            onChange={handleCustomRefreshPromptChange}

          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isQuickRefresh}
                onChange={handleQuickRefresh}
                color="primary"
              />
            }
            label="Quick Refresh (reduce frequency of similar content)"
          />

          <FormControl fullWidth variant="outlined" margin="normal" error={!!typeError}>
            <InputLabel id="type-label">Type</InputLabel>
            <Select
              labelId="type-label"
              value={type}
              onChange={handleTypeChange}
              onBlur={handleTypeBlur}
              label="Type"
            >
              <MenuItem value="flashcard">Flashcard</MenuItem>
              <MenuItem value="quiz">Quiz</MenuItem>
              <MenuItem value="text">Text</MenuItem>
              <MenuItem value="question">Question</MenuItem>
            </Select>
            {typeError && <FormHelperText>{typeError}</FormHelperText>}
          </FormControl>
          {type === 'flashcard' && (
            <>
              <TextField
                fullWidth
                label="Describe the term of your flashcard e.g. English word on a flashcard"
                variant="outlined"
                margin="normal"
                value={flashcardKey}
                onChange={handleFlashcardKeyChange}
                onBlur={handleFlashcardKeyBlur}
                error={!!flashcardKeyError}
                helperText={flashcardKeyError}
              />
              <TextField
                fullWidth
                label="Describe how you want to elaborate the term of your flashcard e.g. English word's meaning on a flashcard"
                variant="outlined"
                margin="normal"
                value={flashcardValue}
                onChange={handleFlashcardValueChange}
                onBlur={handleFlashcardValueBlur}
                error={!!flashcardValueError}
                helperText={flashcardValueError}
              />
            </>
          )}
          {type === 'text' && (
            <>
              <TextField
                fullWidth
                label="Describe the text response you want e.g. Strategy in bullet points or any text format you deemed fit."
                variant="outlined"
                margin="normal"
                value={textWidgetValue}
                onChange={handleTextWidgetValueChange}
                onBlur={handleTextWidgetValueBlur}
                error={!!textWidgetValueError}
                helperText={textWidgetValueError}
              />
            </>
          )}
          {type === 'quiz' && (
            <>
              <TextField
                fullWidth
                label="Describe the quiz e.g. English word"
                variant="outlined"
                margin="normal"
                value={quizKey}
                onChange={handleQuizKeyChange}
                onBlur={handleQuizKeyBlur}
                error={!!quizKeyError}
                helperText={quizKeyError}
              />
              <TextField
                fullWidth
                label="Describe the answer of your quiz e.g. English word's meaning"
                variant="outlined"
                margin="normal"
                value={quizValue}
                onChange={handleQuizValueChange}
                onBlur={handleQuizValueBlur}
                error={!!quizValueError}
                helperText={quizValueError}
              />
            </>
          )}
          {type === 'question' && (
            <>
              <TextField
                fullWidth
                label="Describe the question e.g. Question on English language grammar"
                variant="outlined"
                margin="normal"
                value={questionKey}
                onChange={handleQuestionKeyChange}
                onBlur={handleQuestionKeyBlur}
                error={!!questionKeyError}
                helperText={questionKeyError}
              />
              <TextField
                fullWidth
                label="Specify evaluation criteria e.g. Check if the question is answered properly in terms of accuracy"
                variant="outlined"
                margin="normal"
                value={questionValue}
                onChange={handleQuestionValueChange}
                onBlur={handleQuestionValueBlur}
                error={!!questionValueError}
                helperText={questionValueError}
              />
            </>
          )}

          <div>
          <FormControlLabel
            control={
              <Checkbox
                checked={isTranslucent}
                onChange={handleCheckboxChange}
                color="primary"
              />
            }
            label="Translucent"
          />
          </div>
          
          

   


        </form>
      </Box>
    


    </Box>
  );

  return isDialog ? (

    <Dialog open={open} onClose={handleClose} fullWidth>
      <DialogTitle className={styles.dialogTitle}>Update Widget</DialogTitle>
      <DialogContent>
        <Container maxWidth="lg">
          {formContent}
        </Container>
      </DialogContent>
      <DialogActions>
        <Button onClick={handlePreview} color="primary">Preview</Button>
        <Button onClick={handleUpdate} color="primary">Update</Button>
        <Button onClick={handleClose} color="primary">Cancel</Button>
      </DialogActions>
    </Dialog>
  ) : (
    formContent
  );


});

export default WidgetForm;