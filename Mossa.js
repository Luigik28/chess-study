import * as PezzoModule from './Pezzo.js';

class Mossa {
  constructor(
    riga,
    colonna,
    pezzo,
    cattura = false,
    promozione = null,
    scacco = false,
    scaccoMatto = false,
    arrocco = null,
    disambiguazione = null,
    numeroMossa = 0,
    colore = null
  ) {
    this.riga = riga;
    this.colonna = colonna;
    this.pezzo = pezzo;
    this.cattura = cattura;
    this.promozione = promozione;
    this.scacco = scacco;
    this.scaccoMatto = scaccoMatto;
    this.arrocco = arrocco;
    this.disambiguazione = disambiguazione;
    this.numeroMossa = numeroMossa;
    this.colore = colore;
  }

  toString() {
    if (this.arrocco) return this.arrocco === 'Corto' ? 'O-O' : 'O-O-O';

    return `${this.pezzo.notazione}${this.disambiguazione || ''}${this.cattura ? 'x' : ''}${this.colonna}${this.riga}${this.promozione ? '=' + this.promozione.notazione : ''}${this.scacco ? '+' : ''}${this.scaccoMatto ? '#' : ''}`;
  }

  speak() {
    if (this.arrocco) return this.arrocco === 'Corto' ? 'Arrocco corto' : 'Arrocco lungo';

    let toSpeak = '';
    toSpeak += this.pezzo.nome + ' ';

    if (this.disambiguazione) {
      if (this.disambiguazione in colonne) toSpeak += colonne[this.disambiguazione] + ' ';
      else if (this.disambiguazione in numeri) toSpeak += numeri[this.disambiguazione] + ' ';
    }

    if (this.cattura) toSpeak += 'per ';
    if (this.colonna in colonne) toSpeak += colonne[this.colonna] + ' ';
    if (String(this.riga) in numeri) toSpeak += numeri[String(this.riga)] + ' ';
    if (this.promozione) toSpeak += 'promozione a ' + this.promozione.nome + ' ';
    if (this.scacco) toSpeak += 'scacco ';
    if (this.scaccoMatto) toSpeak += 'scacco matto ';

    return toSpeak.trim();
  }
}

function fromNotazione(notazione, numeroMossa, colore = null) {
  notazione = notazione.replace(/0/g, 'O');

  if (notazione === 'O-O' || notazione === 'O-O-O') {
    return new Mossa(null, null, PezzoModule.Nessuno, false, null, false, false, notazione === 'O-O' ? 'Corto' : 'Lungo');
  }

  const pezzo = pezziDict[notazione[0]] || PezzoModule.Pedone;
  let disambiguazione = null;
  const cattura = notazione.includes('x');
  let promozione = null;
  const scacco = notazione.includes('+');
  const scaccoMatto = notazione.includes('#');

  let cleanNotazione = notazione.replace('x', '').replace('+', '').replace('#', '');
  if (cleanNotazione.includes('=')) {
    const [base, promo] = cleanNotazione.split('=');
    cleanNotazione = base;
    promozione = pezziDict[promo] || null;
  }

  let colonna;
  let riga;

  if (pezzo === PezzoModule.Pedone) {
    if (cattura) {
      disambiguazione = cleanNotazione[0];
      colonna = cleanNotazione[1];
      riga = parseInt(cleanNotazione[2], 10);
    } else {
      colonna = cleanNotazione[0];
      riga = parseInt(cleanNotazione[1], 10);
    }
  } else {
    if (cleanNotazione.length === 3) {
      colonna = cleanNotazione.at(-2);
      riga = parseInt(cleanNotazione.at(-1), 10);
    } else if (cleanNotazione.length === 4) {
      disambiguazione = cleanNotazione[1];
      colonna = cleanNotazione.at(-2);
      riga = parseInt(cleanNotazione.at(-1), 10);
    }
  }

  return new Mossa(riga, colonna, pezzo, cattura, promozione, scacco, scaccoMatto, null, disambiguazione, numeroMossa, colore);
}

const colonne = {
  a: 'a',
  b: 'bi',
  c: 'ci',
  d: 'di',
  e: 'e',
  f: 'effe',
  g: 'gi',
  h: 'acca'
};

const numeri = {
  '1': 'uno',
  '2': 'due',
  '3': 'tre',
  '4': 'quattro',
  '5': 'cinque',
  '6': 'sei',
  '7': 'sette',
  '8': 'otto'
};

const pezziDict = Object.fromEntries(PezzoModule.Pezzi.map(p => [p.notazione, p]));

export { Mossa, fromNotazione };
