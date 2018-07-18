const fetch = require('node-fetch');
const _ = require('lodash');

const getFormatted = (s, list) => {
  return {
    id: s.id,
    level: s.score / s.sessions,
    refuse: s.sessions / s.agreements,
    sessions: s.sessions,
    score: s.score,
    index: list.length - s.index,
  }
};

fetch('https://hola.org/challenges/haggling/scores/standard')
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    const scores = _.map(data, (value, id) => ({ id, ...value.all })).filter(s => s.sessions > 100);

    const list = _.sortBy(scores, s => s.score / s.sessions).map((s, index) => ({
      ...s,
      index,
    }));

    const my = _.find(list, s => s.id === 'e8754ee9d97da55ed7f004f7b785f24d');

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