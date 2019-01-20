import {readFile, convertTextToJson, fasterLap, result, writeFile} from "./race"

const content = readFile('./kart.in')
let dataRace = convertTextToJson(content)

console.log("The faster lap in the race", fasterLap(dataRace))
console.log('-----------------------------------------------')

dataRace = result(dataRace)

console.log(dataRace)

writeFile('./kart.out', dataRace)