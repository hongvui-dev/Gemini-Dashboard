

# Gemini Dashboard
## Setting up project locally
1. Make sure you have Node.js installed. After cloning this project to your local, run `npm install` to install all the dependencies.
2. Set up environment variables:\
   Create a `.env` file based on the provided `.env.template.`\
   Update variable like `GOOGLE_API_KEY_DEV` with your Gemini API key.\
   Note: If you are in development mode, all variables under the `# development` section in the `.env.template` file must be filled with their corresponding values.
3. Create a Firebase Realtime Database project. Grab its configuration and update your `.env` accordingly.\
   Apply the Firebase realtime database security rules which can be found in `database.rules.json`.\
4. In the project directory, you can run `npm start` to start the Gemini Dashboard react app.\
   Open [http://localhost:3000](http://localhost:3000) to view it in your browser.\
   The page will reload when you make changes.\
   You may also see any lint errors in the console.
5. `cd server` and run `npm start` to start Gemini Dashboard API server
## How to use Gemini Dashboard? 
### Login 
* Sign in to your account using your Google credentials.
### Widget Builder 
Create a new Gemini dashboard widget.
* Enter a title, role, and prompt.
* Enter a custom refresh prompt and check “Reduce frequency of similar content” if needed.
* Choose a widget type: quiz, flashcard, question/answer, or text.
* If you want the widget to be translucent on the dashboard, check “Translucent”.
* Preview your widget and click "Submit" when satisfied.
### Widgets
* Add your widget to your dashboard.
* Download widget data as a JSON file (top right corner).
* Widgets are saved for later use. Refresh content manually.
### Dashboard 
View and interact with your widgets on the dashboard.
* Use the refresh button to update widget content.
### Community 
Explore pre-built templates in the community section.
* Add selected templates to your widget storage.
* Use added templates to create new widgets.
* To publish your own widget and template, go back to Widgets and click on Manage Publishing. Check the widgets you want to publish. If you are publishing the widget into a template, make sure to give a template name.
### Troubleshoot
* Unauthorized call error: Log out and sign in again.
* Syntax error: Refresh the page.
* Server error: Please wait and try again later.
* Browser resizing: Refresh the dashboard to adjust widget layout.
### Logout 
Sign out of your account.
## License 
This project is licensed under the MIT License.



