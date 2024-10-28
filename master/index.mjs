let words = [];

let isGenerating = true;

let urlChatGPT;


// Initialisiere Slider
const lengthRangeOriginal = document.getElementById('length-range-original');
const lengthRangeOriginalValues = document.getElementById('length-range-original-values');

const lengthRangeoriginal2 = document.getElementById('length-range-original2');
const lengthRangeoriginal2Values = document.getElementById('length-range-original2-values');



const optionsButton = document.getElementById('options-button');
const optionsContainer = document.getElementById('options-container');

optionsButton.addEventListener('click', () => {
  optionsContainer.classList.toggle('active');
  optionsButton.classList.toggle('active');
});



// Funktion zur Filterung der Wörter basierend auf den Slider-Werten
function filterWordsByLength(words, rangeElement) {
    if (!rangeElement.noUiSlider) {
        throw new Error('noUiSlider not initialized for rangeElement');
    }
    const minLength = Math.round(rangeElement.noUiSlider.get()[0]);
    const maxLength = Math.round(rangeElement.noUiSlider.get()[1]);
    return words.filter(word => word.length >= minLength && word.length <= maxLength);
}



// Slider initialisieren, jetzt aber wirklich
function initializeSliders() {
    return new Promise(resolve => {
      const lengthRangeOriginal = document.getElementById('length-range-original');
      const lengthRangeoriginal2 = document.getElementById('length-range-original2');
  
      if (lengthRangeOriginal.noUiSlider) {
        resolve(); // Slider already initialized, do nothing
      } else {
        noUiSlider.create(lengthRangeOriginal, {
          start: [3, 8], // Hier Voreinstellung des Sliders 
          connect: true,
          range: {
            'min': 3,
            'max': 16
          },
          step: 1,
          tooltips: [false, false]
        });
  
        noUiSlider.create(lengthRangeoriginal2, {
          start: [3, 8],
          connect: true,
          range: {
            'min': 3,
            'max': 16
          },
          step: 1,
          tooltips: [false, false]
        });
  
        // Aktualisiere die angezeigten Werte für den Slider fürs erste Wortpaar
        lengthRangeOriginal.noUiSlider.on('update', function(values) {
          const minLength = Math.round(values[0]);
          const maxLength = Math.round(values[1]);
          lengthRangeOriginalValues.textContent = `Min: ${minLength} - Max: ${maxLength}`;
        });
  
        // Aktualisiere die angezeigten Werte für den Slider fürs zweite Wortpaar
        lengthRangeoriginal2.noUiSlider.on('update', function(values) {
          const minLength = Math.round(values[0]);
          const maxLength = Math.round(values[1]);
          lengthRangeoriginal2Values.textContent = `Min: ${minLength} - Max: ${maxLength}`;
        });
  
        resolve();
      }
    });
  }

async function getJSON(url, callback) {
    await initializeSliders();
  
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = async function() {
      document.querySelector('.loading-indicator').style.opacity = '0';
      isGenerating = false;
      var status = xhr.status;
      if (status === 200) {
        const data = xhr.response;
        const filteredWords = filterWordsByLength(data, lengthRangeOriginal);
        callback(null, filteredWords);
      } else {
        callback(status, xhr.response);
      }
    };
    xhr.send();
  }


getJSON('https://raw.githubusercontent.com/Jonny-exe/German-Words-Library/master/German-words-1600000-words.json', function(err, data) {  
    if (err !== null) {
        alert('Something went wrong: ' + err);
    } else {
                // Filtere die Wörter anhand der Längenbeschränkungen
                words = filterWordsByLength(data.filter(word => countSyllables(word) <= 3), lengthRangeOriginal);

                
                // Nicht schon wieder Slider initialisieren. Diesmal nach dem Laden der Wörter
                initializeSliders();

        words = data.filter(word => countSyllables(word) <= 3);        

        document.getElementById('generate').addEventListener('click', () => {
            if (isGenerating) return;

            isGenerating = true;

            const animatedSpans = document.querySelectorAll('.title h1 .letter');
            animatedSpans.forEach(spanAnimate => {
                spanAnimate.style.animation = 'jump 2s linear infinite';
            });
            generateWords(animatedSpans);
          
                  // Shake-Listener
        window.addEventListener('devicemotion', handleDeviceMotion);
        });
    }
});

// Funktion zur Zählung der Silben
function countSyllables(word) {
    return word.match(/[aeiouyäöü]+/g)?.length || 0;
}


// Funktion zum Auswählen eines Wortes, das nicht mit einem Vokal oder zwei Großbuchstaben beginnt (Abkürzungen vermeiden)
function getRandomConsonantWord(words) {
    const filteredWords = words.filter(word => !/^[aeiouäöü]/i.test(word) && !/^[A-Z][A-Z]/.test(word));
    if (filteredWords.length === 0) return null;
    return filteredWords[Math.floor(Math.random() * filteredWords.length)];
    
}

// Funktion zum Generieren der Wörter
async function generateWords(animatedSpans) {
    let originalWord, matchingWord, secondOriginalWord, secondMatchingWord;

    
    // Erstes Wort generieren und anzeigen
    do {
            // Manuelles Wort verwenden, wenn eingegeben, ansonsten zufälliges Wort generieren
    const manualInput = document.getElementById('manual-word-input').value.trim();
    if (manualInput && words.map(word => word.toLowerCase()).includes(manualInput.toLowerCase())) {
        originalWord = manualInput;
    } else if (manualInput) {
        const invalidChars = /[^a-zA-ZäöüßÄÖÜ]/;
        if (invalidChars.test(manualInput)) {
            document.getElementById('result').innerHTML = `<div class="word-wrapper"><div class="error">Das Wort <strong>${manualInput}</strong> enthält unzulässige Zeichen.</div></div>`;
        } else {
            document.getElementById('result').innerHTML = `<div class="word-wrapper"><div class="error">Das Wort <strong>${manualInput}</strong> ist leider nicht in der Datenbank enthalten.</div></div>`;
        }
        isGenerating = false;
        return; // Beende die Funktion hier, wenn ein Fehler aufgetreten ist
    } else {
        originalWord = getRandomConsonantWord(filterWordsByLength(words, lengthRangeOriginal));
        }
        if (originalWord) {
            const consonantWord = originalWord.slice(1);

            matchingWord = findMatchingWord(consonantWord, originalWord);

            if (manualInput && !matchingWord) {
              document.getElementById('result').innerHTML = `<div class="word-wrapper"><div class="error">Kein passendes Wort gefunden für <strong>${originalWord}</strong>.</div></div>`;
              isGenerating = false; // Setze die Flag zurück, damit man erneut generieren kann
              return; // Beende die Funktion hier
          }
          
            // Anzeige des ersten Wortes
            document.getElementById('result').innerHTML = 
                `<div class="word-wrapper"><span class="word"><strong>${originalWord}</strong></span> - <span class="word"><strong>${matchingWord || ' '}</strong></span></div><br>`;
        }
    } while (!matchingWord && originalWord);

    // Suche nach einem zweiten Paar
    const initialForSecondPair = matchingWord[0];
    let foundSecondPair = false;
    let attemptCount = 0;

    const states = ['🔍🔍', '🤔💭', '💡👀', '🔍🔍', '💭🤔', '💡👀', '🤔💭', '💡👀', '🤪💦', '⏳⌛️', '⌛️⏳', '... ', '... '];
    let placeholder = states[Math.floor(Math.random() * states.length)];
    setInterval(() => {
        placeholder = states[Math.floor(Math.random() * states.length)];
    }, 1200);

    const failstates = ['😭', '🤯', '😐', '🤬', '🥴', '😮', '😵', '🤨'];
    let failPlaceholder = failstates[Math.floor(Math.random() * failstates.length)];


    while (attemptCount < 500 && !foundSecondPair) {
        const filteredWords = filterWordsByLength(
            words.filter(word => word[0] === initialForSecondPair), 
            lengthRangeoriginal2
        );

        secondOriginalWord = getRandomConsonantWord(filteredWords);

        if (!secondOriginalWord || matchingWord.toLowerCase().slice(0, 2).includes(secondOriginalWord.slice(0, 2).toLowerCase())) {
            attemptCount++;
            continue;
        }

        const secondConsonantWord = secondOriginalWord.slice(1);
        secondMatchingWord = findSameInitialMatch(secondConsonantWord, secondOriginalWord, originalWord[0]);

        // Aktualisierung der Anzeige für das zweite Wort
        if (secondMatchingWord) {
            foundSecondPair = true;
            // Endgültige Anzeige der Wörter
            document.getElementById('result').innerHTML = 
                `<div class="word-wrapper"><span class="word"><strong>${originalWord}</strong></span> - <span class="word"><strong>${secondOriginalWord}</strong></span></div><br>` +
                `<div class="word-wrapper"><span class="word"><strong>${matchingWord}</strong></span> - <span class="word"><strong>${secondMatchingWord}</strong></span></div>`;

            // Aktiviere den Button für ChatGPT
            document.getElementById('chatgpt-button').disabled = false;
            document.getElementById('chatgpt-button').style.display = 'block';

            break;
        }

        // Deaktiviere den Button für ChatGPT initial
        document.getElementById('chatgpt-button').disabled = true;


        // Anzeige während der Suche, ersetzen der Anzeige
        document.getElementById('result').innerHTML = 
            `<div class="word-wrapper"><span class="word"><strong>${originalWord}</strong></span> - <span class="word"><strong>${matchingWord || placeholder}</strong></span></div><br>` +
            `<div class="word-wrapper"><span class="word"><strong>${secondOriginalWord || placeholder}</strong></span> - <span class="word" style=""><strong>${secondMatchingWord || placeholder}</strong></span></div>`;
        
        attemptCount++;

        // Kurze Verzögerung, um die Anzeige zu aktualisieren
        await new Promise(resolve => setTimeout(resolve, .2));
    }

    // Falls kein passendes Wort für das zweite Paar gefunden wurde
    if (!foundSecondPair) {
        document.getElementById('result').innerHTML = 
            `<div class="word-wrapper"><span class="word"><strong>${originalWord}</strong></span> - <span class="word"><strong>${matchingWord || failPlaceholder}</strong></span></div><br>` +
            `<div class="word-wrapper"><span class="word"><strong>${secondOriginalWord || failPlaceholder}</strong></span> - <span class="word" style=""><strong>${secondMatchingWord || failPlaceholder}</strong></span></div>`;
        
        
        document.getElementById('result').innerHTML += '<br>Kein passendes Paar gefunden.';
    }

    // Animation styling entfernen, wenn die Suche abgeschlossen ist
    animatedSpans.forEach(spanAnimate => {
        spanAnimate.style.animation = null;
    });

    // Remove Focus from Button
    document.getElementById('generate').blur();


  
    // Create a URL with the prompt and words
    urlChatGPT = `https://chat.openai.com/?q=Schreibe+ein+kurzes+Sprichwort+mit+den+Wörtern+${originalWord}+${secondOriginalWord}+${matchingWord}+${secondMatchingWord}`;


    isGenerating = false; // Clear isGenerating flag to allow new generation
    
}

// Add an event listener to the button
document.getElementById('chatgpt-button').addEventListener('click', () => {
    if (urlChatGPT) {
      // Open the URL in a new tab
      window.open(urlChatGPT, '_blank');
    } else {
      console.error('urlChatGPT is not defined');
    }
  });

// Funktion zum Suchen eines passenden Wortes (Minimalpaar)
function findMatchingWord(baseWord, originalWord) {
  const originalFirstChar = originalWord[0].toLowerCase(); // Erster Buchstabe
  const originalStartThree = originalWord.slice(0, 3).toLowerCase(); // Erste drei Buchstaben
  
  const matchingWords = words.filter(word => 
      word.slice(1) === baseWord && 
      word.toLowerCase() !== originalWord.toLowerCase() && // Case-Insensitive Vergleich
      !/^[aeiouäöü]/i.test(word) && // Keine Wörter, die mit Vokalen beginnen
      !/^[A-Z][A-Z]/.test(word) && // Vermeide Abkürzungen
      !((originalFirstChar === 'k' && (word.toLowerCase().startsWith('k') || word.toLowerCase().startsWith('c'))) || // Vermeide Minimalpaare von C und K bzw. C und Z
        (originalFirstChar === 'c' && (word.toLowerCase().startsWith('k') || word.toLowerCase().startsWith('c') || word.toLowerCase().startsWith('z'))) ||
        (originalFirstChar === 'z' && (word.toLowerCase().startsWith('z') || word.toLowerCase().startsWith('c')))
      )
  );
  
  return matchingWords.length > 0 ? matchingWords[Math.floor(Math.random() * matchingWords.length)] : null;
}



// Funktion zum Suchen eines passenden Wortes mit dem Anfangsbuchstaben des passenden Wortes
// Hier könnte man Logiken für Mehrgraphige Anlaute (Affrikate, Sch usw.) hinzufügen
function findSameInitialMatch(baseWord, originalWord, initial) {
    return words.find(word => 
        word.slice(1) === baseWord && 
        word[0] === initial && 
        word !== originalWord
    );
}


// Funktion zum Handhaben der Gerätebewegung (für schütteln)
window.addEventListener('devicemotion', handleDeviceMotion);

function handleDeviceMotion(event) {
    var acceleration = event.accelerationIncludingGravity;
    
    if (Math.abs(acceleration.x) > 20 || Math.abs(acceleration.y) > 20 || Math.abs(acceleration.z) > 20) {
      
        document.getElementById('generate').focus(); // Simuliere Focus
        document.getElementById('generate').click(); // Simuliere einen Klick
    }
}




