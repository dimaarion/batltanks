module.exports = class Action{

  getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

   getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // Максимум и минимум включаются
  }

}
