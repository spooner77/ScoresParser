const fetch = require('node-fetch');
const _ = require('lodash');

const getFormatted = (s, list) => {
  return {
    id: s.id,
    level: s.score / s.sessions,
    refuse: s.sessions / s.agreements,
    sessions: s.sessions,
    agreements: s.agreements,
    score: s.score,
    index: list.length - s.index,
  }
};

const playerId = 'e9633198215e6c851303703c914cb32f';

fetch('https://hola.org/challenges/haggling/scores/standard')
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    const scores = _.map(data, (value, id) => ({ id, ...value.all }))
      .filter(s => s.sessions > 100 || s.id === playerId);

    const list = _.sortBy(scores, s => s.score / s.sessions).map((s, index) => ({
      ...s,
      index,
    }));

    const my = _.find(list, s => s.id === playerId);

    const top = list.slice(Math.max(list.length - 3, 1)).map(s => getFormatted(s, list));

    if (top && top.length) {
      console.log('=========== TOP ===========');
      console.log(top);
    }

    if (my) {
      console.log('=========== MY ===========');
      console.log(getFormatted(my, list));
    }
  });