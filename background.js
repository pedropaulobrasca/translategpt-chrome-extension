// Adiciona um listener para o item do menu de contexto
chrome.contextMenus.create({
  title: 'Traduzir para o português',
  contexts: ['selection'],
  id: 'traduzir-para-o-portugues' // adiciona um identificador único,
});

function teste() {
  alert(1)
}

// Adiciona um listener para o evento onClicked
chrome.contextMenus.onClicked.addListener(function (info, tab) {
  // Verifica se o item do menu de contexto foi selecionado
  if (info.menuItemId === 'traduzir-para-o-portugues') {
    // Obtém o texto selecionado
    var selectedText = info.selectionText;
    // Chama a função para traduzir o texto
    var apiUrl = "https://api.openai.com/v1/completions";
    var apiKey = "API_KEY";

    // Configura a solicitação HTTP usando fetch
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        model: "text-davinci-003",
        prompt: `
          Traduza o texto, frase ou palavra abaixo para o portugues braseileiro, de modo que seja uma pessoa nativa, com palavras faceis de entender e gramaticamente correto, fazendo sentido no contexto.
      
          (${selectedText})
        `,
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })
    })
      .then(response => response.json())
      .then(async data => {
        if (data.choices && data.choices.length > 0) {
          // Obtém o texto traduzido
          var translatedText = data.choices[0].text;

          // Obter a aba ativa
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

          // Substituir o texto selecionado pelo texto traduzido
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: function (selectedText, translatedText) {
              const selection = window.getSelection();
              selection.deleteFromDocument();
              const range = selection.getRangeAt(0);
              range.insertNode(document.createTextNode(translatedText));
            },
            args: [selectedText, translatedText],
          });
        } else {
          // Obter a aba ativa
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

          // Substituir o texto selecionado pelo texto traduzido
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: function () {
              alert(data.error.message)
            },
          });
        }
      })
      .catch(error => console.error(error));
  }
});