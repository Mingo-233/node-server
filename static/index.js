// static/index.js
var p = document.querySelector('p');
console.log('index.js'+p);
console.log(p);
var style = window.getComputedStyle(p, null);
console.log(style.color);
console.log(new Date());