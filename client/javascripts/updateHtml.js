/**
 * function used to display the home page text 
 */
export const displayHomePage = 
    () => {
        const content = document.getElementById("content");
        const homeText = document.createElement("p");
        homeText.innerHTML = buildHomeText(); 
        content.appendChild(homeText);
    }


/**
 * called by {@link displayHomePage}
 * @returns {String} the homepage string
 */
const buildHomeText = 
    () => {
        return `
            Mettez vos doigts sur les touches <b>E</b> et <b>I</b> de votre clavier.<br>
            Des mots représentant les catégories indiquées au sommet vont apparaître à la suite au milieu de l'écran.<br>
            Quand le mot appartient à la partie de gauche, appuyez sur la touche <b>E</b>, et inversement.<br>
            Chaque objet appartient à <b>une seule</b> catégorie.<br> 
            Si vous faîtes une erreur, un ❌ apparaîtra et il vous faudra corriger votre erreur en pressant l'autre touche.<br>
            <br>
            La rapidité de vos réponses à cette tâche de classification est importante.<br>
            <b>Allez aussi vite que possible</b> tout en faisant le moins d'erreurs possible.<br>
            Si vous allez trop lentement ou faitres trop d'erreurs, cela produira un score inutilisable.<br>
            <br>
            <b>Cliquez sur un type de quizz pour commencer.</b>
            `;
    }

/**
 * display newString on the "content" id HTML object
 * @param {String} newString  
 */
export const replaceContentText = 
    (newString) => {
        document.getElementById("content").innerHTML = newString;
    }


/**
 * macro used to delete "content" id HTML object
 * uses {@link replaceContentText}}
 */
export const deleteContentText = 
    () => {
        replaceContentText("");
    }

/**
 * display the answeres dictionnaire (debug, should not exist at the end)
 * @param {Object} answersDict 
 */
export const updateAnswersDictionnaireDisplay = 
    (answersDict) => {
        const display = document.getElementById("answers-dict-display"); 
        display.innerHTML = JSON.stringify(answersDict,null,2);
    }
    
/**
 * same as updateAnswersDictionnaireDiplay, but not in the same HTML object
 * @see updateAnswersDictionnaireDiplay 
 * @param {Object} finalDict 
 */
export const updateFinalDictDisplay = 
    (finalDict) => {
        const display = document.getElementById("final-dict-display"); 
        display.innerHTML = JSON.stringify(finalDict, null, 2);
    }

/**
 * display the right categories on the left and on the right side of the UI
 * @param {String[]} leftCategories 
 * @param {String[]} rightCategories 
 */
export const updateCategories = 
    (leftCategories, rightCategories) => {

        const left = document.getElementById("left-screen");
        const right = document.getElementById("right-screen");

        left.innerHTML = ""; 
        right.innerHTML = ""; 

        // THIS IS USEFUL ONLY IF LCAT & RCAT ARE LISTS
        leftCategories.forEach(categorie => {
            const pElement = document.createElement('p'); 
            pElement.textContent = categorie;
            left.appendChild(pElement); 
        });

        rightCategories.forEach(categorie => {
            const pElement = document.createElement('p'); 
            pElement.textContent = categorie; 
            right.appendChild(pElement); 
        }); 
    }

