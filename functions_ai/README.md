AI Cloud Function (OpenAI) — quick deploy

1) Install deps and test locally
   cd functions_ai
   npm install

2) Set your OpenAI key in functions config (use Firebase CLI)
   firebase functions:config:set openai.key="YOUR_OPENAI_KEY"

3) Deploy (if your project uses functions folder named 'functions', move this code into that folder or deploy accordingly):
   If you named the folder 'functions', run from project root:
     firebase deploy --only functions:aiConsult

4) After deploy, note the function URL (looks like https://us-central1-<project>.cloudfunctions.net/aiConsult)
   Then set FUNCTION_URL in `javascript/aiService.js` to: https://us-central1-<project>.cloudfunctions.net/aiConsult/consult

Notes:
- This function proxies to OpenAI and keeps your key secret.
- OpenAI usage may cost money; for a presentation you can use a short demo or join OpenAI trials if available.
- If you cannot deploy functions, you can temporarily replace FUNCTION_URL with a public mock endpoint that returns canned replies for demo.
