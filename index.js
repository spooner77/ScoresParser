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

const playerId = '6bc2e10064ab63c7fdf5dca7bd1b3b49';

fetch('https://hola.org/challenges/haggling/scores/standard_1s')
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
    const my = _.find(list, s => s.id === playerId);

    console.log('=========== PLAYERS ===========');
    console.log(`all: ${scores.length}`);
    console.log(`ranking: ${list.length}`);

    if (top && top.length) {
      console.log('=========== TOP ===========');
      console.log(top);
    }

    if (player) {
      console.log('=========== MY ===========');
      console.log(getFormatted(my, list));
    }
  });