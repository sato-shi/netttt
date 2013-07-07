"use strict";

var Ai = (function (Ai) {
  function Random() {
  }

  Random.prototype.getMove = function (game) {
    var moves = game.validMoves();
    return moves[Math.floor(Math.random() * moves.length)];
  };

  function sign(piece) {
    return (piece === 0 ? 0 : (piece === Ttt.X ? 1 : -1));
  }

  function nearWin(a, b, c) {
    a = sign(a);
    b = sign(b);
    c = sign(c);
    var sum = a + b + c;
    return (Math.abs(sum) === 2 ? (sum > 0 ? 1 : -1) : 0);
  }

  function countNearWins(board) {
    var pieces = Ttt.toArray(board);
    var nearWins = 0;

    for (var i = 0; i < 3; ++i) {
      nearWins += nearWin(pieces[i * 3 + 0], pieces[i * 3 + 1], pieces[i * 3 + 2]);
      nearWins += nearWin(pieces[i + 0], pieces[i + 3], pieces[i + 6]);
    }
    nearWins += nearWin(pieces[0], pieces[4], pieces[8]);
    nearWins += nearWin(pieces[2], pieces[4], pieces[6]);
    return nearWins;
  }

  // We give a winning position a high score, then count the number of ways a
  // player could win at the current position.  We use depth to nudge us to
  // winning sooner over later.
  function evaluate(board, depth, winner) {
    depth = depth || 0;
    if (typeof winner === 'undefined')
      winner = Ttt.winner(board);
    if (winner)
      return sign(winner === Ttt.TIE ? 0 : winner) * (100 + depth);

    return countNearWins(board) * 10;
  }

  function resolveTies(board, moves, turn) {
    var max = -Infinity;
    var best = -1;
    for (var move in moves) {
      move = moves[move];

      var value = sign(turn) * evaluate(Ttt.move(board, move, turn));
      if (value > max) {
        max = value;
        best = move;
      }
    }
    return best;
  }

  // Slightly modified negamax with alpha-beta pruning (see
  // <http://en.wikipedia.org/wiki/Negamax> or
  // <http://www.hamedahmadi.com/gametree/>).  Because we use this to instruct
  // us as to which move to make, if top is true we return the move instead of
  // the score of the best move.
  function negamax(board, turn, depth, top, alpha, beta) {
    var winner = Ttt.winner(board);
    if (!depth || winner)
      return sign(turn) * evaluate(board, depth, winner);

    var max = -Infinity;
    var potentials = [];
    // TODO: "branching", to try the likely-best move first.
    var moves = Ttt.validMoves(board);
    for (var move in moves) {
      move = moves[move];

      var value = -negamax(
        Ttt.move(board, move, turn),
        (turn === Ttt.X ? Ttt.O : Ttt.X),
        depth - 1, false, -beta, -alpha
      );

      if (value >= beta)
        return (top ? move : value);
      if (value > alpha)
        alpha = value;
      if (value > max) {
        max = value;
        potentials = [move];
      } else if (value === max) {
        potentials.push(move);
      }
    }

    return (top ? resolveTies(board, potentials, turn) : max);
  }

  function Smart(depth) {
    this.depth = depth || 4;
  }

  Smart.prototype.getMove = function (game) {
    return negamax(game.board, game.turn, this.depth, true, -Infinity, Infinity);
  };

  Ai.Random = Random;
  Ai.Smart = Smart;

  return Ai;
}(Ai || {}));
