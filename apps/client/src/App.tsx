
import { useReducer, useState, useEffect } from "react"
import "./App.css"
import { Marker as Pin } from "react-map-gl/maplibre"
import "maplibre-gl/dist/maplibre-gl.css"
import "./map/maplibre"
import { LineBetweenPins, UKMap } from "./map/map"
import { haversineDistance, calculateScore } from "./game/scoring"
import { questionSchema } from "./game/question"
import { gameReducer, initialGameState } from "./game/state"
import TimerDisplay from "./components/timer"
import ResultsPanel from "./components/results"
import { MenuDrawer } from "./components/menu"
import { HelpOverlay, ScoringOverlay } from "./components/menu-content"
import type { Area } from "./game/types"
import { parse as parseYaml } from "yaml"


function App() { 
  // game state 
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const { pin, targetPin, locked, result, targets, question, questionIndex,
        started, totalScore, showSummary, timeLeft, timeUp, showStory, 
        showResults, areas, all_questions } = state

  // UI hooks
  const [menuOpen, setMenuOpen] = useState(false); // whether the menu is open
  const [showScoring, setShowScoring] = useState(false); // whether to show the scoring overlay
  const [showHelp, setShowHelp] = useState(() => {
    return !localStorage.getItem("helpSeen"); // show help if it hasn't been shown before
  })

  function dismissHelp() {
    setShowHelp(false);
    localStorage.setItem("helpSeen", "true"); // store in local storage that the help has been shown
  }

  function dismissScoring() {
    setShowScoring(false);
  }

  function handleStart() {
    // set the question to the first question in the array
    dispatch({ type: "START" });
  }

  function handleNextQuestion() {
    // set the question to the next question in the array
    dispatch({ type: "NEXT_QUESTION" });
  } 

function handleLockIn() {
  if (!pin) return

  let nearestDistance = Infinity
  let nearestTarget: Area | null = null
  // go through each target, if closer to the pin set nearest
  for (const target of targets) {
    const targetDistance = haversineDistance(
      { lat: target.centroid_lat, lon: target.centroid_lon },
      { lat: pin.latitude, lon: pin.longitude }
    )
    if (targetDistance < nearestDistance) {
      nearestDistance = targetDistance
      nearestTarget = target
    }
  }
  const score = calculateScore(nearestDistance)
  if (!nearestTarget) return
  // dispatch the LOCK_IN action with the result and target pin
  dispatch({
    type: "LOCK_IN",
    result: { score, distance: nearestDistance, nearestTarget },
    targetPin: { longitude: nearestTarget.centroid_lon, latitude: nearestTarget.centroid_lat },
  })
}

  function handleShowSummary() {
    dispatch({ type: "SHOW_SUMMARY" });
  }

  function handleReset() { 
    dispatch({ type: "RESET" });
  }

  // load in the questions from yaml and validate against schema
  useEffect(() => {
    async function getQuestions() {
        try {
          const manifestRes = await fetch("/questions/all-questions.yaml")
          const manifestText = await manifestRes.text()
          const filenames = parseYaml(manifestText)
          console.log("Filenames:", filenames)

          const questions = await Promise.all(
            filenames.map(async (file: string) => {
              const res = await fetch(`/questions/${file}`)
              const text = await res.text()
              return questionSchema.parse(parseYaml(text))
            })
          )
          console.log("Questions loaded:", questions)
          dispatch({ type: "LOAD_QUESTIONS", questions })
        } catch (err) {
          console.error("Failed to load questions:", err)
        }
      }
    getQuestions()
  }, [])

  // load the areas data from the JSON file when the question changes
  useEffect(() => {
    if (!question) return; // if no question, do nothing
    fetch(question.file)
      .then(res => res.json())
      .then(data => {
        console.log("Loaded areas data for question", question.question, data[0])
        const sortedAreas = [...data].sort((a: any, b: any) => {
          if (question.statistic === "max") {
            return (b as any)[question.variable] - (a as any)[question.variable];
          }
          else if (question.statistic === "min") {
            return (a as any)[question.variable] - (b as any)[question.variable];
          }
          else {
            console.error("Unknown statistic", question.statistic);
            return 0;
          }
      })
        dispatch({ type: "LOAD_AREAS", areas: data, targets: sortedAreas.slice(0, question.top_n) });
    })
  }, [question]);
  

  /* timed out message - if the user has run out of time, display a message and lock in the pin */
  useEffect(() => {
    if (timeLeft === 0 && !locked) {
      if (pin) { 
        handleLockIn();
      }
      dispatch({ type: "TIME_UP" });
    }
  }, [timeLeft]);
  
  /* count timer down */ 
  useEffect(() => {
    if (!started || locked || timeLeft === null) return; // if game not started, or locked, or no time limit, do nothing
    const timer = setInterval(() => {
        dispatch({ type: "TIMER_TICK" });
    }, 1000); /* run every second */
    return () => clearInterval(timer); // cleanup timer on unmount
  }, [started, locked, questionIndex]);


  return (
    // overall div
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
      {/* Header */}
      <div className="bar header">
        {/* Logo and title */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <img src="/Imago-logo.png" alt="Imago logo" className="header-logo" />
        </div>
        <h1>Imagolf - A map guessing game</h1>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <p>Score: {totalScore}</p>
          <button className="button button-menu-toplevel" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        </div>
      </div>
      {/* Map components */}
      <UKMap locked={locked} setPin={(pin) => dispatch({ type: "SET_PIN", pin })} areas={locked ? areas : []} variable={question?.variable || "" } variableLabel={question?.variable_label || null}>
        <div className = "map-top-overlay">
          {/* Display the question */}
          {started && question && !locked && (
            <div className="panel question-header">
              <h2>{question.question}</h2>
            </div>
          )}
          {/* Time left display */}
          {started && !locked && timeLeft !== null && (
            <TimerDisplay timeLeft={timeLeft} />
          )
          }
        </div>
        {/* Pins for user and target locations */}
        {started && pin && 
          <Pin longitude={pin.longitude} 
               latitude={pin.latitude} 
               color="#FF8F42" />} {/* Imago orange for user pin */}

        {targetPin && 
          <Pin longitude={targetPin.longitude} 
               latitude={targetPin.latitude} 
               color="#24226F" />} {/* Imago navy for target pin */}

               
        {/* Line between the pin and the target */}
        {result && locked && pin && targetPin && (
          <LineBetweenPins pin={pin} result={result} />
          
        )}

      </UKMap>
      

      {/* Display results and story */}
      {locked && !showSummary && question && (showResults || showStory) && (
        <div className="overlay-backdrop">
          <div className="reveal-panels">
            {showResults && result && (
              <ResultsPanel result={result} onClose={() => dispatch({ type: "DISMISS_RESULTS" })} />
            )}
            {showStory && (
              <div className="panel panel-story">
                <h3>Info</h3>
                <p>{question?.story}</p>
                <button className="close-button" onClick={() => dispatch({ type: "DISMISS_STORY" })}>×</button>
              </div>
            )}
          </div>
        </div>
      )}


      {/* Summary message that displays at the end of the game */}
      {showSummary && (
        <div className="panel panel-summary">
          <p>Game over.</p>
          <p>Final score: {totalScore}/{all_questions.length * 1000}</p>
          <p>Restart by pressing the Reset button.</p>
        </div>
      )}

      {/* Time's up message - if the user has run out of time and hasn't placed a pin, display a message and lock in the pin */}
      {/* if the pin has been placed, then dont show this, as the pin gets locked in place */}
      {timeUp && !showSummary && (
        <div className="overlay-backdrop">
          {/* Time's up panel - if the user has run out of time, display a message and lock in the pin */}
          <div className="panel panel-timer">
            {/* conditional - if no pin, then score 0, else pin gets locked in, communicate this to the user */}
            {!pin ? (
            <p>Time's up! No pin placed — score: 0</p>
            ) : (
            <p>Time's up! Pin locked in - score: {result?.score}</p>
            )}
            <button 
            className="button-inline"
            onClick={() => dispatch({ type: "DISMISS_TIME_UP" })}>Dismiss 
            </button>
          </div>
        </div>
        )}

      {/* Help overlay */}
      <HelpOverlay show={showHelp} onClose={dismissHelp} />
      {/* Scoring overlay */}
      <ScoringOverlay show={showScoring} onClose={dismissScoring} />
      

      {/* Controls */}
      <div className="bar">
      {/* Buttons go here */}
        {/* Show summary button - only visible at the end of the game */}
        {locked && !timeUp && questionIndex === all_questions.length - 1 && !showSummary && (
          <button
          onClick={handleShowSummary}
          className="button button-summary"
          >
          Show summary
          </button>
        )
        }

        {/* Next question button */}
        {locked && !timeUp && questionIndex < all_questions.length - 1 && (
          <button 
          onClick={handleNextQuestion}
          className="button button-progress"
          >
          Next question
          </button>
        )}
        {/* Start button */}
        {(!started &&
          <button 
          onClick={handleStart}
          className="button button-start"
          >
          Start game
          </button>
        )}

        {/* Lock in button */}
        {started && pin && !locked && (
          <button 
          onClick={handleLockIn}
          className="button button-progress"
          >
          Lock in!
          </button>
        )}
        {/* Reset button - restores game to initial state. Always visible after first question has been answered */}
        {locked && started && (
          <button
          onClick={handleReset} 
          className="button button-reset"
          >
          Reset
          </button>
        )}
        {/* Menu drawer */}
        <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} onShowHelp={() => setShowHelp(true)} onShowScoring={() => setShowScoring(true)} />

    </div>
    </div>
  )
}

export default App