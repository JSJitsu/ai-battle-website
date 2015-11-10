/**
 * @class ActionConstants
 *
 * This file stores the enumerations for player actions. Doing this to store the actions over using
 * strings provides significant savings in document size when storing battles in the database.
 */
var reversed = {},
    constants;

constants = {
    North: 1,
    East: 2,
    South: 3,
    West: 4
};

for (var action in constants) {
    reversed[constants[action]] = action;
}

module.exports = {
    toDatabase: constants,
    fromDatabase: reversed
};