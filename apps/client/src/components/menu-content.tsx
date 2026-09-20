
// components/help.tsx
import { useState } from "react"
import "./menu-content.css"

export function HelpOverlay({ show, onClose }: { show: boolean; onClose: () => void }) {
  return show ? (
    <div className="overlay-backdrop">
      <div className="panel panel-menu-popup">
        <h2>How to play</h2>
        <p>Imagolf is a map guessing game. You will be prompted with a question, and you need to place a pin on the map to indicate your answer.</p>
        <p>Once you have placed a pin, you can move it around freely until either:
            <ul>
                <li>you lock in your answer (with the <i>Lock in</i> button), or</li>
                <li>the timer runs out</li>
            </ul>
        </p>
        <p>Once either of these things happen, your answer will be locked in and points calculated.</p>
        <p><i>Hint: be sure to place a pin before the timer runs out, else you will score 0 points for that round!</i></p>
        <p>After each round, you will be shown the correct answer and your score for that question.</p>
        <p>There are several rounds in the game, and your score is the sum of your scores for each round.</p>
        <p>The aim is to be the most below par!</p>
        <p>Good luck!</p>
        <button className="button-inline" onClick={onClose}>Got it</button>
      </div>
    </div>
  ) : null
}

export function ScoringOverlay({ show, onClose }: { show: boolean; onClose: () => void }) {
  return show ? (
    <div className="overlay-backdrop">
      <div className="panel panel-menu-popup">
        <h2>Scoring</h2>
        <p>Scoring is based on the <a href="https://en.wikipedia.org/wiki/Haversine_formula" target="_blank" rel="noopener noreferrer">Haversine distance</a> between
        your guess and the correct answer.</p>
        <p>The closer you are, the higher your score. The maximum score for a round is 1000 points.</p>
        <p> Answers within 50 km of the correct answer will get full marks. Answers 100 km away will receive half of the total,
            and scores continue to decay exponentially with distance after that.
        </p>
        <p><i>Remember: If you do not place a pin before the timer runs out, you will score 0 points for that round.</i></p>
        <button className="button-inline" onClick={onClose}>Got it</button>
      </div>
    </div>
  ) : null  
}