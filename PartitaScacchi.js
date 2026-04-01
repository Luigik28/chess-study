export class PartitaScacchi {
  constructor() {
    this.reset();
  }

  reset() {
    this.board = [
      ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
      ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
      ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
    ];

    this.activeColor = 'w';
    this.castling = 'KQkq';
    this.enPassant = '-';
    this.halfmoveClock = 0;
    this.fullmoveNumber = 1;
    this.history = [];
  }

  squareToCoords(square) {
    if (!/^[a-h][1-8]$/.test(square)) {
      throw new Error(`Casa non valida: ${square}`);
    }

    const file = square.charCodeAt(0) - 97;
    const rank = Number(square[1]);
    return { row: 8 - rank, col: file };
  }

  coordsToSquare(row, col) {
    return String.fromCharCode(97 + col) + String(8 - row);
  }

  getPiece(square) {
    const { row, col } = this.squareToCoords(square);
    return this.board[row][col];
  }

  setPiece(square, piece) {
    const { row, col } = this.squareToCoords(square);
    this.board[row][col] = piece;
  }

  isWhite(piece) {
    return !!piece && piece === piece.toUpperCase();
  }

  isBlack(piece) {
    return !!piece && piece === piece.toLowerCase();
  }

  sameColor(a, b) {
    if (!a || !b) return false;
    return (this.isWhite(a) && this.isWhite(b)) || (this.isBlack(a) && this.isBlack(b));
  }

  pathClear(from, to) {
    const a = this.squareToCoords(from);
    const b = this.squareToCoords(to);

    let dr = Math.sign(b.row - a.row);
    let dc = Math.sign(b.col - a.col);

    let r = a.row + dr;
    let c = a.col + dc;

    while (r !== b.row || c !== b.col) {
      if (this.board[r][c] !== null) return false;
      r += dr;
      c += dc;
    }

    return true;
  }

  updateCastlingRights(from, to, piece, capturedPiece) {
    let rights = this.castling === '-' ? '' : this.castling;

    if (piece === 'K') rights = rights.replace('K', '').replace('Q', '');
    if (piece === 'k') rights = rights.replace('k', '').replace('q', '');

    if (piece === 'R') {
      if (from === 'h1') rights = rights.replace('K', '');
      if (from === 'a1') rights = rights.replace('Q', '');
    }

    if (piece === 'r') {
      if (from === 'h8') rights = rights.replace('k', '');
      if (from === 'a8') rights = rights.replace('q', '');
    }

    if (capturedPiece === 'R') {
      if (to === 'h1') rights = rights.replace('K', '');
      if (to === 'a1') rights = rights.replace('Q', '');
    }

    if (capturedPiece === 'r') {
      if (to === 'h8') rights = rights.replace('k', '');
      if (to === 'a8') rights = rights.replace('q', '');
    }

    this.castling = rights || '-';
  }

  validateBasicMove(piece, from, to, previousEnPassant) {
    const target = this.getPiece(to);
    const a = this.squareToCoords(from);
    const b = this.squareToCoords(to);

    const dr = b.row - a.row;
    const dc = b.col - a.col;
    const absDr = Math.abs(dr);
    const absDc = Math.abs(dc);

    const white = this.isWhite(piece);
    const lower = piece.toLowerCase();

    if (target && this.sameColor(piece, target)) {
      throw new Error('Non puoi catturare un tuo pezzo');
    }

    if (lower === 'p') {
      const dir = white ? -1 : 1;
      const startRow = white ? 6 : 1;

      if (dc === 0 && dr === dir && !target) return;
      if (dc === 0 && dr === 2 * dir && a.row === startRow && !target) {
        const middleRow = a.row + dir;
        if (this.board[middleRow][a.col] !== null) {
          throw new Error('Pedone bloccato');
        }
        return;
      }

      if (absDc === 1 && dr === dir) {
        if (target) return;
        if (to === previousEnPassant) return;
      }

      throw new Error('Mossa del pedone non valida');
    }

    if (lower === 'n') {
      if ((absDr === 2 && absDc === 1) || (absDr === 1 && absDc === 2)) return;
      throw new Error('Mossa del cavallo non valida');
    }

    if (lower === 'b') {
      if (absDr === absDc && this.pathClear(from, to)) return;
      throw new Error('Mossa dell\'alfiere non valida');
    }

    if (lower === 'r') {
      if ((dr === 0 || dc === 0) && this.pathClear(from, to)) return;
      throw new Error('Mossa della torre non valida');
    }

    if (lower === 'q') {
      if (((dr === 0 || dc === 0) || (absDr === absDc)) && this.pathClear(from, to)) return;
      throw new Error('Mossa della donna non valida');
    }

    if (lower === 'k') {
      const isCastle =
        (piece === 'K' && from === 'e1' && (to === 'g1' || to === 'c1')) ||
        (piece === 'k' && from === 'e8' && (to === 'g8' || to === 'c8'));

      if (isCastle) return;
      if (absDr <= 1 && absDc <= 1) return;
      throw new Error('Mossa del re non valida');
    }

    throw new Error('Pezzo sconosciuto');
  }

  makeMove(uci) {
    if (!/^[a-h][1-8][a-h][1-8][qrbnQRBN]?$/.test(uci)) {
      throw new Error('Formato non valido. Usa mosse tipo e2e4, g1f3, e7e8q');
    }

    const from = uci.slice(0, 2);
    const to = uci.slice(2, 4);
    const promo = uci[4] || null;

    const piece = this.getPiece(from);
    if (!piece) {
      throw new Error(`Nessun pezzo in ${from}`);
    }

    if (this.activeColor === 'w' && !this.isWhite(piece)) {
      throw new Error('Tocca al bianco');
    }
    
    if (this.activeColor === 'b' && !this.isBlack(piece)) {
      throw new Error('Tocca al nero');
    }

    const previousEnPassant = this.enPassant;
    const targetBefore = this.getPiece(to);
    const isPawn = piece.toLowerCase() === 'p';

    this.validateBasicMove(piece, from, to, previousEnPassant);
    this.updateCastlingRights(from, to, piece, targetBefore);

    const a = this.squareToCoords(from);
    const b = this.squareToCoords(to);

    let isCapture = !!targetBefore;
    this.enPassant = '-';

    const isWhite = this.isWhite(piece);

    if (piece === 'K' && from === 'e1' && to === 'g1') {
      this.setPiece('e1', null);
      this.setPiece('g1', 'K');
      this.setPiece('h1', null);
      this.setPiece('f1', 'R');
    } else if (piece === 'K' && from === 'e1' && to === 'c1') {
      this.setPiece('e1', null);
      this.setPiece('c1', 'K');
      this.setPiece('a1', null);
      this.setPiece('d1', 'R');
    } else if (piece === 'k' && from === 'e8' && to === 'g8') {
      this.setPiece('e8', null);
      this.setPiece('g8', 'k');
      this.setPiece('h8', null);
      this.setPiece('f8', 'r');
    } else if (piece === 'k' && from === 'e8' && to === 'c8') {
      this.setPiece('e8', null);
      this.setPiece('c8', 'k');
      this.setPiece('a8', null);
      this.setPiece('d8', 'r');
    } else {
      if (isPawn && to === previousEnPassant && !targetBefore && Math.abs(b.col - a.col) === 1) {
        const capturedRow = isWhite ? b.row + 1 : b.row - 1;
        this.board[capturedRow][b.col] = null;
        isCapture = true;
      }

      this.setPiece(from, null);

      let finalPiece = piece;
      if (promo) {
        if (!isPawn) throw new Error('Solo un pedone può promuovere');
        const promotionRow = isWhite ? 0 : 7;
        if (b.row !== promotionRow) throw new Error('Promozione non valida');
        finalPiece = isWhite ? promo.toUpperCase() : promo.toLowerCase();
      }

      this.setPiece(to, finalPiece);

      if (isPawn && Math.abs(a.row - b.row) === 2) {
        const middleRow = (a.row + b.row) / 2;
        this.enPassant = this.coordsToSquare(middleRow, a.col);
      }
    }

    if (isPawn || isCapture) this.halfmoveClock = 0;
    else this.halfmoveClock += 1;

    const fen = this.getFen();
    this.history.push({ move: uci, fen });

    if (this.activeColor === 'b') {
      this.fullmoveNumber += 1;
    }
    this.activeColor = this.activeColor === 'w' ? 'b' : 'w';

    return this.getFen();
  }

  boardToFenPlacement() {
    return this.board.map(row => {
      let out = '';
      let empty = 0;

      for (const cell of row) {
        if (cell === null) {
          empty++;
        } else {
          if (empty > 0) {
            out += empty;
            empty = 0;
          }
          out += cell;
        }
      }

      if (empty > 0) out += empty;
      return out;
    }).join('/');
  }

  getFen() {
    return [
      this.boardToFenPlacement(),
      this.activeColor,
      this.castling,
      this.enPassant,
      this.halfmoveClock,
      this.fullmoveNumber
    ].join(' ');
  }

  renderBoardAscii() {
    return this.board
      .map((row, i) => `${8 - i} ${row.map(x => x ?? '.').join(' ')}`)
      .join('\n') + '\n  a b c d e f g h';
  }
}