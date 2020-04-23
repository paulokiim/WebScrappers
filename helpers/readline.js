const readline = require("readline");
const { promisify } = require("util");

readline.Interface.prototype.question[promisify.custom] = (prompt) => {
  return new Promise((resolve) =>
    readline.Interface.prototype.question.call(this, prompt, resolve)
  );
};
readline.Interface.prototype.questionAsync = promisify(
  readline.Interface.prototype.question
);

const askQuestion = async (question) => {
  const promisifiedReadline = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer = await promisifiedReadline.questionAsync(question);
  promisifiedReadline.close();
  return answer;
};

module.exports = askQuestion;
