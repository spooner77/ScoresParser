const fetch = require('node-fetch');
const _ = require('lodash');

const getFormatted = (s, list) => {
  return {
    id: s.id,
    level: s.score / s.sessions,
    refuse: (s.sessions / s.agreements) - 1,
    sessions: s.sessions,
    agreements: s.agreements,
    score: s.score,
    index: list.length - s.index,
  }
};

const playerId = process.argv.slice(3);
const arena = process.argv[2];

fetch(`https://hola.org/challenges/haggling/scores/${arena}`)
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    const scores = _.map(data, (value, id) => ({ id, ...value.all }));
    const player = _.find(scores, s => s.id === playerId);

    const offset = 1000;
    const rating = scores.filter(s => s.sessions >= offset || s.id === playerId);

    const list = _.sortBy(rating, s => s.score / s.sessions).map((s, index) => ({
      ...s,
      index,
    }));

    const top = list.slice(Math.max(list.length - 3, 1)).map(s => getFormatted(s, list));
    const my = _.filter(list, s => playerId.includes(s.id));
    const myL = my.map(s => getFormatted(s, list));

    console.log('=========== PLAYERS ===========');
    console.log(`all: ${scores.length}`);
    console.log(`ranking: ${list.length}`);

    if (top && top.length) {
      console.log('=========== TOP ===========');
      console.log(top);
    }

    if (player) {
      console.log('=========== MY ===========');
      console.log(myL);
    }
  });
