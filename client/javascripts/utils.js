/**
 * shuffle the list
 * uses the Fisher-Yates algorithm (because it's complexity's O(n))
 * used in {@link filterWords}
 * @param {Object[]} list the list to shuffle
 * @returns the shuffled list
 */
const shuffle = 
    (list) => {
        for (let i = list.length - 1 ; i > 0 ; i--){
            const j = Math.floor(Math.random() * (i+1)); 
            [list[i], list[j]] = [list[j], list[i]]; 
        }
        return list;
    }

/**
 * send a GET request to "/word" (which's the link we defined for words database)
 * @async 
 * used in {@link filterWords}
 * @returns {Promise<Object[]>} the list of word object 
 */
const fetchWords = 
    async () => {
        try{
            const response = await fetch('/word', {method:"GET"}); 
            const allWords = await response.json();
            return allWords;
        } catch (error) {
            console.error(`error while fetching words`); 
        }
    }

/**
 * used in the main method
 * activate when a new round is started 
 * @param {number[]} timerArray 
 * @see {@link Main.play} 
 */
export const startTime = 
    (timerArray) => {
        
        if (timer) {
            clearInterval(timer);
            timer= null; 
        }

        timer = setInterval(() => displayTimer(timerArray),10);   
    }

/**
 * refresh the HTML timer
 * called by {@link startTime}
 * @param {number[]} timerArray 
 */
const displayTimer = 
    (timerArray) => {
        timerArray[0] += 10;  //ms 
        if (timerArray[0] === 1000){
            timerArray[0] = 0; 
            timerArray[1]++; 
            if (timerArray[1] === 60){
                timerArray[1] = 0; 
                timerArray[2]++; 
            }
        }

        const m = timerArray[2] < 10 ? "0" + timerArray[2] : timerArray[2]; 
        const s = timerArray[1] < 10 ? "0" + timerArray[1] : timerArray[1];
        const ms = timerArray[0] < 100 ? "0" + Math.floor(timerArray[0]/10) : Math.floor(timerArray[0]/10);
        const timerDisplay = document.getElementById("timer");
        timerDisplay.innerHTML = `${m} : ${s} : ${ms}`; 
    }

/**
 * @param {number} choice select which categories list 
 * @returns list of categories 
 */
export const getCategories =
    (choice) => {
        if (choice > 3) {
            console.error("there's no dataset for this index"); 
            return; 
        }
        const categorieSet = {
            0: [["Science"], ["Lettres"]], 
            1: [["Féminin"], ["Masculin"]], 
            2: [["Féminin","Lettres"], ["Masculin","Science"]], 
            3: [["Féminin","Science"], ["Masculin","Lettres"]]
        }
        return categorieSet[choice]
    }

 /**
 * 
 * @param {String[]} categories 
 * @returns 
 */
export const filterWords = 
    async (categories) => {

        const allWords = await fetchWords();

        //includes need a list, not a list of lists 
        const flattenCategories = categories.flat(); 

        const filteredWords = allWords.filter(word => 
            flattenCategories.includes(word.categorie) 
        );

        return shuffle(filteredWords);
    }

/**
 * create the answersDict object 
 * @returns Object answersDict which represent the data for a question set
 */
export const createAnswerDict = 
    () => ({
        data: {
            index:0, 
            lastQuestionTime: -400,
            averageTime: 0
        }, 
        answers: {}
    });  

export const wait = 
    (ms) => {
        return new Promise((resolve) => setTimeout(resolve,ms));
    } 