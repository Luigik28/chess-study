class Pezzo {
  constructor(nome, valore, notazione, simbolo) {
    this.id = Symbol();
    this.nome = nome;
    this.valore = valore;
    this.notazione = notazione;
    this.simbolo = simbolo;
    this.colore = '';
  }

  stampaSimbolo() {
    if (!this.colore) return '_';
    const colori = this.simbolo.split(',');
    return this.colore === 'nero' ? colori[0] : colori[1];
  }
}

const Pedone = new Pezzo('Pedone', 1, '', '♙,♟');
const Cavallo = new Pezzo('Cavallo', 3, 'N', '♘,♞');
const Torre = new Pezzo('Torre', 5, 'R', '♖,♜');
const Alfiere = new Pezzo('Alfiere', 3, 'B', '♗,♝');
const Re = new Pezzo('Re', 0, 'K', '♔,♚');
const Donna = new Pezzo('Donna', 9, 'Q', '♕,♛');
const Nessuno = new Pezzo('Nessuno', 0, '', ' ');

const Pezzi = [Pedone, Cavallo, Torre, Alfiere, Re, Donna, Nessuno];

export { Pezzo, Pedone, Cavallo, Torre, Alfiere, Re, Donna, Nessuno, Pezzi };
