"use strict";

var game;
var ai;

$(function () {
  game = new Ttt.Game();
  ai = new Ai.Smart();

  var board = $('#board');
  var aiPlayer = ($.inArray('ai=x', window.location.search.substr(1).split('&')) !== -1 ? Ttt.X : Ttt.O);

  function redraw(highlightPiece) {
    game.draw(board[0].getContext('2d'), board.width(), board.height(), 0, 0, highlightPiece);
  }

  function getSquare(x, y) {
    var col = (x - board.offset().left) / board.width() * 3 | 0;
    var row = (y - board.offset().top) / board.height() * 3 | 0;
    return col + row * 3;
  }

  function move(square) {
    game.move(square);

    switch (game.winner()) {
    case Ttt.X:
      $('#winner').text('X wins!');
      break;

    case Ttt.O:
      $('#winner').text('O wins!');
      break;

    case Ttt.TIE:
      $('#winner').text("Cat's game");
      break;
    }

    redraw();
  }

  board.mousemove(function (event) {
    if (game.winner() === 0)
      redraw(getSquare(event.pageX, event.pageY));
  });

  board.mouseleave(function (event) {
    redraw();
  });

  board.click(function (event) {
    var square = getSquare(event.pageX, event.pageY);
    if (game.winner() === 0 && game.getPiece(square) === 0) {
      move(square);

      if (game.winner() === 0) {
        square = ai.getMove(game);
        if (square >= 0 && square < 9 && game.getPiece(square) === 0)
          move(square);
        else
          $('#winner').text('AI chose invalid move ' + square);
      }
    }
  });

  if (aiPlayer === Ttt.X)
    move(ai.getMove(game));
  else
    redraw();
});