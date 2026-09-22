/* DayChain engine - pure functions for daily habit streaks. */
(function (root) {
  'use strict';
  var DAY = 86400000;
  var nextId = 1;
  function uid() { return 'h' + (nextId++) + '-' + Math.random().toString(36).slice(2, 8); }
  function toMs(date) { return new Date(date + 'T00:00:00Z').getTime(); }
  function minusDays(date, n) { return new Date(toMs(date) - n * DAY).toISOString().slice(0, 10); }

  function addHabit(list, name) {
    name = (name || '').trim();
    if (!name) throw new Error('habit needs a name');
    if (list.some(function (h) { return h.name.toLowerCase() === name.toLowerCase(); })) {
      throw new Error('habit already exists');
    }
    var h = { id: uid(), name: name, checkins: [] };
    list.push(h);
    return h;
  }

  function removeHabit(list, id) {
    var n = list.length;
    var kept = list.filter(function (h) { return h.id !== id; });
    list.length = 0;
    kept.forEach(function (h) { list.push(h); });
    return kept.length < n;
  }

  function checkIn(habit, date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) throw new Error('date must be YYYY-MM-DD');
    if (habit.checkins.indexOf(date) >= 0) throw new Error('already checked in ' + date);
    habit.checkins.push(date);
    habit.checkins.sort();
    return habit;
  }

  function uncheck(habit, date) {
    var i = habit.checkins.indexOf(date);
    if (i < 0) return false;
    habit.checkins.splice(i, 1);
    return true;
  }

  // run of consecutive days ending at `end`, counting backwards
  function runEndingAt(habit, end) {
    var set = {};
    habit.checkins.forEach(function (d) { set[d] = true; });
    var n = 0;
    while (set[minusDays(end, n)]) n++;
    return n;
  }

  // streak is alive if checked today or yesterday (today's check-in still pending)
  function currentStreak(habit, today) {
    var end = runEndingAt(habit, today);
    if (end > 0) return { count: end, checkedToday: true };
    var y = runEndingAt(habit, minusDays(today, 1));
    return { count: y, checkedToday: false };
  }

  function longestStreak(habit) {
    if (!habit.checkins.length) return 0;
    var best = 1, run = 1;
    for (var i = 1; i < habit.checkins.length; i++) {
      var gap = (toMs(habit.checkins[i]) - toMs(habit.checkins[i - 1])) / DAY;
      run = gap === 1 ? run + 1 : 1;
      if (run > best) best = run;
    }
    return best;
  }

  function summary(habit, today) {
    var cur = currentStreak(habit, today);
    return {
      current: cur.count,
      checkedToday: cur.checkedToday,
      longest: longestStreak(habit),
      total: habit.checkins.length,
      // needs attention: streak alive from yesterday but today not yet checked
      atRisk: cur.count > 0 && !cur.checkedToday
    };
  }

  var api = { addHabit: addHabit, removeHabit: removeHabit, checkIn: checkIn, uncheck: uncheck, currentStreak: currentStreak, longestStreak: longestStreak, summary: summary };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DayChain = api;
})(typeof window !== 'undefined' ? window : this);
