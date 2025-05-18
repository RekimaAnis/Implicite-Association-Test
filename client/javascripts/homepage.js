import { average } from './mathematics.js';

import { displayHomePage, deleteContentText, replaceContentText, updateAnswersDictionnaireDisplay, updateCategories } from './updateHtml.js'; 

import { startTime, getCategories, filterWords, createAnswerDict, wait } from './utils.js';


//#################################################################################################################################
// IMPORTS DES FONCTIONS ANNEXES
//#################################################################################################################################


//#################################################################################################################################
// DECLARATION DES VARIABLES STATIQUES 
//#################################################################################################################################

let currentTurn = 0;


let finalDict = {
    firstCluster: null, 
    secondCluster: null, 
    thirdCluster: null, 
    fourthCluster: null, 
    fifthCluster: null,
    sixthCluster: null
};

const clusterKeys = ["firstCluster", "secondCluster", "thirdCluster", "fourthCluster", "fifthCluster", "sixthCluster"];

let keydownHandler = null; 

//#################################################################################################################################
// FONCTIONS ANNEXES
//#################################################################################################################################

/**
 * function used in play to handle the user input keyboard ('e' or 'i')
 * called in {@link play}
 * @param {Object[]} filteredWords 
 * @param {String} key 
 * @param {number[]} timerArray 
 * @param {Object} answersDict 
 * @memberof Main 
 */
const handleAnswer = 
    async (filteredWords,key,timerArray,answersDict) => {

        const currentWord = filteredWords[answersDict.data.index];  

        let [ms,s,m] = timerArray; 

        const currentTime = (m * 60 * 1000) + (s * 1000) + ms; 

        const eCategories = Array.from(document.getElementById("left-screen").children).map(p => p.textContent.trim());
        const iCategories = Array.from(document.getElementById("right-screen").children).map(p => p.textContent.trim());

        if(!eCategories || !iCategories) {
            console.error("categories aren't defined"); 
            return; 
        }

        const userAnswer = key === "e" ? eCategories : iCategories; 
        const realAnswer = eCategories.includes(currentWord.categorie) ? eCategories : iCategories; 

        if (!answersDict.answers[currentWord.mot]){
            answersDict.answers[currentWord.mot] = {
                questionIndex: answersDict.data.index,
                numberOfTries : 0,
                pressTime: currentTime, 
                deltaTime: null,
                leftOrRight: realAnswer === eCategories ? "left" : "right",
                truncated: false 
            };
        }

        if (answersDict.answers[currentWord.mot].numberOfTries < 2){
            answersDict.answers[currentWord.mot].numberOfTries++;
        }  

        if (realAnswer === userAnswer) { 

            let deltaTime = currentTime - answersDict.data.lastQuestionTime; 

            if (deltaTime < 300 || deltaTime > 3000) {
                deltaTime = Math.min(Math.max(deltaTime,300),3000); 
                answersDict.answers[currentWord.mot].truncated = true;
    
            }

            answersDict.answers[currentWord.mot].deltaTime = deltaTime;

            replaceContentText(""); 

            await wait(400); 

            [ms,s,m] = timerArray;  // DEMANDER SI 10 MS DE DECALAGE CEST GRAVE
            const timeAfterWait = (m * 60 * 1000) + (s * 1000) + ms; 

            answersDict.data.lastQuestionTime = timeAfterWait;

            answersDict.data.index++;

            if (answersDict.data.index < filteredWords.length) {
                document.getElementById("cross").hidden = true;
                replaceContentText(filteredWords[answersDict.data.index].mot); 
            }

        } else {
            document.getElementById("cross").hidden = false; 
        }

        if (answersDict.data.index === filteredWords.length - 1) {
            
            replaceContentText("Prochaine série de questions dans 2 secondes"); 
            finalDict[clusterKeys[currentTurn]] = answersDict;

            setTimeout( () => {
                currentTurn++; 
                play();
            }, 2000);
        }
        updateAnswersDictionnaireDisplay(answersDict);
    }

 /**
 * instanciate the answersDict 
 * called by {@link play}
 * @see handleAnswer - function used after user press a key 
 * @param {Object[]} filteredWords - list of the good categorie 
 * @param {number[]} timerArray - array which represent timer [ms,s,m] 
 * @param {Object} answersDict - the answer dictionnaire
 */
const playWords = 
    (filteredWords,timerArray,answersDict) => {

        try {
            document.getElementById("timer").removeAttribute("hidden");

            deleteContentText();

            document.getElementById("random-button").style.visibility = "hidden"; 
            document.getElementById("linear-button").style.visibility = "hidden"; 

            replaceContentText(filteredWords[0].mot); 

            if (keydownHandler){
                document.removeEventListener("keydown", keydownHandler); 
            }

            keydownHandler =  function (event) {
                if (event.code === "KeyE" || event.key === "e" || event.code === "KeyI" || event.key === "i"){
                    handleAnswer(filteredWords,event.key,timerArray,answersDict);
                }
            }

            document.addEventListener("keydown", keydownHandler);

        } catch (error) {
            console.error("error in playWords : ", error); 
        }
    }


//#################################################################################################################################
// FONCTION PRINCIPALE
//#################################################################################################################################

/**
 * main function, used to play a full test 
 * @returns if an error is detected
 */
const play = 
    async () => {

        let answersDict = createAnswerDict();
        let timerArray = [0,0,0]; 
        startTime(timerArray); 
        let categories, filteredWords, timeList; 
            
        switch (currentTurn) {

            case 0:

                categories = getCategories(0); 
                updateCategories(categories[0],categories[1]);
                filteredWords = await filterWords(categories); 
                playWords(filteredWords,timerArray,answersDict,categories);
                answersDict.data.averageTime = average(answersDict);

                break;

            case 1:

                categories = getCategories(1); 
                updateCategories(categories[0],categories[1])
                filteredWords = await filterWords(categories); 
                playWords(filteredWords, timerArray, answersDict); 
                answersDict.data.averageTime = average(answersDict);

                break ; 
            
            case 2: 
            case 3: 

                categories = getCategories(2); 
                updateCategories(categories[0],categories[1]);
                filteredWords = await filterWords(categories); 
                playWords(filteredWords, timerArray, answersDict); 
                answersDict.data.averageTime = average(answersDict);
                console.log(finalDict);
                break ; 
                
            case 4: 

                categories = getCategories(0).reverse(); 
                updateCategories(categories[0],categories[1]);
                filteredWords = await filterWords(categories);
                playWords(filteredWords, timerArray, answersDict); 
                timeList = getTimeListForAverage(answersDict); 
                answersDict.data.averageTime = average(timeList)

                break; 

            case 5:
            case 6: 

                categories = getCategories(3); 
                updateCategories(categories[0],categories[1]);
                filteredWords = await filterWords(categories);
                playWords(filteredWords, timerArray, answersDict); 
                timeList = getTimeListForAverage(answersDict); 
                answersDict.data.averageTime = average(timeList)

                break;

            case 7: 

                replaceContentText("FIN DU TEST, MERCI");

            default: 

                console.error(`default switch detected, should not happen`); 
                return;        
        }
    }

//#################################################################################################################################
// SET-UP EFFECTUE AU CHARGEMENT DE LA PAGE
//#################################################################################################################################


const setupEventListeners = 
    () => {
        document.addEventListener("keydown", function (event) {
            if (event.code === "Space" || event.key === " "){
                play();
            }
        }); 
        // document.getElementById('random-button').addEventListener("click", function () { 
        //     simpleCategories = shuffle(simpleCategories);  
        //     doubleCategories0 = shuffle(doubleCategories0); 
        //     doubleCategories1 = shuffle(doubleCategories1); 
        //     play(); 
        // });  
        // document.getElementById('linear-button').addEventListener("click", function () {
        //     play();
        // })
    }   


const setup = () => {
    console.log("setup"); 
    displayHomePage();
    setupEventListeners();

}

document.addEventListener("DOMContentLoaded",setup);