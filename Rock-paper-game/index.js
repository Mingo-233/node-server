
// console.log(process.argv);
let game = require('./lib')
// let playerAction = process.argv[process.argv.length -1]
let count = 0
process.stdout.write('请输入:');
process.stdin.on('data', (buffer) => {
  let inputData = buffer.toString().trim()
  let result = game(inputData)
  if (result == 1) {
    count++
  }
  if (count == 2) {
    console.log('电脑生气了，不玩了');
    process.exit()
  }
  process.stdout.write('请输入:');


});
