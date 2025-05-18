/**
 * ALL THE MATHEMATICS NEEDED IN THE APPLICATION
 */
/**
 * return a list from the answer dict produce by the guinea pig (that's the official english word for "cobaye")
 * @param {Object} answersDict 
 * @returns {number[]} 
 */ 
const getTimeListForAverage =
    (answersDict) => {
        return Object.values(answersDict)
            .filter(data => data && data.deltaTime !== null)
            .map(mot => mot.deltaTime); 
    }
/**
 * calculate the average of a list
 * @param {number[]} timeList - List of time value for a quizz 
 * @returns {int} the average of the list (in ms) 
 */ 
export const average =
    (answersDict) => {
        const timeList = getTimeListForAverage(answersDict);
        let sum = 0 
        timeList.forEach(value => {
            sum += value; 
        })
        return (sum / timeList.length);
    }

