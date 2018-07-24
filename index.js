const fs = require('fs');
const fetch = require('node-fetch');
const _ = require('lodash');
const moment = require('moment');

const getFormatted = (s, list) => {
  return {
    id: s.id,
    level: s.score / s.sessions,
    refuse: (s.sessions / s.agreements) - 1,
    rcount: s.sessions - s.agreements,
    sessions: s.sessions,
    agreements: s.agreements,
    score: s.score,
    index: list.length - s.index,
  }
};

const args = process.argv.slice(2);
const arena = args[0];
const playerId = args[1];
const statsFileName = `${playerId}.json`;

fetch(`https://hola.org/challenges/haggling/scores/${arena}`)
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    const now = moment();

    let prevStats = [];
    if (fs.existsSync(statsFileName)) {
      prevStats = JSON.parse(fs.readFileSync(statsFileName));
    }

    const prevList = prevStats && prevStats.list ? prevStats.list : [];
    const newList = [
        ...prevList,
      {
        time: moment(),
      data: data,
  }];

    const niceIndex = _.findLastIndex(newList, s => now.diff(moment(s.time), 'seconds') > 30);

    fs.writeFileSync(statsFileName, JSON.stringify({
      list: niceIndex !== -1 ? newList.slice(niceIndex) : newList,
    }), 'utf8');

    const niceData = niceIndex !== -1 ? newList[niceIndex].data : {};

    const niceScores = _.map(niceData, (value, id) => {
      return {
        id,
        ...value,
    };
  });

    let playerDay = null;

    const scores = _.map(data, (value, id) => {
      if (id === playerId) {
      const periods = Object.keys(value);
      playerDay = periods[periods.length - 1];
    }

    return {
      id,
      ...value,
  };
  });

    const periodKey = playerDay || 'all';
    const offset = 1000;
    const filtered = scores.filter((s) => {
      const period = s[periodKey];

    if (!period) return false;

    const niceScore = _.find(niceScores, ns => ns.id === s.id);

    if (niceScore && niceScore[periodKey] && niceScore[periodKey].sessions === s[periodKey].sessions) return false;

    return s.id === playerId || period.sessions >= offset;
  });

    const rating = _.sortBy(filtered, s => {
      const period = s[periodKey];

    return period.score / period.sessions
  })
  .map((s, index) => ({
      ...s[periodKey],
      id: s.id,
      index,
  }));

    console.log('=========== PLAYERS ===========');
    console.log(`all: ${scores.length}`);
    console.log(`online: ${rating.length}`);

    const top = rating.slice(Math.max(rating.length - 3, 1)).map(s => getFormatted(s, rating));
    if (top && top.length) {
      console.log('=========== TOP ===========');
      console.log(top);
    }

    const player = _.find(rating, s => s.id === playerId);
    if (player) {
      const next = rating.length - player.index > 4
        ? rating[player.index + 1]
        : null;

      if (next) {
        console.log('=========== NEXT ===========');
        console.log(getFormatted(next, rating));
      }

      console.log('=========== MY ===========');
      console.log(getFormatted(player, rating));
    }
  }).catch(err => console.log(err));
