import "../map/map.css"

function TimerDisplay({ timeLeft }: { timeLeft: number }) {
    return (
        <div className="panel panel-timer">
            <p>Time left: {timeLeft} seconds</p>
        </div>
    );
}

export default TimerDisplay;