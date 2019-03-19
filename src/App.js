import React, { Component } from 'react';
import './App.css';

// ========================================

function Square(props) {
  let statusClass = 'square';
  if (props.value.winStep) {
    statusClass += ` winner-${props.value.winStep}`;
  }
  return (
    <button className={statusClass} onClick={props.onClick}>
      {props.value.mark}
    </button>
  );
}

class Board extends Component {
  markers = ['X', 'O'];
  boardLength = 3;
  winningLength = 3;
  sizeArr = Array(this.boardLength).fill(undefined);
  winnerTable = initializeWinnerTable(this.boardLength, this.sizeArr);
  boardTable = this.winnerTable.slice(0, this.boardLength);
  winningline = initializeWinnerLine(this.sizeArr, this.winningLength);

  constructor(props) {
    super(props);
    this.state = this.generateNewState();
  }
  generateNewState() {
    return {
      squares: Array(this.boardLength * this.boardLength)
        .fill(undefined)
        .map(() => ({ mark: null, winStep: null })),
      /* [
        { mark: 'X' }, { mark: 'X' }, { mark: 'O' },
        { mark: 'O' }, { mark: 'O' }, { mark: 'X' },
        { mark: null }, { mark: 'X' }, { mark: 'O' }
      ] */
      xIsNext: true,
      winner: null,
      isDrawn: false,
      bestPlayer: null
    };
  }
  createLine(row) {
    return row.map((r) => this.state.squares[r].mark || '-').join('');
  }
  calculateBestPayer(squares) {
    let mainStacks = { 'X': [], 'O': [] };

    this.winnerTable.forEach((row) => {
      let classified = {};
      let lastPlayer = squares[row[0]].mark;
      classified[lastPlayer] = [];

      row.some((i) => {
        const cell = squares[i];
        if (cell.mark !== lastPlayer) {
          if (classified[lastPlayer].length < this.winningLength - 1) {
            delete classified[lastPlayer];
          }
          if (classified[cell.mark]) {
            return true;
          }
          lastPlayer = cell.mark;
          classified[lastPlayer] = [];
        }
        classified[lastPlayer].push(cell);
        return false;
      });

      if (classified['X'] && classified['X'].length === this.winningLength - 1) {
        mainStacks['X'] = mainStacks['X'].concat(classified['X']);
      } else if (classified['O'] && classified['O'].length === this.winningLength - 1) {
        mainStacks['O'] = mainStacks['O'].concat(classified['O']);
      }
    });

    if ((mainStacks['X'].length === 0 && mainStacks['O'].length === 0) || mainStacks['X'].length === mainStacks['O'].length) {
      return false;
    }

    let bestPlayer = generateSign(mainStacks['X'].length > mainStacks['O'].length);
    mainStacks[bestPlayer].forEach((cell) => cell.winStep = bestPlayer);
    return bestPlayer;
  }
  calculateWinner(player, squares) {
    const playerLine = this.winningline[this.state.xIsNext ? 0 : 1];
    return this.winnerTable
      .some((row) => {
        if (this.createLine(row).includes(playerLine)) {
          row.forEach((r) => (squares[r].winStep = player));
          return true;
        }
        return false;
      }) ? player : null;
  }

  handleClick(i) {
    if (this.state.winner || this.state.squares[i].mark) {
      return;
    }
    const squares = this.state.squares.slice();
    const player = generateSign(this.state.xIsNext);
    squares[i].mark = player;

    const winner = this.calculateWinner(player, squares);
    let isDrawn;
    let bestPlayer;
    if (!winner) {
      isDrawn = !winner && squares.map((r) => r.mark).join('').length === squares.length;
      bestPlayer = isDrawn && this.calculateBestPayer(squares);
    }
    this.setState({
      squares: squares,
      xIsNext: !this.state.xIsNext,
      winner: winner,
      isDrawn: isDrawn,
      bestPlayer: bestPlayer
    });
  }
  handleRestart() {
    const newState = this.generateNewState();
    newState.xIsNext = !newState.xIsNext;
    this.setState(newState);
  }
  renderSquare(i) {
    return <Square
      key={i}
      value={this.state.squares[i]}
      onClick={() => this.handleClick(i)} />;
  }


  render() {
    let status;
    let bestPlayerStatus;
    let statusClass = 'status';
    if (this.state.isDrawn) {
      status = 'Game is Drawn. We have No Winners';
      statusClass += ' no-winner';
      if (this.state.bestPlayer) {
        bestPlayerStatus = `But ${this.state.bestPlayer} was close to win`;
      }
    } else if (this.state.winner) {
      status = `Winner is: ${this.state.winner}`;
      statusClass += ` winner-${this.state.winner}`;
    } else {
      status = `Next player: ${generateSign(this.state.xIsNext)}`;
    }

    return (
      <div>
        <div className={statusClass}>{status}</div>
        <div className="status">{bestPlayerStatus}</div>
        {
          this.boardTable.map((boardRow, rowI) =>
            <div key={rowI} className="board-row">
              {boardRow.map((i) => this.renderSquare(i))}
            </div>
          )
        }
        <br />
        {
          (this.state.winner || this.state.isDrawn) &&
          <button onClick={() => this.handleRestart()}>New Game</button>
        }
      </div>
    );
  }
}

class Game extends Component {
  render() {
    return (
      <div className="game">
        <div className="game-board">
          <Board />
        </div>
        <div className="game-info">
          <div>{/* status */}</div>
          <ol>{/* TODO */}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

function initializeWinnerTable(boardLength, sizeArr) {
  const winnerTableMap = [[], [], [[], []]];
  sizeArr
    .forEach((r, i1) => {
      winnerTableMap[0].push([]);
      winnerTableMap[1].push([]);
      winnerTableMap[2][0].push(i1 * (boardLength + 1));
      winnerTableMap[2][1].push((i1 + 1) * (boardLength - 1));

      sizeArr
        .forEach((c, i2) => {
          winnerTableMap[0][i1].push(i1 * boardLength + i2);
          winnerTableMap[1][i1].push(i1 + i2 * boardLength);
        })
    });

  return winnerTableMap.flat();
}
function initializeWinnerLine(sizeArr, winningLength) {
  return [
    sizeArr.slice(0, winningLength).fill('X').join(''),
    sizeArr.slice(0, winningLength).fill('O').join('')
  ]
}
function generateSign(isX) {
  return isX ? 'X' : 'O';
}

export default Game;