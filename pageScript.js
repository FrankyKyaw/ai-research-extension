// pageScript.js
console.log('pageScript.js loaded');

window.addEventListener('message', async (event) => {
  // We only accept messages from ourselves
  if (event.source !== window) {
    return;
  }

  if (event.data.type && event.data.type === 'AI_SUMMARIZE') {
    const text = event.data.text;
  
    try {
      const { available } = await ai.languageModel.capabilities();
      if (available !== 'no') {
        const session = await ai.languageModel.create();

        const prompt = `Please provide a concise summary of the following text:\n\n"${text}"`;

        const result = await session.prompt(prompt);

        // Send the result back to the content script
        window.postMessage({ type: 'AI_SUMMARIZE_RESULT', result: result }, '*');
      } else {
        throw new Error('AI language model is not available');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      window.postMessage(
        { type: 'AI_SUMMARIZE_ERROR', error: 'An error occurred while generating the summary.' },
        '*'
      );
    }
  }
});
