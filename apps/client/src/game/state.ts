// Code for managing game state

import type { Question, Area, Result } from "./types";

export type GameState = {
    pin: { longitude: number, latitude: number } | null
    targetPin: { longitude: number, latitude: number } | null
    locked: boolean
    result: Result | null
    targets: Area[] 
    question: Question | null
    questionIndex: number
    started: boolean
    totalScore: number
    showSummary: boolean
    timeLeft: number | null
    timeUp: boolean
    showStory: boolean
    showResults: boolean
    areas: Area[] 
    all_questions: Question[]
}

export const initialGameState: GameState = {
    pin: null,
    targetPin: null,
    locked: false,
    result: null,
    targets: [],
    question: null,
    questionIndex: 0,
    started: false,
    totalScore: 0,
    showSummary: false,
    timeLeft: null,
    timeUp: false,
    showStory: false,
    showResults: false,
    areas: [],
    all_questions: []
}

export type GameAction =
    // list of possible actions for the game
  | { type: "START" }
  | { type: "NEXT_QUESTION" }
  | { type: "SET_PIN"; pin: { longitude: number; latitude: number } }
  | { type: "LOCK_IN"; result: Result; targetPin: { longitude: number; latitude: number } }
  | { type: "TIME_UP" }
  | { type: "TIMER_TICK" }
  | { type: "SHOW_SUMMARY" }
  | { type: "DISMISS_TIME_UP" }
  | { type: "DISMISS_STORY" }
  | { type: "DISMISS_RESULTS" }
  | { type: "RESET" }
  | { type: "LOAD_AREAS"; areas: Area[]; targets: Area[] }
  | { type: "LOAD_QUESTIONS"; questions: Question[] }


export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "RESET":
      return { ...initialGameState, all_questions: state.all_questions }

    case "START":
      return {
        ...initialGameState,
        all_questions: state.all_questions,
        started: true,
        question: state.all_questions[0],
        questionIndex: 0,
        timeLeft: state.all_questions[0].time_limit,
      }

    case "SET_PIN":
      return { ...state, pin: action.pin }

    case "DISMISS_STORY":
      return { ...state, showStory: false }

    case "DISMISS_RESULTS":
      return { ...state, showResults: false }

    case "DISMISS_TIME_UP":
      return { ...state, timeUp: false }

    case "SHOW_SUMMARY":
      return { ...state, showSummary: true }

    case "TIMER_TICK":
      if (state.timeLeft === null || state.timeLeft <= 0) return state
      return { ...state, timeLeft: state.timeLeft - 1 }

    case "TIME_UP":
      return { ...state, timeUp: true,
        locked: true,
        showStory: true,
       }

    case "LOCK_IN":
    // locked in - need to calc the score, show results and story UI elements, update total score
      return {
        ...state,
        locked: true,
        result: action.result,
        targetPin: action.targetPin,
        totalScore: state.totalScore + action.result.score,
        showStory: true,
        showResults: true
      }

    case "NEXT_QUESTION":
      const nextIndex = state.questionIndex + 1
      // If there are no more questions, show the summary screen
      if (nextIndex >= state.all_questions.length) {
        return { ...state, showSummary: true }
      } else {
        // Otherwise, load the next question and reset the state for the new question
        const nextQuestion = state.all_questions[nextIndex]
        return {
          ...state,
          questionIndex: nextIndex,
          question: nextQuestion,
          pin: null,
          targetPin: null,
          locked: false,
          result: null,
          timeLeft: nextQuestion.time_limit,
          showStory: false,
          showResults: false,
          timeUp: false,
        }
      }

    case "LOAD_AREAS":
      return { ...state, areas: action.areas, targets: action.targets }

    case "LOAD_QUESTIONS":
        return { ...state, all_questions: action.questions }

    default:
      return state
  }
}