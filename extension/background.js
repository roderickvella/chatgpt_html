chrome.browserAction.onClicked.addListener(function (tab) { 
  if (tab.url.includes("chat.openai.com")) {

    chrome.tabs.executeScript({
      code: 'document.getElementsByTagName("main")[0].innerHTML;'
    }, function(result) {

      mainElement = result[0];
      //console.log(mainElement);
      const imageRegex = /<img\s+[^>]*src=["'][^"']*(image\?url)[^"']*["'][^>]*>/gi;
      const mainContentsWithoutImages = mainElement.replace(imageRegex, '');

      // Delete buttons with class "p-1"
      const buttonRegex = /<button\s+[^>]*class=["'][^"']*p-1[^"']*["'][^>]*>[\s\S]*?<\/button>/gi;
      const mainContentsWithoutButtons = mainContentsWithoutImages.replace(buttonRegex, '');

      // Delete form elements
      const formRegex = /<form[^>]*>[\s\S]*?<\/form>/gi;
      const mainContentsWithoutForms = mainContentsWithoutButtons.replace(formRegex, '');

      // Delete buttons with class "cursor-pointer"
      const cursorPointerButtonRegex = /<button\s+[^>]*class=["'][^"']*cursor-pointer[^"']*["'][^>]*>[\s\S]*?<\/button>/gi;
      const mainContentsWithoutCursorPointerButtons = mainContentsWithoutForms.replace(cursorPointerButtonRegex, '');

      //Remove dark mode
      // Match div elements with class dark:bg-gray-800
      const darkGrayDivRegex = /<div\s+[^>]*class=["'][^"']*dark:bg-gray-800[^"']*["'][^>]*>/gi;

      // Replace the class of the matched div elements with the new class
      const mainContentsWithNewClass = mainContentsWithoutCursorPointerButtons.replace(darkGrayDivRegex, (match) => {
        return match.replace(/dark:bg-gray-800/gi, 'dark:bg-white');
      });


      // Create a new HTML document
      const newDoc = document.implementation.createHTMLDocument();
      const htmlElement = newDoc.documentElement;
      const headElement = newDoc.createElement('head');
      const bodyElement = newDoc.createElement('body');
      htmlElement.appendChild(headElement);
      htmlElement.appendChild(bodyElement);

      // Add stylesheet link and script tag to head element
      const cssLink = newDoc.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://cdn.jsdelivr.net/gh/roderickvella/chatgpt_html@style/main.css';
      headElement.appendChild(cssLink);
      const tailwindScript = newDoc.createElement('script');
      tailwindScript.src = 'https://cdn.tailwindcss.com';
      headElement.appendChild(tailwindScript);

      // Add main contents without cursor-pointer buttons to body element
      bodyElement.innerHTML = mainContentsWithNewClass;

      // Add script tag to body element
      const scriptElement = newDoc.createElement('script');
      const scriptText = document.createTextNode(`
  const copyButtons = document.querySelectorAll('button');
  copyButtons.forEach(button => {
    if (button.textContent === 'Copy code') {
      const codeTag = button.parentElement.nextElementSibling.querySelector('code');
      button.addEventListener('click', () => {
        const code = codeTag.textContent;
        navigator.clipboard.writeText(code);

        // Change button text to 'Copied'
        button.textContent = 'Copied !';

        // Change button text back to 'Copy code' after 2 seconds
        setTimeout(() => {
          button.textContent = 'Copy code';
        }, 2000);
      });
    }
  });
`);
      scriptElement.appendChild(scriptText);
      bodyElement.appendChild(scriptElement);

      // Create a new blob with the HTML content
      const blob = new Blob([`<!DOCTYPE html>\n${newDoc.documentElement.outerHTML}`], { type: 'text/html' });

      // Create a download link and simulate a click on it
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'file.html';
      link.click();

    });
  }
});
