import axios from 'axios';

// Check overlapping of widgets
export const isOverlap = (widgetA, widgetB) => {
    return !(
      widgetA.x >= widgetB.x + widgetB.w ||
      widgetA.x + widgetA.w <= widgetB.x ||
      widgetA.y >= widgetB.y + widgetB.h ||
      widgetA.y + widgetA.h <= widgetB.y
    );
  };
  
  // Find available space
  export const findNextAvailablePosition = (widget, layout) => {
    let x = 0, y = 0;
    while (true) {
      let overlap = false;
      for (let i = 0; i < layout.length; i++) {
        if (isOverlap({ ...widget, x, y }, layout[i])) {
          overlap = true;
          break;
        }
      }
      if (!overlap) {
        return { x, y };
      }
      x += widget.w;
      if (x >= 12) {
        x = 0;
        y += widget.h;
      }
    }
  };

  //Format response to HTML useful when system instructions is ignored
  export const formatToHTML = (text) => {
    return text
      .replace(/## (.+)/g, '<h4>$1</h4>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\* (.+)/g, '<li>$1</li>')
      .replace(/(?:\r\n|\r|\n)/g, '<br>')
      .replace(/(<br>\s*){1,}/g, '<br>'); 
  };

  //Truncate title, prompt etc
  export const dynamicTextTruncate = (text, maxLength = 100) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };

  //Escape code snippets unescaped chars
  export const escapeUnescapedQuotes = (jsonString) => {
    let escapedString = jsonString.replace(/\(\"/g, '(\\"');
    escapedString = escapedString.replace(/\"\)/g, '\\")');
    escapedString = escapedString.replace(/`/g, '\\`');
    escapedString = escapedString.replace(/\n+$/, '');


    escapedString = jsonString;

    return escapedString;
  }

  //Fetch new token for user
  const fetchNewToken = async (user) => {
    try {

      
      if (user) {
        const token = await user.getIdToken(true); 
        const decodedToken = await user.getIdTokenResult(); 
  
        const expiresAt = new Date(decodedToken.expirationTime).getTime();

        sessionStorage.setItem('geminiDashboardIdToken', token);
        sessionStorage.setItem('geminiDashboardIdTokenExpiration', expiresAt);
  
        return token;
      }
    } catch (error) {
      console.error("Error fetching new token:", error);
    }
  };
  
  export const getValidToken = async (user) => {
    const now = Date.now();
    
    const storedExpirationTime = sessionStorage.getItem('geminiDashboardIdTokenExpiration');
    const storedToken = sessionStorage.getItem('geminiDashboardIdToken');
  
    if (!storedToken || !storedExpirationTime) {
      return await fetchNewToken(user);
    }
  
    if (now >= parseInt(storedExpirationTime, 10)) {
      return await fetchNewToken(user);
    }
  
    return storedToken;
  };

  //Reusable widget api call
  export const fetchWidgetData = async (widget, userIdToken, apiUrl, showErrorSnackbar) => {
    try {
      const response = await axios.post(`${apiUrl}/gemini-controlled-generation`, {
        data: {
          widgetId: widget.i,
          systemInstructions: widget.systemInstructions,
          type: widget.type,
          flashcardKey: widget.flashcardKey,
          flashcardValue: widget.flashcardValue,
          textWidgetValue: widget.textWidgetValue,
          quizKey: widget.quizKey,
          quizValue: widget.quizValue,
          questionKey: widget.questionKey,
          questionValue: widget.questionValue,
          prompt: widget.prompt,
          creativityLevel: widget.creativityLevel,
          title: widget.title
        },
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userIdToken}`,
        }
      });
  
      const responseData = escapeUnescapedQuotes(response.data);
      let parsedData = {};
  
      try {
        parsedData = JSON.parse(responseData);
      } catch (error) {
        console.error("An error occurred:", error.message);
        parsedData = {};
      }
  
      return parsedData.content;
    } catch (error) {
      let errorResponse;
      if (error instanceof SyntaxError) {
        errorResponse = "Syntax error, please refresh if some widgets failed to load.";
      } else {
        errorResponse = error.response?.data || error.message || error;
      }
  
      if (showErrorSnackbar) {
        showErrorSnackbar(errorResponse);
      }
  
      console.error(`Error getting data for widget:`, error);
    }
  };

  //Check duplication
  export const isDuplicate = (widget, layout) => {
    return layout.some(item => item.i === widget.i);
  };