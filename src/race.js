import { readFileSync, writeFileSync } from "fs"
import { resolve, dirname } from "path"

export function readFile(path) {
  const absolutePath = resolve(dirname(module.parent.filename), path)
  const content = readFileSync(absolutePath, "utf8")

  return content
}

export function writeFile(path, content) {
  const absolutePath = resolve(dirname(module.parent.filename), path)
  const keys = "Posição;ID;Nome;Voltas Completadas;Tempo Total;Melhor Tempo;Melhor Volta;Velocidade Media;Diferença Do Vencedor\n"

  const out = content
    .map((result) => {
      return  `${result.finish_position};`+
              `${result.pilot_id};`+
              `${result.pilot_name};`+
              `${result.total_laps};`+
              `${result.total_time};`+
              `${result.best_time};`+
              `${result.best_lap};`+
              `${result.average_time};`+
              `${result.after_first_pilot}`
    })
    .join('\n')

    const result = [keys + out]

  writeFileSync(absolutePath, result, "utf8")
}

export function convertTextToJson(content) {
  const keys = ["time", "pilot_id", "pilot_name", "lap", "lap_time", "velocity"]

  return content
    .split('\n')
    .splice(1)
    .map(line => line
      .split(/\s–\s|\s+/)
      .reduce((run, data, i) => {
        const key = keys[i]
        run[key] = data
        return run
      }, {})
    )
}

export function fasterLap(content){
  content.sort(function(a, b){
    if (a.lap_time > b.lap_time) {
      return 1
    }
    if (a.lap_time < b.lap_time) {
      return -1
    }
    return 0
  })

  return content[0]
}

export function result(content) {
  const raceResult = content
    .reduce(lapsPerPilot, [])
    .reduce(bestResultsOfPilot, [])
    .sort(rating)
    .map(afterTheWinner)
    .map(formatingTimes)

  return raceResult
}

export function lapsPerPilot(pilots, line) {
  const key = Number(line.pilot_id)

  if (pilots[key] == undefined) {
    pilots[key] = []
  }

  pilots[key].push(line)

  return pilots
}

export function bestResultsOfPilot(results, pilot) {
  const bestOfPilot = pilot.reduce(
    (best, lap) => {
      const lapTime = convertTimeToNumber(lap.lap_time)
      const total_velocity = Number(lap.velocity.replace(',', '.'))
      const bestTime = best.best_time

      best.pilot_id = lap.pilot_id
      best.pilot_name = lap.pilot_name

      if (lapTime < bestTime) {
        best.best_time = lap.lap_time
        best.best_lap = Number(lap.lap)
      }

      best.total_time += lapTime
      best.total_velocity += total_velocity
      best.total_laps++

      return best
    },
    { best_time: Infinity, total_time: 0, total_laps: 0, total_velocity: 0 }
  );

  const {total_velocity, total_laps} = bestOfPilot
  bestOfPilot.average_time = total_velocity / total_laps

  results.push(bestOfPilot)

  return results
}

export function rating(a, b){
  if (a.total_laps <= b.total_laps) {
    if(a.total_time > b.total_time){
      return 1
    }
  }
  return -1
}

export function afterTheWinner(result, index, arr){
  result.finish_position = index+1
  result.after_first_pilot = arr[index].total_time - arr[0].total_time

  return result
}

export function formatingTimes(result){
  result.after_first_pilot  = convertNumberToTime(result.after_first_pilot)
  result.total_time         = convertNumberToTime(result.total_time)
  result.average_time       = convertNumberToTime(result.average_time)
  result.total_velocity     = convertNumberToTime(result.total_velocity)

  return result
}

export function convertTimeToNumber(time) {
  time = time.split(":").map(Number)
  time = time[0] * 60 + time[1]
  return Number(time.toFixed(3))
}

export function convertNumberToTime(number) {
  const minutes = Math.trunc(number / 60)
  const secondsAndMilis = (number - minutes * 60).toFixed(3).padStart(6, "0")

  return `${minutes}:${secondsAndMilis}`
}