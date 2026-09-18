
import { useState, useEffect } from "react"
import "./App.css"
import { Marker as Pin } from "react-map-gl/maplibre"
import "maplibre-gl/dist/maplibre-gl.css"
import "./map/maplibre"
import { LineBetweenPins, UKMap } from "./map/map"
import { haversineDistance, calculateScore } from "./game/scoring"
import { Questions } from "./game/question"
import TimerDisplay from "./components/timer"
import ResultsPanel from "./components/results"
import { MenuDrawer } from "./components/menu"
import { HelpOverlay, ScoringOverlay } from "./components/menu-content"
import type { Question, Area, Result } from "./game/types"


function App() { 
  /* variable to hold pin location. either a point object or null. */ 
  // useState is a react hook that lets us store state in an object. 
  // first value is the state variable, second is a function that updates it 
  const [pin, setPin] = useState<{ longitude: number; latitude: number } | null>(null)
  const [targetPin, setTargetPin] = useState<{ longitude: number; latitude: number } | null>(null)
  const [locked, setLocked] = useState(false); // locking in the pin calculates the score
  const [result, setResult] = useState<Result | null>(null);
  const [targets, setTargets] = useState<Area[]>([]); // array of targets loaded from JSON
  const [question, setQuestion] = useState<Question | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0); // index of the current question
  const [started, setStarted] = useState(false); // whether the game has started
  const [totalScore, setTotalScore] = useState(0); // total score for the game
  const [showSummary, setShowSummary] = useState(false); // whether to show the summary message at the end of the game
  const [timeLeft, setTimeLeft] = useState<number | null>(null); // time left for the current question
  const [timeUp, setTimeUp] = useState(false); // whether the time is up for the current question
  const [showStory, setShowStory] = useState(false); // whether to show the story for the current question
  const [showResults, setShowResults] = useState(false); // whether to show the results for the current question
  const [areas, setAreas] = useState<Area[]>([]);
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
    setStarted(true);
    setQuestionIndex(0); // reset question index to 0
    setQuestion(Questions[0]);
    setTotalScore(0); // reset total score to 0
    setTimeLeft(Questions[0].time_limit); // set time left to the time limit of the first question
  }

  function handleNextQuestion() {
    // set the question to the next question in the array
    const nextIndex = questionIndex + 1;
    if (nextIndex < Questions.length) {
      setQuestionIndex(nextIndex); // increment question index for next question
      setQuestion(Questions[nextIndex]);
      // reset pin and result for next question
      setPin(null);
      setTargetPin(null);
      setLocked(false);
      setTimeLeft(Questions[nextIndex].time_limit); // set time left to the time limit of the next question
      setResult(null);
      setShowStory(false); // make the story go away
      setShowResults(false); // make the results go away
    } else {
      console.log("No more questions");
    }
  } 

  function handleLockIn() {
    // store pin location in local storage and calculate score 
    if (!pin) {  // no pin has been placed, so user has run out of time
      return;
    } // if no pin, and time is up, set score to 0

      let nearestDistance = Infinity;
      let nearestTarget: Area | null = null;

      // loop through all targets - find the closest one and log the distance to it
      for (const target of targets) { 
        const targetDistance = haversineDistance(
          { lat: target.centroid_lat, lon: target.centroid_lon },  // target coordinates
          { lat: pin.latitude, lon: pin.longitude }  // pin coordinates
        ); 

        if (targetDistance < nearestDistance) {
          nearestDistance = targetDistance;
          nearestTarget = target;
        }
      }
      // then calculate the score based on the distance to the closest target
      const score = calculateScore(nearestDistance);
      if (!nearestTarget) {
        console.error("No nearest target found");
        return;
      }
      setTargetPin({ longitude: nearestTarget.centroid_lon, latitude: nearestTarget.centroid_lat });
      setResult({ score, distance: nearestDistance, nearestTarget });
      setTotalScore(prev => prev + score); // add score to total score
      setLocked(true);
      setShowStory(true); // show the story after locking in the pin
      setShowResults(true); // show the results after locking in the pin
  }

  function handleShowSummary() {
    setShowSummary(true);
  }

  function handleReset() { 
    // need to set a bunch of things to null
    setPin(null);
    setTargetPin(null);
    setLocked(false);
    setResult(null);
    setQuestionIndex(0);  // reset question index to 0
    setQuestion(null);
    setStarted(false);
    setShowSummary(false);
    setTotalScore(0); // reset total score to 0
    setTimeUp(false);
    setTimeLeft(null); // reset time left to null
    setShowStory(false); // reset show story to false
    setShowResults(false); // reset show results to false
  }

  // load the areas data from the JSON file when the question changes
  useEffect(() => {
    if (!question) return; // if no question, do nothing
    fetch(question.file)
      .then(res => res.json())
      .then(data => {
        setAreas(data); // store areas in state
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
        setTargets(sortedAreas.slice(0, question.top_n)); // store top N targets in state
    })
  }, [question]);
  

  /* timed out message - if the user has run out of time, display a message and lock in the pin */
  useEffect(() => {
    if (timeLeft === 0 && !locked) {
      if (pin) { 
        handleLockIn();
      }
      setTimeUp(true);
      setLocked(true);
      setShowStory(true); // show story even if time is up
    }
  }, [timeLeft]);
  
  /* count timer down */ 
  useEffect(() => {
    if (!started || locked || timeLeft === null) return; // if game not started, or locked, or no time limit, do nothing
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 0) return prev; // handle case where timeLeft is null or below 0 - return previous value
        return prev - 1; // decrement time left
      });
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
      <UKMap locked={locked} setPin={setPin} areas={locked ? areas : []} variable={question?.variable || ""}>
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
               color="#03CEA3" />} {/* Imago teal for target pin */}

               
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
              <ResultsPanel result={result} onClose={() => setShowResults(false)} />
            )}
            {showStory && (
              <div className="panel panel-story">
                <h3>Info</h3>
                <p>{question?.story}</p>
                <button className="close-button" onClick={() => setShowStory(false)}>×</button>
              </div>
            )}
          </div>
        </div>
      )}


      {/* Summary message that displays at the end of the game */}
      {showSummary && (
        <div className="panel panel-summary">
          <p>Game over.</p>
          <p>Final score: {totalScore}/{Questions.length * 1000}</p>
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
            onClick={() => setTimeUp(false)}>Dismiss 
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
        {locked && !timeUp && questionIndex === Questions.length - 1 && !showSummary && (
          <button
          onClick={handleShowSummary}
          className="button button-summary"
          >
          Show summary
          </button>
        )
        }

        {/* Next question button */}
        {locked && !timeUp && questionIndex < Questions.length - 1 && (
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